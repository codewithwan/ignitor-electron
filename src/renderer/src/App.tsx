import { useState, useEffect } from 'react'
import { X, Clock } from 'lucide-react'
import SplashScreen from './components/SplashScreen'
import Sidebar from './components/Sidebar'
import GameLibrary, { Game as UIGame } from './components/GameLibrary'
import StatsView from './components/StatsView'
import GameImporter from './components/GameImporter'
import DeveloperTeam from './components/DeveloperTeam'
import Achievements from './components/Achievements'
import DevTools from './components/DevTools'
import HomePage from './components/HomePage'
import Settings from './components/Settings'
import AudioManager from './components/AudioManager'
import { Game } from './types'

// Define UI game type that extends the base Game type
interface GameUI extends UIGame {
  id: number;
  title: string;
  description: string;
  color: string;
  bgImage: string;
  icon: string;
  playTime: Record<string, number>;
  totalPlayTime: number;
  lastPlayed?: string;
  // Original properties for launching games
  _originalId: string;
  _originalPath: string;
  _originalImportDate: string;
}

// Map imported games to UI games
const mapImportedGamesToUI = (games: Game[]): GameUI[] => {
  return games.map((game, index) => {
    // Generate a numeric ID for the UI
    const numericId = index + 1;

    // Default color if none is set
    const defaultColors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#845EC2', '#00C9A7'];
    const defaultColor = defaultColors[index % defaultColors.length];

    return {
      // UI specific properties
      id: numericId,
      title: game.name,
      description: `Imported game: ${game.name}`,
      color: game.background || defaultColor,
      bgImage: '', // No longer using image paths
      icon: game.icon || '🎮',
      playTime: game.playTime || {},
      totalPlayTime: game.totalPlayTime || 0,
      lastPlayed: game.lastPlayed,

      // Keep original properties for reference to launch the game
      _originalId: game.id,
      _originalPath: game.path,
      _originalImportDate: game.importDate
    };
  });
};

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [games, setGames] = useState<GameUI[]>([])
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState<number>(0)
  const [playingGame, setPlayingGame] = useState<GameUI | null>(null)
  const [playStartTime, setPlayStartTime] = useState<number | null>(null)
  const [noGamesMessage, setNoGamesMessage] = useState<string>('No games found. Import some games to get started.')
  const [apiAvailabilityChecked, setApiAvailabilityChecked] = useState(false)
  // Settings state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('soundEnabled')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('volume')
    return saved !== null ? JSON.parse(saved) : 0.5
  })

  const appVersion = '1.0.0'
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled))
  }, [soundEnabled])

  useEffect(() => {
    localStorage.setItem('volume', JSON.stringify(volume))
  }, [volume])

  // Check if API methods are available
  useEffect(() => {
    // Define a function to check if all required API methods are available
    const checkApiAvailability = () => {
      const apiMethods = [
        'getGames',
        'importGame',
        'deleteGame',
        'updateGameSettings',
        'setGameStyle',
        'trackPlaytime',
        'launchGame',
        'onGamesUpdated'
      ];
      
      let allMethodsAvailable = true;
      const missingMethods: string[] = [];
      
      apiMethods.forEach(method => {
        if (!window.api || typeof window.api[method as keyof typeof window.api] !== 'function') {
          allMethodsAvailable = false;
          missingMethods.push(method);
        }
      });
      
      if (!allMethodsAvailable) {
        console.warn('Missing API methods:', missingMethods);
      }
      
      setApiAvailabilityChecked(true);
    };
    
    checkApiAvailability();
  }, []);

  // Fetch imported games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        if (window.api && typeof window.api.getGames === 'function') {
          const importedGamesList = await window.api.getGames();

          // Map the imported games to UI games
          if (importedGamesList && importedGamesList.length > 0) {
            const mappedGames = mapImportedGamesToUI(importedGamesList);
            setGames(mappedGames);

            // Set the featured game index to the first game if we have games
            if (mappedGames.length > 0 && currentFeaturedIndex >= mappedGames.length) {
              setCurrentFeaturedIndex(0);
            }

            setNoGamesMessage('');
          } else {
            setGames([]);
            setNoGamesMessage('No games found. Import some games to get started.');
          }
        } else {
          console.warn('getGames API method is not available');
          setGames([]);
          setNoGamesMessage('API methods not available. Application may need to be rebuilt.');
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setGames([]);
        setNoGamesMessage('Error loading games. Please try again.');
      }
    };

    if (apiAvailabilityChecked) {
      fetchGames();
    }

    // Set up games updated listener
    let unsubscribe: (() => void) | undefined;
    
    if (window.api && typeof window.api.onGamesUpdated === 'function') {
      unsubscribe = window.api.onGamesUpdated((updatedGames) => {
        if (updatedGames && updatedGames.length > 0) {
          const mappedGames = mapImportedGamesToUI(updatedGames);
          setGames(mappedGames);

          // Set the featured game index to the first game if we have games and no current featured game
          if (mappedGames.length > 0 && currentFeaturedIndex >= mappedGames.length) {
            setCurrentFeaturedIndex(0);
          }

          setNoGamesMessage('');
        } else {
          setGames([]);
          setNoGamesMessage('No games found. Import some games to get started.');
        }
      });
    }

    // Clean up listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentFeaturedIndex, apiAvailabilityChecked]);

  // Handle splash screen finish
  const handleSplashFinish = (): void => {
    setShowSplash(false)
  }

  // Handle navigation
  const handleNavigate = (page: string): void => {
    setCurrentPage(page)
    // Stop playing game if navigating away
    if (playingGame) {
      handleStopPlaying()
    }
  }

  // Handle starting a game
  const handlePlayGame = async (gameId: number): Promise<void> => {
    const game = games.find(g => g.id === gameId)

    if (game) {
      setPlayingGame(game)
      setPlayStartTime(Date.now())

      // Launch the game using the API
      try {
        // Check if the API exists before calling it
        if (window.api && typeof window.api.launchGame === 'function') {
          const result = await window.api.launchGame(game._originalPath);

          if (!result.success) {
            console.error(`Failed to launch game: ${result.message}`);
          }
        } else {
          console.error('launchGame API is not available');
        }
      } catch (error) {
        console.error('Error launching game:', error);
      }
    }
  }

  // Handle stopping a game
  const handleStopPlaying = (): void => {
    if (playingGame) {
      // Here you would stop the running game process
    }

    setPlayingGame(null)
    setPlayStartTime(null)
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} duration={3000} />
  }

  return (
    <div className="app-container">
      {/* Audio Manager Component */}
      {!showSplash && (
        <AudioManager 
          soundEnabled={soundEnabled}
          volume={volume}
        />
      )}
      
      <Sidebar
        onNavigate={handleNavigate}
        activePage={currentPage}
      />

      <main className="main-content">
        {/* Playing Game View */}
        {playingGame ? (
          <div className="game-playing-view fade-in">
            <div className="game-header">
              <h1>{playingGame.title}</h1>
              <button
                className="close-game-btn"
                onClick={handleStopPlaying}
                aria-label="Stop Playing"
              >
                <X size={24} />
              </button>
            </div>

            <div className="game-container">
              <iframe
                src={`${playingGame._originalPath}/index.html`}
                title={playingGame.title}
                className="game-iframe"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>

            <div className="game-toolbar">
              <div className="game-time">
                <Clock size={16} />
                <span>
                  {playStartTime
                    ? `Playing: ${Math.floor(
                      (Date.now() - playStartTime) / 60000
                    )} minutes`
                    : 'Starting game...'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Home Page */}
            {currentPage === 'home' && (
              <HomePage 
                games={games}
                currentFeaturedIndex={currentFeaturedIndex}
                setCurrentFeaturedIndex={setCurrentFeaturedIndex}
                handlePlayGame={handlePlayGame}
                noGamesMessage={noGamesMessage}
                onNavigate={handleNavigate}
              />
            )}

            {/* Game Library */}
            {currentPage === 'library' && (
              <GameLibrary
                games={games}
                onPlayGame={handlePlayGame}
              />
            )}

            {/* Achievements */}
            {currentPage === 'achievements' && (
              <Achievements />
            )}

            {/* Stats View */}
            {currentPage === 'stats' && (
              <StatsView
                games={games}
              />
            )}

            {/* Game Store */}
            {currentPage === 'store' && (
              <div className="store-page fade-in">
                <div className="page-header store-header">
                  <div>
                    <h1 className="page-title">Game Store</h1>
                    <p className="store-subtitle">Discover new educational games</p>
                  </div>
                </div>

                <div className="store-featured">
                  <h2>Coming Soon</h2>
                  <p>Our store is under construction. Check back later for amazing educational games!</p>
                </div>
              </div>
            )}

            {/* Developer Team */}
            {currentPage === 'developers' && (
              <DeveloperTeam />
            )}

            {/* Game Importer */}
            {currentPage === 'import' && (
              <GameImporter
                onNavigateToHome={() => handleNavigate('library')}
              />
            )}

            {/* DevTools */}
            {currentPage === 'devtools' && (
              <DevTools />
            )}

            {/* Settings */}
            {currentPage === 'settings' && (
              <Settings
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                volume={volume}
                setVolume={setVolume}
              />
            )}
          </>
        )}
      </main>

      <div className="app-footer">
        <p className="copyright">© 2025 IGNITOR</p>
        <p className="version">v{appVersion}</p>
      </div>
    </div>
  )
}

export default App
