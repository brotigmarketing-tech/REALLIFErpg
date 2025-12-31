
export enum StatType {
  Strength1 = 'Strength (Pullups)',
  Strength2 = 'Strength (Pushups)',
  Strength3 = 'Strength (Squats)',
  Stamina = 'Stamina',
  Reaction = 'Reaction Time',
  Vitality = 'Sleep'
}

export interface PRData {
  pullups: number;
  pushups: number;
  squats: number;
  emom: number; // minutes
  reactionTime: number; // seconds
  avgSleep: number; // hours
}

export interface PlayerStats {
  level: number;
  xp: number;
  totalXp: number;
  coinsActive: number;
  coinsBank: number;
  inventory: InventoryItem[];
  stats: Record<StatType, number>;
  pr: PRData;
  streak: number;
  hardcoreMode: boolean;
  inventorySlots: number;
  sicknessSaverActive: boolean;
  waterIntake: number; // glasses drunk today
  coldShowerDate: string | null; // last date showered cold
  xpMultiplierNextDay: number; // multiplier for next day (1.03 if showered)
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'SKIP' | 'RECOVERY' | 'FOCUS' | 'STAMINA' | 'DOUBLE' | 'BLOOD_OATH' | 'SICKNESS';
  limitPerWeek?: number;
  usedThisWeek: number;
  isFixed?: boolean;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodLog {
  date: string;
  rating: number; 
  alcohol: boolean;
  jokerUsed: boolean;
  description: string;
  mealType: MealType;
  time: string; 
}

export interface BankLog {
  id: string;
  date: string;
  amount: number;
  note: string;
  type: 'WITHDRAW' | 'DEPOSIT';
}

export interface SleepLog {
  date: string;
  hours: number;
}

export interface PRHistoryLog {
  date: string;
  stat: string;
  value: number;
}

export interface Challenge {
  id: string;
  label: string;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  calcType?: 'FOOD_STREAK' | 'WATER_STREAK' | 'HARDCORE_STREAK' | 'JOKER';
}

export interface Quest {
  id: string;
  label: string;
  xp: number;
  coins: number;
  completed: boolean;
  type: 'DAILY' | 'RANDOM' | 'HARDCORE' | 'TRACKER' | 'PERSONAL';
}

export interface Boss {
  id: string;
  name: string;
  type: 'MINI' | 'ELITE' | 'LEGENDARY' | 'MYTHIC' | 'FINAL' | 'SEASONAL';
  requirement: string;
  scaling: number;
  rewardXp: number;
  rewardCoins: number;
  cooldownDays: number;
  lastAttempted?: string;
}

export interface UserAccount {
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface GameState {
  player: PlayerStats;
  quests: Quest[];
  foodHistory: FoodLog[];
  sleepHistory: SleepLog[];
  bankHistory: BankLog[];
  prHistory: PRHistoryLog[];
  challenges: Challenge[];
  waterHistory: { date: string, glasses: number }[];
  bosses: Boss[];
  currentSeason: number;
  seasonDay: number;
  history: {
    date: string;
    xpEarned: number;
    coinsEarned: number;
    questsDone: number;
    sleepHours: number;
  }[];
}
