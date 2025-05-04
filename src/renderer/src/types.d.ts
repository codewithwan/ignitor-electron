export interface Game {
  id: string
  name: string
  path: string
  importDate: string
  background?: string 
  icon?: string 
  playTime?: Record<string, number> 
  lastPlayed?: string 
  totalPlayTime?: number 
}

export interface ImportResult {
  success: boolean
  message: string
  game?: Game
}

export interface DeleteResult {
  success: boolean
  message: string
}

export interface LaunchResult {
  success: boolean
  message: string
}

export interface StyleUpdateResult {
  success: boolean
  message: string
  value?: string
}

export interface PlaytimeResult {
  success: boolean
  message: string
  totalTime?: number
}

declare global {
  interface Window {
    api: {
      importGame: () => Promise<ImportResult>
      getGames: () => Promise<Game[]>
      deleteGame: (gameId: string) => Promise<DeleteResult>
      onGamesUpdated: (callback: (games: Game[]) => void) => () => void
      updateGameSettings: (
        gameId: string,
        settings: Partial<Game>
      ) => Promise<{ success: boolean; message: string }>
      setGameStyle: (
        gameId: string,
        type: 'icon' | 'background',
        value: string
      ) => Promise<StyleUpdateResult>
      trackPlaytime: (gameId: string, seconds: number) => Promise<PlaytimeResult>
      launchGame: (gamePath: string) => Promise<LaunchResult>
    }
  }
}
