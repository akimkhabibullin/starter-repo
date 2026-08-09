import { useEffect } from 'react';

import { queryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { getSupabaseClient } from '@/lib/supabase/client';

const ERROR_CHANNEL_STATUSES: ReadonlySet<string> = new Set(['CHANNEL_ERROR', 'TIMED_OUT']);

export function useMapRealtime(selectedItemId: string | undefined): void {
  useEffect(() => {
    const supabase = getSupabaseClient();
    let mapTimer: ReturnType<typeof setTimeout> | undefined;
    let updatesTimer: ReturnType<typeof setTimeout> | undefined;

    const invalidateMap = () => {
      if (mapTimer) clearTimeout(mapTimer);
      mapTimer = setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.mapItems.all });
      }, 250);
    };

    const invalidateUpdates = () => {
      if (!selectedItemId) return;
      if (updatesTimer) clearTimeout(updatesTimer);
      updatesTimer = setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.mapItems.updates(selectedItemId),
        });
      }, 250);
    };

    const channel = supabase
      .channel('authenticated-map-area')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_items' }, invalidateMap)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'map_updates' },
        invalidateUpdates,
      )
      .subscribe((status) => {
        if (ERROR_CHANNEL_STATUSES.has(status)) {
          console.error('Map synchronization channel is unavailable.');
        }
      });

    return () => {
      if (mapTimer) clearTimeout(mapTimer);
      if (updatesTimer) clearTimeout(updatesTimer);
      void supabase.removeChannel(channel);
    };
  }, [selectedItemId]);
}
