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
}

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
  
  // Event listeners
  onGamesUpdated: (callback: (games: Game[]) => void) => {
    const subscription = (_event: any, games: Game[]) => callback(games);
    ipcRenderer.on('games-updated', subscription);
    
    return () => {
      ipcRenderer.removeListener('games-updated', subscription);
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
