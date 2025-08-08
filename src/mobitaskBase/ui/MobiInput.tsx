import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle,
    TouchableOpacity
} from 'react-native';

export interface MobiInputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    required?: boolean;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: 'default' | 'outlined' | 'filled';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    helperText?: string;
}

export const MobiInput: React.FC<MobiInputProps> = ({
    label,
    error,
    required = false,
    containerStyle,
    inputStyle,
    labelStyle,
    errorStyle,
    leftIcon,
    rightIcon,
    variant = 'default',
    size = 'medium',
    disabled = false,
    helperText,
    value,
    onChangeText,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        props.onBlur?.(e);
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    input: styles.inputSmall,
                    container: styles.containerSmall
                };
            case 'large':
                return {
                    input: styles.inputLarge,
                    container: styles.containerLarge
                };
            default:
                return {
                    input: styles.inputMedium,
                    container: styles.containerMedium
                };
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

    const sizeStyles = getSizeStyles();
    const variantStyles = getVariantStyles();

    const containerStyles = [
        styles.container,
        sizeStyles.container,
        variantStyles.container,
        isFocused && styles.focused,
        error && styles.error,
        disabled && styles.disabled,
        containerStyle
    ];

    const inputStyles = [
        styles.input,
        sizeStyles.input,
        variantStyles.input,
        leftIcon && styles.inputWithLeftIcon,
        rightIcon && styles.inputWithRightIcon,
        disabled && styles.inputDisabled,
        inputStyle
    ].filter(Boolean);

    return (
        <View style={containerStyles}>
            {label && (
                <Text style={[styles.label, labelStyle]}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}

            <View style={styles.inputContainer}>
                {leftIcon && (
                    <View style={styles.leftIconContainer}>
                        {leftIcon}
                    </View>
                )}

                <TextInput
                    style={inputStyles}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    editable={!disabled}
                    placeholderTextColor={disabled ? '#C0C0C0' : '#999999'}
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity style={styles.rightIconContainer}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>

            {(error || helperText) && (
                <Text style={[
                    styles.helperText,
                    error ? [styles.errorText, errorStyle] : styles.helperTextNormal
                ]}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    containerSmall: {
        marginBottom: 12,
    },
    containerMedium: {
        marginBottom: 16,
    },
    containerLarge: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    required: {
        color: '#E53E3E',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        backgroundColor: 'transparent',
    },
    inputSmall: {
        fontSize: 14,
        paddingVertical: 8,
        paddingHorizontal: 12,
        minHeight: 36,
    },
    inputMedium: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 48,
    },
    inputLarge: {
        fontSize: 18,
        paddingVertical: 16,
        paddingHorizontal: 20,
        minHeight: 56,
    },
    inputWithLeftIcon: {
        paddingLeft: 44,
    },
    inputWithRightIcon: {
        paddingRight: 44,
    },
    inputDisabled: {
        color: '#999999',
        backgroundColor: '#F5F5F5',
    },
    // Default variant
    defaultContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    defaultInput: {
        backgroundColor: 'transparent',
    },
    // Outlined variant
    outlinedContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    outlinedInput: {
        backgroundColor: 'transparent',
    },
    // Filled variant
    filledContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filledInput: {
        backgroundColor: 'transparent',
    },
    // State styles
    focused: {
        borderColor: '#007AFF',
    },
    error: {
        borderColor: '#E53E3E',
    },
    disabled: {
        backgroundColor: '#F8F8F8',
        borderColor: '#E0E0E0',
    },
    // Icon containers
    leftIconContainer: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        height: 20,
    },
    rightIconContainer: {
        position: 'absolute',
        right: 12,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        height: 20,
    },
    // Helper text
    helperText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    helperTextNormal: {
        color: '#666666',
    },
    errorText: {
        color: '#E53E3E',
    },
});

export default MobiInput;
