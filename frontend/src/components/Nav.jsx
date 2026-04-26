import { Box, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../lib/api";

export function Nav() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function logout() {
    clearSession();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <Box size={24} />
        <span>KloudBox</span>
      </Link>
      <nav className="navlinks">
        <NavLink to="/pricing">Pricing</NavLink>
        {user ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="user-pill">{user.name}</span>
            <button className="icon-button" onClick={logout} title="Logout" aria-label="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <Link className="text-link" to="/login">Login</Link>
            <Link className="button small" to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
