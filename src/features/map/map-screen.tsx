import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, {
  type LongPressEvent,
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  type Region,
} from 'react-native-maps';

import { Screen } from '@/components/screen';
import { useAuth } from '@/features/auth/auth-context';
import { BlockUserButton, ReportForm } from '@/features/moderation/moderation-controls';
import type { ReportTarget } from '@/features/moderation/schemas';
import { queryClient } from '@/lib/query/client';
import { analytics } from '@/lib/analytics';
import { queryKeys } from '@/lib/query/keys';
import { normalizeApplicationError } from '@/lib/supabase/errors';

import {
  createMapUpdate,
  createPoint,
  createPolygon,
  deleteMapItem,
  deleteMapUpdate,
  fetchMapItems,
  fetchMapUpdates,
  updateMapItem,
  updateMapUpdate,
} from './api';
import {
  type Coordinate,
  type MapBounds,
  type MapItem,
  type MapItemDraft,
  mapItemDraftSchema,
  type MapUpdate,
  type MapUpdateDraft,
  mapUpdateDraftSchema,
} from './schemas';
import { useMapRealtime } from './use-map-realtime';

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};

type CreationDraft =
  | { kind: 'point'; coordinate: Coordinate }
  | { kind: 'polygon'; vertices: Coordinate[] };

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function boundsFromRegion(region: Region): MapBounds {
  const halfLatitude = Math.min(Math.abs(region.latitudeDelta) / 2, 90);
  const halfLongitude = Math.min(Math.abs(region.longitudeDelta) / 2, 180);
  return {
    minLat: clamp(region.latitude - halfLatitude, -90, 90),
    maxLat: clamp(region.latitude + halfLatitude, -90, 90),
    minLong: clamp(region.longitude - halfLongitude, -180, 180),
    maxLong: clamp(region.longitude + halfLongitude, -180, 180),
  };
}

function boundsKey(bounds: MapBounds): string {
  return [bounds.minLat, bounds.minLong, bounds.maxLat, bounds.maxLong]
    .map((value) => value.toFixed(4))
    .join(':');
}

function toCoordinate(tuple: [number, number]): Coordinate {
  return { longitude: tuple[0], latitude: tuple[1] };
}

function itemCoordinates(item: MapItem): Coordinate[] {
  if (item.geometry_geojson.type === 'Point') {
    return [toCoordinate(item.geometry_geojson.coordinates)];
  }
  return item.geometry_geojson.coordinates[0]?.map(toCoordinate) ?? [];
}

interface ItemFormProps {
  initial?: MapItemDraft;
  label: string;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (draft: MapItemDraft) => void;
}

function ItemForm({ initial, label, pending, onCancel, onSubmit }: ItemFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<MapItemDraft>({
    resolver: zodResolver(mapItemDraftSchema),
    defaultValues: initial ?? { title: '', description: '' },
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            accessibilityLabel="Map item title"
            maxLength={120}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Title"
            style={styles.input}
            value={value}
          />
        )}
      />
      {errors.title ? <Text style={styles.error}>{errors.title.message}</Text> : null}
      <Controller
        control={control}
        name="description"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            accessibilityLabel="Map item description"
            maxLength={4000}
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Description (optional)"
            style={[styles.input, styles.multiline]}
            value={value}
          />
        )}
      />
      {errors.description ? <Text style={styles.error}>{errors.description.message}</Text> : null}
      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={() => void handleSubmit(onSubmit)()}
          style={[styles.primaryButton, pending ? styles.disabled : null]}
        >
          <Text style={styles.primaryButtonText}>{pending ? 'Saving…' : label}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface UpdateFormProps {
  initial?: MapUpdateDraft;
  label: string;
  pending: boolean;
  onCancel?: () => void;
  onSubmit: (draft: MapUpdateDraft) => void;
}

function UpdateForm({ initial, label, pending, onCancel, onSubmit }: UpdateFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<MapUpdateDraft>({
    resolver: zodResolver(mapUpdateDraftSchema),
    defaultValues: initial ?? { body: '' },
  });

  const submit = (draft: MapUpdateDraft) => {
    onSubmit(draft);
  };

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="body"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            accessibilityLabel="Collaborative update"
            maxLength={2000}
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Add a collaborative update"
            style={[styles.input, styles.multiline]}
            value={value}
          />
        )}
      />
      {errors.body ? <Text style={styles.error}>{errors.body.message}</Text> : null}
      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={() => void handleSubmit(submit)()}
          style={[styles.primaryButton, pending ? styles.disabled : null]}
        >
          <Text style={styles.primaryButtonText}>{pending ? 'Saving…' : label}</Text>
        </Pressable>
        {onCancel ? (
          <Pressable accessibilityRole="button" onPress={onCancel} style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function CollaborativeMapScreen() {
  const { session } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [selectedId, setSelectedId] = useState<string>();
  const [creationMode, setCreationMode] = useState<'point' | 'polygon'>('point');
  const [creationDraft, setCreationDraft] = useState<CreationDraft>();
  const [editingItem, setEditingItem] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<MapUpdate>();
  const [reportTarget, setReportTarget] = useState<ReportTarget>();
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const bounds = useMemo(() => boundsFromRegion(region), [region]);
  const viewportKey = boundsKey(bounds);

  useEffect(() => {
    analytics.capture({ name: 'map_screen_viewed', properties: {} });
  }, []);

  const items = useQuery({
    queryKey: queryKeys.mapItems.viewport(viewportKey),
    queryFn: () => fetchMapItems(bounds),
  });
  const selectedItem = items.data?.find((item) => item.id === selectedId);
  const updates = useQuery({
    queryKey: queryKeys.mapItems.updates(selectedId ?? 'none'),
    queryFn: () => fetchMapUpdates(selectedId ?? ''),
    enabled: Boolean(selectedId),
  });

  useMapRealtime(selectedId);

  const invalidateMap = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.mapItems.all });
  };
  const invalidateUpdates = async () => {
    if (!selectedId) return;
    await queryClient.invalidateQueries({ queryKey: queryKeys.mapItems.updates(selectedId) });
  };

  const creation = useMutation({
    mutationFn: async (draft: MapItemDraft) => {
      if (!creationDraft) throw new Error('Select coordinates before saving.');
      return creationDraft.kind === 'point'
        ? createPoint({ draft, coordinate: creationDraft.coordinate })
        : createPolygon({ draft, vertices: creationDraft.vertices });
    },
    onSuccess: async (id) => {
      setCreationDraft(undefined);
      setSelectedId(id);
      setStatus('Map item created.');
      await invalidateMap();
    },
    onError: (caught) => setError(normalizeApplicationError(caught).message),
  });

  const itemEdit = useMutation({
    mutationFn: (draft: MapItemDraft) => {
      if (!selectedId) throw new Error('Select a map item first.');
      return updateMapItem({ id: selectedId, draft });
    },
    onSuccess: async () => {
      setEditingItem(false);
      setStatus('Map item updated.');
      await invalidateMap();
    },
    onError: (caught) => setError(normalizeApplicationError(caught).message),
  });

  const itemDeletion = useMutation({
    mutationFn: deleteMapItem,
    onSuccess: async () => {
      setSelectedId(undefined);
      setStatus('Map item deleted.');
      await invalidateMap();
    },
    onError: (caught) => setError(normalizeApplicationError(caught).message),
  });

  const updateCreation = useMutation({
    mutationFn: (draft: MapUpdateDraft) => {
      if (!selectedId) throw new Error('Select a map item first.');
      return createMapUpdate({ mapItemId: selectedId, draft });
    },
    onSuccess: async () => {
      setStatus('Update added.');
      await invalidateUpdates();
    },
    onError: (caught) => setError(normalizeApplicationError(caught).message),
  });

  const updateEdit = useMutation({
    mutationFn: (draft: MapUpdateDraft) => {
      if (!editingUpdate) throw new Error('Select an update first.');
      return updateMapUpdate({ id: editingUpdate.id, draft });
    },
    onSuccess: async () => {
      setEditingUpdate(undefined);
      setStatus('Update edited.');
      await invalidateUpdates();
    },
    onError: (caught) => setError(normalizeApplicationError(caught).message),
  });

  const updateDeletion = useMutation({
    mutationFn: deleteMapUpdate,
    onSuccess: async () => {
      setStatus('Update deleted.');
      await invalidateUpdates();
    },
    onError: (caught) => setError(normalizeApplicationError(caught).message),
  });

  const handleLongPress = (event: LongPressEvent) => {
    setError(undefined);
    const coordinate = event.nativeEvent.coordinate;
    if (creationMode === 'point') {
      setCreationDraft({ kind: 'point', coordinate });
      setStatus('Point selected. Complete its details below.');
      return;
    }

    setCreationDraft((current) => ({
      kind: 'polygon',
      vertices: [...(current?.kind === 'polygon' ? current.vertices : []), coordinate].slice(
        0,
        100,
      ),
    }));
    setStatus('Polygon vertex added. Add at least three vertices.');
  };

  const useMyLocation = async () => {
    setError(undefined);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setStatus('Location permission was not granted. The map remains fully available.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextRegion = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      mapRef.current?.animateToRegion(nextRegion, 350);
      setRegion(nextRegion);
      setStatus('Map centered on your current location. It was not saved.');
    } catch (caught) {
      setError(normalizeApplicationError(caught).message);
    }
  };

  const confirmDeleteItem = (item: MapItem) => {
    Alert.alert('Delete map item?', 'This also deletes its collaborative updates.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => itemDeletion.mutate(item.id),
      },
    ]);
  };

  return (
    <Screen
      title="Collaborative map"
      description="Browse the visible area, add points or polygons, and share text updates."
    >
      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => void useMyLocation()}
          style={styles.outlineButton}
          testID="use-my-location"
        >
          <Text style={styles.outlineButtonText}>Use my location</Text>
        </Pressable>
        <Link href="/settings" asChild>
          <Pressable accessibilityRole="button" style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Settings</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setCreationMode('point');
            setCreationDraft(undefined);
          }}
          style={creationMode === 'point' ? styles.selectedMode : styles.modeButton}
        >
          <Text style={creationMode === 'point' ? styles.selectedModeText : styles.modeText}>
            Add point
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setCreationMode('polygon');
            setCreationDraft({ kind: 'polygon', vertices: [] });
          }}
          style={creationMode === 'polygon' ? styles.selectedMode : styles.modeButton}
        >
          <Text style={creationMode === 'polygon' ? styles.selectedModeText : styles.modeText}>
            Draw polygon
          </Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        Long-press the map to select a point or add polygon vertices. Location is never saved unless
        you submit a map item.
      </Text>

      <MapView
        {...(Platform.OS === 'android' ? { provider: PROVIDER_GOOGLE } : {})}
        initialRegion={DEFAULT_REGION}
        onLongPress={handleLongPress}
        onRegionChangeComplete={setRegion}
        ref={mapRef}
        style={styles.map}
        testID="collaborative-map"
      >
        {items.data?.map((item) => {
          const coordinates = itemCoordinates(item);
          if (item.geometry_geojson.type === 'Point') {
            const coordinate = coordinates[0];
            return coordinate ? (
              <Marker
                coordinate={coordinate}
                key={item.id}
                onPress={() => setSelectedId(item.id)}
                title={item.title}
              />
            ) : null;
          }
          return (
            <Polygon
              coordinates={coordinates}
              fillColor="rgba(37, 99, 235, 0.22)"
              key={item.id}
              onPress={() => setSelectedId(item.id)}
              strokeColor="#1D4ED8"
              strokeWidth={2}
              tappable
            />
          );
        })}
        {creationDraft?.kind === 'point' ? (
          <Marker coordinate={creationDraft.coordinate} pinColor="#D97706" title="New point" />
        ) : null}
        {creationDraft?.kind === 'polygon' && creationDraft.vertices.length >= 2 ? (
          <Polygon
            coordinates={creationDraft.vertices}
            fillColor="rgba(217, 119, 6, 0.2)"
            strokeColor="#D97706"
          />
        ) : null}
      </MapView>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setCreationMode('point');
          setCreationDraft({
            kind: 'point',
            coordinate: { latitude: region.latitude, longitude: region.longitude },
          });
          setStatus('Map center selected for a new point.');
        }}
        style={styles.outlineButton}
      >
        <Text style={styles.outlineButtonText}>Select map center for point</Text>
      </Pressable>

      {creationDraft?.kind === 'polygon' ? (
        <Text style={styles.hint}>{creationDraft.vertices.length} polygon vertices selected.</Text>
      ) : null}
      {creationDraft && (creationDraft.kind === 'point' || creationDraft.vertices.length >= 3) ? (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            New {creationDraft.kind}
          </Text>
          <ItemForm
            label="Create map item"
            onCancel={() => setCreationDraft(undefined)}
            onSubmit={(draft) => creation.mutate(draft)}
            pending={creation.isPending}
          />
        </View>
      ) : null}

      {status ? (
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {status}
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {items.isPending ? <Text style={styles.hint}>Loading this map area…</Text> : null}
      {items.isError ? (
        <View style={styles.card}>
          <Text accessibilityRole="alert" style={styles.error}>
            {normalizeApplicationError(items.error).message}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void items.refetch()}
            style={styles.outlineButton}
          >
            <Text style={styles.outlineButtonText}>Retry map data</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Visible items
        </Text>
        {items.data?.length === 0 ? <Text style={styles.hint}>No items in this area.</Text> : null}
        {items.data?.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => setSelectedId(item.id)}
            style={styles.listItem}
          >
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text numberOfLines={2} style={styles.hint}>
              {item.description || `${item.geometry_geojson.type} with no description`}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedItem ? (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {selectedItem.title}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => setSelectedId(undefined)}>
              <Text style={styles.linkText}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>{selectedItem.description || 'No description.'}</Text>
          <Text style={styles.metadata}>{selectedItem.geometry_geojson.type}</Text>

          {selectedItem.author_id === session?.user.id ? (
            editingItem ? (
              <ItemForm
                initial={{
                  title: selectedItem.title,
                  description: selectedItem.description,
                }}
                key={selectedItem.id}
                label="Save changes"
                onCancel={() => setEditingItem(false)}
                onSubmit={(draft) => itemEdit.mutate(draft)}
                pending={itemEdit.isPending}
              />
            ) : (
              <View style={styles.buttonRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditingItem(true)}
                  style={styles.outlineButton}
                >
                  <Text style={styles.outlineButtonText}>Edit item</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => confirmDeleteItem(selectedItem)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete item</Text>
                </Pressable>
              </View>
            )
          ) : null}

          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setReportTarget({
                  kind: 'map_item',
                  id: selectedItem.id,
                  authorId: selectedItem.author_id,
                })
              }
              style={styles.reportAction}
            >
              <Text style={styles.reportActionText}>Report item</Text>
            </Pressable>
            {selectedItem.author_id !== session?.user.id ? (
              <BlockUserButton
                authorId={selectedItem.author_id}
                onBlocked={() => {
                  setSelectedId(undefined);
                  setStatus('User blocked. Their content is now hidden.');
                }}
              />
            ) : null}
          </View>

          {reportTarget?.kind === 'map_item' && reportTarget.id === selectedItem.id ? (
            <ReportForm
              key={reportTarget.id}
              onCancel={() => setReportTarget(undefined)}
              onSubmitted={() => {
                setReportTarget(undefined);
                setStatus('Report submitted for human review.');
              }}
              target={reportTarget}
            />
          ) : null}

          <Text accessibilityRole="header" style={styles.subsectionTitle}>
            Collaborative updates
          </Text>
          {updates.isPending ? <Text style={styles.hint}>Loading updates…</Text> : null}
          {updates.isError ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {normalizeApplicationError(updates.error).message}
            </Text>
          ) : null}
          {updates.data?.length === 0 ? <Text style={styles.hint}>No updates yet.</Text> : null}
          {updates.data?.map((update) => (
            <View key={update.id} style={styles.updateCard}>
              {editingUpdate?.id === update.id ? (
                <UpdateForm
                  initial={{ body: update.body }}
                  key={update.id}
                  label="Save update"
                  onCancel={() => setEditingUpdate(undefined)}
                  onSubmit={(draft) => updateEdit.mutate(draft)}
                  pending={updateEdit.isPending}
                />
              ) : (
                <>
                  <Text style={styles.primaryText}>{update.body}</Text>
                  {update.author_id === session?.user.id ? (
                    <View style={styles.buttonRow}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setEditingUpdate(update)}
                        style={styles.compactButton}
                      >
                        <Text style={styles.linkText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => updateDeletion.mutate(update.id)}
                        style={styles.compactButton}
                      >
                        <Text style={styles.dangerLink}>Delete</Text>
                      </Pressable>
                    </View>
                  ) : null}
                  <View style={styles.buttonRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        setReportTarget({
                          kind: 'map_update',
                          id: update.id,
                          authorId: update.author_id,
                        })
                      }
                      style={styles.compactButton}
                    >
                      <Text style={styles.reportActionText}>Report update</Text>
                    </Pressable>
                    {update.author_id !== session?.user.id ? (
                      <BlockUserButton
                        authorId={update.author_id}
                        onBlocked={() => {
                          setSelectedId(undefined);
                          setStatus('User blocked. Their content is now hidden.');
                        }}
                      />
                    ) : null}
                  </View>
                  {reportTarget?.kind === 'map_update' && reportTarget.id === update.id ? (
                    <ReportForm
                      key={reportTarget.id}
                      onCancel={() => setReportTarget(undefined)}
                      onSubmitted={() => {
                        setReportTarget(undefined);
                        setStatus('Report submitted for human review.');
                      }}
                      target={reportTarget}
                    />
                  ) : null}
                </>
              )}
            </View>
          ))}
          <UpdateForm
            key={updates.data?.length ?? 0}
            label="Add update"
            onSubmit={(draft) => updateCreation.mutate(draft)}
            pending={updateCreation.isPending}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: { height: 420, overflow: 'hidden', borderRadius: 16 },
  card: { gap: 12, padding: 18, borderRadius: 16, backgroundColor: '#FFFFFF' },
  detailCard: {
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  subsectionTitle: { paddingTop: 8, fontSize: 17, fontWeight: '700', color: '#0F172A' },
  primaryText: { fontSize: 15, lineHeight: 22, color: '#0F172A' },
  hint: { fontSize: 15, lineHeight: 22, color: '#475569' },
  metadata: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  status: { fontSize: 15, lineHeight: 22, color: '#166534' },
  error: { fontSize: 15, lineHeight: 22, color: '#B91C1C' },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  selectedMode: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#1D4ED8',
  },
  modeText: { fontWeight: '700', color: '#334155' },
  selectedModeText: { fontWeight: '700', color: '#FFFFFF' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 18,
  },
  primaryButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  outlineButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  outlineButtonText: { fontSize: 15, fontWeight: '700', color: '#334155' },
  deleteButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#B91C1C',
    paddingHorizontal: 16,
  },
  deleteButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  disabled: { opacity: 0.5 },
  form: { gap: 10 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  multiline: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
  listItem: { minHeight: 48, gap: 4, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  updateCard: { gap: 8, borderTopWidth: 1, borderTopColor: '#BFDBFE', paddingTop: 12 },
  compactButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  linkText: { fontSize: 15, fontWeight: '700', color: '#1D4ED8' },
  dangerLink: { fontSize: 15, fontWeight: '700', color: '#B91C1C' },
  reportAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  reportActionText: { fontSize: 15, fontWeight: '700', color: '#B45309' },
});
