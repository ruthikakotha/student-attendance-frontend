import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme";

const API_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "https://student-attendance-production-3786.up.railway.app/api"
).replace(/\/+$/, "");

function StudentDashboard() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const role = sessionStorage.getItem("role");
        const storedStudent = sessionStorage.getItem("student");
        const token = sessionStorage.getItem("token");

        if (role?.toUpperCase() !== "STUDENT" || !storedStudent || !token) {
            setError("Your student session is missing. Please log in again.");
            setLoading(false);
            return;
        }

        let currentStudent;

        try {
            currentStudent = JSON.parse(storedStudent);

            if (!currentStudent?.id) {
                setError("Student details are missing. Please log in again.");
                setLoading(false);
                return;
            }
        } catch {
            setError("Unable to read student details. Please log in again.");
            setLoading(false);
            return;
        }

        setStudent(currentStudent);

        const loadAttendance = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/attendance/student/${currentStudent.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load attendance (HTTP ${response.status}).`
                    );
                }

                const data = await response.json();
                setAttendance(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Attendance loading error:", err);
                setError(err.message || "Unable to load attendance.");
            } finally {
                setLoading(false);
            }
        };

        loadAttendance();
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("student");
        navigate("/", { replace: true });
    };

    if (loading) {
        return (
            <div className="page">
                <h1>Student Dashboard</h1>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="page">
                <h1>Student Dashboard</h1>
                <p>{error || "Student details are unavailable."}</p>
                <button onClick={handleLogout}>Back to Login</button>
            </div>
        );
    }

    const presentCount = attendance.filter(
        item => item.status?.toLowerCase() === "present"
    ).length;

    const absentCount = attendance.filter(
        item => item.status?.toLowerCase() === "absent"
    ).length;

    const total = presentCount + absentCount;

    const percentage = total
        ? Math.round((presentCount / total) * 100)
        : 0;

    const subjects = {};

    attendance.forEach(item => {
        const name = item.subject?.trim() || "Other";
        const key = name.toLowerCase();

        if (!subjects[key]) {
            subjects[key] = { name, present: 0, absent: 0 };
        }

        if (item.status?.toLowerCase() === "present") {
            subjects[key].present++;
        } else if (item.status?.toLowerCase() === "absent") {
            subjects[key].absent++;
        }
    });

    return (
        <>
            <nav className="navbar">
                <div className="navbar-title">Student Portal</div>

                <div className="student-nav-actions">
                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={toggleTheme}
                    >
                        {theme === "light" ? "☾ Dark mode" : "☀ Light mode"}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            padding: "10px 18px",
                            border: "1px solid white",
                            borderRadius: "8px",
                            background: "transparent",
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="page student-page">
                <div className="student-page-heading">
                    <div>
                        <h1>Welcome, {student.name}!</h1>
                        <p>Here is your attendance summary.</p>
                    </div>
                    <span className="portal-label">Student portal</span>
                </div>

                {error && (
                    <div role="alert" className="error-message">
                        {error}
                    </div>
                )}

                <div className="dashboard-cards student-details">
                    <div className="dashboard-card">
                        <h3>Roll Number</h3>
                        <h2>{student.rollNo}</h2>
                    </div>
                    <div className="dashboard-card">
                        <h3>Department</h3>
                        <h2>{student.department}</h2>
                    </div>
                    <div className="dashboard-card">
                        <h3>Year &amp; Section</h3>
                        <h2>{student.year} / {student.section}</h2>
                    </div>
                </div>

                <div
                    className="dashboard-stats student-attendance-stats"
                    style={{ marginTop: "25px" }}
                >
                    <div className="stat-card">
                        <div>
                            <p>Total Classes</p>
                            <h2>{total}</h2>
                        </div>
                    </div>
                    <div className="stat-card present-card">
                        <div>
                            <p>Present</p>
                            <h2>{presentCount}</h2>
                        </div>
                    </div>
                    <div className="stat-card absent-card">
                        <div>
                            <p>Absent</p>
                            <h2>{absentCount}</h2>
                        </div>
                    </div>
                    <div className="stat-card percentage-card">
                        <div>
                            <p>Attendance</p>
                            <h2>{percentage}%</h2>
                            <div
                                className="progress-track"
                                role="progressbar"
                                aria-label="Your overall attendance"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow={percentage}
                            >
                                <span
                                    className="progress-fill"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <h2 style={{ marginTop: "35px" }}>
                    Subject-wise Attendance
                </h2>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Total Classes</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(subjects).length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        No attendance records available.
                                    </td>
                                </tr>
                            ) : (
                                Object.entries(subjects).map(([key, data]) => {
                                    const subjectTotal =
                                        data.present + data.absent;

                                    const subjectPercentage = subjectTotal
                                        ? Math.round(
                                            (data.present / subjectTotal) * 100
                                        )
                                        : 0;

                                    return (
                                        <tr key={key}>
                                            <td>{data.name}</td>
                                            <td>{data.present}</td>
                                            <td>{data.absent}</td>
                                            <td>{subjectTotal}</td>
                                            <td>
                                                {subjectPercentage}%
                                                <div className="subject-progress">
                                                    <span
                                                        style={{
                                                            width: `${subjectPercentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}

export default StudentDashboard;