import { NavLink } from 'react-router-dom';

const mainMenu = [
  { label: 'Dashboard', path: '/', icon: '📊' },
];

const analysisMenu = [
  { label: 'Energy Forecast', path: '/forecast', icon: '⚡' },
  { label: 'Bill Calculator', path: '/billing', icon: '💰' },
  { label: 'Alert', path: '/alert', icon: '🔔' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">Ener<span className="logo-highlight">lytix</span></span>
      </div>

      <nav className="sidebar-nav">
        {mainMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label">ANALYSIS</div>

        {analysisMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
