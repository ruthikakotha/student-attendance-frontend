import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getStudents, getAttendance } from "../services/api";

function ProgressBar({ value, label }) {
    return (
        <div
            className="progress-track"
            role="progressbar"
            aria-label={label}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={value}
        >
            <span className="progress-fill" style={{ width: `${value}%` }} />
        </div>
    );
}

function Dashboard() {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setLoadError(false);

            const studentData = await getStudents();
            const attendanceData = await getAttendance();

            setStudents(studentData);
            setAttendance(attendanceData);
        } catch (error) {
            console.error("Error loading dashboard:", error);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const today = new Date().toISOString().split("T")[0];

    const todayAttendance = attendance.filter(
        (item) => item.date === today
    );

    const presentToday = todayAttendance.filter(
        (item) => item.status?.toLowerCase() === "present"
    ).length;

    const absentToday = todayAttendance.filter(
        (item) => item.status?.toLowerCase() === "absent"
    ).length;

    const todayPercentage =
        todayAttendance.length > 0
            ? Math.round((presentToday / todayAttendance.length) * 100)
            : 0;

    const totalAttendance = attendance.length;

    const totalPresent = attendance.filter(
        (item) => item.status?.toLowerCase() === "present"
    ).length;

    const totalAbsent = attendance.filter(
        (item) => item.status?.toLowerCase() === "absent"
    ).length;

    const attendancePercentage =
        totalAttendance > 0
            ? Math.round((totalPresent / totalAttendance) * 100)
            : 0;

    const lowAttendanceStudents = students.filter((student) => {
        const studentRecords = attendance.filter(
            (item) => Number(item.studentId) === Number(student.id)
        );

        if (studentRecords.length === 0) {
            return true;
        }

        const present = studentRecords.filter(
            (item) => item.status?.toLowerCase() === "present"
        ).length;

        const percentage = (present / studentRecords.length) * 100;
        return percentage < 75;
    });

    return (
        <>
            <Navbar />
            <main className="page">
                <div className="page-heading">
                    <div>
                        <h1>Dashboard</h1>
                        <p className="dashboard-welcome">
                            Welcome to the Student Attendance Management System.
                        </p>
                    </div>
                    <button
                        className="secondary-button"
                        type="button"
                        onClick={loadDashboardData}
                        disabled={loading}
                    >
                        {loading ? "Refreshing…" : "Refresh data"}
                    </button>
                </div>

                {loading ? (
                    <div className="dashboard-card" role="status">
                        Loading attendance data…
                    </div>
                ) : loadError ? (
                    <div className="dashboard-card data-error" role="alert">
                        <h2>Dashboard data could not be loaded</h2>
                        <p>
                            Check that the existing backend and database are running,
                            then retry. No attendance values are shown until the
                            saved records load successfully.
                        </p>
                        <button className="primary-button" type="button" onClick={loadDashboardData}>
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <section className="dashboard-stats" aria-label="Attendance summary">
                            <article className="stat-card">
                                <div className="stat-icon" aria-hidden="true">♙</div>
                                <div><p>Total Students</p><h2>{students.length}</h2></div>
                            </article>
                            <article className="stat-card present-card">
                                <div className="stat-icon" aria-hidden="true">✓</div>
                                <div><p>Present Today</p><h2>{presentToday}</h2></div>
                            </article>
                            <article className="stat-card absent-card">
                                <div className="stat-icon" aria-hidden="true">○</div>
                                <div><p>Absent Today</p><h2>{absentToday}</h2></div>
                            </article>
                            <article className="stat-card percentage-card">
                                <div className="stat-icon" aria-hidden="true">↗</div>
                                <div className="stat-value-block">
                                    <p>Overall Attendance</p>
                                    <h2>{attendancePercentage}%</h2>
                                    <ProgressBar value={attendancePercentage} label="Overall attendance" />
                                </div>
                            </article>
                        </section>

                        <section className="dashboard-panels" aria-label="Attendance details">
                            <article className="dashboard-card">
                                <div className="panel-heading">
                                    <div>
                                        <h2>Today’s Attendance</h2>
                                        <p>{todayAttendance.length} saved attendance records</p>
                                    </div>
                                    <Link className="text-link" to="/attendance">Manage attendance</Link>
                                </div>
                                <div className="metric-row"><span>Present</span><strong className="attendance-good">{presentToday}</strong></div>
                                <div className="metric-row"><span>Absent</span><strong className="attendance-low">{absentToday}</strong></div>
                                <div className="progress-caption"><span>Present rate</span><strong>{todayPercentage}%</strong></div>
                                <ProgressBar value={todayPercentage} label="Today's attendance present rate" />
                            </article>

                            <article className="dashboard-card">
                                <div className="panel-heading">
                                    <div>
                                        <h2>Attendance Summary</h2>
                                        <p>All saved attendance records</p>
                                    </div>
                                    <Link className="text-link" to="/reports">Open reports</Link>
                                </div>
                                <div className="metric-row"><span>Total records</span><strong>{totalAttendance}</strong></div>
                                <div className="metric-row"><span>Present</span><strong className="attendance-good">{totalPresent}</strong></div>
                                <div className="metric-row"><span>Absent</span><strong className="attendance-low">{totalAbsent}</strong></div>
                                <div className="progress-caption"><span>Overall present rate</span><strong>{attendancePercentage}%</strong></div>
                                <ProgressBar value={attendancePercentage} label="Overall attendance present rate" />
                            </article>

                            <article className="dashboard-card low-attendance-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h2>Low Attendance</h2>
                                        <p>Students below the existing 75% threshold</p>
                                    </div>
                                    <span className="alert-count">{lowAttendanceStudents.length}</span>
                                </div>
                                {lowAttendanceStudents.length === 0 ? (
                                    <p className="empty-success">All students are at or above 75% attendance.</p>
                                ) : (
                                    <div className="low-attendance-list">
                                        {lowAttendanceStudents.map((student) => {
                                            const records = attendance.filter(
                                                (item) => Number(item.studentId) === Number(student.id)
                                            );
                                            const present = records.filter(
                                                (item) => item.status?.toLowerCase() === "present"
                                            ).length;
                                            const percentage = records.length > 0
                                                ? Math.round((present / records.length) * 100)
                                                : 0;

                                            return (
                                                <div className="low-attendance-row" key={student.id}>
                                                    <div className="student-identity">
                                                        <span className="student-avatar" aria-hidden="true">♙</span>
                                                        <span><strong>{student.name}</strong><small>{student.rollNo}</small></span>
                                                    </div>
                                                    <div className="alert-progress">
                                                        <strong className="attendance-low">{percentage}%</strong>
                                                        <ProgressBar value={percentage} label={`${student.name} attendance`} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </article>
                        </section>
                    </>
                )}
            </main>
        </>
    );
}

export default Dashboard;
