import React from 'react'
import { Coffee, Pizza, Gamepad2 } from 'lucide-react'
import BedRest from '../assets/teams/bedrest.png'
import Kartika from '../assets/teams/kartika.png'
import Dea from '../assets/teams/dea.png'

interface Developer {
    id: number
    name: string
    nim: string
    role: string
    description: string
    funnyNote: string
    icon: React.ReactNode
    color: string
    imgUrl?: string
}

// Helper function to get initials from a name
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
};

const developers: Developer[] = [
    {
        id: 1,
        name: 'Muhammad Ridwan',
        nim: '3.34.23.3.15',
        role: 'Chill Developer',
        description: 'Aslinya wengdev garis keras',
        funnyNote: 'when yh jago..',
        icon: <Coffee size={30} />,
        color: '#FF6B6B',
        imgUrl: BedRest
    },
    {
        id: 2,
        name: 'M. Syahrul Romadhon',
        nim: '3.34.23.3.12',
        role: 'Developer',
        description: 'Penikmat Sepak Bola 🤤',
        funnyNote: 'Jika mencari jarum dalam jerami bakar jeraminya',
        icon: <Gamepad2 size={30} />,
        color: '#4ECDC4',
        imgUrl: ''
    },
    {
        id: 3,
        name: 'Dea Derika Winahyu',
        nim: '3.34.23.3.06',
        role: 'Apa aja di kerjain',
        description: 'Ngerjain apa yang bisa dikerjain',
        funnyNote: '2in',
        icon: <Pizza size={30} />,
        color: '#3B82F6',
        imgUrl: Dea
    },
    {
        id: 4,
        name: 'KARTIKA YULIANA',
        nim: '3.34.23.3.11',
        role: 'Apa aja di kerjain',
        description: 'Katanya si ngikut aja',
        funnyNote: 'jujur gatau aku',
        icon: <Gamepad2 size={30} />,
        color: '#845EC2',
        imgUrl: Kartika
    }
]

function DeveloperTeam(): React.JSX.Element {
    return (
        <div className="developer-team fade-in">
            <div className="page-header team-header">
                <div>
                    <h1 className="page-title">Meet Our Developers</h1>
                    <p className="team-subtitle">The development team behind this educational game launcher application</p>
                </div>
            </div>

            <div className="developer-list" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '2rem'
            }}>
                {developers.map(developer => (
                    <div
                        key={developer.id}
                        className="developer-list-item"
                        style={{
                            borderColor: developer.color,
                            boxShadow: `8px 8px 0px #000000`
                        }}
                    >
                        <div
                            className="developer-photo-container"
                            style={{ backgroundColor: developer.color }}
                        >
                            {developer.imgUrl ? (
                                <img
                                    src={developer.imgUrl}
                                    alt={developer.name}
                                    className="developer-photo"
                                />
                            ) : (
                                <div className="developer-initials">
                                    {getInitials(developer.name)}
                                </div>
                            )}
                            <div className="developer-icon-badge">
                                {developer.icon}
                            </div>
                        </div>

                        <div className="developer-content">
                            <div className="developer-header">
                                <h3 className="developer-name">{developer.name}</h3>
                                <div className="developer-nim">{developer.nim}</div>
                            </div>

                            <div className="developer-role-badge" style={{ backgroundColor: developer.color }}>
                                {developer.role}
                            </div>

                            <p className="developer-description">{developer.description}</p>

                            <div className="developer-funny-note">
                                <span className="quote">"</span>
                                {developer.funnyNote}
                                <span className="quote">"</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DeveloperTeam