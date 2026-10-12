import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../theme";

function Navbar() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const handleLogout = () => navigate("/");
    return <><aside className="sidebar"><div className="brand"><span className="brand-mark">EA</span><span><b>EduAttend</b><small>Attendance Portal</small></span></div><nav className="side-nav">
        <NavLink to="/dashboard">▦ <span>Dashboard</span></NavLink>
        <NavLink to="/students">♙ <span>Students</span></NavLink>
        <NavLink to="/attendance">▣ <span>Attendance</span></NavLink>
        <NavLink to="/reports">▤ <span>Reports</span></NavLink>
    </nav><div className="sidebar-foot"><span className="online-dot"/>System ready<small>Using saved attendance data</small></div></aside><header className="topbar"><div className="topbar-label">EduAttend <span>/ Teacher Portal</span></div><div className="topbar-actions"><button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">{theme === "light" ? "☾" : "☀"}<span>{theme === "light" ? "Dark mode" : "Light mode"}</span></button><span className="user-badge">T</span><button className="logout-link" onClick={handleLogout}>Log out</button></div></header></>;
}
export default Navbar;
