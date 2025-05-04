import { useState, useEffect } from 'react'
import { X, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import SplashScreen from './components/SplashScreen'
import Sidebar from './components/Sidebar'
import GameLibrary, { Game as UIGame } from './components/GameLibrary'
import FeaturedGame from './components/FeaturedGame'
import StatsView from './components/StatsView'
import GameImporter from './components/GameImporter'
import DeveloperTeam from './components/DeveloperTeam'
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

// Format playtime to human-readable string
// const formatPlaytime = (seconds: number): string => {
//   if (seconds < 60) {
//     return `${seconds}s`;
//   } else if (seconds < 3600) {
//     return `${Math.floor(seconds / 60)}m`;
//   } else {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     return `${hours}h ${minutes}m`;
//   }
// };

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

  const appVersion = '1.0.0'

  // Fetch imported games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        if (window.api) {
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
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setGames([]);
        setNoGamesMessage('Error loading games. Please try again.');
      }
    };

    fetchGames();

    // Set up games updated listener
    const unsubscribe = window.api?.onGamesUpdated ? window.api.onGamesUpdated((updatedGames) => {
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
    }) : () => { };

    // Clean up listener when component unmounts
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [currentFeaturedIndex]);

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

  // Handle previous featured game
  const handlePrevFeatured = (): void => {
    setCurrentFeaturedIndex(prev =>
      prev === 0 ? games.length - 1 : prev - 1
    )
  }

  // Handle next featured game
  const handleNextFeatured = (): void => {
    setCurrentFeaturedIndex(prev =>
      prev === games.length - 1 ? 0 : prev + 1
    )
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} duration={3000} />
  }

  return (
    <div className="app-container">
      <Sidebar
        onNavigate={handleNavigate}
        activePage={currentPage}
      />

      <main className="main-content">
        {/* Playing Game View */}
        {playingGame ? (
          <div className="game-playing">
            <div className="game-header">
              <h2>{playingGame.title}</h2>
              <button className="stop-button" onClick={handleStopPlaying}>
                <X size={16} />
                <span>Stop Playing</span>
              </button>
            </div>
            <div className="game-frame" style={{
              backgroundColor: playingGame.color,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <div className="game-placeholder">
                <div className="game-icon-xl">{playingGame.icon}</div>
                <p>Game is running from: {playingGame._originalPath}</p>
                {playStartTime && (
                  <p className="playing-timer">
                    <Clock size={16} /> Playing since: {new Date(playStartTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Home Page */}
            {currentPage === 'home' && (
              <div className="home-page fade-in">
                <div className="page-header">
                  <h1 className="page-title">Welcome to IGNITOR</h1>
                </div>

                {games.length > 0 ? (
                  <>
                    <div className="featured-slider-container">
                      <button
                        className="featured-arrow featured-prev"
                        onClick={handlePrevFeatured}
                        aria-label="Previous Game"
                      >
                        <ChevronLeft size={24} />
                      </button>

                      <FeaturedGame
                        game={games[currentFeaturedIndex]}
                        onPlay={handlePlayGame}
                      />

                      <button
                        className="featured-arrow featured-next"
                        onClick={handleNextFeatured}
                        aria-label="Next Game"
                      >
                        <ChevronRight size={24} />
                      </button>

                      <div className="featured-indicators">
                        {games.map((_, index) => (
                          <button
                            key={index}
                            className={`featured-indicator ${index === currentFeaturedIndex ? 'active' : ''}`}
                            onClick={() => setCurrentFeaturedIndex(index)}
                            aria-label={`Game ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="recent-games">
                      <h2>Recent Games</h2>
                      <div className="recent-games-grid">
                        {games.map(game => (
                          <div key={game.id} className="recent-game-card" onClick={() => handlePlayGame(game.id)}>
                            <div className="recent-game-icon" style={{
                              backgroundColor: game.color
                            }}>
                              {game.icon}
                            </div>
                            <div className="recent-game-info">
                              <div className="recent-game-title">{game.title}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🎮</div>
                    <h2>Your Game Library is Empty</h2>
                    <p>{noGamesMessage}</p>
                    <button
                      className="import-button"
                      onClick={() => handleNavigate('import')}
                    >
                      Import Games
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Game Library */}
            {currentPage === 'library' && (
              <GameLibrary
                games={games}
                onPlayGame={handlePlayGame}
              />
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
