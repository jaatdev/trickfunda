'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { TelegramAuthFlow } from '@/components/tools/telegram/TelegramAuthFlow';
import { TelegramDownloader } from '@/components/tools/telegram/TelegramDownloader';
import { MouseTrail } from '@/components/ui/tools/MouseTrail';
import { MeteorShower } from '@/components/ui/tools/MeteorShower';

export default function TelegramPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/tools/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUsername(data.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] pt-24 pb-12 px-4 relative selection:bg-blue-500/30">
      <MouseTrail />
      <MeteorShower />
      
      {/* Background Noise & Gradients */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-0" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <Send className="w-4 h-4" /> Telegram MTProto Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Telegram Downloader
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Bypass &quot;Restricted&quot; channel blocks. Extract and download media directly via the MTProto API.
          </p>
        </motion.div>

        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-blue-500 gap-4">
             <Loader2 className="w-12 h-12 animate-spin opacity-50" />
             <p className="text-sm font-medium text-blue-400 animate-pulse">Checking Session...</p>
          </div>
        ) : isAuthenticated ? (
          <TelegramDownloader 
            username={username} 
            onLogout={() => { setIsAuthenticated(false); setUsername(''); }} 
          />
        ) : (
          <TelegramAuthFlow 
            onAuthenticated={(user) => { setIsAuthenticated(true); setUsername(user); }} 
          />
        )}

      </div>
    </div>
  );
}
