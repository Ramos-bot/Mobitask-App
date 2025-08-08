import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    ScrollView,
    ViewStyle,
    SafeAreaView
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface MobiDrawerItem {
    key: string;
    title: string;
    icon?: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    badge?: string | number;
    children?: MobiDrawerItem[];
}

export interface MobiDrawerProps {
    visible: boolean;
    onClose: () => void;
    items: MobiDrawerItem[];
    title?: string;
    subtitle?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    position?: 'left' | 'right';
    width?: number;
    overlay?: boolean;
    closeOnItemPress?: boolean;
    style?: ViewStyle;
    itemStyle?: ViewStyle;
    activeItemKey?: string;
}

export const MobiDrawer: React.FC<MobiDrawerProps> = ({
    visible,
    onClose,
    items,
    title,
    subtitle,
    header,
    footer,
    position = 'left',
    width = screenWidth * 0.8,
    overlay = true,
    closeOnItemPress = true,
    style,
    itemStyle,
    activeItemKey
}) => {
    const slideAnimation = useRef(new Animated.Value(-width)).current;
    const opacityAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnimation, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnimation, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnimation, {
                    toValue: position === 'left' ? -width : width,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnimation, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, slideAnimation, opacityAnimation, width, position]);

    const handleItemPress = (item: MobiDrawerItem) => {
        if (item.disabled) return;

        item.onPress();

        if (closeOnItemPress) {
            onClose();
        }
    };

    const renderBadge = (badge: string | number) => (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
        </View>
    );

    const renderDrawerItem = (item: MobiDrawerItem, level: number = 0) => {
        const isActive = activeItemKey === item.key;
        const hasChildren = item.children && item.children.length > 0;

        return (
            <View key={item.key}>
                <TouchableOpacity
                    style={[
                        styles.drawerItem,
                        { paddingLeft: 16 + (level * 16) },
                        isActive && styles.activeItem,
                        item.disabled && styles.disabledItem,
                        itemStyle
                    ]}
                    onPress={() => handleItemPress(item)}
                    disabled={item.disabled}
                >
                    <View style={styles.itemContent}>
                        {item.icon && (
                            <View style={styles.itemIcon}>
                                {item.icon}
                            </View>
                        )}

                        <Text style={[
                            styles.itemText,
                            isActive && styles.activeItemText,
                            item.disabled && styles.disabledItemText
                        ]}>
                            {item.title}
                        </Text>

                        {item.badge && renderBadge(item.badge)}
                    </View>
                </TouchableOpacity>

                {hasChildren && item.children?.map(child =>
                    renderDrawerItem(child, level + 1)
                )}
            </View>
        );
    };

    const renderHeader = () => {
        if (header) return header;

        if (!title && !subtitle) return null;

        return (
            <View style={styles.header}>
                {title && (
                    <Text style={styles.headerTitle}>{title}</Text>
                )}
                {subtitle && (
                    <Text style={styles.headerSubtitle}>{subtitle}</Text>
                )}
            </View>
        );
    };

    const renderFooter = () => {
        if (!footer) return null;

        return (
            <View style={styles.footer}>
                {footer}
            </View>
        );
    };

    const drawerStyle = [
        styles.drawer,
        {
            width,
            [position]: 0,
            transform: [{ translateX: slideAnimation }]
        },
        style
    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {overlay && (
                    <TouchableWithoutFeedback onPress={onClose}>
                        <Animated.View
                            style={[
                                styles.overlay,
                                { opacity: opacityAnimation }
                            ]}
                        />
                    </TouchableWithoutFeedback>
                )}

                <Animated.View style={drawerStyle}>
                    <SafeAreaView style={styles.drawerContent}>
                        {renderHeader()}

                        <ScrollView
                            style={styles.itemsContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {items.map(item => renderDrawerItem(item))}
                        </ScrollView>

                        {renderFooter()}
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: {
            width: 2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 16,
    },
    drawerContent: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    itemsContainer: {
        flex: 1,
    },
    drawerItem: {
        paddingVertical: 12,
        paddingRight: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
    },
    activeItem: {
        backgroundColor: '#EBF8FF',
        borderRightWidth: 3,
        borderRightColor: '#007AFF',
    },
    activeItemText: {
        color: '#007AFF',
        fontWeight: '500',
    },
    disabledItem: {
        opacity: 0.5,
    },
    disabledItemText: {
        color: '#9CA3AF',
    },
    badge: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
});

export default MobiDrawer;
