import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Visitor {
  id: string;
  timestamp: string;
  page: string;
  referrer?: string;
  userAgent?: string;
}

interface PhoneClick {
  id: string;
  timestamp: string;
  phoneNumber: string;
  page: string;
}

interface ChangeLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

interface AnalyticsData {
  visitors: Visitor[];
  phoneClicks: PhoneClick[];
  changeLogs: ChangeLog[];
}

interface AnalyticsContextType {
  analytics: AnalyticsData;
  trackVisit: (page: string) => void;
  trackPhoneClick: (phoneNumber: string, page: string) => void;
  addChangeLog: (user: string, action: string, details: string) => void;
  clearAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const ANALYTICS_STORAGE_KEY = 'sofia_furniture_analytics';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          visitors: [],
          phoneClicks: [],
          changeLogs: []
        };
      }
    }
    return {
      visitors: [],
      phoneClicks: [],
      changeLogs: []
    };
  });

  // Save to localStorage whenever analytics changes
  useEffect(() => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));
  }, [analytics]);

  // Track page visit
  const trackVisit = useCallback((page: string) => {
    const visitor: Visitor = {
      id: `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      page,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent
    };

    setAnalytics(prev => ({
      ...prev,
      visitors: [...prev.visitors, visitor].slice(-1000) // Keep last 1000 visits
    }));
  }, []);

  // Track phone click
  const trackPhoneClick = useCallback((phoneNumber: string, page: string) => {
    const click: PhoneClick = {
      id: `click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      phoneNumber,
      page
    };

    setAnalytics(prev => ({
      ...prev,
      phoneClicks: [...prev.phoneClicks, click].slice(-500) // Keep last 500 clicks
    }));
  }, []);

  // Add change log entry
  const addChangeLog = useCallback((user: string, action: string, details: string) => {
    const log: ChangeLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user,
      action,
      details
    };

    setAnalytics(prev => ({
      ...prev,
      changeLogs: [...prev.changeLogs, log].slice(-500) // Keep last 500 logs
    }));
  }, []);

  // Clear all analytics data
  const clearAnalytics = useCallback(() => {
    setAnalytics({
      visitors: [],
      phoneClicks: [],
      changeLogs: []
    });
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        trackVisit,
        trackPhoneClick,
        addChangeLog,
        clearAnalytics
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
