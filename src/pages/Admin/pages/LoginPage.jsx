import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminLogin } from '../../../lib/api.js';

import styles from './LoginPage.module.css';

export default function LoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin/articles';

  const [status, setStatus] = useState({ state: 'idle', message: '' });

  async function onSubmit(event) {
    event.preventDefault();
    setStatus({ state: 'loading', message: '' });

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') || '');
    const password = String(formData.get('password') || '');

    try {
      const result = await adminLogin({ username, password });
      onLoggedIn(result.user);
      navigate(from, { replace: true });
    } catch (error) {
      setStatus({ state: 'error', message: error?.message || 'Connexion impossible.' });
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.title}>Connexion</div>
        <div className={styles.subtitle}>Accès réservé (admin / éditeur).</div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label}>
            Identifiant
            <input className={styles.input} name="username" autoComplete="username" required />
          </label>
          <label className={styles.label}>
            Mot de passe
            <input
              className={styles.input}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          <button className={styles.button} type="submit" disabled={status.state === 'loading'}>
            Se connecter
          </button>

          {status.state === 'error' && <div className={styles.error}>{status.message}</div>}
        </form>

        <div className={styles.hint}>
          Si aucun compte n&apos;est configuré, créez le premier admin via{' '}
          <code>npm run create-user -- --username admin --password "motdepassefort" --role admin</code>.
        </div>
      </div>
    </div>
  );
}
