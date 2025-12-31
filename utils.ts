
import { PR_TIERS, RANDOM_QUESTS } from './constants';
import { StatType, PRData } from './types';

/**
 * XP Formula (XP needed for lvl up):
 * sqrt(LEVEL + 14.795918) * 280
 */
export const getXpThreshold = (level: number): number => {
  return Math.floor(Math.sqrt(level + 14.795918) * 280);
};

export const calculateStatLevel = (type: StatType, value: number): number => {
  const tiers = PR_TIERS[type];
  let points = 0;
  if (type === StatType.Reaction) {
    // For reaction, lower is better
    for (const tier of tiers) {
      if (value <= tier) points++;
    }
  } else {
    for (const tier of tiers) {
      if (value >= tier) points++;
    }
  }
  return points;
};

export const getSeasonInfo = (date: Date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  const seasonLength = 91;
  const season = Math.floor(dayOfYear / seasonLength) + 1;
  const seasonDay = (dayOfYear % seasonLength) + 1;
  const weekInSeason = Math.floor((seasonDay - 1) / 7) + 1;
  
  return {
    season: season > 4 ? 4 : season,
    day: seasonDay,
    week: weekInSeason,
    isFinalWeek: weekInSeason === 13
  };
};

export const getRandomQuest = () => {
  const randomIndex = Math.floor(Math.random() * RANDOM_QUESTS.length);
  return RANDOM_QUESTS[randomIndex];
};

export const formatCurrency = (coins: number) => {
  return (coins / 100).toLocaleString('en-EU', { style: 'currency', currency: 'EUR' });
};
