import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { adminDeleteArticle, adminListArticles } from '../../../lib/api.js';

import styles from './ArticlesPage.module.css';

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value)
    );
  } catch {
    return '';
  }
}

export default function ArticlesPage() {
  const [state, setState] = useState({ status: 'loading', items: [], error: null });

  async function refresh() {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const items = await adminListArticles();
      setState({ status: 'ready', items, error: null });
    } catch (error) {
      setState({ status: 'error', items: [], error });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onDelete(id) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Supprimer cet article ?')) return;
    await adminDeleteArticle(id);
    await refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Articles</div>
          <div className={styles.subtitle}>Créer / modifier / publier des contenus.</div>
        </div>
        <Link className={styles.newBtn} to="/admin/articles/new">
          + Nouvel article
        </Link>
      </div>

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
                <th>Statut</th>
                <th>Titre</th>
                <th>Slug</th>
                <th>Modifié</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.items
                .slice()
                .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
                .map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          item.status === 'published' ? styles.badgeOk : styles.badgeDraft
                        }`}
                      >
                        {item.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className={styles.cellTitle}>{item.title}</td>
                    <td className={styles.cellSlug}>{item.slug}</td>
                    <td className={styles.cellDate}>{formatDate(item.updatedAt)}</td>
                    <td className={styles.cellActions}>
                      <Link className={styles.actionLink} to={`/admin/articles/${item.id}`}>
                        Modifier
                      </Link>
                      <button
                        type="button"
                        className={styles.actionDanger}
                        onClick={() => onDelete(item.id)}
                      >
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
  );
}

