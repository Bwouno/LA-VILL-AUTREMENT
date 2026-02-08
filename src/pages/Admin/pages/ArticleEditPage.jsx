import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  adminCreateArticle,
  adminListArticles,
  adminUpdateArticle,
  adminUploadDataUrl
} from '../../../lib/api.js';

import styles from './ArticleEditPage.module.css';

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Lecture impossible du fichier.'));
    reader.readAsDataURL(file);
  });
}

export default function ArticleEditPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [status, setStatus] = useState({ state: 'loading', message: '' });
  const [upload, setUpload] = useState({ state: 'idle', message: '' });

  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImageUrl: '',
    status: 'draft'
  });

  const isCreate = mode === 'create';

  useEffect(() => {
    if (isCreate) {
      setStatus({ state: 'ready', message: '' });
      return;
    }

    let cancelled = false;
    (async () => {
      setStatus({ state: 'loading', message: '' });
      try {
        const items = await adminListArticles();
        const current = items.find((a) => a.id === id);
        if (!current) throw new Error('Article introuvable.');
        if (cancelled) return;
        setForm({
          title: current.title || '',
          slug: current.slug || '',
          summary: current.summary || '',
          content: current.content || '',
          coverImageUrl: current.coverImageUrl || '',
          status: current.status || 'draft'
        });
        setStatus({ state: 'ready', message: '' });
      } catch (error) {
        if (cancelled) return;
        setStatus({ state: 'error', message: error?.message || 'Erreur' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isCreate]);

  const title = isCreate ? 'Nouvel article' : 'Modifier l’article';

  const canSave = useMemo(() => {
    return form.title.trim().length > 0 && form.summary.trim().length > 0;
  }, [form.title, form.summary]);

  async function onPickCover(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUpload({ state: 'loading', message: 'Upload en cours…' });
    try {
      const dataUrl = await toDataUrl(file);
      const result = await adminUploadDataUrl({ fileName: file.name, dataUrl });
      setForm((f) => ({ ...f, coverImageUrl: result.url }));
      setUpload({ state: 'success', message: 'Image uploadée.' });
    } catch (error) {
      setUpload({ state: 'error', message: error?.message || 'Upload impossible.' });
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canSave) return;

    setStatus({ state: 'loading', message: '' });
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || slugify(form.title)
      };

      if (isCreate) await adminCreateArticle(payload);
      else await adminUpdateArticle(id, payload);

      setStatus({ state: 'success', message: 'Enregistré.' });
      navigate('/admin/articles', { replace: true });
    } catch (error) {
      setStatus({ state: 'error', message: error?.message || 'Enregistrement impossible.' });
    }
  }

  function onChange(field) {
    return (event) => setForm((f) => ({ ...f, [field]: event.target.value }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>Remplissez les champs puis publiez.</div>
        </div>
        <Link className={styles.back} to="/admin/articles">
          ← Retour
        </Link>
      </div>

      {status.state === 'error' && <div className={styles.error}>{status.message}</div>}
      {status.state === 'loading' && <div className={styles.info}>Chargement…</div>}

      {status.state !== 'loading' && (
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.grid}>
            <label className={styles.label}>
              Titre
              <input className={styles.input} value={form.title} onChange={onChange('title')} required />
            </label>

            <label className={styles.label}>
              Slug (URL)
              <input
                className={styles.input}
                value={form.slug}
                onChange={onChange('slug')}
                placeholder={slugify(form.title) || 'mon-article'}
              />
            </label>

            <label className={styles.label}>
              Statut
              <select className={styles.input} value={form.status} onChange={onChange('status')}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </label>

            <label className={styles.label}>
              Image de couverture
              <div className={styles.coverRow}>
                <input className={styles.input} value={form.coverImageUrl} onChange={onChange('coverImageUrl')} placeholder="/uploads/..." />
                <label className={styles.uploadBtn}>
                  Upload
                  <input className={styles.file} type="file" accept="image/*" onChange={onPickCover} />
                </label>
              </div>
              {upload.state !== 'idle' && (
                <div
                  className={`${styles.uploadStatus} ${
                    upload.state === 'success' ? styles.ok : upload.state === 'error' ? styles.err : ''
                  }`}
                >
                  {upload.message}
                </div>
              )}
            </label>
          </div>

          {form.coverImageUrl && (
            <img className={styles.coverPreview} src={form.coverImageUrl} alt="" />
          )}

          <label className={styles.label}>
            Résumé
            <textarea className={styles.textarea} rows="3" value={form.summary} onChange={onChange('summary')} required />
          </label>

          <label className={styles.label}>
            Contenu
            <textarea className={styles.textarea} rows="10" value={form.content} onChange={onChange('content')} />
          </label>

          <div className={styles.actions}>
            <button className={styles.saveBtn} type="submit" disabled={!canSave || status.state === 'loading'}>
              Enregistrer
            </button>
            {status.state === 'success' && <div className={styles.okMsg}>{status.message}</div>}
          </div>
        </form>
      )}
    </div>
  );
}

