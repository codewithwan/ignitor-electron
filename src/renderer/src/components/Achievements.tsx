import React, { useState, useEffect } from 'react';
import { Achievement, AchievementProgress } from '../types';

// Mock achievement data for development/testing
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'games_collector_bronze',
    title: 'Game Collector: Bronze',
    description: 'Add 3 games to your collection',
    icon: '🎮',
    requirement: 3,
    type: 'games_added',
    reward: '#FF9B54',
    rewardType: 'background'
  },
  {
    id: 'games_collector_silver',
    title: 'Game Collector: Silver',
    description: 'Add 5 games to your collection',
    icon: '🎮',
    requirement: 5,
    type: 'games_added',
    reward: '#00B2CA',
    rewardType: 'background'
  },
  {
    id: 'casual_gamer',
    title: 'Casual Gamer',
    description: 'Play games for a total of 1 hour',
    icon: '⏱️',
    requirement: 3600, // 1 hour in seconds
    type: 'total_playtime',
    reward: '🏆',
    rewardType: 'icon'
  }
];

// Mock achievement progress for development/testing
const MOCK_PROGRESS: AchievementProgress[] = [
  {
    achievement: MOCK_ACHIEVEMENTS[0],
    progress: 2,
    unlocked: false
  },
  {
    achievement: MOCK_ACHIEVEMENTS[1],
    progress: 0,
    unlocked: false
  },
  {
    achievement: MOCK_ACHIEVEMENTS[2],
    progress: 1500,
    unlocked: false
  }
];

const Achievements: React.FC = () => {
    const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [useMockData, setUseMockData] = useState(false);
    const [showRebuildInstructions, setShowRebuildInstructions] = useState(false);

    useEffect(() => {
        // Fetch achievements on component mount
        const fetchAchievements = async () => {
            setLoading(true);
            try {
                if (window.api && typeof window.api.getAchievementProgress === 'function') {
                    const progress = await window.api.getAchievementProgress();
                    setAchievements(progress);
                    setError(null);
                    setUseMockData(false);
                } else {
                    console.warn('getAchievementProgress API method is not available');
                    setError('Achievement system is not available. Showing demo achievements.');
                    // Set mock achievements for UI development
                    setAchievements(MOCK_PROGRESS);
                    setUseMockData(true);
                }
            } catch (error) {
                console.error('Error fetching achievements:', error);
                setError('Failed to load achievements. Showing demo achievements instead.');
                setAchievements(MOCK_PROGRESS);
                setUseMockData(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();

        // Setup achievement unlocked listener if available
        let unsubscribe: (() => void) | undefined;
        
        if (window.api && typeof window.api.onAchievementUnlocked === 'function') {
            unsubscribe = window.api.onAchievementUnlocked((achievement: Achievement) => {
                setNewAchievement(achievement);
                setShowNotification(true);
                
                // Hide notification after 5 seconds
                setTimeout(() => {
                    setShowNotification(false);
                    setNewAchievement(null);
                }, 5000);
                
                // Refresh achievements list
                fetchAchievements();
            });
        }

        // Cleanup
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Mock the unlocking of an achievement (for demo purposes)
    const unlockMockAchievement = (achievementId: string) => {
        if (!useMockData) return;

        const achievementToUnlock = MOCK_ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievementToUnlock) return;

        setNewAchievement(achievementToUnlock);
        setShowNotification(true);
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            setShowNotification(false);
            setNewAchievement(null);
        }, 5000);

        // Update mock progress
        setAchievements(prev => 
            prev.map(ap => {
                if (ap.achievement.id === achievementId) {
                    return {
                        ...ap,
                        progress: ap.achievement.requirement,
                        unlocked: true
                    };
                }
                return ap;
            })
        );
    };

    // Group achievements by type
    const groupedAchievements = achievements.reduce((groups, achievement) => {
        const type = achievement.achievement.type;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(achievement);
        return groups;
    }, {} as Record<string, AchievementProgress[]>);

    // Format progress for display
    const formatProgress = (progress: AchievementProgress) => {
        const { achievement, progress: currentProgress } = progress;
        
        switch (achievement.type) {
            case 'games_added':
                return `${currentProgress}/${achievement.requirement} games`;
            case 'total_playtime':
                const hours = Math.floor(currentProgress / 3600);
                const minutes = Math.floor((currentProgress % 3600) / 60);
                return `${hours}h ${minutes}m / ${Math.floor(achievement.requirement / 3600)}h`;
            case 'games_played':
                return `${currentProgress}/${achievement.requirement} games`;
            default:
                return `${currentProgress}/${achievement.requirement}`;
        }
    };

    const getTypeTitle = (type: string): string => {
        switch (type) {
            case 'games_added':
                return 'Game Collection';
            case 'total_playtime':
                return 'Gameplay Time';
            case 'games_played':
                return 'Game Explorer';
            default:
                return type.replace('_', ' ');
        }
    };

    // Styles for achievements UI with neo-brutalism aesthetics
    const styles = {
        container: {
            padding: '20px',
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
        categoryTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '30px 0 15px',
            padding: '8px 16px',
            background: '#f3f3f3',
            borderLeft: '6px solid #4ECDC4',
            textTransform: 'uppercase' as const,
        } as React.CSSProperties,
        achievementsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '20px',
            marginTop: '15px',
        } as React.CSSProperties,
        achievementCard: {
            padding: '15px',
            border: '3px solid #000',
            boxShadow: '5px 5px 0px #000',
            backgroundColor: '#fff',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: useMockData ? 'pointer' : 'default',
        } as React.CSSProperties,
        unlockedCard: {
            backgroundColor: '#4ECDC4',
            color: 'white',
        } as React.CSSProperties,
        lockedCard: {
            backgroundColor: '#f3f3f3',
            opacity: 0.7,
        } as React.CSSProperties,
        achievementIcon: {
            fontSize: '36px',
            marginBottom: '10px',
            display: 'block',
        } as React.CSSProperties,
        achievementTitle: {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '5px',
        } as React.CSSProperties,
        achievementDesc: {
            fontSize: '14px',
            marginBottom: '10px',
            minHeight: '40px',
        } as React.CSSProperties,
        progressBar: {
            height: '10px',
            backgroundColor: '#e0e0e0',
            borderRadius: '5px',
            overflow: 'hidden',
            marginTop: '10px',
            border: '2px solid #000',
        } as React.CSSProperties,
        progressFill: {
            height: '100%',
            backgroundColor: '#FF6B6B',
            borderRadius: '3px',
        } as React.CSSProperties,
        notification: {
            position: 'fixed' as const,
            bottom: '20px',
            right: '20px',
            padding: '15px 20px',
            backgroundColor: '#FFE66D',
            border: '3px solid #000',
            boxShadow: '5px 5px 0px #000',
            zIndex: 1000,
            maxWidth: '350px',
        } as React.CSSProperties,
        notificationTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
        } as React.CSSProperties,
        notificationIcon: {
            fontSize: '30px',
            marginRight: '10px',
            display: 'inline-block',
        } as React.CSSProperties,
        reward: {
            display: 'inline-block',
            marginTop: '10px',
            padding: '5px 10px',
            backgroundColor: '#FFE66D',
            border: '2px solid #000',
            fontWeight: 'bold',
            fontSize: '14px',
        } as React.CSSProperties,
        progressText: {
            fontSize: '14px',
            marginTop: '5px',
            textAlign: 'right' as const,
        } as React.CSSProperties,
        emptyState: {
            padding: '30px',
            textAlign: 'center' as const,
            border: '3px dashed #000',
            marginTop: '40px',
        } as React.CSSProperties,
        errorMessage: {
            padding: '15px',
            backgroundColor: '#f8f8f8',
            color: '#666',
            border: '2px solid #ddd',
            borderRadius: '5px',
            margin: '10px 0 20px',
            fontSize: '14px',
        } as React.CSSProperties,
        loadingState: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column' as const,
            padding: '50px 0',
        } as React.CSSProperties,
        demoModeNotice: {
            padding: '10px 15px',
            backgroundColor: '#f9f9f9',
            border: '2px solid #ddd',
            borderRadius: '5px',
            marginTop: '10px',
            fontSize: '14px',
            color: '#666',
        } as React.CSSProperties,
        rebuildButton: {
            backgroundColor: '#4ECDC4',
            border: '2px solid #000',
            padding: '5px 10px',
            marginTop: '10px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 'bold',
        } as React.CSSProperties,
        rebuildInstructions: {
            backgroundColor: '#f8f8f8',
            border: '2px solid #ddd',
            padding: '15px',
            marginTop: '15px',
            borderRadius: '5px',
            fontSize: '14px',
            lineHeight: '1.5',
        } as React.CSSProperties,
        codeBlock: {
            backgroundColor: '#333',
            color: '#fff',
            padding: '10px',
            borderRadius: '3px',
            fontFamily: 'monospace',
            marginTop: '10px',
            marginBottom: '10px',
            whiteSpace: 'pre-wrap',
            fontSize: '12px',
            overflowX: 'auto',
        } as React.CSSProperties,
        stepTitle: {
            fontWeight: 'bold',
            marginTop: '10px',
            marginBottom: '5px',
        } as React.CSSProperties,
    };

    return (
        <div className="achievements fade-in">
            <div className="page-header team-header">
                <div>
                    <h1 className="page-title">Achievements</h1>
                    <p className="team-subtitle">Track your progress and earn rewards as you play games</p>
                </div>
            </div>

            {/* Demo mode notice */}
            {useMockData && (
                <div style={styles.demoModeNotice}>
                    <p><strong>Demo Mode:</strong> The achievement system API is not available. Showing sample achievements for demonstration.</p>
                    {error && <p style={{marginTop: '5px'}}><strong>Reason:</strong> {error}</p>}
                    <p style={{marginTop: '5px'}}><em>Click on locked achievements to simulate unlocking them.</em></p>
                    <button 
                        style={styles.rebuildButton}
                        onClick={() => setShowRebuildInstructions(!showRebuildInstructions)}
                    >
                        {showRebuildInstructions ? 'Hide Rebuild Instructions' : 'Show Rebuild Instructions'}
                    </button>
                    
                    {showRebuildInstructions && (
                        <div style={styles.rebuildInstructions}>
                            <h3>How to Fix the Achievement System</h3>
                            <p>The achievement system requires a complete rebuild of the application. Follow these steps:</p>
                            
                            <div style={styles.stepTitle}>1. Stop the application and navigate to the project folder</div>
                            <div style={styles.codeBlock}>cd path/to/test-game-launcher</div>
                            
                            <div style={styles.stepTitle}>2. Clean the build artifacts</div>
                            <div style={styles.codeBlock}>npm run clean</div>
                            
                            <div style={styles.stepTitle}>3. Install all dependencies</div>
                            <div style={styles.codeBlock}>npm install</div>
                            
                            <div style={styles.stepTitle}>4. Rebuild the application</div>
                            <div style={styles.codeBlock}>npm run build</div>
                            
                            <div style={styles.stepTitle}>5. Start the application</div>
                            <div style={styles.codeBlock}>npm start</div>
                            
                            <p style={{marginTop: '15px'}}>If the issue persists, you may need to:</p>
                            <ul style={{marginLeft: '20px', marginTop: '5px'}}>
                                <li>Check that all source files are properly saved</li>
                                <li>Verify that the API methods are correctly defined in preload.ts</li>
                                <li>Confirm that the main process IPC handlers are properly registered</li>
                                <li>Restart your development environment</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Show notification for newly unlocked achievement */}
            {showNotification && newAchievement && (
                <div style={styles.notification}>
                    <div style={styles.notificationTitle}>
                        <span style={styles.notificationIcon}>{newAchievement.icon}</span>
                        Achievement Unlocked!
                    </div>
                    <div><strong>{newAchievement.title}</strong></div>
                    <div>{newAchievement.description}</div>
                    {newAchievement.reward && (
                        <div style={styles.reward}>
                            Reward: {newAchievement.rewardType === 'icon' ? 'New Game Icon' : 'New Background Color'}
                        </div>
                    )}
                </div>
            )}

            {/* Show loading state */}
            {loading && (
                <div style={styles.loadingState}>
                    <div style={{ fontSize: '40px', marginBottom: '20px' }}>🏆</div>
                    <p>Loading achievements...</p>
                </div>
            )}

            {/* Show achievements grid if available */}
            {!loading && Object.keys(groupedAchievements).length > 0 && (
                Object.entries(groupedAchievements).map(([type, achievementsList]) => (
                    <div key={type}>
                        <h2 style={styles.categoryTitle}>{getTypeTitle(type)}</h2>
                        <div style={styles.achievementsGrid}>
                            {achievementsList.map((achievement) => {
                                const { unlocked } = achievement;
                                const progress = Math.min(
                                    100,
                                    Math.round(
                                        (achievement.progress / achievement.achievement.requirement) * 100
                                    )
                                );
                                
                                return (
                                    <div 
                                        key={achievement.achievement.id}
                                        style={{
                                            ...styles.achievementCard,
                                            ...(unlocked ? styles.unlockedCard : styles.lockedCard),
                                        }}
                                        onClick={() => {
                                            if (useMockData && !unlocked) {
                                                unlockMockAchievement(achievement.achievement.id);
                                            }
                                        }}
                                    >
                                        <span style={styles.achievementIcon}>
                                            {achievement.achievement.icon}
                                        </span>
                                        <h3 style={styles.achievementTitle}>
                                            {achievement.achievement.title}
                                        </h3>
                                        <p style={styles.achievementDesc}>
                                            {achievement.achievement.description}
                                        </p>
                                        
                                        {unlocked && achievement.achievement.reward && (
                                            <div style={styles.reward}>
                                                Reward: {achievement.achievement.rewardType === 'icon' 
                                                    ? `New Icon ${achievement.achievement.reward}` 
                                                    : 'New Color'}
                                            </div>
                                        )}
                                        
                                        <div style={styles.progressBar}>
                                            <div 
                                                style={{
                                                    ...styles.progressFill,
                                                    width: `${progress}%`,
                                                }}
                                            />
                                        </div>
                                        <p style={styles.progressText}>{formatProgress(achievement)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}

            {/* Show empty state if needed */}
            {!loading && Object.keys(groupedAchievements).length === 0 && (
                <div style={styles.emptyState}>
                    <h3>No achievements yet!</h3>
                    <p>Import and play games to earn achievements.</p>
                </div>
            )}
        </div>
    );
};

export default Achievements; 