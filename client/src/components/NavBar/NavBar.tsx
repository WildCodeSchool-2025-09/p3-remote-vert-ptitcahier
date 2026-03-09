import { LogOut } from "lucide-react";
import { useState } from "react";
import { NavLink, useOutletContext } from "react-router-dom";
import siteLogo from "../../assets/images/logo_site.png";
import type { Parent } from "../../types/Auth";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import type { School } from "../../types/School";
import LogoutButton from "../LogoutButton/LogoutButton";
import parentStyles from "./NavBarParent.module.css";
import schoolStyles from "./NavBarSchool.module.css";
import { getNavItems } from "./navItems";

function NavBar() {
  const { auth, setAuth } = useOutletContext<OutletAuthContext>();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const logOut = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };

  const isSchoolUser = auth?.role === "school";
  const styles = isSchoolUser ? schoolStyles : parentStyles;
  const mobileNavStyle = isSchoolUser
    ? schoolStyles.mobileNav
    : parentStyles.mobileNavParent;

  const menuItems = getNavItems(auth).filter(
    (item) => item.label !== "Déconnexion",
  );

  let userName = "";
  if (auth?.role === "parent") {
    const parentProfile = auth.profile as Parent;
    userName = parentProfile.firstName;
  } else if (auth?.role === "school") {
    const schoolProfile = auth.profile as School;
    userName = schoolProfile.name;
  }

  const userImage = auth?.profile.photoUrl || "/images/default_avatar.png";

  return (
    <>
      <aside
        id="sidebar"
        aria-label="Menu latéral"
        className={`${styles.sidebar} ${isSidebarOpen ? styles.expanded : styles.collapsed}`}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "Réduire le menu" : "Ouvrir le menu"}
        >
          <span className={styles.toggleIcon} aria-hidden="true">
            {isSidebarOpen ? "❮❮" : "❯❯"}
          </span>
        </button>

        <div className={styles.profile}>
          <img src={userImage} alt={userName} className={styles.avatar} />
          {isSidebarOpen && (
            <span className={styles.displayName}>{userName}</span>
          )}
        </div>

        <nav className={styles.nav} aria-label="Navigation principale">
          <ul className={styles.navList}>
            {menuItems.map((item) => (
              <li key={item.to} className={styles.navItem}>
                <NavLink
                  to={item.to || "#"}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navLink} ${styles.active}`
                      : styles.navLink
                  }
                  aria-label={item.label}
                >
                  <item.Icon className={styles.icon} aria-hidden="true" />
                  {isSidebarOpen && (
                    <span className={styles.linkLabel}>{item.label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footer}>
          {isSidebarOpen ? (
            <LogoutButton />
          ) : (
            <button
              type="button"
              onClick={logOut}
              className={styles.collapsedLogout}
              aria-label="Se déconnecter"
            >
              <LogOut className={styles.icon} aria-hidden="true" />
            </button>
          )}

          <NavLink
            to={isSchoolUser ? "/school/home" : "/parent/home"}
            className={styles.footerLogoLink}
            aria-label="Retour à l'accueil"
          >
            <img
              src={siteLogo}
              alt="Logo P'tit Cahier"
              className={styles.footerLogo}
            />
          </NavLink>
          {isSidebarOpen && (
            <p className={styles.footerText}>P'tit Cahier © 2026</p>
          )}
        </div>
      </aside>

      <nav className={mobileNavStyle} aria-label="Navigation mobile">
        <div className={styles.mobileRow}>
          <NavLink
            to={isSchoolUser ? "/school/home" : "/parent/home"}
            className={styles.mobileHome}
            aria-label="Retour à l'accueil"
          >
            <img
              src={siteLogo}
              alt=""
              className={styles.mobileLogo}
              aria-hidden="true"
            />
          </NavLink>

          {menuItems.map((item) => (
            <NavLink
              key={`mobile-${item.to}`}
              to={item.to || "#"}
              className={({ isActive }) =>
                isActive
                  ? `${styles.mobileLink} ${styles.active}`
                  : styles.mobileLink
              }
              aria-label={item.label}
            >
              <item.Icon className={styles.icon} aria-hidden="true" />
            </NavLink>
          ))}

          <button
            type="button"
            onClick={logOut}
            className={styles.mobileLogoutButton}
            aria-label="Se déconnecter"
          >
            <LogOut className={styles.icon} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </>
  );
}
export default NavBar;
