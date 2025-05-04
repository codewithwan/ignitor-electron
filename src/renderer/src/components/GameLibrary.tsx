import React, { useState } from 'react'
import { Filter, Grid, Play, Clock, Calendar, Gamepad } from 'lucide-react'

export interface Game {
  id: number
  title: string
  description: string
  color: string
  bgImage: string
  icon: string
  playTime: Record<string, number>
  totalPlayTime?: number
  lastPlayed?: string
}

export interface GameLibraryProps {
  games: Game[]
  onPlayGame: (gameId: number) => void
}

// Format playtime to human-readable string
const formatPlaytime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

// Format date to readable format
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Never played';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // If today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise
  return date.toLocaleDateString();
};

function GameLibrary({ games, onPlayGame }: GameLibraryProps): React.JSX.Element {
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [hoveredGame, setHoveredGame] = useState<number | null>(null)
  
  // Filter games based on selected filter
  const filteredGames = () => {
    if (filter === 'all') return games
    return games
  }

  return (
    <div className="game-library fade-in">
      <div className="page-header library-header">
        <div>
          <h1 className="page-title">Game Library</h1>
          <p className="library-subtitle">All your educational games in one place</p>
        </div>
        
        <div className="library-controls">
          <div className="library-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              disabled={filter === 'all'}
            >
              <Filter size={14} className="filter-icon" />
              All Games
            </button>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className={`games-grid ${viewMode}`}>
        {filteredGames().length > 0 ? (
          filteredGames().map(game => (
            <div 
              key={game.id} 
              className="game-card"
              onClick={() => onPlayGame(game.id)}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              style={{ 
                borderColor: game.color,
                transform: hoveredGame === game.id ? 'translateY(-10px) rotate(-1deg)' : 'rotate(-1deg)',
                boxShadow: hoveredGame === game.id 
                  ? `10px 10px 0px ${game.color}` 
                  : `5px 5px 0px ${game.color}`
              }}
            >
              <div 
                className="game-header" 
                style={{ 
                  backgroundColor: game.color,
                  height: hoveredGame === game.id ? '130px' : '100px',
                }}
              >
                <div className="game-icon-wrapper">
                  <span className="game-icon">{game.icon}</span>
                  {hoveredGame === game.id && (
                    <div className="game-play-overlay">
                      <Play size={30} />
                    </div>
                  )}
                </div>
                <div className="game-badge">GAME</div>
              </div>
              <div className="game-content">
                <h3 className="game-title">{game.title}</h3>
                <p className="game-description">{game.description}</p>
                <div className="game-stats">
                  <div className="game-stat">
                    <Clock size={14} />
                    <span>{formatPlaytime(game.totalPlayTime || 0)}</span>
                  </div>
                  
                  <div className="game-stat">
                    <Calendar size={14} />
                    <span>{formatDate(game.lastPlayed)}</span>
                  </div>
                </div>
                
                <button className="game-play-button">
                  <Gamepad size={16} />
                  <span>Play Now</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-games">
            <div className="no-games-icon">🎮</div>
            <h3>No games found</h3>
            <p>Try importing some games or changing your filter</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameLibrary 