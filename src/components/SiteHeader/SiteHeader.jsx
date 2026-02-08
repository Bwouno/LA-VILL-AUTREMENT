import { NavLink } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import styles from './SiteHeader.module.css';

const navItems = [
  { to: '/', label: 'Accueil' },
  { to: '/equipe', label: 'Équipe' },
  { to: '/evenements', label: 'Évènements' },
  { to: '/contact', label: 'Contact' }
];

export default function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(
    () =>
      navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
          }
        >
          {item.label}
        </NavLink>
      )),
    []
  );

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.brand} aria-label="Aller à l'accueil">
          <img
            className={styles.brandLogo}
            src="/branding/LOGO.png"
            alt="La Vill'Autrement"
          />
        </NavLink>

        <nav className={styles.nav} aria-label="Navigation principale">
          {navLinks}
        </nav>

        <button
          type="button"
          className={styles.mobileToggle}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="srOnly">Menu</span>
          <span className={styles.mobileBars} aria-hidden="true" />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ''}`}
      >
        <div className={`container ${styles.mobilePanelInner}`}>{navLinks}</div>
      </div>
    </header>
  );
}

