import { Platform } from 'react-native';

type Props = {
    value: Date | null;
    onChange: (d: Date | null) => void;
};

export default function DatePicker({ value, onChange }: Props) {
    if (Platform.OS === 'web') {
        return (
            <input
                type="date"
                value={value ? value.toISOString().slice(0, 10) : ''}
                onChange={(e) => {
                    const v = e.target.value;
                    onChange(v ? new Date(v + 'T00:00:00') : null);
                }}
                style={{ padding: 8, borderRadius: 8 }}
            />
        );
    } else {
        const RNDateTimePicker = require('@react-native-community/datetimepicker').default;
        return (
            <RNDateTimePicker
                value={value ?? new Date()}
                mode="date"
                display="default"
                onChange={(_e: any, d?: Date) => onChange(d ?? value)}
            />
        );
    }
}
