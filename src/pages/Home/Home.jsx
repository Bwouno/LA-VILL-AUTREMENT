import { Link } from 'react-router-dom';
import SiteFooter from '../../components/SiteFooter/SiteFooter.jsx';
import SiteHeader from '../../components/SiteHeader/SiteHeader.jsx';
import EngagementCard from '../../components/EngagementCard/EngagementCard.jsx';
import { EarthIcon, ShopIcon, TownHallIcon } from '../../components/icons/EngagementIcons.jsx';
import { QUESTIONNAIRE_URL } from '../../content/links.js';

import styles from './Home.module.css';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.hero} aria-label="Présentation">
          <div className={styles.heroBg} aria-hidden="true" />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={`container ${styles.heroInner}`}>
            <img
              className={styles.wordmark}
              src="/public/branding/LOGOHEADER.png"
              alt="La Vill'Autrement"
            />
            <p className={styles.tagline}>
              Engagés pour une Ville-aux-Dames plus verte et solidaire.
            </p>
          </div>
        </section>

        <section className={styles.engagements} aria-label="Nos engagements">
          <div className="container">
            <h2 className="sectionTitle sectionTitle--onDark">Nos engagements</h2>

            <div className={styles.engagementGrid}>
              <EngagementCard
                icon={<EarthIcon />}
                text="Agir pour un environnement plus vert et durable à la Ville-aux-Dames."
              />
              <EngagementCard
                icon={<ShopIcon />}
                text="Soutenir les commerces locaux et renforcer le lien social dans notre ville."
              />
              <EngagementCard
                icon={<TownHallIcon />}
                text="Encourager la participation citoyenne pour construire ensemble l'avenir."
              />
            </div>
          </div>
        </section>

        <section className={styles.future} aria-label="Questionnaire">
          <div className="container">
            <h2 className="sectionTitle">
              Parlons de l&apos;avenir de la Ville aux Dames
            </h2>

            <div className={styles.futureInner}>
              <img
                className={styles.futureImage}
                src="/public/branding/AVENIR.jpg"
                alt="AVENIR"
              />

              <p className={styles.futureText}>
                Envie de nous aider à nourrir un projet concret et répondant réellement aux besoins des
                gynépolitaines et gynépolitains ?
              </p>
              <p className={styles.futureTextStrong}>
                Nous vous proposons de répondre à notre questionnaire !
              </p>

              <a className="btnPrimary" href={QUESTIONNAIRE_URL} target="_blank" rel="noreferrer">
                Répondre au questionnaire
              </a>
            </div>
          </div>
        </section>

        <section className={styles.team} aria-label="Notre équipe">
          <div className="container">
            <h2 className="sectionTitle sectionTitle--onDark">Notre équipe</h2>

            <div className={styles.teamInner}>
              <img className={styles.teamImage} src="/public/branding/EQUIPE.jpg" alt="EQUIPE" />

              <p className={styles.teamText}>
                Rencontrez les visages engagés de la Vill&apos;Autrement, prêts à construire un avenir plus
                vert et solidaire pour notre ville.
              </p>

              <Link className="btnSecondary" to="/equipe">
                En savoir plus
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.electoral} aria-label="Listes électorales">
          <div className="container">
            <h2 className="sectionTitle">Listes électorales</h2>

            <p className={styles.electoralText}>
              Dernière ligne droite pour vous inscrire sur les listes électorales et pouvoir exprimer votre
              choix aux élections municipales qui se dérouleront les 15 et 22 mars 2026.
            </p>
            <p className={styles.electoralTextSmall}>
              L&apos;inscription sur les listes électorales est possible jusqu&apos;au 4 février 2026 en ligne sur
              <a
                className={styles.inlineLink}
                href="https://www.service-public.gouv.fr/?fbclid=IwY2xjawPhsUlleHRuA2FlbQIxMABzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeHiaBgTMsgcfB2a5UfsBuhDLv7gnsxJk_A0PsabJVGboR_rjY2TZxiYJOZM4_aem_qrJiHR_pPMGIcx-mjGARuQ"
                target="_blank"
                rel="noreferrer"
              >
                {' '}
                service-public.fr
              </a>{' '}
              et le 6 février 2026 au Centre administratif et en Mairies Annexes.
            </p>

            <img
              className={styles.electoralImage}
              src="/public/branding/ELECTION.png"
              alt="ELECTION"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
