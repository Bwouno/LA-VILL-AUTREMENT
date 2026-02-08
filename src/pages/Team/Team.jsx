import SiteFooter from "../../components/SiteFooter/SiteFooter.jsx";
import SiteHeader from "../../components/SiteHeader/SiteHeader.jsx";
import styles from "./Team.module.css";

const teamMembers = [
  {
    name: "Benoît LEVIEUX",
    role: "Tête de liste",
    photo: "/branding/BENOIT.png",
    fullImage: "/branding/Benoit Levieux.jpg",
  },
  {
    name: "Marie-Christine PRUVOT",
    role: "Adjointe",
    photo: "/branding/PRUVOT.png",
    fullImage: "/branding/Marie-Christine Pruvot.jpg",
  },
  {
    name: "Alain Phalippou",
    role: "Adjoint",
    photo: "/branding/PHALIPPOU.png",
    fullImage: "/branding/Alain Phalippou.jpg",
  },
  {
    name: "André SAVOIE",
    role: "Liste",
    photo: "/branding/ANDRE.png",
    fullImage: "/branding/Andre Savoie.jpg",
  },
  {
    name: "Arnaud DORMIGNIES",
    role: "Liste",
    photo: "/branding/DORMIGNIES.png",
    fullImage: "/branding/Arnaud Dormignies.jpg",
  },
  {
    name: "Aurore NAUD",
    role: "Liste",
    photo: "/branding/NAUD.png",
    fullImage: "/branding/Aurore Naud.jpg",
  },
];

export default function Team() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <h2 className="sectionTitle sectionTitle--onDark">Notre équipe</h2>

            <div className={styles.teamInner}>
              <img
                className={styles.teamImage}
                src="/branding/EQUIPE.jpg"
                alt="EQUIPE"
              />

              <div className={styles.teamContent}>
                <p className={styles.teamText}>
                  Une équipe engagée, proche des habitants, prête à faire
                  bouger La Ville-aux-Dames autrement. Vous trouverez ici les
                  membres de la liste la « Vill’Autrement » pour les élections
                  municipales 2026 à la Ville-Aux-Dames.
                </p>
                <p className={styles.teamText}>
                  Dans cette liste vous retrouverez :
                </p>
                <ul className={styles.teamList}>
                  <li>
                    Des conseillers municipaux qui connaissent le
                    fonctionnement de la commune et de la communauté de
                    communes, les dossiers et les enjeux locaux depuis
                    plusieurs années.
                  </li>
                  <li>
                    Des femmes et des hommes aux métiers variés, du secteur
                    public et du secteur privé, leur permettant d’avoir des
                    compétences plurielles et complémentaires.
                  </li>
                  <li>
                    Des femmes et des hommes engagés depuis des années dans la
                    vie associative de la commune.
                  </li>
                </ul>
              </div>
            </div>

            <p className={styles.teamSlogan}>
              Une équipe à votre image déterminée à s’engager pour vous et avec
              vous.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.grid}>
              {teamMembers.map((member) => (
                <a
                  key={member.name}
                  className={styles.cardLink}
                  href={encodeURI(member.fullImage)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Ouvrir la photo de ${member.name}`}
                >
                  <article className={styles.cardFlip}>
                    <div className={`${styles.cardFace} ${styles.cardFront}`}>
                      <div className={styles.photoWrap}>
                        <img
                          className={styles.photo}
                          src={encodeURI(member.photo)}
                          alt={member.name}
                        />
                      </div>
                      <div className={styles.cardBody}>
                        <div className={styles.name}>{member.name}</div>
                        <div className={styles.role}>{member.role}</div>
                      </div>
                    </div>
                    <div className={`${styles.cardFace} ${styles.cardBack}`}>
                      <img
                        className={styles.backImage}
                        src={encodeURI(member.fullImage)}
                        alt={`${member.name} en entier`}
                      />
                    </div>
                  </article>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
