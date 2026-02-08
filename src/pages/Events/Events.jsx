import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SiteFooter from '../../components/SiteFooter/SiteFooter.jsx';
import SiteHeader from '../../components/SiteHeader/SiteHeader.jsx';
import { getPublicArticles } from '../../lib/api.js';

import styles from './Events.module.css';

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value));
  } catch {
    return '';
  }
}

export default function Events() {
  const [state, setState] = useState({ status: 'loading', articles: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const articles = await getPublicArticles();
        if (cancelled) return;
        setState({ status: 'ready', articles, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({ status: 'error', articles: [], error });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.title}>Évènements</h1>
            <p className={styles.subtitle}>
              Actualités, réunions, annonces… (contenu géré depuis l&apos;espace admin).
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            {state.status === 'loading' && <p className={styles.info}>Chargement…</p>}
            {state.status === 'error' && (
              <p className={styles.info}>
                Impossible de charger les articles pour le moment.
                <br />
                <span className={styles.muted}>
                  ({state.error?.message || 'Erreur réseau / API non démarrée'})
                </span>
              </p>
            )}
            {state.status === 'ready' && state.articles.length === 0 && (
              <p className={styles.info}>Aucun évènement publié pour le moment.</p>
            )}

            <div className={styles.grid}>
              {state.articles.map((article) => (
                <article key={article.id} className={styles.card}>
                  <img
                    className={styles.cover}
                    src={article.coverImageUrl || '/images/future.svg'}
                    alt=""
                  />
                  <div className={styles.cardBody}>
                    <div className={styles.meta}>
                      {article.publishedAt ? formatDate(article.publishedAt) : ''}
                    </div>
                    <div className={styles.cardTitle}>{article.title}</div>
                    <p className={styles.summary}>{article.summary}</p>
                    <Link className={styles.readMore} to={`/evenements/${article.slug}`}>
                      Lire →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

