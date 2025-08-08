import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Platform,
    ViewStyle,
    TextStyle
} from 'react-native';

// Conditional import for React Native DateTimePicker
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
    try {
        DateTimePicker = require('@react-native-community/datetimepicker').default;
    } catch (e) {
        console.warn('DateTimePicker not available for this platform');
    }
}

export interface MobiDatePickerProps {
    label?: string;
    value?: Date;
    onChange: (date: Date) => void;
    mode?: 'date' | 'time' | 'datetime';
    minimumDate?: Date;
    maximumDate?: Date;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    required?: boolean;
    format?: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd' | 'custom';
    customFormatFn?: (date: Date) => string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'default' | 'outlined' | 'filled';
}

export const MobiDatePicker: React.FC<MobiDatePickerProps> = ({
    label,
    value,
    onChange,
    mode = 'date',
    minimumDate,
    maximumDate,
    placeholder = 'Selecionar data',
    disabled = false,
    error,
    required = false,
    format = 'dd/MM/yyyy',
    customFormatFn,
    style,
    textStyle,
    variant = 'default'
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState(value || new Date());

    const formatDateForInput = (date?: Date): string => {
        return date ? date.toISOString().split('T')[0] : '';
    };

    const formatTimeForInput = (date?: Date): string => {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatDate = (date: Date): string => {
        if (customFormatFn) {
            return customFormatFn(date);
        }

        switch (format) {
            case 'dd/MM/yyyy':
                return date.toLocaleDateString('pt-BR');
            case 'MM/dd/yyyy':
                return date.toLocaleDateString('en-US');
            case 'yyyy-MM-dd':
                return date.toISOString().split('T')[0];
            default:
                return date.toLocaleDateString('pt-BR');
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDateTime = (date: Date): string => {
        return `${formatDate(date)} ${formatTime(date)}`;
    };

    const getDisplayValue = (): string => {
        if (!value) return placeholder;

        switch (mode) {
            case 'time':
                return formatTime(value);
            case 'datetime':
                return formatDateTime(value);
            default:
                return formatDate(value);
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'outlined':
                return {
                    container: styles.outlinedContainer,
                    input: styles.outlinedInput
                };
            case 'filled':
                return {
                    container: styles.filledContainer,
                    input: styles.filledInput
                };
            default:
                return {
                    container: styles.defaultContainer,
                    input: styles.defaultInput
                };
        }
    };

    const variantStyles = getVariantStyles();

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
            setTempDate(selectedDate);
            if (Platform.OS === 'android') {
                onChange(selectedDate);
            }
        }
    };

    const handleConfirm = () => {
        onChange(tempDate);
        setShowPicker(false);
    };

    const handleCancel = () => {
        setTempDate(value || new Date());
        setShowPicker(false);
    };

    const renderDatePicker = () => {
        // Web platform uses HTML input
        if (Platform.OS === 'web') {
            return null; // Web input is rendered inline
        }

        if (Platform.OS === 'ios') {
            return (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showPicker}
                    onRequestClose={handleCancel}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={handleCancel}>
                                    <Text style={styles.modalButton}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleConfirm}>
                                    <Text style={[styles.modalButton, styles.confirmButton]}>
                                        Confirmar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {DateTimePicker && (
                                <DateTimePicker
                                    value={tempDate}
                                    mode={mode}
                                    display="spinner"
                                    onChange={handleDateChange}
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
                                    locale="pt-BR"
                                />
                            )}
                        </View>
                    </View>
                </Modal>
            );
        }

        if (showPicker && DateTimePicker) {
            return (
                <DateTimePicker
                    value={tempDate}
                    mode={mode}
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                />
            );
        }

        return null;
    };

    const containerStyles = [
        styles.container,
        variantStyles.container,
        error && styles.errorContainer,
        disabled && styles.disabledContainer,
        style
    ].filter(Boolean);

    const inputStyles = [
        styles.input,
        variantStyles.input,
        !value && styles.placeholderText,
        error && styles.errorInput,
        disabled && styles.disabledInput,
        textStyle
    ].filter(Boolean);

    return (
        <View style={styles.wrapper}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}

            {Platform.OS === 'web' ? (
                <View style={[styles.webContainer, variantStyles.container, error && styles.errorContainer, disabled && styles.disabledContainer, style]}>
                    <input
                        type={mode === 'time' ? 'time' : mode === 'datetime' ? 'datetime-local' : 'date'}
                        value={mode === 'time' ? formatTimeForInput(value) : formatDateForInput(value)}
                        onChange={(e) => {
                            if (e.target.value) {
                                const newDate = new Date(e.target.value);
                                if (!isNaN(newDate.getTime())) {
                                    onChange(newDate);
                                }
                            }
                        }}
                        disabled={disabled}
                        style={{
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: 16,
                            color: error ? '#EF4444' : disabled ? '#9CA3AF' : '#000000',
                            width: '100%',
                            padding: 0
                        }}
                    />
                </View>
            ) : (
                <TouchableOpacity
                    style={containerStyles}
                    onPress={() => !disabled && setShowPicker(true)}
                    disabled={disabled}
                >
                    <Text style={inputStyles}>
                        {getDisplayValue()}
                    </Text>
                </TouchableOpacity>
            )}

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {renderDatePicker()}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    container: {
        borderRadius: 8,
        justifyContent: 'center',
    },
    webContainer: {
        borderRadius: 8,
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    input: {
        fontSize: 16,
        color: '#000000',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    required: {
        color: '#EF4444',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    errorContainer: {
        borderColor: '#EF4444',
    },
    errorInput: {
        color: '#EF4444',
    },
    disabledContainer: {
        opacity: 0.5,
    },
    disabledInput: {
        color: '#9CA3AF',
    },

    // Variant styles
    defaultContainer: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    defaultInput: {
        // Default input styles already defined above
    },
    outlinedContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    outlinedInput: {
        // Same as default
    },
    filledContainer: {
        backgroundColor: '#F3F4F6',
        borderWidth: 0,
    },
    filledInput: {
        // Same as default
    },

    // Modal styles for iOS
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 34, // Safe area for iOS
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalButton: {
        fontSize: 16,
        color: '#007AFF',
    },
    confirmButton: {
        fontWeight: '600',
    },
});

export default MobiDatePicker;
