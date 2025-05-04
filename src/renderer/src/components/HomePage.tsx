import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FeaturedGame from './FeaturedGame';

// Interface for the UI Game
interface GameUI {
  id: number;
  title: string;
  description: string;
  color: string;
  bgImage: string;
  icon: string;
  playTime: Record<string, number>;
  totalPlayTime: number;
  lastPlayed?: string;
  _originalId: string;
  _originalPath: string;
  _originalImportDate: string;
}

interface HomePageProps {
  games: GameUI[];
  currentFeaturedIndex: number;
  setCurrentFeaturedIndex: React.Dispatch<React.SetStateAction<number>>;
  handlePlayGame: (gameId: number) => void;
  noGamesMessage: string;
  onNavigate: (page: string) => void;
}

function HomePage({
  games,
  currentFeaturedIndex,
  setCurrentFeaturedIndex,
  handlePlayGame,
  noGamesMessage,
  onNavigate
}: HomePageProps): React.JSX.Element {
  
  // Handle previous featured game
  const handlePrevFeatured = (): void => {
    setCurrentFeaturedIndex((prev: number) =>
      prev === 0 ? games.length - 1 : prev - 1
    );
  };

  // Handle next featured game
  const handleNextFeatured = (): void => {
    setCurrentFeaturedIndex((prev: number) =>
      prev === games.length - 1 ? 0 : prev + 1
    );
  };

  return (
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
            onClick={() => onNavigate('import')}
          >
            Import Games
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage; 