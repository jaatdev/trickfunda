import { useState, useEffect, useCallback } from 'react';

export interface SniffedUrl {
  id: string;
  url: string;
  type: 'm3u8' | 'mp4' | 'ts' | 'mpd' | 'other';
  quality: 'SD' | 'HD' | '4K' | 'Unknown';
  domain: string;
  tabTitle: string;
  headers: Record<string, string>;
  tokens: Record<string, string>;
  timestamp: number;
}

export type FilterType = 'all' | 'm3u8' | 'mp4' | 'ts' | 'mpd';

export function useVideoSniffer() {
  const [sniffedUrls, setSniffedUrls] = useState<SniffedUrl[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    byType: 'all' as FilterType,
    byDomain: '',
    bySearch: ''
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our extension
      if (!event.data || event.data.source !== 'trickfunda-sniffer-extension') return;

      if (event.data.type === 'TRICKFUNDA_SNIFFER_PONG') {
        setIsConnected(true);
        setIsScanning(event.data.data?.enabled !== false);
        clearTimeout(timeoutId);
      } else if (event.data.type === 'TRICKFUNDA_SNIFFER_READY') {
        // Extension just loaded, re-ping
        setIsConnected(true);
        clearTimeout(timeoutId);
        window.postMessage({ type: 'TRICKFUNDA_SNIFFER_GET_ALL' }, '*');
      } else if (event.data.type === 'TRICKFUNDA_SNIFFER_RESULT') {
        const newUrl = event.data.data as SniffedUrl;
        setSniffedUrls(prev => {
          if (prev.some(item => item.id === newUrl.id || item.url === newUrl.url)) {
            return prev;
          }
          return [newUrl, ...prev];
        });
      } else if (event.data.type === 'TRICKFUNDA_SNIFFER_ALL_RESULTS') {
        setSniffedUrls(event.data.data || []);
      } else if (event.data.type === 'TRICKFUNDA_SNIFFER_CLEARED') {
        setSniffedUrls([]);
        setSelectedId(null);
      } else if (event.data.type === 'TRICKFUNDA_SNIFFER_STATUS') {
        setIsScanning(event.data.data?.enabled !== false);
      }
    };

    window.addEventListener('message', handleMessage);

    // Ping extension
    window.postMessage({ type: 'TRICKFUNDA_SNIFFER_PING' }, '*');
    window.postMessage({ type: 'TRICKFUNDA_SNIFFER_GET_ALL' }, '*');

    // Timeout if no response within 2 seconds
    timeoutId = setTimeout(() => {
      setIsConnected(false);
    }, 2000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
    };
  }, []);

  const clearResults = useCallback(() => {
    setSniffedUrls([]);
    setSelectedId(null);
    window.postMessage({ type: 'TRICKFUNDA_SNIFFER_CLEAR' }, '*');
  }, []);

  const toggleSniffer = useCallback(() => {
    setIsScanning(prev => {
      const newState = !prev;
      window.postMessage({ type: 'TRICKFUNDA_SNIFFER_TOGGLE', enabled: newState }, '*');
      return newState;
    });
  }, []);

  const selectUrl = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const setFilter = useCallback((key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredUrls = sniffedUrls.filter(item => {
    if (filters.byType !== 'all' && item.type !== filters.byType) return false;
    if (filters.byDomain && !item.domain.toLowerCase().includes(filters.byDomain.toLowerCase())) return false;
    if (filters.bySearch) {
      const search = filters.bySearch.toLowerCase();
      return (
        item.url.toLowerCase().includes(search) ||
        item.tabTitle.toLowerCase().includes(search) ||
        item.domain.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const selectedUrl = sniffedUrls.find(url => url.id === selectedId) || null;

  return {
    sniffedUrls,
    filteredUrls,
    isConnected,
    isScanning,
    selectedUrl,
    selectedId,
    filters,
    clearResults,
    toggleSniffer,
    selectUrl,
    setFilter
  };
}
