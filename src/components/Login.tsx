import React, { useState } from 'react';
import SplashCursor from './SplashCursor';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'بعععععع') {
      setIsExploding(true);
      // Wait for smoke animation before completing login
      setTimeout(() => {
        onLogin();
      }, 800);
    } else {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 z-0"
        style={{ backgroundImage: "url('/assets/itachi uchiha.png')" }}
      />

      {/* Splash Cursor Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <SplashCursor BACK_COLOR={{ r: 0, g: 0, b: 0 }} COLOR="#ff0000" SIM_RESOLUTION={64} DYE_RESOLUTION={512} />
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 w-full h-full flex items-center justify-center p-4">

        {/* Smoke Poof Element */}
        <div
          className={`absolute inset-0 bg-gray-200 rounded-full blur-3xl pointer-events-none transition-all duration-700 ease-out ${isExploding ? 'scale-[3] opacity-0' : 'scale-0 opacity-100'
            }`}
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Login Card */}
        <div
          className={`relative max-w-md w-full backdrop-blur-xl bg-black/50 border border-red-900/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all duration-500 ${isExploding ? 'scale-0 opacity-0 rotate-12 blur-md' : 'scale-100 opacity-100'
            } ${errorShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-widest text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] mb-2" style={{ fontFamily: "'Press Start 2P', system-ui", letterSpacing: '-2px' }}>
              Nezer's Shinobi App
            </h1>
            <div className="w-16 h-1 bg-red-600 mx-auto rounded-full shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            <div className="text-gray-300 text-lg leading-relaxed bg-black/40 p-4 rounded-lg border border-red-900/30 shadow-inner">
              قابل اعوف الموقع سردح مردح؟ الباسوورد هو
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center justify-center w-8 h-8 mx-2 rounded-full bg-red-900/40 hover:bg-red-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Reveal Hint"
              >
                {showHint ? '🥷' : '👁️'}
              </button>
              <span className={`font-bold text-red-400 transition-all duration-300 ${showHint ? 'opacity-100 blur-none' : 'opacity-0 blur-sm absolute'}`}>
                بعععععع
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border-2 border-red-900/50 rounded-xl px-4 py-4 text-white text-xl text-center focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all placeholder-gray-600"
                placeholder="أدخل كلمة المرور"
                dir="auto"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all transform hover:-translate-y-1 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>Sign In</span>
                <span>🔥</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
            </button>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
      `}} />
    </div>
  );
}
