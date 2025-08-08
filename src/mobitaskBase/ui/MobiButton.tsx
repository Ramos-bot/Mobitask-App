import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View
} from 'react-native';

export interface MobiButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const MobiButton: React.FC<MobiButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    style,
    textStyle
}) => {
    const isDisabled = disabled || loading;

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    container: styles.secondaryContainer,
                    text: styles.secondaryText
                };
            case 'outline':
                return {
                    container: styles.outlineContainer,
                    text: styles.outlineText
                };
            case 'ghost':
                return {
                    container: styles.ghostContainer,
                    text: styles.ghostText
                };
            case 'danger':
                return {
                    container: styles.dangerContainer,
                    text: styles.dangerText
                };
            default:
                return {
                    container: styles.primaryContainer,
                    text: styles.primaryText
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    container: styles.smallContainer,
                    text: styles.smallText
                };
            case 'large':
                return {
                    container: styles.largeContainer,
                    text: styles.largeText
                };
            default:
                return {
                    container: styles.mediumContainer,
                    text: styles.mediumText
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    const containerStyles = [
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style
    ].filter(Boolean);

    const textStyles = [
        styles.text,
        variantStyles.text,
        sizeStyles.text,
        isDisabled && styles.disabledText,
        textStyle
    ].filter(Boolean);

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.contentContainer}>
                    <ActivityIndicator
                        color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#007AFF'}
                        size="small"
                    />
                    <Text style={[textStyles, styles.loadingText]}>{title}</Text>
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                {leftIcon && (
                    <View style={styles.leftIcon}>
                        {leftIcon}
                    </View>
                )}
                <Text style={textStyles}>{title}</Text>
                {rightIcon && (
                    <View style={styles.rightIcon}>
                        {rightIcon}
                    </View>
                )}
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={containerStyles}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
    loadingText: {
        marginLeft: 8,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.7,
    },

    // Size variants
    smallContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        minHeight: 32,
    },
    smallText: {
        fontSize: 12,
    },
    mediumContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 44,
    },
    mediumText: {
        fontSize: 14,
    },
    largeContainer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        minHeight: 52,
    },
    largeText: {
        fontSize: 16,
    },

    // Color variants
    primaryContainer: {
        backgroundColor: '#007AFF',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryContainer: {
        backgroundColor: '#F2F2F7',
    },
    secondaryText: {
        color: '#007AFF',
    },
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    outlineText: {
        color: '#007AFF',
    },
    ghostContainer: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: '#007AFF',
    },
    dangerContainer: {
        backgroundColor: '#E53E3E',
    },
    dangerText: {
        color: '#FFFFFF',
    },
});

export default MobiButton;
