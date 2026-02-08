import SiteFooter from '../../components/SiteFooter/SiteFooter.jsx';
import SiteHeader from '../../components/SiteHeader/SiteHeader.jsx';
import styles from './Team.module.css';

const teamMembers = [
  {
    name: 'Benoît LEVEUX',
    role: 'Tête de liste',
    bio: 'Présentation à compléter (nom, rôle, engagement, etc.).',
    photo: '/branding/BENOIT.png'
  },
  {
    name: 'Membre 2',
    role: 'Rôle',
    bio: 'Présentation à compléter.',
    photo: '/images/team.svg'
  },
  {
    name: 'Membre 3',
    role: 'Rôle',
    bio: 'Présentation à compléter.',
    photo: '/images/team.svg'
  }
];

export default function Team() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.title}>Notre équipe</h1>
            <p className={styles.subtitle}>
              Découvrez les personnes qui portent le projet et leurs engagements.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.grid}>
              {teamMembers.map((member) => (
                <article key={member.name} className={styles.card}>
                  <img className={styles.photo} src={member.photo} alt="" />
                  <div className={styles.cardBody}>
                    <div className={styles.name}>{member.name}</div>
                    <div className={styles.role}>{member.role}</div>
                    <p className={styles.bio}>{member.bio}</p>
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

