
import { useState, useEffect, useCallback } from 'react';
import { GameState, StatType, PlayerStats, Quest, FoodLog, PRData, MealType, BankLog, PRHistoryLog, Challenge } from '../types';
import { BASE_QUESTS, HARDCORE_MANDATORY, BOSSES } from '../constants';
import { getXpThreshold, calculateStatLevel, getSeasonInfo, getRandomQuest } from '../utils';

const WEEKLY_CHALLENGES: Challenge[] = [
  { id: 'c1', label: 'Food streak: 7 days 8-10 rated', rewardXp: 125, rewardCoins: 0, completed: false, calcType: 'FOOD_STREAK' },
  { id: 'c2', label: 'Hardcore health: stretch + mobility daily', rewardXp: 0, rewardCoins: 50, completed: false, calcType: 'HARDCORE_STREAK' },
  { id: 'c3', label: 'No Joker Day completion', rewardXp: 50, rewardCoins: 0, completed: false, calcType: 'JOKER' },
  { id: 'c4', label: 'Hydration streak: 7 days ≥ 2.5 L', rewardXp: 75, rewardCoins: 0, completed: false, calcType: 'WATER_STREAK' },
  { id: 'c5', label: 'Sleep discipline: Bed before 23:30 (5 nights)', rewardXp: 100, rewardCoins: 0, completed: false },
  { id: 'c6', label: 'Steps challenge: 10k steps (5 days)', rewardXp: 90, rewardCoins: 0, completed: false },
  { id: 'c7', label: 'No junk week (7 days)', rewardXp: 125, rewardCoins: 0, completed: false },
  { id: 'c8', label: 'Zero liquid calories (5 days)', rewardXp: 60, rewardCoins: 0, completed: false },
  { id: 'c9', label: 'Dopamine detox lite (No social < 12:00, 5 days)', rewardXp: 100, rewardCoins: 0, completed: false },
  { id: 'c10', label: 'Focus blocks: 3x45m deep work (4 days)', rewardXp: 90, rewardCoins: 0, completed: false },
  { id: 'c11', label: 'Discipline: Wake up at first alarm (7 days)', rewardXp: 125, rewardCoins: 0, completed: false },
];

const INITIAL_PLAYER: PlayerStats = {
  level: 1,
  xp: 0,
  totalXp: 0,
  coinsActive: 0,
  coinsBank: 0,
  inventory: [
    { id: 'sick-1', name: 'Sickness Saver', description: 'Skip a day without penalty if sick.', type: 'SICKNESS', usedThisWeek: 0, isFixed: true }
  ],
  stats: {
    [StatType.Strength1]: 0,
    [StatType.Strength2]: 0,
    [StatType.Strength3]: 0,
    [StatType.Stamina]: 0,
    [StatType.Reaction]: 0,
    [StatType.Vitality]: 0,
  },
  pr: {
    pullups: 0,
    pushups: 0,
    squats: 0,
    emom: 0,
    reactionTime: 0.5,
    avgSleep: 0,
  },
  streak: 0,
  hardcoreMode: false,
  inventorySlots: 3,
  sicknessSaverActive: false,
  waterIntake: 0,
  coldShowerDate: null,
  xpMultiplierNextDay: 1.0,
};

export const useRpgState = (username: string | null) => {
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);
  const storageKey = username ? `life_rpg_state_${username}` : null;
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!username || !storageKey) {
      setState(null);
      return;
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      const seasonInfo = getSeasonInfo();
      const newState: GameState = {
        player: INITIAL_PLAYER,
        quests: [
          ...BASE_QUESTS.map(q => ({ ...q, completed: false })),
          { id: 'q-sleep', label: 'Log Sleep Hours', xp: 0, coins: 0, completed: false, type: 'TRACKER' }
        ] as Quest[],
        foodHistory: [],
        sleepHistory: [],
        bankHistory: [],
        prHistory: [],
        waterHistory: [],
        challenges: WEEKLY_CHALLENGES,
        bosses: BOSSES,
        currentSeason: seasonInfo.season,
        seasonDay: seasonInfo.day,
        history: [],
      };
      setState(newState);
      localStorage.setItem(storageKey, JSON.stringify(newState));
    }
  }, [username, storageKey]);

  useEffect(() => {
    if (state && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey]);

  const handleDailyReset = (today: string) => {
    setState(prev => {
      if (!prev) return null;
      
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toDateString();
      const showeredYesterday = prev.player.coldShowerDate === yesterdayStr;
      const nextXpMult = showeredYesterday ? 1.03 : 1.0;

      const newQuests: Quest[] = [
        ...BASE_QUESTS.map(q => ({ ...q, completed: false })),
        { id: 'q-sleep', label: 'Log Sleep Hours', xp: 0, coins: 0, completed: false, type: 'TRACKER' }
      ] as Quest[];
      
      newQuests.push({
        id: 'random-' + Date.now(),
        label: getRandomQuest(),
        xp: 150,
        coins: 0,
        completed: false,
        type: 'RANDOM'
      });

      const allDailyDone = prev.player.sicknessSaverActive || prev.quests.filter(q => q.type === 'DAILY').every(q => q.completed);
      const newStreak = allDailyDone ? prev.player.streak + 1 : 0;

      const seasonInfo = getSeasonInfo();
      let activeCoins = prev.player.coinsActive;
      let bankCoins = prev.player.coinsBank;

      if (prev.seasonDay === 91 && seasonInfo.day === 1) {
        bankCoins += activeCoins;
        activeCoins = 0;
        addNotification("Season Complete! Active coins synced to Vault.");
      }

      const newWaterHistory = [...(prev.waterHistory || []), { date: yesterdayStr, glasses: prev.player.waterIntake }].slice(-91);

      return {
        ...prev,
        currentSeason: seasonInfo.season,
        seasonDay: seasonInfo.day,
        quests: newQuests,
        waterHistory: newWaterHistory,
        player: { 
          ...prev.player, 
          streak: newStreak,
          sicknessSaverActive: false,
          hardcoreMode: false,
          waterIntake: 0, 
          xpMultiplierNextDay: nextXpMult,
          coinsActive: activeCoins,
          coinsBank: bankCoins
        }
      };
    });
    if (username) localStorage.setItem(`last_reset_${username}`, today);
  };

  useEffect(() => {
    if (!state) return;
    const lastResetKey = `last_reset_${username}`;
    const lastReset = localStorage.getItem(lastResetKey);
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
      handleDailyReset(today);
    }
  }, [state, username]);

  const addNotification = useCallback((message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const applyRewards = useCallback((prev: GameState, xpReward: number, coinReward: number, newQuests?: Quest[]) => {
    const multiplier = prev.player.xpMultiplierNextDay || 1.0;
    let finalXpReward = Math.floor(xpReward * multiplier);
    
    let newXp = prev.player.xp + finalXpReward;
    let newLevel = prev.player.level;
    let threshold = getXpThreshold(newLevel);

    while (newXp >= threshold) {
      newXp -= threshold;
      newLevel++;
      threshold = getXpThreshold(newLevel);
    }

    const inventorySlots = 3 + Math.floor(newLevel / 10);

    return {
      ...prev,
      quests: newQuests || prev.quests,
      player: {
        ...prev.player,
        xp: newXp,
        level: newLevel,
        totalXp: prev.player.totalXp + finalXpReward,
        coinsActive: prev.player.coinsActive + coinReward,
        inventorySlots
      }
    };
  }, []);

  const trackWater = useCallback((amount: number) => {
    setState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        player: { ...prev.player, waterIntake: Math.max(0, prev.player.waterIntake + amount) }
      };
    });
  }, []);

  const takeColdShower = useCallback(() => {
    setState(prev => {
      if (!prev) return null;
      const today = new Date().toDateString();
      if (prev.player.coldShowerDate === today) return prev;
      addNotification("Cryo-Protocol Complete: +3% XP tomorrow!");
      return {
        ...prev,
        player: { ...prev.player, coldShowerDate: today }
      };
    });
  }, [addNotification]);

  const completeQuest = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return null;
      const quest = prev.quests.find(q => q.id === id);
      if (!quest || quest.completed) return prev;

      let xpReward = quest.xp;
      let coinReward = quest.coins;

      if (prev.player.hardcoreMode) xpReward = Math.floor(xpReward * 1.5);

      const newQuests = prev.quests.map(q => q.id === id ? { ...q, completed: true } : q);
      
      const dailies = newQuests.filter(q => q.type === 'DAILY');
      const allDone = dailies.every(d => d.completed);
      if (allDone && !prev.quests.filter(q => q.type === 'DAILY').every(q => q.completed)) {
        xpReward += Math.floor(Math.random() * 190) + 10;
        coinReward += 30;
      }

      return applyRewards(prev, xpReward, coinReward, newQuests);
    });
  }, [applyRewards]);

  const updatePR = useCallback((pr: Partial<Omit<PRData, 'avgSleep'>>) => {
    setState(prev => {
      if (!prev) return null;
      const oldPR = prev.player.pr;
      const oldStats = prev.player.stats;
      const newPR = { ...prev.player.pr, ...pr };
      const newStats: Record<StatType, number> = { ...prev.player.stats };
      const newPRHistory = [...(prev.prHistory || [])];
      
      newStats[StatType.Strength1] = calculateStatLevel(StatType.Strength1, newPR.pullups);
      newStats[StatType.Strength2] = calculateStatLevel(StatType.Strength2, newPR.pushups);
      newStats[StatType.Strength3] = calculateStatLevel(StatType.Strength3, newPR.squats);
      newStats[StatType.Stamina] = calculateStatLevel(StatType.Stamina, newPR.emom);
      newStats[StatType.Reaction] = calculateStatLevel(StatType.Reaction, newPR.reactionTime);
      newStats[StatType.Vitality] = calculateStatLevel(StatType.Vitality, newPR.avgSleep);

      Object.entries(pr).forEach(([key, val]) => {
        const oldVal = (oldPR as any)[key];
        const newVal = val as number;
        let isNewPR = false;
        if (key === 'reactionTime') { if (newVal < oldVal) isNewPR = true; } 
        else { if (newVal > oldVal) isNewPR = true; }

        if (isNewPR) {
          newPRHistory.push({ date: new Date().toISOString(), stat: key, value: newVal });
        }
      });

      (Object.keys(newStats) as StatType[]).forEach((statKey) => {
        const value = newStats[statKey];
        const oldValue = oldStats[statKey];
        if (value > oldValue) addNotification(`TIER UP: ${statKey}!`);
      });

      return {
        ...prev,
        prHistory: newPRHistory,
        player: { ...prev.player, pr: newPR, stats: newStats }
      };
    });
  }, [addNotification]);

  const logSleep = useCallback((hours: number) => {
    setState(prev => {
      if (!prev) return null;
      const date = new Date().toDateString();
      const existing = prev.sleepHistory.findIndex(s => s.date === date);
      let newHistory = [...prev.sleepHistory];
      if (existing !== -1) newHistory[existing] = { date, hours };
      else newHistory.push({ date, hours });
      
      const newHistorySlice = newHistory.slice(-90);
      const sum = newHistorySlice.reduce((acc, curr) => acc + curr.hours, 0);
      const avg = sum / newHistorySlice.length;

      const newQuests = prev.quests.map(q => q.id === 'q-sleep' ? { ...q, completed: true } : q);
      const newVitality = calculateStatLevel(StatType.Vitality, avg);
      
      return {
        ...prev,
        quests: newQuests,
        sleepHistory: newHistorySlice,
        player: {
          ...prev.player,
          stats: { ...prev.player.stats, [StatType.Vitality]: newVitality },
          pr: { ...prev.player.pr, avgSleep: avg } 
        }
      };
    });
  }, []);

  const toggleHardcore = useCallback(() => {
    setState(prev => {
      if (!prev) return null;
      const isEnabling = !prev.player.hardcoreMode;
      let newQuests = [...prev.quests];
      if (isEnabling) {
        HARDCORE_MANDATORY.forEach(h => {
          if (!newQuests.find(q => q.id === h.id)) {
            newQuests.push({ ...h, completed: false, xp: Math.floor(h.xp * 1.5) } as Quest);
          }
        });
      } else {
        newQuests = newQuests.filter(q => q.type !== 'HARDCORE');
      }
      return { ...prev, quests: newQuests, player: { ...prev.player, hardcoreMode: isEnabling } };
    });
  }, []);

  const fightBoss = useCallback((bossId: string) => {
    setState(prev => {
      if (!prev) return null;
      const boss = prev.bosses.find(b => b.id === bossId);
      if (!boss) return prev;
      const streakReq = parseInt(boss.requirement.match(/\d+/)?.[0] || "0");
      if (prev.player.streak < streakReq) return prev;
      return applyRewards(prev, boss.rewardXp, boss.rewardCoins);
    });
  }, [applyRewards]);

  const completeChallenge = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return null;
      const challenge = prev.challenges.find(c => c.id === id);
      if (!challenge || challenge.completed) return prev;
      const newChallenges = prev.challenges.map(c => c.id === id ? { ...c, completed: true } : c);
      addNotification(`CHALLENGE COMPLETE: ${challenge.label}`);
      return applyRewards({ ...prev, challenges: newChallenges }, challenge.rewardXp, challenge.rewardCoins);
    });
  }, [applyRewards, addNotification]);

  const addFoodLog = useCallback((r: number, a: boolean, d: string, m: MealType, t: string) => setState(prev => {
       if (!prev) return null;
       const date = new Date().toDateString();
       let xpBonus = 0;
       if (r >= 8) xpBonus = 50; else if (r <= 4) xpBonus = -50;
       let isJoker = false;
       if (a) {
         const hasUsedJokerThisMonth = prev.foodHistory.some(f => {
           const logDate = new Date(f.date);
           const now = new Date();
           return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear() && f.jokerUsed;
         });
         if (!hasUsedJokerThisMonth) { isJoker = true; addNotification("JOKER ACTIVATED! No alcohol penalty today."); } 
         else { xpBonus -= 100; addNotification("ALCOHOL PENALTY: -100 XP."); }
       }
       const newLog: FoodLog = { date, rating: r, alcohol: a, description: d, mealType: m, time: t, jokerUsed: isJoker };
       return applyRewards({ ...prev, foodHistory: [...prev.foodHistory, newLog] }, xpBonus, 0);
  }), [applyRewards, addNotification]);

  const withdrawFromBank = useCallback((amount: number, note: string) => setState(prev => {
    if (!prev || prev.player.coinsBank < amount) return prev;
    const newLog: BankLog = { id: Date.now().toString(), date: new Date().toISOString(), amount, note, type: 'WITHDRAW' };
    return { ...prev, bankHistory: [newLog, ...prev.bankHistory], player: { ...prev.player, coinsBank: prev.player.coinsBank - amount } };
  }), []);

  return { 
    state, completeQuest, updatePR, logSleep, addFoodLog, toggleHardcore, withdrawFromBank, trackWater, takeColdShower, completeChallenge,
    transferToBank: useCallback((a) => setState(prev => {
      if (!prev || prev.player.coinsActive < a) return prev;
      const newLog: BankLog = { id: Date.now().toString(), date: new Date().toISOString(), amount: a, note: 'Deposit to Vault', type: 'DEPOSIT' };
      return { 
        ...prev, 
        bankHistory: [newLog, ...prev.bankHistory],
        player: { ...prev.player, coinsActive: prev.player.coinsActive - a, coinsBank: prev.player.coinsBank + a } 
      }
    }), []), 
    toggleSicknessSaver: useCallback(() => setState(prev => {
      if (!prev) return null;
      return ({ ...prev, player: { ...prev.player, sicknessSaverActive: !prev.player.sicknessSaverActive } })
    }), []), 
    addPersonalQuest: useCallback((l) => setState(prev => {
      if (!prev) return null;
      return ({ ...prev, quests: [...prev.quests, { id: 'p-' + Date.now(), label: l, xp: 20, coins: 2, completed: false, type: 'PERSONAL' }] })
    }), []), 
    fightBoss, notifications 
  };
};
