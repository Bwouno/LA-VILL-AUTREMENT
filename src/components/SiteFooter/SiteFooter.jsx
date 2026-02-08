import { NavLink } from 'react-router-dom';
import styles from './SiteFooter.module.css';

function FacebookIcon(props) {
  return (
    <img
      src="/public/branding/facebook.png"
      alt="FACEBOOK"
    />
  );
}

function InstagramIcon(props) {
  return (
    <img
      src="/public/branding/instagram.png"
      alt="INSTAGRAM"
    />
  );
}

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <img
            className={styles.brandLogo}
            src="/branding/LOGO.png"
            alt="La Vill'Autrement"
          />
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Menu</div>
          <NavLink className={styles.link} to="/">
            Accueil
          </NavLink>
          <NavLink className={styles.link} to="/equipe">
            Équipe
          </NavLink>
          <NavLink className={styles.link} to="/evenements">
            Évènements
          </NavLink>
          <NavLink className={styles.link} to="/contact">
            Contact
          </NavLink>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Contacts</div>
          <a className={styles.link} href="mailto:lavillautrement37@gmail.com">
            lavillautrement37@gmail.com
          </a>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Réseaux sociaux</div>
          <div className={styles.socialRow}>
            <a className={styles.socialLink} href="https://www.facebook.com/profile.php?id=61579131783185&locale=fr_FR" aria-label="Facebook" target="_blank" rel="noreferrer">
              <FacebookIcon />
            </a>
            <a className={styles.socialLink} href="https://www.instagram.com/la.vill.autrement/" aria-label="Instagram" target="_blank" rel="noreferrer">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} La Vill&apos;Autrement. All rights reserved.
      </div>
    </footer>
  );
}
