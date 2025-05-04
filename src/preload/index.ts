import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Game type definition
interface Game {
  id: string;
  name: string;
  path: string;
  importDate: string;
  background?: string;
  icon?: string;
  playTime?: Record<string, number>;
  lastPlayed?: string;
  totalPlayTime?: number;
  achievements?: Record<string, boolean>; // Track unlocked achievements
}

// Achievement type definition
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'games_added' | 'total_playtime' | 'games_played';
  reward?: string;
  rewardType?: 'background' | 'icon';
}

// Achievement progress type
// interface AchievementProgress {
//   achievement: Achievement;
//   progress: number;
//   unlocked: boolean;
// }

// Custom APIs for renderer
const api = {
  // Game importer functions
  importGame: () => {
    return ipcRenderer.invoke('import-game-dialog');
  },
  
  getGames: () => {
    return ipcRenderer.invoke('get-games');
  },
  
  deleteGame: (gameId: string) => {
    return ipcRenderer.invoke('delete-game', gameId);
  },
  
  // New functions for customization
  updateGameSettings: (gameId: string, settings: Partial<Game>) => {
    return ipcRenderer.invoke('update-game-settings', gameId, settings);
  },
  
  // Replace selectCustomImage with setGameStyle
  setGameStyle: (gameId: string, type: 'icon' | 'background', value: string) => {
    return ipcRenderer.invoke('set-game-style', gameId, type, value);
  },
  
  // Track playtime for games
  trackPlaytime: (gameId: string, seconds: number) => {
    return ipcRenderer.invoke('track-playtime', gameId, seconds);
  },
  
  // Game launching
  launchGame: (gamePath: string) => {
    return ipcRenderer.invoke('launch-game', gamePath);
  },
  
  // Achievement functions
  getAchievements: () => {
    return ipcRenderer.invoke('get-achievements');
  },
  
  getAchievementProgress: () => {
    return ipcRenderer.invoke('get-achievement-progress');
  },
  
  unlockAchievement: (achievementId: string) => {
    return ipcRenderer.invoke('unlock-achievement', achievementId);
  },
  
  // Event listeners
  onGamesUpdated: (callback: (games: Game[]) => void) => {
    const subscription = (_event: any, games: Game[]) => callback(games);
    ipcRenderer.on('games-updated', subscription);
    
    return () => {
      ipcRenderer.removeListener('games-updated', subscription);
    };
  },
  
  onAchievementUnlocked: (callback: (achievement: Achievement) => void) => {
    const subscription = (_event: any, achievement: Achievement) => callback(achievement);
    ipcRenderer.on('achievement-unlocked', subscription);
    
    return () => {
      ipcRenderer.removeListener('achievement-unlocked', subscription);
    };
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose APIs:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
