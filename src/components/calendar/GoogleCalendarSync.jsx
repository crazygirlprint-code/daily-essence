import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar as CalendarIcon, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONNECTOR_ID = '6a07709bbde7ffce12991229';

export default function GoogleCalendarSync() {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('syncGoogleCalendar', {});
      setSyncResult(res.data);
      setConnected(true);
      queryClient.invalidateQueries({ queryKey: ['specialEvents'] });
    } catch (error) {
      setConnected(false);
      setSyncResult(null);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        await handleSync();
      }
      setLoading(false);
    });
  }, []);

  const handleConnect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        handleSync();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setSyncResult(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200/50 mb-6 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-stone-200 border-t-slate-800 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Checking Google Calendar…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200/50 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Google Calendar Sync</p>
            <p className="text-xs text-slate-500">
              {connected ? 'Connected — events sync automatically' : 'Connect to pull events into your schedule'}
            </p>
          </div>
        </div>
        {connected ? (
          <div className="flex items-center gap-2">
            {syncResult && !syncing && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {syncResult.synced > 0 ? `${syncResult.synced} new events synced` : 'Up to date'}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={syncing ? 'w-3 h-3 animate-spin' : 'w-3 h-3'} />
              {syncing ? 'Syncing…' : 'Sync Now'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="text-slate-400 hover:text-red-500"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Connect Google Calendar
          </Button>
        )}
      </div>
    </div>
  );
}