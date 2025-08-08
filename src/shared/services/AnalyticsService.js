import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../../firebaseConfig';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

class AnalyticsService {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        this.events = [];
        this.isEnabled = true;
        this.userConsent = null;

        this.initializeAnalytics();
    }

    // Initialize analytics service
    async initializeAnalytics() {
        try {
            // Check user consent for analytics
            const consent = await AsyncStorage.getItem('analytics_consent');
            this.userConsent = consent === 'true';

            if (this.userConsent) {
                console.log('📊 Analytics service initialized');
                this.trackEvent('app_start', {
                    session_id: this.sessionId,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('❌ Analytics initialization error:', error);
        }
    }

    // Set user consent for analytics
    async setUserConsent(consent) {
        try {
            this.userConsent = consent;
            await AsyncStorage.setItem('analytics_consent', consent.toString());

            if (consent) {
                console.log('✅ Analytics consent granted');
                this.flushPendingEvents();
            } else {
                console.log('🚫 Analytics consent denied');
                this.clearAnalyticsData();
            }
        } catch (error) {
            console.error('❌ Set analytics consent error:', error);
        }
    }

    // Track event
    trackEvent(eventName, properties = {}) {
        if (!this.userConsent || !this.isEnabled) {
            return;
        }

        const event = {
            event_name: eventName,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            properties: {
                ...properties,
                app_version: '1.0.0', // Get from app.json or package.json
                platform: 'mobile' // or 'web' depending on platform
            }
        };

        this.events.push(event);

        // Send to Firebase in batches or immediately for important events
        if (this.isImportantEvent(eventName) || this.events.length >= 10) {
            this.flushEvents();
        }
    }

    // Track screen view
    trackScreenView(screenName, properties = {}) {
        this.trackEvent('screen_view', {
            screen_name: screenName,
            ...properties
        });
    }

    // Track user action
    trackUserAction(action, target, properties = {}) {
        this.trackEvent('user_action', {
            action,
            target,
            ...properties
        });
    }

    // Track performance metrics
    trackPerformance(metric, value, properties = {}) {
        this.trackEvent('performance', {
            metric,
            value,
            ...properties
        });
    }

    // Track errors
    trackError(error, context = {}) {
        if (!this.userConsent) return;

        this.trackEvent('error', {
            error_message: error.message || error,
            error_stack: error.stack,
            error_context: context,
            timestamp: new Date().toISOString()
        });
    }

    // Track user engagement
    trackEngagement(action, duration = null, properties = {}) {
        this.trackEvent('engagement', {
            action,
            duration,
            ...properties
        });
    }

    // Track business metrics
    trackBusiness(metric, value, properties = {}) {
        this.trackEvent('business', {
            metric,
            value,
            ...properties
        });
    }

    // Start session
    startSession() {
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();

        this.trackEvent('session_start', {
            session_id: this.sessionId
        });
    }

    // End session
    endSession() {
        const sessionDuration = Date.now() - this.sessionStartTime;

        this.trackEvent('session_end', {
            session_id: this.sessionId,
            session_duration: sessionDuration
        });

        this.flushEvents();
    }

    // Flush events to Firebase
    async flushEvents() {
        if (!this.userConsent || this.events.length === 0) {
            return;
        }

        try {
            const batch = [...this.events];
            this.events = [];

            // Send events to Firebase
            await addDoc(collection(db, 'analytics_events'), {
                events: batch,
                batch_timestamp: new Date(),
                session_id: this.sessionId
            });

            console.log(`📊 Sent ${batch.length} analytics events`);
        } catch (error) {
            console.error('❌ Analytics flush error:', error);
            // Re-add events to queue for retry
            this.events = [...this.events, ...batch];
        }
    }

    // Flush pending events
    flushPendingEvents() {
        if (this.events.length > 0) {
            this.flushEvents();
        }
    }

    // Check if event is important (should be sent immediately)
    isImportantEvent(eventName) {
        const importantEvents = [
            'app_start',
            'session_start',
            'session_end',
            'error',
            'crash',
            'purchase',
            'subscription'
        ];

        return importantEvents.includes(eventName);
    }

    // Generate unique session ID
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Clear analytics data
    async clearAnalyticsData() {
        try {
            this.events = [];
            await AsyncStorage.removeItem('analytics_consent');
            console.log('🗑️ Analytics data cleared');
        } catch (error) {
            console.error('❌ Clear analytics data error:', error);
        }
    }

    // Get analytics summary
    async getAnalyticsSummary() {
        if (!this.userConsent) {
            return null;
        }

        try {
            // This would typically fetch from your analytics backend
            return {
                session_id: this.sessionId,
                session_duration: Date.now() - this.sessionStartTime,
                events_tracked: this.events.length,
                consent_status: this.userConsent
            };
        } catch (error) {
            console.error('❌ Get analytics summary error:', error);
            return null;
        }
    }

    // Enable/disable analytics
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`📊 Analytics ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Export singleton instance
export default new AnalyticsService();
