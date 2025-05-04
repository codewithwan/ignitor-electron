import { useEffect, useRef, useState } from 'react'
import backgroundMusic from '../assets/sounds/backsound.mp3'

interface AudioManagerProps {
    soundEnabled: boolean;
    volume: number;
}

function AudioManager({
    soundEnabled,
    volume
}: AudioManagerProps): React.JSX.Element {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioInitialized, setAudioInitialized] = useState(false);

    // Initialize audio element on mount
    useEffect(() => {
        // Create the audio element if it doesn't exist
        if (!audioRef.current) {
            audioRef.current = new Audio(backgroundMusic);
            audioRef.current.loop = true;
        }

        // Set volume
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }

        // Clean up on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current = null;
            }
        };
    }, []);

    // Handle changes to sound enabled/disabled
    useEffect(() => {
        if (!audioRef.current) return;

        if (soundEnabled) {
            // Use a promise to handle autoplay restrictions
            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Autoplay was prevented
                    console.error('Audio playback failed:', error);
                    setAudioInitialized(false);
                }).then(() => {
                    setAudioInitialized(true);
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [soundEnabled]);

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Add listener for user interaction to enable audio
    useEffect(() => {
        const handleUserInteraction = () => {
            if (audioRef.current && soundEnabled && !audioInitialized) {
                const playPromise = audioRef.current.play();

                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        setAudioInitialized(true);
                        // Remove event listeners once audio is playing
                        document.removeEventListener('click', handleUserInteraction);
                        document.removeEventListener('keydown', handleUserInteraction);
                    }).catch(error => {
                        console.error('Audio playback still failed after user interaction:', error);
                    });
                }
            }
        };

        // Add event listeners for user interaction
        if (soundEnabled && !audioInitialized) {
            document.addEventListener('click', handleUserInteraction);
            document.addEventListener('keydown', handleUserInteraction);
        }

        // Clean up event listeners
        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, [soundEnabled, audioInitialized]);

    // This component doesn't render anything visible
    return <></>;
}

export default AudioManager; 