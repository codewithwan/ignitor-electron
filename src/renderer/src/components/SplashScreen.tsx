import { useEffect, useState } from 'react'

interface SplashScreenProps {
    duration?: number
    onFinish: () => void
}

const SplashScreen = ({ duration = 3000, onFinish }: SplashScreenProps): React.JSX.Element => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Show the splash screen
        const fadeInTimeout = setTimeout(() => {
            const splashElement = document.querySelector('.splash-screen')
            if (splashElement) {
                splashElement.classList.add('fade-in')
            }
        }, 100)

        // Hide the splash screen after duration
        const fadeOutTimeout = setTimeout(() => {
            const splashElement = document.querySelector('.splash-screen')
            if (splashElement) {
                splashElement.classList.remove('fade-in')
                splashElement.classList.add('fade-out')
            }

            // Wait for animation to complete
            setTimeout(() => {
                setIsVisible(false)
                onFinish()
            }, 800)
        }, duration)

        return () => {
            clearTimeout(fadeInTimeout)
            clearTimeout(fadeOutTimeout)
        }
    }, [duration, onFinish])

    if (!isVisible) return <></>

    return (
        <div className="splash-screen">
            {/* Decorative Elements */}
            <div className="splash-decoration splash-dot-1"></div>
            <div className="splash-decoration splash-dot-2"></div>
            <div className="splash-decoration splash-dot-3"></div>
            <div className="splash-decoration splash-dot-4"></div>

            <div className="splash-content">
                <div className="team-logo">
                    <div className="logo-placeholder">IG</div>
                </div>
                <h1 className="team-name">IGNITOR</h1>
                <p className="team-slogan">Game Edukatif Untuk Anak-Anak</p>
            </div>
        </div>
    )
}

export default SplashScreen 