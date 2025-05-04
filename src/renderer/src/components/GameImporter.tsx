import React, { useState, useEffect } from 'react';
import { Game, ImportResult, StyleUpdateResult } from '../types';

// Neo-brutalism themed colors for game backgrounds
const NEO_BRUTALISM_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFD166', // Yellow
    '#845EC2', // Purple
    '#00C9A7', // Mint
    '#F9F871', // Light Yellow
    '#FFA69E', // Coral
    '#6A0572', // Dark Purple
    '#1D4E89', // Navy Blue
    '#F57600', // Orange
    '#22577A', // Dark Teal
    '#FF5400', // Bright Orange
];

// Game icons (emojis for simplicity)
const GAME_ICONS = [
    '🎮', '🕹️', '🎯', '🎲', '🎪', '🎨',
    '🚀', '🤖', '👾', '🦸‍♂️', '🧩', '🎭',
    '🏆', '⚔️', '🛡️', '🧠', '📚', '🔢',
    '🌍', '🚗', '✈️', '🚢', '🚂', '⚽',
    '🏀', '🏈', '⚾', '🎾', '🎱', '⚽'
];

// Styling for the Game Importer UI
const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
    } as React.CSSProperties,
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    } as React.CSSProperties,
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase' as const,
        background: '#FFE66D',
        padding: '8px 16px',
        border: '3px solid #000',
        boxShadow: '4px 4px 0px #000',
        transform: 'rotate(-1deg)'
    } as React.CSSProperties,
    importButton: {
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: '#FF6B6B',
        color: 'white',
        border: '3px solid #000',
        boxShadow: '4px 4px 0px #000',
        cursor: 'pointer',
        textTransform: 'uppercase' as const,
        transition: 'transform 0.2s, box-shadow 0.2s',
    } as React.CSSProperties,
    gameList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '20px',
        marginTop: '30px',
    } as React.CSSProperties,
    gameCard: {
        padding: '0',
        border: '3px solid #000',
        boxShadow: '5px 5px 0px #000',
        backgroundColor: '#fff',
        position: 'relative' as const,
        overflow: 'hidden',
        transform: 'rotate(-1deg)',
        transition: 'transform 0.2s, box-shadow 0.2s',
    } as React.CSSProperties,
    gameIcon: {
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        backgroundColor: '#4ECDC4',
        color: '#000',
        borderBottom: '3px solid #000',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative' as const,
    } as React.CSSProperties,
    customizeIconButton: {
        position: 'absolute' as const,
        bottom: '5px',
        right: '5px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: '2px solid white',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '10px',
        cursor: 'pointer',
    } as React.CSSProperties,
    gameInfo: {
        padding: '15px',
    } as React.CSSProperties,
    gameName: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '5px',
        textTransform: 'uppercase' as const,
    } as React.CSSProperties,
    gameDate: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '15px',
    } as React.CSSProperties,
    deleteButton: {
        padding: '8px 16px',
        fontSize: '14px',
        backgroundColor: '#F7F9FC',
        color: '#FF6B6B',
        border: '2px solid #000',
        boxShadow: '3px 3px 0px #000',
        cursor: 'pointer',
        width: 'calc(100% - 30px)',
        marginBottom: '15px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    customizeButton: {
        padding: '8px 16px',
        fontSize: '14px',
        backgroundColor: '#4ECDC4',
        color: 'white',
        border: '2px solid #000',
        boxShadow: '3px 3px 0px #000',
        cursor: 'pointer',
        width: 'calc(100% - 30px)',
        marginBottom: '15px',
        fontWeight: 'bold',
    } as React.CSSProperties,
    noGames: {
        padding: '30px',
        textAlign: 'center' as const,
        border: '3px dashed #000',
        marginTop: '40px',
        backgroundColor: '#F7F9FC',
    } as React.CSSProperties,
    emptyIcon: {
        fontSize: '60px',
        marginBottom: '20px',
        color: '#4ECDC4',
    } as React.CSSProperties,
    notification: {
        margin: '20px 0',
        padding: '15px',
        backgroundColor: '#FFE66D',
        border: '3px solid #000',
        boxShadow: '4px 4px 0px #000',
        transform: 'rotate(1deg)',
        fontWeight: 'bold',
    } as React.CSSProperties,
    errorNotification: {
        backgroundColor: '#FF6B6B',
        color: 'white',
    } as React.CSSProperties,
    customizeOptions: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
    } as React.CSSProperties,
    customizeOption: {
        flex: '1',
        margin: '0 5px',
        padding: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '2px solid #000',
        boxShadow: '2px 2px 0px #000',
        cursor: 'pointer',
        textAlign: 'center' as const,
    } as React.CSSProperties,
    viewGamesButton: {
        marginTop: '20px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: '#4ECDC4',
        color: 'white',
        border: '3px solid #000',
        boxShadow: '4px 4px 0px #000',
        cursor: 'pointer',
        display: 'inline-block'
    } as React.CSSProperties,
    styleSection: {
        marginTop: '15px',
        border: '2px solid #000',
        padding: '15px',
        backgroundColor: '#f8f8f8',
    } as React.CSSProperties,
    styleHeader: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textTransform: 'uppercase' as const,
    } as React.CSSProperties,
    colorGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        marginBottom: '15px',
    } as React.CSSProperties,
    colorOption: {
        width: '30px',
        height: '30px',
        border: '2px solid #000',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    } as React.CSSProperties,
    iconGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
    } as React.CSSProperties,
    iconOption: {
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        backgroundColor: '#fff',
        border: '2px solid #000',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    } as React.CSSProperties,
    selectedOption: {
        transform: 'scale(1.1)',
        boxShadow: '3px 3px 0 #000',
    } as React.CSSProperties,
};

interface GameImporterProps {
    onNavigateToHome?: () => void;
}

const GameImporter: React.FC<GameImporterProps> = ({ onNavigateToHome }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | null;
    }>({ message: '', type: null });
    const [loading, setLoading] = useState<boolean>(false);
    const [recentlyImported, setRecentlyImported] = useState<boolean>(false);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [styleEditMode, setStyleEditMode] = useState<'background' | 'icon' | null>(null);

    // Load games when component mounts
    useEffect(() => {
        const fetchGames = async () => {
            try {
                if (window.api) {
                    const importedGames = await window.api.getGames();
                    setGames(importedGames || []);
                }
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };

        fetchGames();
    }, []);

    // Show notification
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: null });
        }, 5000);
    };

    // Handle import game
    const handleImportGame = async () => {
        setLoading(true);
        try {
            const result: ImportResult = await window.api.importGame();
            if (result.success) {
                showNotification(result.message, 'success');
                setRecentlyImported(true);
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error importing game:', error);
            showNotification('Error importing game', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle navigation to home screen
    const handleNavigateToHome = () => {
        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    // Handle delete game
    const handleDeleteGame = async (gameId: string, gameName: string) => {
        if (confirm(`Are you sure you want to delete ${gameName}?`)) {
            try {
                const result = await window.api.deleteGame(gameId);
                if (result.success) {
                    showNotification(result.message, 'success');
                } else {
                    showNotification(result.message, 'error');
                }
            } catch (error) {
                console.error('Error deleting game:', error);
                showNotification('Error deleting game', 'error');
            }
        }
    };

    // Handle setting the game style (icon or background)
    const handleSetGameStyle = async (gameId: string, type: 'icon' | 'background', value: string) => {
        try {
            let result: StyleUpdateResult | null = null;
            
            // Try to use setGameStyle API function if available
            if (window.api && typeof window.api.setGameStyle === 'function') {
                result = await window.api.setGameStyle(gameId, type, value);
            } else {
                // Fall back to updateGameSettings if setGameStyle is not available
                if (window.api && typeof window.api.updateGameSettings === 'function') {
                    const settings = type === 'icon' ? { icon: value } : { background: value };
                    result = await window.api.updateGameSettings(gameId, settings);
                }
            }
            
            if (result && result.success) {
                showNotification(`Successfully updated game ${type}`, 'success');
                // Refresh games list
                if (window.api) {
                    const updatedGames = await window.api.getGames();
                    setGames(updatedGames || []);
                }
            } else {
                showNotification(`Failed to update game ${type}`, 'error');
            }
        } catch (error) {
            console.error(`Error setting game ${type}:`, error);
            
            // Try alternative method as fallback
            try {
                if (window.api && typeof window.api.updateGameSettings === 'function') {
                    const settings = type === 'icon' ? { icon: value } : { background: value };
                    const result = await window.api.updateGameSettings(gameId, settings);
                    
                    if (result && result.success) {
                        showNotification(`Successfully updated game ${type}`, 'success');
                        // Refresh games list
                        const updatedGames = await window.api.getGames();
                        setGames(updatedGames || []);
                    } else {
                        showNotification(`Failed to update game ${type}`, 'error');
                    }
                }
            } catch (fallbackError) {
                console.error(`Error in fallback method for setting game ${type}:`, fallbackError);
                showNotification(`Failed to update game ${type}`, 'error');
            }
        }
    };

    // Handle opening the style editor
    const openStyleEditor = (gameId: string, type: 'background' | 'icon') => {
        setSelectedGame(gameId);
        setStyleEditMode(type);
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Game Library</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {onNavigateToHome && (
                        <button
                            style={{
                                ...styles.viewGamesButton,
                                backgroundColor: '#6A5ACD'
                            }}
                            onClick={handleNavigateToHome}
                        >
                            Back to Home
                        </button>
                    )}
                    <button
                        style={styles.importButton}
                        onClick={handleImportGame}
                        disabled={loading}
                    >
                        {loading ? 'Importing...' : 'Import Game'}
                    </button>
                </div>
            </div>

            {notification.message && (
                <div style={{
                    ...styles.notification,
                    ...(notification.type === 'error' ? styles.errorNotification : {})
                }}>
                    {notification.message}
                    {notification.type === 'success' && onNavigateToHome && (
                        <button
                            style={{
                                ...styles.viewGamesButton,
                                marginLeft: '10px'
                            }}
                            onClick={handleNavigateToHome}
                        >
                            View Games
                        </button>
                    )}
                </div>
            )}

            {styleEditMode && selectedGame && (
                <div style={styles.styleSection}>
                    <h3 style={styles.styleHeader}>
                        {styleEditMode === 'background' ? 'Select Background Color' : 'Select Game Icon'}
                    </h3>

                    {styleEditMode === 'background' ? (
                        <div style={styles.colorGrid}>
                            {NEO_BRUTALISM_COLORS.map((color) => (
                                <div
                                    key={color}
                                    style={{
                                        ...styles.colorOption,
                                        backgroundColor: color,
                                    }}
                                    onClick={() => handleSetGameStyle(selectedGame, 'background', color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={styles.iconGrid}>
                            {GAME_ICONS.map((icon) => (
                                <div
                                    key={icon}
                                    style={styles.iconOption}
                                    onClick={() => handleSetGameStyle(selectedGame, 'icon', icon)}
                                    title={`Game icon: ${icon}`}
                                >
                                    {icon}
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        style={{
                            ...styles.customizeButton,
                            marginTop: '15px'
                        }}
                        onClick={() => setStyleEditMode(null)}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {games.length > 0 ? (
                <div style={styles.gameList}>
                    {games.map((game) => (
                        <div key={game.id} style={styles.gameCard}>
                            <div
                                style={{
                                    ...styles.gameIcon,
                                    backgroundColor: game.background || '#4ECDC4',
                                }}
                            >
                                <span style={{ fontSize: '40px' }}>{game.icon || '🎮'}</span>
                            </div>
                            <div style={styles.gameInfo}>
                                <h3 style={styles.gameName}>{game.name}</h3>
                                <p style={styles.gameDate}>Imported: {formatDate(game.importDate)}</p>

                                <div style={styles.customizeOptions}>
                                    <button
                                        style={{
                                            ...styles.customizeOption,
                                            backgroundColor: '#4ECDC4',
                                            color: 'white'
                                        }}
                                        onClick={() => openStyleEditor(game.id, 'background')}
                                    >
                                        Change Color
                                    </button>
                                    <button
                                        style={{
                                            ...styles.customizeOption,
                                            backgroundColor: '#FFD166'
                                        }}
                                        onClick={() => openStyleEditor(game.id, 'icon')}
                                    >
                                        Change Icon
                                    </button>
                                </div>

                                <button
                                    style={styles.deleteButton}
                                    onClick={() => handleDeleteGame(game.id, game.name)}
                                >
                                    Delete Game
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.noGames}>
                    <div style={styles.emptyIcon}>🎮</div>
                    <h3>No Games Yet</h3>
                    <p>Import your first game by clicking the Import Game button above.</p>
                    <p style={{ fontSize: '13px', marginTop: '15px', color: '#666' }}>
                        You can import HTML5 games packaged as ZIP files. The game should have an index.html file in the root directory.
                    </p>
                </div>
            )}

            {recentlyImported && games.length > 0 && onNavigateToHome && (
                <div style={{ marginTop: '30px', textAlign: 'center' as const }}>
                    <button
                        style={{
                            ...styles.viewGamesButton,
                            padding: '15px 30px'
                        }}
                        onClick={handleNavigateToHome}
                    >
                        Go to Home to View Your Games
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameImporter; 