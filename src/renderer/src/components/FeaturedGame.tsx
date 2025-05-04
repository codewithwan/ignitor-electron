import React from 'react';
import { Clock, Play } from 'lucide-react';
import { Game } from './GameLibrary';

interface FeaturedGameProps {
    game: Game & {
        totalPlayTime?: number;
        lastPlayed?: string;
    };
    onPlay: (id: number) => void
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

// Format date to human-readable string
const formatLastPlayed = (dateString?: string): string => {
    if (!dateString) return 'Never played';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
        return date.toLocaleDateString();
    }
};

function FeaturedGame({ game, onPlay }: FeaturedGameProps): React.JSX.Element {
    // Generate a child-friendly background color
    const getBgColor = (color: string) => {
        return color;
    }

    // Check if game has a custom background
    const hasCustomBackground = game.bgImage && game.bgImage.startsWith('/');

    const handlePlay = () => {
        onPlay(game.id);
    };

    return (
        <div
            className="featured-game"
            style={{
                backgroundColor: getBgColor(game.color),
                backgroundImage: hasCustomBackground ? `url(${game.bgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}
        >
            {/* Add overlay for better text readability when using background images */}
            {hasCustomBackground && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1
                }} />
            )}

            {/* Decorative cloud shapes (only show if no custom background) */}
            {!hasCustomBackground && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '20%',
                            width: '80px',
                            height: '40px',
                            borderRadius: '50px',
                            background: 'rgba(255, 255, 255, 0.6)',
                            zIndex: 0
                        }}
                    />

                    <div
                        style={{
                            position: 'absolute',
                            top: '30px',
                            right: '30%',
                            width: '50px',
                            height: '30px',
                            borderRadius: '50px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 0
                        }}
                    />
                </>
            )}

            <div className="featured-content" style={{ zIndex: hasCustomBackground ? 2 : 1 }}>
                <div className="featured-tag">Game Pilihan</div>
                <h2 className="featured-title" style={{ 
                    color: hasCustomBackground ? 'white' : 'inherit' 
                }}>{game.title}</h2>
                <p className="featured-description" style={{ 
                    color: hasCustomBackground ? 'rgba(255, 255, 255, 0.9)' : 'inherit' 
                }}>{game.description}</p>

                <div className="featured-stats" style={{ 
                    backgroundColor: hasCustomBackground ? 'rgba(0, 0, 0, 0.5)' : 'inherit',
                    color: hasCustomBackground ? 'white' : 'inherit',
                    borderColor: hasCustomBackground ? 'rgba(255, 255, 255, 0.3)' : 'inherit'
                }}>
                    <div className="stat">
                        <div className="stat-value-container">
                            <Clock size={18} className="stat-icon-small" />
                            <span className="stat-value">{formatPlaytime(game.totalPlayTime || 0)}</span>
                        </div>
                        <span className="stat-label">Playtime</span>
                    </div>
                    <div className="stat">
                        <div className="stat-value-container">
                            <Clock size={18} className="stat-icon-small" />
                            <span className="stat-value">{formatLastPlayed(game.lastPlayed)}</span>
                        </div>
                        <span className="stat-label">Last played</span>
                    </div>
                </div>

                <button
                    className="featured-play-button"
                    onClick={handlePlay}
                >
                    <Play size={18} />
                    <span>Main Sekarang</span>
                </button>
            </div>

            <div className="featured-image" style={{ zIndex: hasCustomBackground ? 2 : 1 }}>
                {/* Check if game has a custom icon */}
                {game.icon && typeof game.icon === 'string' && game.icon.startsWith('/') ? (
                    <div className="game-icon-large" style={{
                        backgroundImage: `url(${game.icon})`
                    }} />
                ) : (
                    <div className="game-icon-large">{game.icon}</div>
                )}
            </div>
        </div>
    );
}

export default FeaturedGame;