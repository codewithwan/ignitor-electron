import React, { useState } from 'react';
import { Game } from './GameLibrary';
import { Clock, Calendar, TrendingUp, Trophy, Gamepad, Zap, ArrowUp } from 'lucide-react';

interface StatsViewProps {
    games: Game[];
}

// Format playtime to human-readable string
const formatPlaytime = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds} seconds`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
};

// Format date to human-readable string
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
};

// Calculate percentage for bar visualization
const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min(100, Math.round((value / total) * 100));
};

const StatsView: React.FC<StatsViewProps> = ({ games }) => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    // Calculate total playtime across all games
    const totalPlaytime = games.reduce((total, game) => total + (game.totalPlayTime || 0), 0);

    // Find most played game
    const mostPlayedGame = games.length > 0
        ? games.reduce((prev, current) =>
            (prev.totalPlayTime || 0) > (current.totalPlayTime || 0) ? prev : current
        )
        : null;

    // Find last played game
    const lastPlayedGame = games.length > 0
        ? games.reduce((prev, current) => {
            if (!current.lastPlayed) return prev;
            if (!prev.lastPlayed) return current;
            return new Date(current.lastPlayed) > new Date(prev.lastPlayed) ? current : prev;
        })
        : null;

    // Get play history for last 7 days
    //   const last7Days = [...Array(7)].map((_, i) => {
    //     const date = new Date();
    //     date.setDate(date.getDate() - i);
    //     return date.toISOString().split('T')[0];
    //   });

    // Total play sessions
    const totalSessions = games.reduce((total, game) => {
        if (!game.playTime) return total;
        return total + Object.keys(game.playTime).length;
    }, 0);

    // Sort games by playtime (descending)
    const sortedGames = [...games].sort((a, b) =>
        (b.totalPlayTime || 0) - (a.totalPlayTime || 0)
    );

    return (
        <div className="stats-view fade-in">
            <div className="page-header">
                <h1 className="page-title">Your Gaming Stats</h1>
                <p className="stats-subtitle">Track your progress and see your gaming habits</p>
            </div>

            <div className="stats-summary">
                <div className="stat-card summary-card">
                    <div className="stat-icon trophy-icon">
                        <Trophy size={28} />
                    </div>
                    <div className="stat-details">
                        <h3 className="stat-title">Total Playtime</h3>
                        <p className="stat-value highlight">{formatPlaytime(totalPlaytime)}</p>
                        <div className="stat-badge">DEDICATED GAMER</div>
                    </div>
                </div>

                <div className="stat-card summary-card">
                    <div className="stat-icon trending-icon">
                        <TrendingUp size={28} />
                    </div>
                    <div className="stat-details">
                        <h3 className="stat-title">Most Played</h3>
                        {mostPlayedGame ? (
                            <>
                                <p className="stat-value highlight">{mostPlayedGame.title}</p>
                                <p className="stat-subvalue">{formatPlaytime(mostPlayedGame.totalPlayTime || 0)}</p>
                            </>
                        ) : (
                            <p className="stat-value">No games played yet</p>
                        )}
                    </div>
                </div>

                <div className="stat-card summary-card">
                    <div className="stat-icon calendar-icon">
                        <Calendar size={28} />
                    </div>
                    <div className="stat-details">
                        <h3 className="stat-title">Last Played</h3>
                        {lastPlayedGame && lastPlayedGame.lastPlayed ? (
                            <>
                                <p className="stat-value highlight">{lastPlayedGame.title}</p>
                                <p className="stat-subvalue">{formatDate(lastPlayedGame.lastPlayed)}</p>
                            </>
                        ) : (
                            <p className="stat-value">No games played yet</p>
                        )}
                    </div>
                </div>

                <div className="stat-card summary-card">
                    <div className="stat-icon sessions-icon">
                        <Gamepad size={28} />
                    </div>
                    <div className="stat-details">
                        <h3 className="stat-title">Play Sessions</h3>
                        <p className="stat-value highlight">{totalSessions}</p>
                        <p className="stat-subvalue">total sessions</p>
                    </div>
                </div>
            </div>

            {games.length > 0 ? (
                <>
                    <div className="stats-header">
                        <h2 className="section-title">Game Breakdown</h2>
                        <p className="section-subtitle">See which games you've played the most</p>
                    </div>

                    <div className="stats-bars">
                        {sortedGames.slice(0, 5).map(game => (
                            <div key={game.id} className="stats-bar-item">
                                <div className="stats-bar-info">
                                    <div className="stats-bar-icon" style={{ backgroundColor: game.color }}>
                                        {game.icon}
                                    </div>
                                    <div className="stats-bar-title">{game.title}</div>
                                </div>
                                <div className="stats-bar-container">
                                    <div
                                        className="stats-bar-fill"
                                        style={{
                                            width: `${calculatePercentage(game.totalPlayTime || 0, totalPlaytime)}%`,
                                            backgroundColor: game.color
                                        }}
                                    >
                                        <span className="stats-bar-value">{formatPlaytime(game.totalPlayTime || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="game-stats-list">
                        <h2 className="section-title">Detailed Game Stats</h2>
                        <div className="games-stats-grid">
                            {games.map(game => (
                                <div
                                    key={game.id}
                                    className="game-stat-card"
                                    onMouseEnter={() => setHoveredCard(game.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                        borderColor: game.color,
                                        transform: hoveredCard === game.id ? 'translateY(-5px) rotate(-1deg)' : 'rotate(-1deg)',
                                        boxShadow: hoveredCard === game.id
                                            ? `8px 8px 0px ${game.color}`
                                            : `4px 4px 0px ${game.color}`
                                    }}
                                >
                                    <div className="game-stat-header" style={{ backgroundColor: game.color }}>
                                        <div className="game-stat-icon-wrapper">
                                            <span className="game-stat-icon">{game.icon}</span>
                                            {hoveredCard === game.id && <ArrowUp className="icon-pulse" size={16} />}
                                        </div>
                                        <div className="game-stat-title-wrapper">
                                            <h3 className="game-stat-title">{game.title}</h3>
                                            <div className="game-stat-badge">STATS</div>
                                        </div>
                                    </div>
                                    <div className="game-stat-content">
                                        <div className="game-stat-item">
                                            <Clock size={16} className="stat-item-icon" />
                                            <span>Total playtime: <strong>{formatPlaytime(game.totalPlayTime || 0)}</strong></span>
                                        </div>
                                        <div className="game-stat-item">
                                            <Calendar size={16} className="stat-item-icon" />
                                            <span>Last played: <strong>{formatDate(game.lastPlayed)}</strong></span>
                                        </div>
                                        <div className="game-stat-item">
                                            <Zap size={16} className="stat-item-icon" />
                                            <span>Sessions: <strong>{game.playTime ? Object.keys(game.playTime).length : 0}</strong></span>
                                        </div>

                                        <div className="game-stat-percentage">
                                            <div className="percentage-label">
                                                {calculatePercentage(game.totalPlayTime || 0, totalPlaytime)}% of total
                                            </div>
                                            <div className="percentage-bar">
                                                <div
                                                    className="percentage-fill"
                                                    style={{
                                                        width: `${calculatePercentage(game.totalPlayTime || 0, totalPlaytime)}%`,
                                                        backgroundColor: game.color
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="empty-stats">
                    <div className="empty-icon">📊</div>
                    <h2>No Stats Available Yet</h2>
                    <p>Play some games to see your statistics here!</p>
                    <button className="empty-action-button">
                        <Gamepad size={18} />
                        <span>Play Games</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default StatsView; 