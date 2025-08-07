import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, Alert, RefreshControl, Modal, TextInput
} from 'react-native';
import { useApp } from '../shared/context/AppContext';

export default function CalendarScreen({ user, onBack, onNavigate }) {
    const {
        clients,
        activities,
        loading
    } = useApp();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // month, week, day
    const [refreshing, setRefreshing] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        generateEvents();
    }, []);

    const generateEvents = () => {
        const eventsList = [
            {
                id: 'event_1',
                title: 'Análise Piscina - Maria Silva',
                description: 'Análise completa da qualidade da água',
                date: new Date(2024, 0, 15, 10, 0), // 15 Jan 2024, 10:00
                duration: 120, // minutos
                type: 'aqua',
                clientId: 'client_1',
                status: 'scheduled',
                priority: 'high',
                location: 'Rua das Flores, 123 - Lisboa'
            },
            {
                id: 'event_2',
                title: 'Manutenção Jardim - João Santos',
                description: 'Poda e tratamento de plantas',
                date: new Date(2024, 0, 15, 14, 30), // 15 Jan 2024, 14:30
                duration: 180,
                type: 'verde',
                clientId: 'client_2',
                status: 'scheduled',
                priority: 'medium',
                location: 'Avenida Central, 456 - Porto'
            },
            {
                id: 'event_3',
                title: 'Consultoria Fitossanitários',
                description: 'Avaliação de produtos para pragas',
                date: new Date(2024, 0, 16, 9, 0), // 16 Jan 2024, 09:00
                duration: 90,
                type: 'phyto',
                clientId: 'client_3',
                status: 'confirmed',
                priority: 'high',
                location: 'Quinta do Vale, Sintra'
            },
            {
                id: 'event_4',
                title: 'Reunião Equipa',
                description: 'Reunião semanal de coordenação',
                date: new Date(2024, 0, 16, 15, 0), // 16 Jan 2024, 15:00
                duration: 60,
                type: 'meeting',
                clientId: null,
                status: 'scheduled',
                priority: 'medium',
                location: 'Escritório - Sala de Reuniões'
            },
            {
                id: 'event_5',
                title: 'Formação Aqua',
                description: 'Curso de atualização em tratamento de águas',
                date: new Date(2024, 0, 17, 10, 0), // 17 Jan 2024, 10:00
                duration: 240,
                type: 'training',
                clientId: null,
                status: 'scheduled',
                priority: 'low',
                location: 'Centro de Formação, Cascais'
            },
            {
                id: 'event_6',
                title: 'Análise Urgente - António Costa',
                description: 'Problema reportado na qualidade da água',
                date: new Date(2024, 0, 18, 8, 0), // 18 Jan 2024, 08:00
                duration: 90,
                type: 'aqua',
                clientId: 'client_4',
                status: 'urgent',
                priority: 'high',
                location: 'Condomínio Sol Mar, Cascais'
            }
        ];

        setEvents(eventsList);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        generateEvents();
        setRefreshing(false);
    };

    const getMonthCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendar = [];
        const current = new Date(startDate);

        for (let week = 0; week < 6; week++) {
            const weekDays = [];
            for (let day = 0; day < 7; day++) {
                weekDays.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            calendar.push(weekDays);

            // Stop if we've covered the entire month
            if (current.getMonth() !== month) break;
        }

        return calendar;
    };

    const getEventsForDate = (date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'aqua': return '#1e88e5';
            case 'verde': return '#4caf50';
            case 'phyto': return '#ff9800';
            case 'meeting': return '#9c27b0';
            case 'training': return '#607d8b';
            default: return '#666';
        }
    };

    const getEventTypeIcon = (type) => {
        switch (type) {
            case 'aqua': return '💧';
            case 'verde': return '🌱';
            case 'phyto': return '🧪';
            case 'meeting': return '👥';
            case 'training': return '📚';
            default: return '📅';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return '#2196f3';
            case 'confirmed': return '#4caf50';
            case 'urgent': return '#f44336';
            case 'completed': return '#666';
            case 'cancelled': return '#ff5722';
            default: return '#666';
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-PT', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}min`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${mins}min`;
        }
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameMonth = (date, month) => {
        return date.getMonth() === month;
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedDate(newDate);
    };

    const handleEventPress = (event) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const handleDatePress = (date) => {
        setSelectedDate(date);
        if (viewMode === 'month') {
            setViewMode('day');
        }
    };

    const renderMonthView = () => {
        const calendar = getMonthCalendar(selectedDate);
        const currentMonth = selectedDate.getMonth();

        return (
            <View style={styles.monthView}>
                {/* Days of Week Header */}
                <View style={styles.weekHeader}>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <Text key={index} style={styles.weekHeaderText}>{day}</Text>
                    ))}
                </View>

                {/* Calendar Grid */}
                {calendar.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {week.map((day, dayIndex) => {
                            const dayEvents = getEventsForDate(day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isSelected = day.toDateString() === selectedDate.toDateString();

                            return (
                                <TouchableOpacity
                                    key={dayIndex}
                                    style={[
                                        styles.dayCell,
                                        isToday(day) && styles.todayCell,
                                        isSelected && styles.selectedCell,
                                        !isCurrentMonth && styles.otherMonthCell
                                    ]}
                                    onPress={() => handleDatePress(day)}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        isToday(day) && styles.todayText,
                                        isSelected && styles.selectedText,
                                        !isCurrentMonth && styles.otherMonthText
                                    ]}>
                                        {day.getDate()}
                                    </Text>

                                    {dayEvents.length > 0 && (
                                        <View style={styles.eventIndicators}>
                                            {dayEvents.slice(0, 3).map((event, index) => (
                                                <View
                                                    key={index}
                                                    style={[
                                                        styles.eventDot,
                                                        { backgroundColor: getEventTypeColor(event.type) }
                                                    ]}
                                                />
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <Text style={styles.moreEvents}>+{dayEvents.length - 3}</Text>
                                            )}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    const renderDayView = () => {
        const dayEvents = getEventsForDate(selectedDate).sort((a, b) => a.date - b.date);

        return (
            <ScrollView style={styles.dayView} showsVerticalScrollIndicator={false}>
                <Text style={styles.dayViewTitle}>
                    {selectedDate.toLocaleDateString('pt-PT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Text>

                {dayEvents.length > 0 ? (
                    dayEvents.map((event) => (
                        <TouchableOpacity
                            key={event.id}
                            style={styles.eventCard}
                            onPress={() => handleEventPress(event)}
                        >
                            <View style={styles.eventTime}>
                                <Text style={styles.eventTimeText}>{formatTime(event.date)}</Text>
                                <Text style={styles.eventDurationText}>
                                    {formatDuration(event.duration)}
                                </Text>
                            </View>

                            <View style={[
                                styles.eventContent,
                                { borderLeftColor: getEventTypeColor(event.type) }
                            ]}>
                                <View style={styles.eventHeader}>
                                    <Text style={styles.eventTypeIcon}>
                                        {getEventTypeIcon(event.type)}
                                    </Text>
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <View style={[
                                        styles.eventStatus,
                                        { backgroundColor: getStatusColor(event.status) }
                                    ]}>
                                        <Text style={styles.eventStatusText}>
                                            {event.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.eventDescription}>
                                    {event.description}
                                </Text>

                                <Text style={styles.eventLocation}>
                                    📍 {event.location}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.noEventsContainer}>
                        <Text style={styles.noEventsIcon}>📅</Text>
                        <Text style={styles.noEventsText}>Sem eventos agendados para este dia</Text>
                    </View>
                )}
            </ScrollView>
        );
    };

    const renderEventModal = () => {
        if (!selectedEvent) return null;

        return (
            <Modal
                visible={showEventModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEventModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detalhes do Evento</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowEventModal(false)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.modalEventHeader}>
                                <Text style={styles.modalEventIcon}>
                                    {getEventTypeIcon(selectedEvent.type)}
                                </Text>
                                <Text style={styles.modalEventTitle}>
                                    {selectedEvent.title}
                                </Text>
                            </View>

                            <Text style={styles.modalEventDescription}>
                                {selectedEvent.description}
                            </Text>

                            <View style={styles.modalEventDetails}>
                                <View style={styles.modalDetailRow}>
                                    <Text style={styles.modalDetailLabel}>📅 Data:</Text>
                                    <Text style={styles.modalDetailValue}>
                                        {selectedEvent.date.toLocaleDateString('pt-PT')}
                                    </Text>
                                </View>

                                <View style={styles.modalDetailRow}>
                                    <Text style={styles.modalDetailLabel}>🕐 Hora:</Text>
                                    <Text style={styles.modalDetailValue}>
                                        {formatTime(selectedEvent.date)}
                                    </Text>
                                </View>

                                <View style={styles.modalDetailRow}>
                                    <Text style={styles.modalDetailLabel}>⏱️ Duração:</Text>
                                    <Text style={styles.modalDetailValue}>
                                        {formatDuration(selectedEvent.duration)}
                                    </Text>
                                </View>

                                <View style={styles.modalDetailRow}>
                                    <Text style={styles.modalDetailLabel}>📍 Local:</Text>
                                    <Text style={styles.modalDetailValue}>
                                        {selectedEvent.location}
                                    </Text>
                                </View>

                                <View style={styles.modalDetailRow}>
                                    <Text style={styles.modalDetailLabel}>📊 Status:</Text>
                                    <View style={[
                                        styles.modalStatusBadge,
                                        { backgroundColor: getStatusColor(selectedEvent.status) }
                                    ]}>
                                        <Text style={styles.modalStatusText}>
                                            {selectedEvent.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalActionButton}>
                                    <Text style={styles.modalActionText}>Editar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalActionButton, styles.cancelButton]}>
                                    <Text style={[styles.modalActionText, styles.cancelText]}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendário</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => Alert.alert('Novo Evento', 'Funcionalidade em desenvolvimento')}
                >
                    <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateMonth(-1)}
                >
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.monthTitle}>
                    {selectedDate.toLocaleDateString('pt-PT', {
                        month: 'long',
                        year: 'numeric'
                    })}
                </Text>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateMonth(1)}
                >
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* View Mode Selector */}
            <View style={styles.viewModeSelector}>
                {['month', 'day'].map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[
                            styles.viewModeButton,
                            viewMode === mode && styles.viewModeButtonActive
                        ]}
                        onPress={() => setViewMode(mode)}
                    >
                        <Text style={[
                            styles.viewModeText,
                            viewMode === mode && styles.viewModeTextActive
                        ]}>
                            {mode === 'month' ? 'Mês' : 'Dia'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {viewMode === 'month' ? renderMonthView() : renderDayView()}
            </ScrollView>

            {renderEventModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#1565C0',
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    monthNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize',
    },
    viewModeSelector: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    viewModeButton: {
        flex: 1,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    viewModeButtonActive: {
        backgroundColor: '#1e88e5',
    },
    viewModeText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    viewModeTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    monthView: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    weekHeader: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    weekHeaderText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    weekRow: {
        flexDirection: 'row',
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderRightWidth: 0.5,
        borderColor: '#f0f0f0',
        position: 'relative',
    },
    todayCell: {
        backgroundColor: '#e3f2fd',
    },
    selectedCell: {
        backgroundColor: '#1e88e5',
    },
    otherMonthCell: {
        backgroundColor: '#fafafa',
    },
    dayText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    todayText: {
        color: '#1e88e5',
        fontWeight: 'bold',
    },
    selectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    otherMonthText: {
        color: '#ccc',
    },
    eventIndicators: {
        position: 'absolute',
        bottom: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1,
    },
    moreEvents: {
        fontSize: 8,
        color: '#666',
        marginLeft: 2,
    },
    dayView: {
        flex: 1,
        padding: 20,
    },
    dayViewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textTransform: 'capitalize',
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    eventTime: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#f5f5f5',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        minWidth: 80,
    },
    eventTimeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    eventDurationText: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
    eventContent: {
        flex: 1,
        padding: 15,
        borderLeftWidth: 4,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventTypeIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    eventTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    eventStatus: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    eventStatusText: {
        fontSize: 8,
        color: '#fff',
        fontWeight: 'bold',
    },
    eventDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        lineHeight: 16,
    },
    eventLocation: {
        fontSize: 10,
        color: '#999',
    },
    noEventsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noEventsIcon: {
        fontSize: 60,
        marginBottom: 20,
        opacity: 0.5,
    },
    noEventsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 20,
        maxHeight: '80%',
        width: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCloseButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        color: '#666',
    },
    modalBody: {
        padding: 20,
    },
    modalEventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalEventIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    modalEventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    modalEventDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    modalEventDetails: {
        marginBottom: 20,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalDetailLabel: {
        fontSize: 14,
        color: '#666',
        width: 80,
    },
    modalDetailValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    modalStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    modalStatusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modalActionButton: {
        flex: 1,
        backgroundColor: '#1e88e5',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    modalActionText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    cancelText: {
        color: '#666',
    },
});
