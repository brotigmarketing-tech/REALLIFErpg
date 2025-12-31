
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRpgState } from './hooks/useRpgState';
import { getXpThreshold, getSeasonInfo } from './utils';
import { StatType, MealType, UserAccount, BankLog, FoodLog } from './types';
import { PR_TIERS } from './constants';
import Layout from './components/Layout';
import { getMotivationalFeedback } from './services/geminiService';
import { 
  Dumbbell, 
  Activity, 
  Zap, 
  Heart, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  TrendingUp, 
  Gamepad2, 
  Banknote, 
  Skull, 
  ShieldCheck, 
  Moon, 
  Utensils, 
  Plus, 
  Sparkles, 
  Trophy, 
  Lock, 
  User, 
  Beer, 
  Thermometer,
  ArrowDownLeft,
  Calendar,
  Wallet,
  Coins,
  Medal,
  History,
  Droplets,
  CloudRain,
  ChevronRight,
  Target,
  Backpack,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const AuthScreen: React.FC<{ onLogin: (username: string) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Required fields missing.'); return; }
    const registry: Record<string, UserAccount> = JSON.parse(localStorage.getItem('liferpg_user_registry') || '{}');
    if (isLogin) {
      const user = registry[username];
      if (user && user.passwordHash === password) onLogin(username);
      else setError('Invalid credentials.');
    } else {
      if (registry[username]) setError('Username taken.');
      else {
        registry[username] = { username, passwordHash: password, createdAt: new Date().toISOString() };
        localStorage.setItem('liferpg_user_registry', JSON.stringify(registry));
        onLogin(username);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3 transition-transform"><Gamepad2 className="text-white" size={32} /></div>
          </div>
          <h1 className="retro-font text-center text-xs text-indigo-400 mb-8 tracking-widest uppercase">Life RPG Login</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500" placeholder="Username" /></div>
            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500" placeholder="Password" /></div>
            {error && <div className="text-rose-500 text-center text-[10px] font-bold uppercase">{error}</div>}
            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all uppercase text-sm">{isLogin ? 'Initialize' : 'Register'}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-slate-500 hover:text-indigo-400 text-[10px] font-bold uppercase">{isLogin ? 'New Hero? Register' : 'Existing Hero? Login'}</button>
        </div>
      </div>
    </div>
  );
};

const QuestBoard: React.FC<{ 
  state: any, 
  completeQuest: (id: string) => void, 
  addPersonalQuest: (label: string) => void,
  isSick: boolean,
  accentColor: string,
  accentBg: string
}> = ({ state, completeQuest, addPersonalQuest, isSick, accentColor, accentBg }) => {
  const [personalLabel, setPersonalLabel] = useState("");
  
  if (!state) return null;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black italic flex items-center gap-2 uppercase tracking-tight"><Gamepad2 className={`text-${accentColor}-400`} /> Objective Matrix</h2>
      
      {isSick && (
        <div className="bg-rose-500/20 border border-rose-500/50 p-6 rounded-3xl flex items-center gap-4 animate-pulse">
          <Thermometer size={48} className="text-rose-500" />
          <div><h3 className="font-black uppercase text-rose-500">Sickness Protocol Active</h3><p className="text-xs text-rose-200">Quests paused. Recover system functionality.</p></div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-3">
        <input type="text" value={personalLabel} onChange={(e) => setPersonalLabel(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && personalLabel) { addPersonalQuest(personalLabel); setPersonalLabel(""); } }} placeholder="Assign a new sub-mission..." className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
        <button onClick={() => { if(personalLabel) { addPersonalQuest(personalLabel); setPersonalLabel(""); } }} className={`p-3 ${accentBg} text-white rounded-xl`}><Plus size={24} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.quests.filter((q:any) => q.type !== 'TRACKER').map((quest: any) => (
          <button key={quest.id} disabled={quest.completed || isSick} onClick={() => completeQuest(quest.id)} className={`flex items-center p-4 rounded-xl border transition-all text-left ${isSick ? 'bg-stone-800 opacity-30' : quest.completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-60' : `bg-slate-900 border-slate-800 hover:border-${accentColor}-500 group`}`}>
            <div className="mr-4">{quest.completed ? <CheckCircle2 size={24} /> : <Circle size={24} className={`text-slate-600 group-hover:text-${accentColor}-400`} />}</div>
            <div className="flex-1">
              <div className="font-bold text-sm">{quest.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-3"><span>{quest.xp} XP</span><span>{quest.coins} C</span></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const BossRoom: React.FC<{ state: any, fightBoss: (id: string) => void, accentColor: string }> = ({ state, fightBoss, accentColor }) => {
  if (!state) return null;
  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-black italic uppercase flex items-center gap-2"><Skull className="text-rose-500" /> Encounter Ladder</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.bosses.map((boss: any) => {
            const streakValue = parseInt(boss.requirement.match(/\d+/)?.[0] || "0");
            const canFight = state.player.streak >= streakValue;
            const scaling = boss.scaling;
            return (
              <div key={boss.id} className={`bg-slate-900 border p-6 rounded-3xl relative overflow-hidden transition-all ${canFight ? 'border-rose-500/50 shadow-xl' : 'opacity-40 grayscale border-slate-800'}`}>
                 <div className="flex justify-between items-start mb-4">
                    <div><div className="text-[10px] font-black text-rose-500 uppercase mb-1">Scale: {scaling}X</div><h3 className="text-xl font-bold text-white uppercase">{boss.name}</h3></div>
                    <Skull size={32} className={canFight ? "text-rose-500 animate-pulse" : "text-slate-700"} />
                 </div>
                 <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-black/20 p-2 rounded-lg text-center"><div className="text-[8px] text-slate-500">Pullups</div><div className="text-xs font-bold text-indigo-400">{state.player.pr.pullups * scaling}</div></div>
                    <div className="bg-black/20 p-2 rounded-lg text-center"><div className="text-[8px] text-slate-500">Pushups</div><div className="text-xs font-bold text-indigo-400">{state.player.pr.pushups * scaling}</div></div>
                    <div className="bg-black/20 p-2 rounded-lg text-center"><div className="text-[8px] text-slate-500">Squats</div><div className="text-xs font-bold text-indigo-400">{state.player.pr.squats * scaling}</div></div>
                 </div>
                 {!canFight && <div className="mb-4 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-center text-[10px] font-bold text-rose-500 uppercase">Requirement: {boss.requirement}</div>}
                 <button onClick={() => canFight && fightBoss(boss.id)} disabled={!canFight} className={`w-full py-4 rounded-xl font-black italic uppercase text-xs transition-all ${canFight ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{canFight ? "Initiate Encounter" : "Locked"}</button>
              </div>
            );
          })}
       </div>
    </div>
  );
};

const FoodTracker: React.FC<{ state: any, addFoodLog: any, accentBg: string, accentColor: string }> = ({ state, addFoodLog, accentBg, accentColor }) => {
  const [rating, setRating] = useState(8);
  const [alcohol, setAlcohol] = useState(false);
  const [desc, setDesc] = useState("");
  const [meal, setMeal] = useState<MealType>('Lunch');
  if (!state) return null;

  const groupedFood = state.foodHistory.reduce((acc: Record<string, FoodLog[]>, log: FoodLog) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedFood).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Month check for Joker status
  const monthlyJokerUsed = useMemo(() => {
    const now = new Date();
    return state.foodHistory.some(f => {
      const d = new Date(f.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && f.jokerUsed;
    });
  }, [state.foodHistory]);

  const alcoholDrunkThisMonth = useMemo(() => {
    const now = new Date();
    return state.foodHistory.some(f => {
      const d = new Date(f.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && f.alcohol;
    });
  }, [state.foodHistory]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <h3 className="text-lg font-black uppercase italic mb-6 text-white flex items-center gap-2"><Utensils className="text-emerald-500" /> Bio-Fuel Log</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div><label className="block text-[10px] text-slate-500 font-black uppercase mb-2">Cycle</label>
            <div className="flex flex-wrap gap-2">{['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(m => (<button key={m} type="button" onClick={() => setMeal(m as MealType)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${meal === m ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{m}</button>))}</div>
          </div>
          <div><label className="block text-[10px] text-slate-500 font-black uppercase mb-2 flex justify-between">Value <span>{rating}/10</span></label><input type="range" min="1" max="10" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="w-full accent-emerald-500" /></div>
        </div>
        <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Fuel source description..." className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white mb-6" />
        
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={alcohol} onChange={(e) => setAlcohol(e.target.checked)} className="hidden" /><div className={`w-12 h-6 rounded-full p-1 transition-colors ${alcohol ? 'bg-purple-600' : 'bg-slate-800'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${alcohol ? 'translate-x-6' : 'translate-x-0'}`} /></div><span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Beer size={12}/> Alcohol</span></label>
          <div className="flex gap-4">
             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Month Joker: <span className={monthlyJokerUsed ? 'text-rose-500' : 'text-emerald-500'}>{monthlyJokerUsed ? 'USED' : 'AVAILABLE'}</span></div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">History: <span className={alcoholDrunkThisMonth ? 'text-amber-500' : 'text-slate-500'}>{alcoholDrunkThisMonth ? 'DETECTED' : 'CLEAN'}</span></div>
          </div>
        </div>
        
        {alcohol && monthlyJokerUsed && (
          <div className="mb-4 flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <AlertTriangle size={14} className="text-rose-500" />
            <span className="text-[10px] font-black text-rose-500 uppercase">Warning: Monthly Joker already spent. -100 XP Penalty will apply.</span>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={() => { addFoodLog(rating, alcohol, desc, meal, new Date().toTimeString().slice(0,5)); setDesc(""); setAlcohol(false); }} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs">Log Entry</button>
        </div>
      </div>
      <div className="space-y-8">
        {sortedDates.map(date => (
          <div key={date} className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 border-l-2 border-slate-800">{date}</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedFood[date].map((log, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex justify-between items-start mb-2"><div className="text-[8px] font-black uppercase text-slate-500">{log.mealType} • {log.time}</div><div className={`text-xs font-black ${log.rating >= 8 ? 'text-emerald-400' : log.rating <= 4 ? 'text-rose-500' : 'text-amber-400'}`}>{log.rating}/10</div></div>
                    <p className="text-xs text-slate-200 italic truncate mb-2">"{log.description}"</p>
                    {log.alcohol && (
                      <div className={`text-[8px] font-black uppercase flex items-center gap-1 ${log.jokerUsed ? 'text-purple-400' : 'text-rose-500'}`}>
                        <Beer size={10} /> {log.jokerUsed ? 'JOKER USED (NO PENALTY)' : 'PENALTY APPLIED (-100 XP)'}
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PRLogView: React.FC<{ state: any, updatePR: any, accentColor: string }> = ({ state, updatePR, accentColor }) => {
  const [prs, setPrs] = useState({ pullups: 0, pushups: 0, squats: 0, emom: 0, reaction: 0.5 });
  
  useEffect(() => { 
    if (state) setPrs({ 
      pullups: state.player.pr.pullups, 
      pushups: state.player.pr.pushups, 
      squats: state.player.pr.squats, 
      emom: state.player.pr.emom, 
      reaction: state.player.pr.reactionTime 
    }); 
  }, [state?.player.pr]);

  if (!state) return null;
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <h3 className="text-lg font-black uppercase italic mb-6 text-white flex items-center gap-2"><TrendingUp className="text-indigo-400"/> PR Nexus</h3>
        <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest italic">Update your personal records here to adjust boss scaling and earn Skill Points.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <PRInput label="Pullups" value={prs.pullups} onChange={(v) => setPrs({...prs, pullups: v})} accentColor={accentColor} />
          <PRInput label="Pushups" value={prs.pushups} onChange={(v) => setPrs({...prs, pushups: v})} accentColor={accentColor} />
          <PRInput label="Squats" value={prs.squats} onChange={(v) => setPrs({...prs, squats: v})} accentColor={accentColor} />
          <PRInput label="Stamina (EMOM)" value={prs.emom} onChange={(v) => setPrs({...prs, emom: v})} accentColor={accentColor} />
          <PRInput label="Reaction (sec)" step={0.01} value={prs.reaction} onChange={(v) => setPrs({...prs, reaction: v})} accentColor={accentColor} />
        </div>
        <button onClick={() => updatePR({ pullups: prs.pullups, pushups: prs.pushups, squats: prs.squats, emom: prs.emom, reactionTime: prs.reaction })} className={`w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase text-xs transition-all shadow-lg shadow-indigo-600/20`}>Sync Records</button>
      </div>
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h3 className="text-xs font-black text-slate-500 uppercase mb-4 flex items-center gap-2"><History size={14} /> Record History</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {state.prHistory.slice().reverse().map((log: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <div><span className="text-[10px] font-black text-indigo-400 uppercase mr-2">{log.stat}</span><span className="text-xs font-bold text-white">{log.value}</span></div>
              <span className="text-[8px] text-slate-600 uppercase">{new Date(log.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BankView: React.FC<{ 
  state: any, 
  transferToBank: (a: number) => void, 
  withdrawFromBank: (a: number, n: string) => void, 
  accentColor: string, 
  accentBg: string 
}> = ({ state, transferToBank, withdrawFromBank, accentColor, accentBg }) => {
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawNote, setWithdrawNote] = useState("");

  if (!state) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-lg font-black uppercase italic mb-6 text-white flex items-center gap-2"><ArrowDownLeft className="text-emerald-500" /> Vault Deposit</h3>
          <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest">Active: {state.player.coinsActive} C</p>
          <div className="space-y-4">
            <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="Amount..." />
            <button onClick={() => { transferToBank(transferAmount); setTransferAmount(0); }} disabled={transferAmount <= 0 || transferAmount > state.player.coinsActive} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl uppercase text-xs">Deposit</button>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-lg font-black uppercase italic mb-6 text-white flex items-center gap-2"><Wallet className="text-indigo-500" /> Vault Withdrawal</h3>
          <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest">Balance: {state.player.coinsBank} C</p>
          <div className="space-y-4">
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600" placeholder="Amount..." />
            <input type="text" value={withdrawNote} onChange={(e) => setWithdrawNote(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600" placeholder="Purpose..." />
            <button onClick={() => { withdrawFromBank(withdrawAmount, withdrawNote); setWithdrawAmount(0); setWithdrawNote(""); }} disabled={withdrawAmount <= 0 || withdrawAmount > state.player.coinsBank} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl uppercase text-xs">Withdraw</button>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h3 className="text-xs font-black text-slate-500 uppercase mb-4 flex items-center gap-2"><History size={14} /> Transaction History</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {state.bankHistory.map((log: BankLog) => (
            <div key={log.id} className="flex justify-between items-center p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase ${log.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>{log.type}</span>
                  <span className="text-xs font-bold text-white">{log.amount} C</span>
                </div>
                {log.note && <div className="text-[10px] text-slate-500 italic mt-0.5">"{log.note}"</div>}
              </div>
              <span className="text-[8px] text-slate-600 uppercase">{new Date(log.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('liferpg_session'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStatDetail, setSelectedStatDetail] = useState<StatType | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isShowering, setIsShowering] = useState(false);
  
  const { 
    state, completeQuest, updatePR, addFoodLog, logSleep, toggleHardcore, transferToBank, 
    withdrawFromBank, toggleSicknessSaver, addPersonalQuest, fightBoss, notifications, trackWater, takeColdShower, completeChallenge
  } = useRpgState(currentUser);

  const isHardcore = state?.player.hardcoreMode ?? false;
  const isSick = state?.player.sicknessSaverActive ?? false;
  const isJoker = useMemo(() => { if (!state) return false; const today = new Date().toDateString(); return state.foodHistory.some(f => f.date === today && f.jokerUsed); }, [state?.foodHistory]);
  
  const accentColor = isHardcore ? 'red' : isSick ? 'lime' : 'indigo';
  const accentHex = isHardcore ? '#ef4444' : isSick ? '#84cc16' : '#6366f1';
  const accentBg = isHardcore ? 'bg-red-600' : isSick ? 'bg-lime-600' : 'bg-indigo-600';
  const cardBg = isHardcore ? 'bg-red-950/20 border-red-900/40' : isSick ? 'bg-stone-800/60 border-lime-900/20' : 'bg-slate-900/50 border-slate-800';

  const xpThreshold = useMemo(() => state ? getXpThreshold(state.player.level) : 100, [state?.player.level]);
  const [motivation, setMotivation] = useState<string>("Analyzing bio-metrics...");

  useEffect(() => { if (currentUser) localStorage.setItem('liferpg_session', currentUser); else localStorage.removeItem('liferpg_session'); }, [currentUser]);
  useEffect(() => { if (!state) return; const lastLevelKey = `last_known_level_${currentUser}`; const lastLevel = localStorage.getItem(lastLevelKey); if (lastLevel && parseInt(lastLevel) < state.player.level) { setShowLevelUp(true); setTimeout(() => setShowLevelUp(false), 5000); } localStorage.setItem(lastLevelKey, state.player.level.toString()); }, [state?.player.level, currentUser]);
  useEffect(() => { if (!state) return; const fetchMotivation = async () => { const feedback = await getMotivationalFeedback(state.player.level, state.player.stats); setMotivation(feedback); }; fetchMotivation(); }, [state?.player.level]);
  const avgSleep = useMemo(() => { if (!state || state.sleepHistory.length === 0) return 0; const sum = state.sleepHistory.reduce((acc, curr) => acc + curr.hours, 0); return (sum / state.sleepHistory.length).toFixed(1); }, [state?.sleepHistory]);

  const calculateDerivedChallenge = (type: string) => {
    if (!state) return false;
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      return d.toDateString();
    });

    if (type === 'FOOD_STREAK') {
      return last7Days.every(d => {
        const logs = state.foodHistory.filter((f:FoodLog) => f.date === d);
        return logs.length > 0 && logs.every((f:FoodLog) => f.rating >= 8);
      });
    }
    if (type === 'WATER_STREAK') {
      return last7Days.every(d => {
        const entry = state.waterHistory.find((w:any) => w.date === d);
        return entry && entry.glasses >= 10; // 10 glasses ~ 2.5L
      });
    }
    if (type === 'JOKER') {
      return !last7Days.some(d => {
        const logs = state.foodHistory.filter((f: FoodLog) => f.date === d);
        return logs.some((f: FoodLog) => f.alcohol && !f.jokerUsed);
      });
    }
    return false;
  };

  const Dashboard = () => {
    if (!state) return null;
    const today = new Date().toDateString();
    const showeredToday = state.player.coldShowerDate === today;
    const [sleepHours, setSleepHours] = useState(8);
    const sleepQuestDone = state.quests.find((q:any) => q.id === 'q-sleep')?.completed;

    return (
      <div className="space-y-6">
        <div className="fixed top-20 right-4 z-[999] pointer-events-none flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id} className={`${accentBg} text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/20 animate-bounce flex items-center gap-3`}>
              <Sparkles className="text-white" /><span className="retro-font text-[10px] uppercase">{n.message}</span>
            </div>
          ))}
        </div>

        <div className={`${cardBg} border p-6 rounded-3xl relative overflow-hidden group theme-transition`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 ${accentBg} rounded-2xl shadow-lg`}><Zap className="text-white" size={24} /></div>
            <div><div className={`text-[10px] font-black text-${accentColor}-400 uppercase mb-1`}>Transmission</div><p className="text-slate-200 font-medium italic text-sm">"{motivation}"</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`${cardBg} border p-5 rounded-2xl`}>
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3"><div className="p-2 bg-blue-500/20 rounded-lg"><Droplets size={20} className="text-blue-400" /></div><h3 className="font-bold text-slate-200">Hydration</h3></div>
                <div className="text-2xl font-black text-white italic">{state.player.waterIntake} <span className="text-xs text-slate-500">Glasses</span></div>
             </div>
             <div className="flex gap-2"><button onClick={() => trackWater(1)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs">Add Glass</button><button onClick={() => trackWater(-1)} className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg text-xs">-</button></div>
             <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${Math.min(100, (state.player.waterIntake / 10) * 100)}%` }} /></div>
          </div>
          <div className={`${cardBg} border p-5 rounded-2xl`}>
             <div className="flex items-center justify-between mb-4"><div className="flex items-center space-x-3"><div className="p-2 bg-cyan-500/20 rounded-lg"><CloudRain size={20} className="text-cyan-400" /></div><h3 className="font-bold text-slate-200">Cryo-Protocol</h3></div>{showeredToday && <Sparkles className="text-cyan-400 animate-pulse" />}</div>
             <button disabled={showeredToday} onClick={() => { setIsShowering(true); takeColdShower(); setTimeout(() => setIsShowering(false), 3000); }} className={`w-full py-4 ${showeredToday ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' : 'bg-cyan-600 hover:bg-cyan-500 text-white'} font-black italic rounded-xl transition-all uppercase text-xs`}>{showeredToday ? "Protocol Locked" : "Initiate Shower"}</button>
             <div className="mt-2 text-[8px] text-center text-slate-500 font-bold uppercase tracking-widest">Next day reward: +3% XP</div>
          </div>
          {!sleepQuestDone && (
            <div className={`${cardBg} border p-5 rounded-2xl`}>
              <div className="flex items-center justify-between mb-4"><div className="flex items-center space-x-3"><div className="p-2 bg-indigo-500/20 rounded-lg"><Moon size={20} className="text-indigo-400" /></div><h3 className="font-bold text-slate-200">Bio-Clock</h3></div><span className="text-xl font-black italic text-white">{sleepHours}h</span></div>
              <input type="range" min="1" max="15" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(parseFloat(e.target.value))} className="w-full h-2 accent-indigo-500 mb-4" />
              <button onClick={() => logSleep(sleepHours)} className="w-full py-2 bg-indigo-600 text-white font-black uppercase text-[10px] rounded-lg">Log Sleep</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(state.player.stats).map(([key, val]) => {
            const type = key as StatType;
            const value = val as number;
            const isSelected = selectedStatDetail === type;
            const tiers = PR_TIERS[type];
            return (
              <div key={key} onClick={() => setSelectedStatDetail(isSelected ? null : type)} className={`${cardBg} border p-5 rounded-2xl relative overflow-hidden group transition-all cursor-pointer ${isSelected ? `border-${accentColor}-500 shadow-xl ring-2 ring-${accentColor}-500/20` : 'hover:border-slate-600'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3"><div className="p-2 bg-black/20 rounded-lg">
                      {type.includes('Pullups') && <Dumbbell size={20} className={`text-${accentColor}-400`} />}
                      {type.includes('Pushups') && <Zap size={20} className={`text-${accentColor}-400`} />}
                      {type.includes('Squats') && <Activity size={20} className={`text-${accentColor}-400`} />}
                      {type === StatType.Stamina && <Flame size={20} className={`text-${accentColor}-400`} />}
                      {type === StatType.Reaction && <Clock size={20} className={`text-${accentColor}-400`} />}
                      {type === StatType.Vitality && <Moon size={20} className={`text-${accentColor}-400`} />}
                    </div><h3 className="font-bold text-slate-200">{type}</h3></div>
                  <div className="text-2xl font-black text-white italic">T{value}</div>
                </div>
                <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5, 6].map((tier) => (<div key={tier} className={`h-1 flex-1 rounded-full ${value >= tier ? `bg-${accentColor}-500 shadow-[0_0_8px_${accentHex}80]` : 'bg-black/20'}`} />))}</div>
                {isSelected && (<div className="mt-4 pt-4 border-t border-white/5 space-y-2">{tiers.map((req, i) => (<div key={i} className={`flex justify-between items-center px-3 py-1.5 rounded-lg ${value >= i + 1 ? `bg-${accentColor}-600/20 text-${accentColor}-200` : 'bg-black/10 text-slate-500'}`}><span className="text-[10px] font-bold uppercase">Tier {i + 1}</span><span className="font-black italic">{type === StatType.Reaction ? `${req}s` : `${req} units`}</span></div>))}</div>)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const SeasonalTab = () => {
    if (!state) return null;
    const seasonInfo = getSeasonInfo();
    const isBossWeek = seasonInfo.week === 13;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-black italic uppercase text-white flex items-center gap-2"><Target className="text-orange-400" /> Season {state.currentSeason} Nexus</h2>
        {isBossWeek ? (
          <div className="bg-gradient-to-r from-orange-900/40 to-rose-900/40 border border-orange-500/50 p-8 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-20"><Skull size={120} /></div>
             <div className="relative z-10 max-w-lg">
                <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Encounter Unlocked</div>
                <h3 className="text-3xl font-black text-white uppercase italic mb-4">Season {state.currentSeason} Boss</h3>
                <p className="text-sm text-slate-300 italic mb-8">Maintain your streak of conviction to face the Sentinel.</p>
                <button onClick={() => fightBoss(`sb-${state.currentSeason}`)} className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black italic rounded-2xl shadow-xl shadow-orange-600/30 transition-all uppercase tracking-widest text-sm">Initiate Challenge</button>
             </div>
          </div>
        ) : (<div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-center"><div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 text-slate-600"><Lock size={32} /></div><h3 className="text-xl font-black text-slate-400 uppercase italic">Seasonal Boss Locked</h3><p className="text-xs text-slate-500 mt-2">Unlocks in Week 13.</p></div>)}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
           <h3 className="font-bold uppercase text-slate-400 text-xs mb-6 flex items-center gap-2"><Medal size={14} /> Weekly Discipline Challenges</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.challenges.map((c:any) => {
                const autoCalculatable = !!c.calcType;
                const isAutoCompleted = autoCalculatable && calculateDerivedChallenge(c.calcType);
                const showComplete = c.completed || isAutoCompleted;
                return (
                  <button key={c.id} disabled={showComplete || autoCalculatable} onClick={() => !autoCalculatable && completeChallenge(c.id)} className={`flex items-center p-4 rounded-xl border transition-all text-left ${showComplete ? 'bg-emerald-500/10 border-emerald-500/30 opacity-60' : 'bg-black/10 border-white/5 hover:border-orange-500/50 group'} ${autoCalculatable ? 'cursor-default' : ''}`}>
                    <div className="mr-4">{showComplete ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Circle className="text-slate-700 group-hover:text-orange-500" size={20} />}</div>
                    <div className="flex-1"><div className="text-xs font-bold text-slate-200">{c.label}</div><div className="text-[10px] text-slate-500 mt-1 flex gap-2">{c.rewardXp > 0 && <span>{c.rewardXp} XP</span>}{c.rewardCoins > 0 && <span>{c.rewardCoins} C</span>}{autoCalculatable && <span className="text-orange-400 ml-auto">[AUTO-CALC]</span>}</div></div>
                  </button>
                );
              })}
           </div>
        </div>
      </div>
    );
  };

  const ShowerAnimation = () => {
    const drops = Array.from({ length: 50 });
    return (
      <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
        {drops.map((_, i) => (<div key={i} className="rain-drop" style={{ left: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random() * 1}s`, animationDelay: `${Math.random() * 2}s` }} />))}
        <div className="fixed inset-0 bg-cyan-500/5 backdrop-blur-[1px]" />
      </div>
    );
  };

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser} />;
  if (!state) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 retro-font text-xs animate-pulse">Establishing Nexus...</div>;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} level={state.player.level} xp={state.player.xp} xpThreshold={xpThreshold} coinsActive={state.player.coinsActive} coinsBank={state.player.coinsBank} isHardcore={isHardcore} isSick={isSick} isJoker={isJoker} onToggleHardcore={toggleHardcore} username={currentUser} onLogout={() => setCurrentUser(null)} streak={state.player.streak}>
      {isShowering && <ShowerAnimation />}
      {showLevelUp && (<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"><div className="relative flex flex-col items-center"><div className={`p-8 bg-gradient-to-b from-${accentColor}-500 to-${accentColor}-700 rounded-full border-8 border-white shadow-2xl animate-bounce mb-8`}><Trophy size={80} className="text-white" /></div><h2 className="retro-font text-4xl text-white text-center mb-4">LEVEL UP!</h2><div className={`text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-${accentColor}-400 to-${accentColor}-200`}>{state.player.level}</div><button onClick={() => setShowLevelUp(false)} className={`mt-12 px-8 py-3 bg-white text-slate-950 font-black rounded-full uppercase text-xs`}>Accept Power</button></div></div>)}
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'quests' && <QuestBoard state={state} completeQuest={completeQuest} addPersonalQuest={addPersonalQuest} isSick={isSick} accentColor={accentColor} accentBg={accentBg} />}
      {activeTab === 'bosses' && <BossRoom state={state} fightBoss={fightBoss} accentColor={accentColor} />}
      {activeTab === 'seasonal' && <SeasonalTab />}
      {activeTab === 'food' && <FoodTracker state={state} addFoodLog={addFoodLog} accentBg={accentBg} accentColor={accentColor} />}
      {activeTab === 'inventory' && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{state.player.inventory.map((item) => (<div key={item.id} className={`${cardBg} border p-5 rounded-2xl group transition-all hover:border-${accentColor}-500`}><div className={`p-3 w-fit rounded-xl mb-4 bg-black/20 text-${accentColor}-400`}>{item.type === 'SICKNESS' ? <ShieldCheck /> : <Backpack />}</div><h3 className="font-bold text-slate-100 mb-1">{item.name}</h3><div className="text-xs text-slate-500 mb-4">{item.description}</div><button onClick={toggleSicknessSaver} className={`w-full py-2 text-xs font-bold uppercase rounded-lg transition-all ${isSick ? `${accentBg} text-white` : 'bg-slate-800 text-slate-200'}`}>{isSick ? 'Abort Sick Mode' : 'Engage Bio-Recovery'}</button></div>))}</div>)}
      {activeTab === 'bank' && <BankView state={state} transferToBank={transferToBank} withdrawFromBank={withdrawFromBank} accentColor={accentColor} accentBg={accentBg} />}
      {activeTab === 'prlog' && <PRLogView state={state} updatePR={updatePR} accentColor={accentColor} />}
      {activeTab === 'analytics' && (<div className="space-y-6"><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className={`${cardBg} border p-8 rounded-3xl h-[400px]`}><div className="flex items-center justify-between mb-8"><div className="flex items-center space-x-2"><Moon className={`text-${accentColor}-400`} /><h2 className="text-xl font-bold uppercase italic text-white">Sleep Data</h2></div><div className="text-2xl font-black text-white italic">{avgSleep}h Avg</div></div><ResponsiveContainer width="100%" height="80%"><LineChart data={state.sleepHistory}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} /><XAxis dataKey="date" hide /><YAxis stroke="#475569" fontSize={10} domain={[4, 12]} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} /><Line type="monotone" dataKey="hours" stroke={accentHex} strokeWidth={4} dot={false} /></LineChart></ResponsiveContainer></div><div className={`${cardBg} border p-8 rounded-3xl h-[400px]`}><div className="flex items-center justify-between mb-8"><div className="flex items-center space-x-2"><Utensils className="text-emerald-400" /><h2 className="text-xl font-bold uppercase italic text-white">Food Ratings</h2></div><div className="text-2xl font-black text-white italic">{(state.foodHistory.reduce((a:number, b:FoodLog) => a + b.rating, 0) / (state.foodHistory.length || 1)).toFixed(1)}/10</div></div><ResponsiveContainer width="100%" height="80%"><BarChart data={state.foodHistory.slice(-30)}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} /><XAxis dataKey="date" hide /><YAxis stroke="#475569" fontSize={10} domain={[0, 10]} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} /><Bar dataKey="rating" radius={[4, 4, 0, 0]}>{state.foodHistory.slice(-30).map((entry:FoodLog, index:number) => ( <Cell key={`cell-${index}`} fill={entry.rating >= 8 ? '#10b981' : entry.rating <= 4 ? '#ef4444' : '#f59e0b'} /> ))}</Bar></BarChart></ResponsiveContainer></div></div></div>)}
    </Layout>
  );
};

const PRInput: React.FC<{ label: string; value: number; onChange: (v: number) => void; step?: number; accentColor: string }> = ({ label, value, onChange, step = 1, accentColor }) => (
  <div className="bg-black/20 p-3 rounded-xl border border-white/5"><label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-tighter">{label}</label><input type="number" step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className={`w-full bg-transparent text-white font-black text-lg focus:outline-none focus:text-${accentColor}-400 transition-colors`} /></div>
);

export default App;
