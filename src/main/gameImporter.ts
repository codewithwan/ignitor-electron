import { BrowserWindow, dialog, ipcMain, app as electronApp } from 'electron'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'
// For launching executable files
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { spawn } = require('child_process')
import { checkAchievements } from './achievements'
import { SimpleStore } from './store'

// Import store from main process
// The store is now initialized in the main index.ts file
let store: SimpleStore;

// Define the structure of a game entry
interface Game {
  id: string
  name: string
  path: string
  importDate: string
  background?: string
  icon?: string
  playTime?: Record<string, number> // Track play time in seconds by date
  lastPlayed?: string // ISO date string of last play
  totalPlayTime?: number // Total seconds played
  achievements?: Record<string, boolean> // Track unlocked achievements
}

// Define store schema
// interface StoreSchema {
//   games: Game[];
// }

export function setupGameImporterHandlers(mainWindow: BrowserWindow) {
  // Get the store instance from main.ts (passed as a parameter)
  store = (global as any).store;
  
  if (!store) {
    store = new SimpleStore({
      name: 'game-library',
      defaults: {
        games: []
      }
    });
    (global as any).store = store;
  }

  // Get user data path
  const userDataPath = electronApp.getPath('userData')
  const gamesDirectory = path.join(userDataPath, 'games')
  const assetsDirectory = path.join(userDataPath, 'assets')

  // Create necessary directories if they don't exist
  if (!fs.existsSync(gamesDirectory)) {
    fs.mkdirSync(gamesDirectory, { recursive: true })
  }

  if (!fs.existsSync(assetsDirectory)) {
    fs.mkdirSync(assetsDirectory, { recursive: true })
  }

  // Handler for opening file dialog and importing ZIP file
  ipcMain.handle('import-game-dialog', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'ZIP Files', extensions: ['zip'] }],
        title: 'Select a Game ZIP File'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'File selection cancelled' }
      }

      const zipPath = result.filePaths[0]
      
      const gameFileName = path.basename(zipPath, '.zip')
      
      // Create a unique ID for the game
      const gameId = `game_${Date.now()}`
      
      // Create specific game directory
      const gameDirectory = path.join(gamesDirectory, gameId)
      
      if (!fs.existsSync(gameDirectory)) {
        fs.mkdirSync(gameDirectory, { recursive: true })
      }
      
      try {
        // Extract ZIP file
        const zip = new AdmZip(zipPath)
        zip.extractAllTo(gameDirectory, true)
        
        // Check if the game has an index.html file (basic validation)
        const possibleEntryPoints = ['index.html', 'game.html', 'main.html']
        let entryFile: string | null = null
        
        for (const entryPoint of possibleEntryPoints) {
          const entryPath = path.join(gameDirectory, entryPoint)
          if (fs.existsSync(entryPath)) {
            entryFile = entryPath
            break
          }
        }
        
        if (!entryFile) {
          console.warn('No HTML entry point found in the imported game')
        }
        
        // Create game entry
        const gameEntry: Game = {
          id: gameId,
          name: gameFileName,
          path: gameDirectory,
          importDate: new Date().toISOString(),
          achievements: {}
        }
        
        // Get current games from store with a fallback to empty array
        const games = store.get('games') || []
        
        // Add new game to the array
        games.push(gameEntry)
        
        // Save updated games array back to store
        store.set('games', games)
        
        // Check for achievements
        checkAchievements(mainWindow, store)
        
        // Send updated game list to renderer
        mainWindow.webContents.send('games-updated', games)
        
        return {
          success: true,
          message: `Successfully imported ${gameFileName}`,
          game: gameEntry
        }
      } catch (zipError) {
        console.error('Error during ZIP extraction or game validation:', zipError)
        
        // Clean up incomplete import
        if (fs.existsSync(gameDirectory)) {
          fs.rmSync(gameDirectory, { recursive: true, force: true })
        }
        
        throw zipError
      }
    } catch (error: unknown) {
      console.error('Error importing game:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `Error importing game: ${errorMessage}`
      }
    }
  })

  // Handler for getting the list of games
  ipcMain.handle('get-games', async () => {
    const games = store.get('games') || []
    return games
  })

  // Handler for deleting a game
  ipcMain.handle('delete-game', async (_, gameId: string) => {
    try {
      // Get current games from store
      const games = store.get('games') || []
      
      // Find the game to delete
      const gameToDelete = games.find((game: Game) => game.id === gameId)
      
      if (!gameToDelete) {
        return { success: false, message: 'Game not found' }
      }
      
      // Delete the game directory
      if (fs.existsSync(gameToDelete.path)) {
        fs.rmSync(gameToDelete.path, { recursive: true, force: true })
      }
      
      // Delete custom background and icon if they exist
      if (gameToDelete.background && fs.existsSync(gameToDelete.background)) {
        fs.unlinkSync(gameToDelete.background)
      }
      
      if (gameToDelete.icon && fs.existsSync(gameToDelete.icon)) {
        fs.unlinkSync(gameToDelete.icon)
      }
      
      // Remove game from array
      const updatedGames = games.filter((game: Game) => game.id !== gameId)
      
      // Save updated games array
      store.set('games', updatedGames)
      
      // Send updated game list to renderer
      mainWindow.webContents.send('games-updated', updatedGames)
      
      return {
        success: true,
        message: `Successfully deleted ${gameToDelete.name}`
      }
    } catch (error: unknown) {
      console.error('Error deleting game:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `Error deleting game: ${errorMessage}`
      }
    }
  })

  // Handler for updating game settings
  ipcMain.handle('update-game-settings', async (_, gameId: string, settings: Partial<Game>) => {
    try {
      // Get current games from store
      const games = store.get('games') || []
      
      // Find the game to update
      const gameIndex = games.findIndex((game: Game) => game.id === gameId)
      
      if (gameIndex === -1) {
        return { success: false, message: 'Game not found' }
      }
      
      // Update the game with new settings
      games[gameIndex] = {
        ...games[gameIndex],
        ...settings
      }
      
      // Save updated games array
      store.set('games', games)
      
      // Send updated game list to renderer
      mainWindow.webContents.send('games-updated', games)
      
      return {
        success: true,
        message: `Successfully updated ${games[gameIndex].name} settings`
      }
    } catch (error: unknown) {
      console.error('Error updating game settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `Error updating game settings: ${errorMessage}`
      }
    }
  })

  // Handler for tracking playtime
  ipcMain.handle('track-playtime', async (_, gameId: string, seconds: number) => {
    try {
      // Get current games from store
      const games = store.get('games') || []
      
      // Find the game to update
      const gameIndex = games.findIndex((game: Game) => game.id === gameId)
      
      if (gameIndex === -1) {
        return { success: false, message: 'Game not found' }
      }
      
      const game = games[gameIndex]
      
      // Initialize playtime tracking if not exists
      if (!game.playTime) {
        game.playTime = {}
      }
      
      if (!game.totalPlayTime) {
        game.totalPlayTime = 0
      }
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0]
      
      // Update today's playtime
      game.playTime[today] = (game.playTime[today] || 0) + seconds
      
      // Update total playtime
      game.totalPlayTime += seconds
      
      // Update last played date
      game.lastPlayed = new Date().toISOString()
      
      // Save updated game
      games[gameIndex] = game
      store.set('games', games)
      
      // Check for achievements
      checkAchievements(mainWindow, store)
      
      // Send updated game list to renderer
      mainWindow.webContents.send('games-updated', games)
      
      return {
        success: true,
        message: `Updated playtime for ${game.name}`,
        totalTime: game.totalPlayTime
      }
    } catch (error: unknown) {
      console.error('Error tracking playtime:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `Error tracking playtime: ${errorMessage}`
      }
    }
  })

  // Handler for setting a game icon or background
  ipcMain.handle(
    'set-game-style',
    async (_, gameId: string, type: 'icon' | 'background', value: string) => {
      try {
        // Get current games from store
        const games = store.get('games') || []
        
        // Find the game to update
        const gameIndex = games.findIndex((game: Game) => game.id === gameId)
        
        if (gameIndex === -1) {
          return { success: false, message: 'Game not found' }
        }
        
        // Update the game with the new style attribute
        if (type === 'icon') {
          games[gameIndex].icon = value
        } else {
          games[gameIndex].background = value
        }
        
        // Save updated games array
        store.set('games', games)
        
        // Send updated game list to renderer
        mainWindow.webContents.send('games-updated', games)
        
        return {
          success: true,
          message: `Successfully updated game ${type}`,
          value: value
        }
      } catch (error: unknown) {
        console.error(`Error setting game ${type}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return {
          success: false,
          message: `Error setting game ${type}: ${errorMessage}`
        }
      }
    }
  )

  // Handler for launching games
  ipcMain.handle('launch-game', async (_, gamePath: string) => {
    try {
      // Look for index.html or default entry point in the game directory
      const possibleHtmlEntryPoints = ['index.html', 'game.html', 'main.html']
      let htmlEntryFile: string | null = null
      
      for (const entryPoint of possibleHtmlEntryPoints) {
        const entryPath = path.join(gamePath, entryPoint)
        if (fs.existsSync(entryPath)) {
          htmlEntryFile = entryPath
          break
        }
      }
      
      // If HTML entry found, launch in browser window
      if (htmlEntryFile) {
        const gameWindow = new BrowserWindow({
          width: 1280,
          height: 720,
          show: true,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
          }
        })
        
        // Load the game from the local file system
        await gameWindow.loadFile(htmlEntryFile)
        return { success: true, message: `Game launched successfully from ${htmlEntryFile}` }
      } else {
        // If we couldn't find a web entry point, check for executable files
        const possibleExeEntryPoints = ['.exe', '.app', '.sh', '.bat']
        let executablePath: string | null = null
        
        // First, scan the directory for files
        const files = fs.readdirSync(gamePath)
        
        // Look for executable files
        for (const file of files) {
          const filePath = path.join(gamePath, file)
          const fileExt = path.extname(file).toLowerCase()
          
          // Check if it's a directory
          if (fs.statSync(filePath).isDirectory()) {
            // Check subdirectories for executable files
            const subDirFiles = fs.readdirSync(filePath)
            for (const subFile of subDirFiles) {
              const subFilePath = path.join(filePath, subFile)
              const subFileExt = path.extname(subFile).toLowerCase()
              
              if (possibleExeEntryPoints.includes(subFileExt)) {
                executablePath = subFilePath
                break
              }
            }
          } else if (possibleExeEntryPoints.includes(fileExt)) {
            // Check if it's an executable in the root directory
            executablePath = filePath
            break
          }
          
          if (executablePath) break
        }
        
        if (executablePath) {
          // Launch the executable using child_process
          const process = spawn(executablePath, [], {
            detached: true,
            stdio: 'ignore',
            windowsHide: false
          })
          
          // Unref the process to let it run independently
          process.unref()
          
          return { 
            success: true, 
            message: `Game launched successfully from executable: ${executablePath}` 
          }
        }
        
        return { 
          success: false, 
          message: 'Could not find a playable file (HTML or executable) in the game directory' 
        }
      }
    } catch (error: unknown) {
      console.error('Error launching game:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `Error launching game: ${errorMessage}`
      }
    }
  })
}
