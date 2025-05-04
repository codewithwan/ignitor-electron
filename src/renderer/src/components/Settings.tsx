import { Volume2, VolumeX, Music } from 'lucide-react'

interface SettingsProps {
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
}

function Settings({
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume
}: SettingsProps): React.JSX.Element {
    return (
        <div className="settings-page fade-in">
            <div className="page-header settings-header">
                <div>
                    <h1 className="page-title">Sound Settings</h1>
                    <p className="settings-subtitle">Control the music in your gaming experience</p>
                </div>
            </div>

            <div className="settings-container">
                <div className="settings-sections">
                    {/* Sound Settings */}
                    <div className="settings-section">
                        <div className="setting-item">
                            <div className="setting-label">
                                <span className="setting-icon">
                                    {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                                </span>
                                <span>Background Music</span>
                            </div>
                            <div className="setting-control">
                                <label className="switch-container">
                                    <input
                                        className="switch-checkbox"
                                        type="checkbox"
                                        checked={soundEnabled}
                                        onChange={() => setSoundEnabled(!soundEnabled)}
                                    />
                                    <div className={`switch-slider ${soundEnabled ? 'on' : 'off'}`}>
                                        <div className="switch-button"></div>
                                        <span className="switch-text on-text">ON</span>
                                        <span className="switch-text off-text">OFF</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="setting-item">
                            <div className="setting-label">
                                <span>Volume</span>
                            </div>
                            <div className="setting-control volume-control">
                                <input
                                    className="neo-range"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    disabled={!soundEnabled}
                                />
                                <span className="volume-badge">{Math.round(volume * 100)}%</span>
                            </div>
                        </div>

                        <div className="settings-note">
                            <p>Music will play automatically when you navigate through the app. You can toggle it on/off anytime.</p>
                        </div>
                    </div>
                </div>

                <div className="settings-illustration">
                    <div className="music-icon-container">
                        <Music size={80} className={soundEnabled ? "music-icon pulse" : "music-icon"} />
                        <div className={soundEnabled ? "music-wave wave-1" : "music-wave wave-1 disabled"}></div>
                        <div className={soundEnabled ? "music-wave wave-2" : "music-wave wave-2 disabled"}></div>
                        <div className={soundEnabled ? "music-wave wave-3" : "music-wave wave-3 disabled"}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings 