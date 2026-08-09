import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props<TFields extends FieldValues> {
  control: Control<TFields>;
  label: string;
  name: Path<TFields>;
  secureTextEntry?: boolean;
  testID: string;
}

export function FormField<TFields extends FieldValues>({
  control,
  label,
  name,
  secureTextEntry = false,
  testID,
}: Props<TFields>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={name === 'email' ? 'email-address' : 'default'}
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry={secureTextEntry}
            style={[styles.input, error ? styles.inputError : null]}
            testID={testID}
            value={typeof value === 'string' ? value : ''}
          />
          {error?.message ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error.message}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  inputError: { borderColor: '#DC2626' },
  error: { fontSize: 13, color: '#B91C1C' },
});
