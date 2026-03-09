import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import ptit_cahier_logo_original from "../../assets/images/ptit_cahier_logo_original.png";
import AnnouncementCard from "../../components/AnnouncementCard/AnnouncementCard";
import CalendarCard from "../../components/CalendarCard/CalendarCard";
import DigitalClock from "../../components/DigitalClock/DigitalClock";
import TicketCard from "../../components/TicketCard/TicketCard";
import type { Announcement } from "../../types/Announcement";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import type { School, SchoolDashboard } from "../../types/School";
import type { Ticket } from "../../types/Ticket";
import styles from "./Home.module.css";

function Home() {
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dashboardStats, setDashboardStats] = useState<SchoolDashboard | null>(
    null,
  );
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const { auth } = useOutletContext<OutletAuthContext>();
  const userRole = auth?.role;

  const defaultBanner = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = "/images/schools/banner-0.jpg";
  };

  const fetchDashboardData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${auth?.token}` };
    try {
      if (userRole === "school") {
        const [schoolData, tickets] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/schools/me`, { headers }),
          fetch(
            `${import.meta.env.VITE_API_URL}/api/schools/me/tickets?limit=6`,
            { headers },
          ),
        ]);

        setSchool({
          id: (auth?.profile as School).id,
          name: (auth?.profile as School).name,
        });
        setDashboardStats(await schoolData.json());
        setTickets(await tickets.json());
      } else {
        const [school, tickets, announcements] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/parents/me/school`, {
            headers,
          }),
          fetch(
            `${import.meta.env.VITE_API_URL}/api/parents/me/tickets?limit=3`,
            { headers },
          ),
          fetch(
            `${import.meta.env.VITE_API_URL}/api/parents/me/announcements/?limit=3`,
            { headers },
          ),
        ]);

        setSchool(await school.json());
        setTickets(await tickets.json());
        setAnnouncements(await announcements.json());
      }
    } catch (error) {
      console.error("Erreur lors du chargement du tableau de bord :", error);
    }
  }, [auth, userRole]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalSlides = announcements.length;

  const showNextAnnouncement = useCallback(() => {
    setActiveSlideIndex((current) =>
      current === totalSlides - 1 ? 0 : current + 1,
    );
  }, [totalSlides]);

  const showPreviousAnnouncement = () => {
    setActiveSlideIndex((current) =>
      current === 0 ? totalSlides - 1 : current - 1,
    );
  };

  useEffect(() => {
    if (
      userRole === "school" ||
      totalSlides <= 1 ||
      isCarouselPaused ||
      announcements.length === 0
    )
      return;

    const autoPlayTimer = setInterval(showNextAnnouncement, 7000);
    return () => clearInterval(autoPlayTimer);
  }, [
    totalSlides,
    isCarouselPaused,
    showNextAnnouncement,
    userRole,
    announcements.length,
  ]);

  const renderTicketsList = () => (
    <ul className={styles.ticket_list}>
      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <li key={ticket.id}>
            <TicketCard
              ticket={ticket}
              variant="dashboard"
              onClick={() => navigate(`/${auth?.role}/tickets`)}
              showStatusBadge
            />
          </li>
        ))
      ) : (
        <p className={styles.empty_message}>Aucun ticket récent.</p>
      )}
    </ul>
  );

  return (
    <main
      className={
        userRole === "school" ? "school-background" : "parent-background"
      }
    >
      <div className={styles.dashboard_container}>
        <header className={styles.home_header}>
          <img
            src={ptit_cahier_logo_original}
            alt="logo P'tit Cahier"
            className={styles.logo}
          />
          <section className={styles.ba_card} aria-labelledby="school-name">
            <figure className={styles.ba_card_header}>
              <img
                src={`/images/schools/banner-${school?.id ?? 0}.jpg`}
                alt={`Bannière de l'école ${school?.name}`}
                className={styles.school_banner}
                onError={defaultBanner}
              />
              <figcaption>
                <h1 id="school-name" className={styles.card_title}>
                  {school?.name ?? "Chargement de l'école..."}
                </h1>
              </figcaption>
            </figure>
          </section>
        </header>

        <div className={styles.main_content_grid}>
          <section className={styles.left_column}>
            {userRole === "school" ? (
              <article className={styles.stats_section}>
                {/* <h2 className={styles.section_title}>Indicateurs clés</h2> */}
                <dl className={styles.stats_list}>
                  {[
                    {
                      label: "Annonces",
                      value: dashboardStats?.totalAnnouncements,
                    },
                    { label: "Élèves", value: dashboardStats?.totalStudents },
                    {
                      label: "Classes",
                      value: dashboardStats?.totalClassrooms,
                    },
                    { label: "Parents", value: dashboardStats?.totalParents },
                  ].map((stat) => (
                    <div key={stat.label} className={styles.stat_group}>
                      <dt>{stat.label}</dt>
                      <dd>{stat.value ?? 0}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ) : (
              <section aria-labelledby="messages-title">
                <h2
                  id="messages-title"
                  className={styles.secondary_section_title}
                >
                  Derniers messages
                </h2>
                {renderTicketsList()}
              </section>
            )}

            <footer className={styles.widgets_footer}>
              <DigitalClock />
              <CalendarCard />
            </footer>
          </section>

          <section
            className={styles.right_column}
            aria-labelledby="right-col-title"
          >
            <h2
              id="right-col-title"
              className="primary-title"
              style={{ textAlign: "center", marginBottom: "2rem" }}
            >
              {userRole === "school"
                ? "Derniers Tickets Reçus"
                : "Fil d'actualité"}
            </h2>

            {userRole === "school" ? (
              renderTicketsList()
            ) : (
              <div
                className={styles.carousel_wrapper}
                onMouseEnter={() => setIsCarouselPaused(true)}
                onMouseLeave={() => setIsCarouselPaused(false)}
              >
                {totalSlides > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousAnnouncement}
                      className={`${styles.nav_button} ${styles.left}`}
                      aria-label="Annonce précédente"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      type="button"
                      onClick={showNextAnnouncement}
                      className={`${styles.nav_button} ${styles.right}`}
                      aria-label="Annonce suivante"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}
                <ul
                  className={styles.carousel_track}
                  style={{
                    transform: `translateX(-${activeSlideIndex * 100}%)`,
                  }}
                >
                  {announcements.map((announcement, index) => (
                    <li
                      key={announcement.id}
                      className={styles.carousel_item}
                      aria-hidden={index !== activeSlideIndex}
                    >
                      <AnnouncementCard
                        announcement={announcement}
                        variant="dashboard"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default Home;
