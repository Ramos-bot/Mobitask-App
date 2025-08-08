import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    ViewStyle,
    TextStyle
} from 'react-native';

export interface MobiTableColumn {
    key: string;
    title: string;
    width?: number | string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, item: any, index: number) => React.ReactNode;
    sortable?: boolean;
}

export interface MobiTableProps {
    columns: MobiTableColumn[];
    data: any[];
    onRowPress?: (item: any, index: number) => void;
    loading?: boolean;
    emptyMessage?: string;
    showHeader?: boolean;
    striped?: boolean;
    bordered?: boolean;
    compact?: boolean;
    style?: ViewStyle;
    headerStyle?: ViewStyle;
    rowStyle?: ViewStyle;
    cellStyle?: ViewStyle;
    sortable?: boolean;
    defaultSort?: {
        key: string;
        direction: 'asc' | 'desc';
    };
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    keyExtractor?: (item: any, index: number) => string;
}

export const MobiTable: React.FC<MobiTableProps> = ({
    columns,
    data,
    onRowPress,
    loading = false,
    emptyMessage = 'Nenhum registro encontrado',
    showHeader = true,
    striped = false,
    bordered = false,
    compact = false,
    style,
    headerStyle,
    rowStyle,
    cellStyle,
    sortable = false,
    defaultSort,
    onSort,
    keyExtractor = (item, index) => index.toString()
}) => {
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: 'asc' | 'desc';
    } | null>(defaultSort || null);

    const handleSort = (columnKey: string) => {
        if (!sortable) return;

        const column = columns.find(col => col.key === columnKey);
        if (!column?.sortable) return;

        let direction: 'asc' | 'desc' = 'asc';

        if (sortConfig?.key === columnKey) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }

        const newSortConfig = { key: columnKey, direction };
        setSortConfig(newSortConfig);
        onSort?.(columnKey, direction);
    };

    const getSortedData = () => {
        if (!sortConfig || onSort) {
            // If there's an external sort handler, don't sort locally
            return data;
        }

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === bValue) return 0;

            let comparison = 0;
            if (aValue == null) comparison = -1;
            else if (bValue == null) comparison = 1;
            else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else {
                comparison = aValue < bValue ? -1 : 1;
            }

            return sortConfig.direction === 'desc' ? -comparison : comparison;
        });
    };

    const getColumnWidth = (column: MobiTableColumn): ViewStyle => {
        if (column.width) {
            return { width: column.width as any };
        }
        return { flex: 1 };
    };

    const getColumnAlign = (column: MobiTableColumn): TextStyle => {
        switch (column.align) {
            case 'center':
                return { textAlign: 'center' };
            case 'right':
                return { textAlign: 'right' };
            default:
                return { textAlign: 'left' };
        }
    };

    const renderSortIndicator = (columnKey: string) => {
        if (!sortable) return null;

        const column = columns.find(col => col.key === columnKey);
        if (!column?.sortable) return null;

        if (sortConfig?.key === columnKey) {
            return (
                <Text style={styles.sortIndicator}>
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                </Text>
            );
        }

        return <Text style={styles.sortIndicatorInactive}> ↕</Text>;
    };

    const renderHeader = () => {
        if (!showHeader) return null;

        return (
            <View style={[
                styles.headerRow,
                bordered && styles.borderedRow,
                headerStyle
            ]}>
                {columns.map((column) => (
                    <TouchableOpacity
                        key={column.key}
                        style={[
                            styles.headerCell,
                            getColumnWidth(column),
                            compact && styles.compactCell,
                            bordered && styles.borderedCell,
                            cellStyle
                        ]}
                        onPress={() => handleSort(column.key)}
                        disabled={!sortable || !column.sortable}
                    >
                        <Text style={[
                            styles.headerText,
                            getColumnAlign(column)
                        ]}>
                            {column.title}
                            {renderSortIndicator(column.key)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderCell = (column: MobiTableColumn, item: any, index: number) => {
        const value = item[column.key];

        if (column.render) {
            return column.render(value, item, index);
        }

        return (
            <Text style={[
                styles.cellText,
                getColumnAlign(column)
            ]}>
                {value?.toString() || ''}
            </Text>
        );
    };

    const renderRow = ({ item, index }: { item: any; index: number }) => {
        const isEven = index % 2 === 0;

        return (
            <TouchableOpacity
                style={[
                    styles.row,
                    striped && !isEven && styles.stripedRow,
                    bordered && styles.borderedRow,
                    rowStyle
                ]}
                onPress={() => onRowPress?.(item, index)}
                disabled={!onRowPress}
            >
                {columns.map((column) => (
                    <View
                        key={column.key}
                        style={[
                            styles.cell,
                            getColumnWidth(column),
                            compact && styles.compactCell,
                            bordered && styles.borderedCell,
                            cellStyle
                        ]}
                    >
                        {renderCell(column, item, index)}
                    </View>
                ))}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
    );

    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
        </View>
    );

    const sortedData = getSortedData();

    return (
        <View style={[styles.container, style]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tableContainer}>
                    {renderHeader()}

                    {loading ? (
                        renderLoading()
                    ) : sortedData.length === 0 ? (
                        renderEmpty()
                    ) : (
                        <FlatList
                            data={sortedData}
                            renderItem={renderRow}
                            keyExtractor={keyExtractor}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableContainer: {
        minWidth: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerCell: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    row: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    stripedRow: {
        backgroundColor: '#F9FAFB',
    },
    cell: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    cellText: {
        fontSize: 14,
        color: '#111827',
    },
    compactCell: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    borderedRow: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    borderedCell: {
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    sortIndicator: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    sortIndicatorInactive: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    emptyContainer: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default MobiTable;
