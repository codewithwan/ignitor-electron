import { BrowserWindow, ipcMain } from 'electron'
import { Game, Achievement, AchievementProgress } from '../renderer/src/types'

// Neo-brutalism themed colors for achievement rewards
const ACHIEVEMENT_REWARD_COLORS = [
  '#FF9B54', // Coral
  '#00B2CA', // Bright Teal
  '#7D5BA6', // Medium Purple
  '#FFC857', // Golden Yellow
  '#E63946', // Imperial Red
  '#06D6A0', // Caribbean Green
  '#118AB2', // Blue Sapphire
  '#FF5400', // Safety Orange
  '#3A5A40', // Dark Forest Green
  '#D62828', // Fire Engine Red
];

// Special icons for achievement rewards
const ACHIEVEMENT_REWARD_ICONS = [
  '🏆', '🎖️', '🥇', '⭐', '💎', '👑', '🌟', '🔮', '💫', '✨' 
];

// Define all available achievements
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'games_collector_bronze',
    title: 'Game Collector: Bronze',
    description: 'Add 3 games to your collection',
    icon: '🎮',
    requirement: 3,
    type: 'games_added',
    reward: ACHIEVEMENT_REWARD_COLORS[0],
    rewardType: 'background'
  },
  {
    id: 'games_collector_silver',
    title: 'Game Collector: Silver',
    description: 'Add 5 games to your collection',
    icon: '🎮',
    requirement: 5,
    type: 'games_added',
    reward: ACHIEVEMENT_REWARD_COLORS[1],
    rewardType: 'background'
  },
  {
    id: 'games_collector_gold',
    title: 'Game Collector: Gold',
    description: 'Add 10 games to your collection',
    icon: '🎮',
    requirement: 10,
    type: 'games_added',
    reward: ACHIEVEMENT_REWARD_COLORS[2],
    rewardType: 'background'
  },
  {
    id: 'casual_gamer',
    title: 'Casual Gamer',
    description: 'Play games for a total of 1 hour',
    icon: '⏱️',
    requirement: 60 * 60, // 1 hour in seconds
    type: 'total_playtime',
    reward: ACHIEVEMENT_REWARD_ICONS[0],
    rewardType: 'icon'
  },
  {
    id: 'dedicated_gamer',
    title: 'Dedicated Gamer',
    description: 'Play games for a total of 5 hours',
    icon: '⏱️',
    requirement: 5 * 60 * 60, // 5 hours in seconds
    type: 'total_playtime',
    reward: ACHIEVEMENT_REWARD_ICONS[1],
    rewardType: 'icon'
  },
  {
    id: 'gaming_enthusiast',
    title: 'Gaming Enthusiast',
    description: 'Play games for a total of 10 hours',
    icon: '⏱️',
    requirement: 10 * 60 * 60, // 10 hours in seconds
    type: 'total_playtime',
    reward: ACHIEVEMENT_REWARD_ICONS[2],
    rewardType: 'icon'
  },
  {
    id: 'game_explorer_bronze',
    title: 'Game Explorer: Bronze',
    description: 'Play 3 different games',
    icon: '🔍',
    requirement: 3,
    type: 'games_played',
    reward: ACHIEVEMENT_REWARD_COLORS[3],
    rewardType: 'background'
  },
  {
    id: 'game_explorer_silver',
    title: 'Game Explorer: Silver',
    description: 'Play 5 different games',
    icon: '🔍',
    requirement: 5,
    type: 'games_played',
    reward: ACHIEVEMENT_REWARD_COLORS[4],
    rewardType: 'background'
  },
  {
    id: 'game_explorer_gold',
    title: 'Game Explorer: Gold',
    description: 'Play 10 different games',
    icon: '🔍',
    requirement: 10,
    type: 'games_played',
    reward: ACHIEVEMENT_REWARD_ICONS[3],
    rewardType: 'icon'
  }
];

// Setup achievement handlers
export function setupAchievementHandlers(mainWindow: BrowserWindow, store: any) {
  // Handler to get all achievements
  ipcMain.handle('get-achievements', async () => {
    return ACHIEVEMENTS;
  });

  // Handler to get achievement progress
  ipcMain.handle('get-achievement-progress', async () => {
    try {
      const games = store.get('games') || [];
      const achievementStatus = calculateAchievementProgress(games);
      return achievementStatus;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return [];
    }
  });

  // Handler to manually unlock an achievement (for testing)
  ipcMain.handle('unlock-achievement', async (_, achievementId: string) => {
    try {
      const games = store.get('games') || [];
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      
      if (!achievement) {
        return { success: false, message: 'Achievement not found' };
      }

      // Update games with achievement
      const updatedGames = markAchievementAsUnlocked(games, achievement);
      store.set('games', updatedGames);
      
      // Notify renderer
      mainWindow.webContents.send('games-updated', updatedGames);
      
      return { 
        success: true, 
        message: `Achievement unlocked: ${achievement.title}` 
      };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Error unlocking achievement: ${errorMessage}`
      };
    }
  });
}

// Calculate achievement progress based on games data
export function calculateAchievementProgress(games: Game[]): AchievementProgress[] {
  return ACHIEVEMENTS.map(achievement => {
    let progress = 0;
    let unlocked = false;

    // Check if this achievement is already unlocked in any game
    const alreadyUnlocked = games.some(game => 
      game.achievements && game.achievements[achievement.id]
    );

    if (alreadyUnlocked) {
      progress = achievement.requirement;
      unlocked = true;
    } else {
      // Calculate progress based on achievement type
      switch (achievement.type) {
        case 'games_added':
          progress = games.length;
          unlocked = progress >= achievement.requirement;
          break;
        
        case 'total_playtime':
          // Sum up total playtime across all games
          const totalSeconds = games.reduce((total, game) => {
            return total + (game.totalPlayTime || 0);
          }, 0);
          progress = totalSeconds;
          unlocked = progress >= achievement.requirement;
          break;
        
        case 'games_played':
          // Count games that have been played at least once
          const playedGames = games.filter(game => 
            game.lastPlayed && game.totalPlayTime && game.totalPlayTime > 0
          ).length;
          progress = playedGames;
          unlocked = progress >= achievement.requirement;
          break;
      }
    }

    return {
      achievement,
      progress,
      unlocked
    };
  });
}

// Mark an achievement as unlocked in player's game data
export function markAchievementAsUnlocked(games: Game[], achievement: Achievement): Game[] {
  return games.map(game => {
    // Initialize achievements object if it doesn't exist
    if (!game.achievements) {
      game.achievements = {};
    }
    
    // Mark this achievement as unlocked
    game.achievements[achievement.id] = true;
    
    // Apply reward if applicable
    if (achievement.reward && achievement.rewardType) {
      if (achievement.rewardType === 'background') {
        game.background = achievement.reward;
      } else if (achievement.rewardType === 'icon') {
        game.icon = achievement.reward;
      }
    }
    
    return game;
  });
}

// Check for newly completed achievements
export function checkAchievements(mainWindow: BrowserWindow, store: any): void {
  const games = store.get('games') || [];
  const achievementProgress = calculateAchievementProgress(games);
  
  // Find newly unlocked achievements
  const newlyUnlocked = achievementProgress.filter(ap => 
    ap.unlocked && !games.some(game => 
      game.achievements && game.achievements[ap.achievement.id]
    )
  );
  
  if (newlyUnlocked.length > 0) {
    let updatedGames = [...games];
    
    // Update games with the newly unlocked achievements
    newlyUnlocked.forEach(({ achievement }) => {
      updatedGames = markAchievementAsUnlocked(updatedGames, achievement);
      
      // Notify renderer about unlocked achievement
      mainWindow.webContents.send('achievement-unlocked', achievement);
    });
    
    // Save updated game data
    store.set('games', updatedGames);
    
    // Notify renderer about updated games
    mainWindow.webContents.send('games-updated', updatedGames);
  }
} 