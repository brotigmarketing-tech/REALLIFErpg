
import React, { useState } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  User, 
  TrendingUp, 
  Utensils, 
  Backpack, 
  Skull,
  ShieldCheck,
  Banknote,
  Flame,
  LogOut,
  Thermometer,
  Sparkles,
  History,
  X,
  Target
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  level: number;
  xp: number;
  xpThreshold: number;
  coinsActive: number;
  coinsBank: number;
  isHardcore: boolean;
  isSick: boolean;
  isJoker: boolean;
  onToggleHardcore: () => void;
  username: string;
  onLogout: () => void;
  streak: number; 
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  level, 
  xp, 
  xpThreshold,
  coinsActive,
  coinsBank,
  isHardcore,
  isSick,
  isJoker,
  onToggleHardcore,
  username,
  onLogout,
  streak
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', icon: <Trophy size={20} />, label: 'Stats' },
    { id: 'quests', icon: <Gamepad2 size={20} />, label: 'Quests' },
    { id: 'bosses', icon: <Skull size={20} />, label: 'Bosses' },
    { id: 'seasonal', icon: <Target size={20} />, label: 'Season' },
    { id: 'food', icon: <Utensils size={20} />, label: 'Food' },
    { id: 'inventory', icon: <Backpack size={20} />, label: 'Items' },
    { id: 'analytics', icon: <TrendingUp size={20} />, label: 'Trends' },
    { id: 'prlog', icon: <History size={20} />, label: 'PR Log' },
    { id: 'bank', icon: <Banknote size={20} />, label: 'Bank' },
  ];

  const themeClass = isHardcore ? 'theme-hardcore' : isSick ? 'theme-sick' : 'theme-normal';
  const bgClass = isHardcore ? 'bg-red-950/20' : isSick ? 'bg-stone-900' : 'bg-slate-950';
  const sidebarClass = isHardcore ? 'bg-red-950 border-red-900/50' : isSick ? 'bg-stone-800 border-lime-900/30' : 'bg-slate-900 border-slate-800';
  const accentText = isHardcore ? 'text-red-500' : isSick ? 'text-lime-500' : 'text-indigo-400';
  const accentBg = isHardcore ? 'bg-red-600' : isSick ? 'bg-lime-600' : 'bg-indigo-600';

  const isStreakGolden = streak > 0 && streak % 10 === 0;

  const SidebarContent = () => (
    <>
      <div className="mb-6 px-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${accentBg} rounded-lg flex items-center justify-center shadow-lg transition-colors`}>
            {isSick ? <Thermometer className="text-white" /> : <Gamepad2 className="text-white" />}
          </div>
          <h1 className={`retro-font text-[10px] tracking-tight ${accentText} uppercase transition-colors`}>
            {isSick ? 'Life RPG (Sick)' : isHardcore ? 'Life RPG (HELL)' : 'Life RPG'}
          </h1>
        </div>
        <button className="md:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <div className={`mb-8 px-3 py-4 ${isHardcore ? 'bg-red-900/20 border-red-800/30' : isSick ? 'bg-stone-700/40 border-stone-600/30' : 'bg-slate-800/40 border-slate-700/50'} rounded-2xl border flex items-center justify-between group`}>
         <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full ${isHardcore ? 'bg-red-500/20 text-red-400 border-red-500/30' : isSick ? 'bg-lime-500/20 text-lime-400 border-lime-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'} flex items-center justify-center border`}>
               <User size={16} />
            </div>
            <div className="truncate max-w-[100px]">
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Player</div>
               <div className="text-xs font-black text-white truncate">{username}</div>
            </div>
         </div>
         <button onClick={onLogout} className="text-slate-600 hover:text-rose-400 transition-colors p-1"><LogOut size={16} /></button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
              activeTab === tab.id 
              ? `${accentBg} text-white shadow-lg` 
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span className="font-semibold text-sm">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
        {isSick && (
           <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center space-x-2 animate-pulse">
              <ShieldCheck className="text-rose-500" size={16} />
              <span className="text-[10px] text-rose-500 font-black uppercase">Sick Mode Active</span>
           </div>
        )}
        
        <button 
          onClick={onToggleHardcore}
          disabled={isSick}
          className={`w-full p-3 rounded-xl border text-left transition-all group ${
            isHardcore 
            ? 'bg-red-600/20 border-red-500/50 text-red-500 hardcore-glow' 
            : isSick ? 'bg-stone-800 border-stone-700 opacity-40 grayscale cursor-not-allowed'
            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'
          }`}
        >
           <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest">Hardcore Mode</span>
              <Flame size={14} className={isHardcore ? "text-red-500 animate-pulse" : ""} />
           </div>
           <p className="text-[9px] leading-tight">
             {isHardcore ? "HELL ACTIVE: Tap to Disable" : "Enable: +50% XP Bonus"}
           </p>
        </button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen ${themeClass} ${bgClass} flex flex-col md:flex-row overflow-hidden theme-transition`}>
      {isSick && <div className="sick-vignette" />}
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 ${sidebarClass} border-r flex flex-col p-4 z-[110] md:hidden transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-64 ${sidebarClass} border-r flex-col p-4 theme-transition`}>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`${isHardcore ? 'bg-red-950/60 border-red-900/50' : isSick ? 'bg-stone-800/60 border-lime-900/30' : 'bg-slate-900/50 border-slate-800'} backdrop-blur-md border-b p-4 sticky top-0 z-20 theme-transition`}>
          <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="relative group focus:outline-none"
              >
                <div className={`w-12 h-12 ${isHardcore ? 'bg-red-900 border-red-500' : isSick ? 'bg-stone-700 border-lime-500' : 'bg-slate-800 border-indigo-500'} rounded-full border-2 flex items-center justify-center text-xl font-bold retro-font transition-all group-hover:scale-110`}>
                  {level}
                </div>
                <div className={`absolute -bottom-1 -right-1 ${accentBg} text-[8px] px-1 rounded retro-font transition-colors`}>LVL</div>
              </button>
              
              <div className="flex flex-col">
                <div className={`text-[10px] font-black uppercase tracking-widest ${isStreakGolden ? 'text-amber-400' : 'text-slate-500'}`}>Streak</div>
                <div className={`flex items-center gap-1 text-sm font-black italic ${isStreakGolden ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-white'}`}>
                  <Flame size={14} className={streak > 0 ? "fill-current" : ""} />
                  {streak}
                </div>
              </div>

              <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span className={accentText}>XP</span>
                  <span className="text-slate-400">{xp} / {xpThreshold}</span>
                </div>
                <div className={`w-full h-2 ${isHardcore ? 'bg-red-950' : isSick ? 'bg-stone-900' : 'bg-slate-800'} rounded-full overflow-hidden`}>
                  <div className={`h-full ${accentBg} transition-all duration-500`} style={{ width: `${(xp / xpThreshold) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className={`flex items-center justify-end ${isHardcore ? 'text-orange-500' : 'text-amber-400'} font-bold`}>
                  <span className="mr-1">{coinsActive}</span>
                  <div className={`w-4 h-4 rounded-full ${isHardcore ? 'bg-orange-500' : 'bg-amber-400'} flex items-center justify-center text-[10px] text-slate-900 font-black italic`}>C</div>
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active</div>
              </div>
              <div className="text-right hidden sm:block">
                <div className={`flex items-center justify-end ${accentText} font-bold`}>
                  <span className="mr-1">{coinsBank}</span>
                  <div className={`w-4 h-4 rounded-full ${accentBg} flex items-center justify-center text-[10px] text-slate-900 font-black italic`}>C</div>
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vault</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
