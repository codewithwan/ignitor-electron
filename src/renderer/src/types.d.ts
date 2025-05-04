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
  achievements?: Record<string, boolean> // Track unlocked achievements
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  requirement: number // Required value to unlock (games added, time played, etc.)
  type: 'games_added' | 'total_playtime' | 'games_played' // Achievement type
  reward?: string // Optional reward (background color, icon, etc.)
  rewardType?: 'background' | 'icon' // Type of reward
}

export interface AchievementProgress {
  achievement: Achievement
  progress: number // Current progress towards achievement
  unlocked: boolean
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
      getAchievements: () => Promise<Achievement[]>
      getAchievementProgress: () => Promise<AchievementProgress[]>
      unlockAchievement: (achievementId: string) => Promise<{ success: boolean; message: string }>
      onAchievementUnlocked: (callback: (achievement: Achievement) => void) => () => void
    }
  }
}
