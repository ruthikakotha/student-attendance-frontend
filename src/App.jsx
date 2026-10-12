import { useEffect, useState } from "react";
import {
    HashRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import StudentDashboard from "./pages/StudentDashboard";
import { ThemeContext } from "./theme";
import "./App.css";

function App() {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("attendance-theme");
        return savedTheme === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("attendance-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) =>
            current === "light" ? "dark" : "light"
        );
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route
                        path="/student-dashboard"
                        element={<StudentDashboard />}
                    />
                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </HashRouter>
        </ThemeContext.Provider>
    );
}

export default App;