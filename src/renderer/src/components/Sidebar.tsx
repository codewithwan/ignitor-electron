import { useState } from 'react'
import {
    Home, Library, ChevronLeft, ChevronRight,
    ShoppingBag, BarChart2, Upload, Users, Award, Terminal, Settings
} from 'lucide-react'

interface SidebarProps {
    onNavigate: (page: string) => void
    activePage: string
}

function Sidebar({
    onNavigate,
    activePage
}: SidebarProps): React.JSX.Element {

    const [collapsed, setCollapsed] = useState(false)

    const handleCollapse = (): void => {
        setCollapsed(!collapsed)
    }

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="launcher-logo">
                    <div className="logo-icon">IG</div>
                    <span className="logo-text">IGNITOR</span>
                </div>
                <button
                    className="collapse-btn"
                    onClick={handleCollapse}
                    aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <div className="sidebar-menu">
                <button
                    className={`menu-item ${activePage === 'home' ? 'active' : ''}`}
                    onClick={() => onNavigate('home')}
                >
                    <span className="menu-icon"><Home size={20} /></span>
                    <span className="menu-text">Home</span>
                </button>

                <button
                    className={`menu-item ${activePage === 'library' ? 'active' : ''}`}
                    onClick={() => onNavigate('library')}
                >
                    <span className="menu-icon"><Library size={20} /></span>
                    <span className="menu-text">Library</span>
                </button>

                <button
                    className={`menu-item ${activePage === 'achievements' ? 'active' : ''}`}
                    onClick={() => onNavigate('achievements')}
                >
                    <span className="menu-icon"><Award size={20} /></span>
                    <span className="menu-text">Achievements</span>
                </button>

                <button
                    className={`menu-item ${activePage === 'stats' ? 'active' : ''}`}
                    onClick={() => onNavigate('stats')}
                >
                    <span className="menu-icon"><BarChart2 size={20} /></span>
                    <span className="menu-text">Stats</span>
                </button>

                <button
                    className={`menu-item ${activePage === 'store' ? 'active' : ''}`}
                    onClick={() => onNavigate('store')}
                >
                    <span className="menu-icon"><ShoppingBag size={20} /></span>
                    <span className="menu-text">Store</span>
                </button>

                <button
                    className={`menu-item ${activePage === 'developers' ? 'active' : ''}`}
                    onClick={() => onNavigate('developers')}
                >
                    <span className="menu-icon"><Users size={20} /></span>
                    <span className="menu-text">Developers</span>
                </button>

                <button
                    className={`menu-item ${activePage === 'settings' ? 'active' : ''}`}
                    onClick={() => onNavigate('settings')}
                >
                    <span className="menu-icon"><Settings size={20} /></span>
                    <span className="menu-text">Settings</span>
                </button>

                <button
                    className={`menu-item ${activePage === 'import' ? 'active' : ''}`}
                    onClick={() => onNavigate('import')}
                >
                    <span className="menu-icon"><Upload size={20} /></span>
                    <span className="menu-text">Import Game</span>
                </button>

                <button
                    className={`menu-item ${activePage === 'devtools' ? 'active' : ''}`}
                    onClick={() => onNavigate('devtools')}
                >
                    <span className="menu-icon"><Terminal size={20} /></span>
                    <span className="menu-text">Dev Tools</span>
                </button>


            </div>

            {/* <div className="sidebar-footer">
        <div className="app-info">
            <p>PERKUMPULAN GEMING 1</p>
        </div>
      </div> */}
        </div>
    )
}

export default Sidebar 