import { useEffect, useState } from 'react';
import { adminCreateUser, adminDeleteUser, adminListUsers } from '../../../lib/api.js';

import styles from './UsersPage.module.css';

export default function UsersPage() {
  const [state, setState] = useState({ status: 'loading', users: [], error: null });
  const [form, setForm] = useState({ username: '', password: '', role: 'editor' });
  const [message, setMessage] = useState(null);

  async function refresh() {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const users = await adminListUsers();
      setState({ status: 'ready', users, error: null });
    } catch (error) {
      setState({ status: 'error', users: [], error });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(event) {
    event.preventDefault();
    setMessage(null);
    try {
      await adminCreateUser(form);
      setForm({ username: '', password: '', role: 'editor' });
      setMessage({ type: 'ok', text: 'Utilisateur créé.' });
      await refresh();
    } catch (error) {
      setMessage({ type: 'err', text: error?.message || 'Impossible de créer l’utilisateur.' });
    }
  }

  async function onDelete(id) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await adminDeleteUser(id);
    await refresh();
  }

  function onChange(field) {
    return (event) => setForm((f) => ({ ...f, [field]: event.target.value }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Utilisateurs</div>
          <div className={styles.subtitle}>Créer des accès (admin / éditeur).</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Créer un utilisateur</div>
        <form className={styles.form} onSubmit={onCreate}>
          <label className={styles.label}>
            Identifiant
            <input className={styles.input} value={form.username} onChange={onChange('username')} required />
          </label>
          <label className={styles.label}>
            Mot de passe (8+)
            <input className={styles.input} value={form.password} onChange={onChange('password')} type="password" required />
          </label>
          <label className={styles.label}>
            Rôle
            <select className={styles.input} value={form.role} onChange={onChange('role')}>
              <option value="editor">Éditeur</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className={styles.button} type="submit">
            Créer
          </button>
        </form>
        {message && (
          <div className={`${styles.msg} ${message.type === 'ok' ? styles.ok : styles.err}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Liste</div>
        {state.status === 'loading' && <div className={styles.info}>Chargement…</div>}
        {state.status === 'error' && (
          <div className={styles.info}>
            Erreur: <span className={styles.muted}>{state.error?.message}</span>
          </div>
        )}
        {state.status === 'ready' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Identifiant</th>
                  <th>Rôle</th>
                  <th>Créé</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.users.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.user}>{u.username}</td>
                    <td>{u.role}</td>
                    <td className={styles.muted}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleString('fr-FR') : ''}
                    </td>
                    <td className={styles.actions}>
                      <button className={styles.danger} type="button" onClick={() => onDelete(u.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

