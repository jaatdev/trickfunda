"use client";

import React, { useState, useEffect } from 'react';
import { Save, ShieldAlert, Globe, Server, UserCheck, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

interface Settings {
  siteName: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  seoDescription: string;
  contactEmail: string;
  features: {
    kdMethod: boolean;
    customQuizzes: boolean;
    leaderboard: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const updateFeature = (key: keyof Settings['features'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      features: { ...settings.features, [key]: value }
    });
  };

  if (isLoading || !settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Global Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage site-wide configurations and feature flags.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-500 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </span>
          )}
          {error && (
            <span className="text-sm font-medium text-red-500">
              {error}
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">General Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SEO Description</label>
                <textarea
                  value={settings.seoDescription}
                  onChange={(e) => updateSetting('seoDescription', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Access & Security */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Access & Security</h2>
            </div>
            
            <div className="space-y-4">
              <ToggleRow 
                label="Maintenance Mode" 
                description="Disable public access to the site while performing updates."
                value={settings.maintenanceMode}
                onChange={(val: boolean) => updateSetting('maintenanceMode', val)}
                danger
              />
              <ToggleRow 
                label="Allow Registrations" 
                description="Allow new users to sign up and create accounts via Clerk."
                value={settings.allowRegistrations}
                onChange={(val: boolean) => updateSetting('allowRegistrations', val)}
              />
            </div>
          </div>

        </div>

        {/* Right Column - Feature Flags */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Server className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Feature Flags</h2>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Toggle specific platform features on or off without redeploying code.
            </p>

            <div className="space-y-4 pt-2">
              <ToggleRow 
                label="KD Method System" 
                value={settings.features.kdMethod}
                onChange={(val: boolean) => updateFeature('kdMethod', val)}
                small
              />
              <ToggleRow 
                label="Custom Quizzes" 
                value={settings.features.customQuizzes}
                onChange={(val: boolean) => updateFeature('customQuizzes', val)}
                small
              />
              <ToggleRow 
                label="Leaderboard & Rankings" 
                value={settings.features.leaderboard}
                onChange={(val: boolean) => updateFeature('leaderboard', val)}
                small
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange, danger = false, small = false }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${value ? (danger ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10') : 'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-black/20'} transition-colors`}>
      <div>
        <h4 className={`font-semibold ${danger && value ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'} ${small ? 'text-sm' : ''}`}>{label}</h4>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <button 
        onClick={() => onChange(!value)}
        className={`transition-colors ${value ? (danger ? 'text-red-500' : 'text-emerald-500') : 'text-gray-400'}`}
      >
        {value ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
      </button>
    </div>
  );
}
