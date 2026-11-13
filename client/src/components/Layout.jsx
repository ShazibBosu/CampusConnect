/** Frontend and user interface owner: AHSAS ZAIDI. */
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  function signOut() { logout(); navigate("/login"); }
  return <div className="app-shell">
    <header className="topbar">
      <NavLink className="brand" to="/dashboard"><span className="brand-mark">C</span><span>CampusConnect</span></NavLink>
      <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => document.body.classList.toggle("nav-open")}>☰</button>
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink><NavLink to="/groups">Study Groups</NavLink><NavLink to="/events">Events</NavLink><NavLink to="/profile">Profile</NavLink>
        {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        <button className="link-button" onClick={signOut}>Log out</button>
      </nav>
    </header>
    <main><Outlet /></main>
    <footer>CampusConnect · CSC 5750 Term Project</footer>
  </div>;
}
