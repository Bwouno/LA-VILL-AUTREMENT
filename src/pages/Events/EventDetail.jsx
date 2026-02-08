import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SiteFooter from '../../components/SiteFooter/SiteFooter.jsx';
import SiteHeader from '../../components/SiteHeader/SiteHeader.jsx';

import styles from './EventDetail.module.css';

async function getArticleBySlug(slug) {
  const response = await fetch(`/api/public/articles/${encodeURIComponent(slug)}`, {
    credentials: 'include'
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || 'Article introuvable');
  return payload;
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value));
  } catch {
    return '';
  }
}

export default function EventDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', article: null, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const article = await getArticleBySlug(slug);
        if (cancelled) return;
        setState({ status: 'ready', article, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({ status: 'error', article: null, error });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.section}>
          <div className="container">
            <Link className={styles.back} to="/evenements">
              ← Retour
            </Link>

            {state.status === 'loading' && <p className={styles.info}>Chargement…</p>}
            {state.status === 'error' && (
              <p className={styles.info}>
                {state.error?.message || 'Erreur'}
              </p>
            )}

            {state.status === 'ready' && state.article && (
              <article className={styles.article}>
                <header className={styles.header}>
                  <h1 className={styles.title}>{state.article.title}</h1>
                  {state.article.publishedAt && (
                    <div className={styles.meta}>{formatDate(state.article.publishedAt)}</div>
                  )}
                </header>

                {state.article.coverImageUrl && (
                  <img className={styles.cover} src={state.article.coverImageUrl} alt="" />
                )}

                <p className={styles.summary}>{state.article.summary}</p>

                <div className={styles.content}>
                  {state.article.content
                    .split('\n')
                    .filter(Boolean)
                    .map((line, index) => (
                      <p key={index} className={styles.paragraph}>
                        {line}
                      </p>
                    ))}
                </div>
              </article>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

