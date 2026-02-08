import { useState } from 'react';
import SiteFooter from '../../components/SiteFooter/SiteFooter.jsx';
import SiteHeader from '../../components/SiteHeader/SiteHeader.jsx';
import styles from './Contact.module.css';

export default function Contact() {
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  async function onSubmit(event) {
    event.preventDefault();
    setStatus({ state: 'loading', message: '' });

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || '')
    };

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || 'Erreur');

      event.currentTarget.reset();
      setStatus({ state: 'success', message: 'Message envoyé. Merci !' });
    } catch (error) {
      setStatus({
        state: 'error',
        message: error?.message || 'Impossible d’envoyer le message.'
      });
    }
  }

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.title}>Contact</h1>
            <p className={styles.subtitle}>
              Une question, une idée, une envie de participer ? Écrivez-nous.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.card}>
              <div className={styles.info}>
                <div className={styles.infoTitle}>Email</div>
                <a className={styles.infoLink} href="mailto:lavillautrement37@gmail.com">
                  lavillautrement37@gmail.com
                </a>
              </div>

              <form className={styles.form} onSubmit={onSubmit}>
                <label className={styles.label}>
                  Nom
                  <input className={styles.input} name="name" type="text" required />
                </label>
                <label className={styles.label}>
                  Email
                  <input className={styles.input} name="email" type="email" required />
                </label>
                <label className={styles.label}>
                  Message
                  <textarea className={styles.textarea} name="message" rows="6" required />
                </label>

                <button className="btnPrimary" type="submit" disabled={status.state === 'loading'}>
                  Envoyer
                </button>

                {status.state !== 'idle' && (
                  <div
                    className={`${styles.status} ${
                      status.state === 'success' ? styles.statusOk : styles.statusErr
                    }`}
                    role="status"
                  >
                    {status.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

