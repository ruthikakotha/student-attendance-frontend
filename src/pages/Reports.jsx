import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getStudents,
    getAttendance
} from "../services/api";

function Reports() {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);

    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState("");
    const [date, setDate] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getStudents(), getAttendance()])
            .then(([studentsData, attendanceData]) => {
                if (cancelled) return;
                setStudents(studentsData);
                setAttendance(attendanceData);
            })
            .catch((error) => {
                if (cancelled) return;
                console.error("Error loading reports:", error);
                alert("Unable to load attendance reports.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    /* Group capitalization variants while preserving a stored display name. */
    const subjects = [
        ...new Map(
            attendance
                .map((item) => item.subject?.trim())
                .filter(Boolean)
                .map((item) => [item.toLowerCase(), item])
        ).values()
    ];

    /* Filter attendance records */
    const filteredAttendance = attendance.filter((item) => {
        const subjectMatch =
            subject === "" ||
            item.subject?.toLowerCase() === subject.toLowerCase();

        const dateMatch =
            date === "" || item.date === date;

        return subjectMatch && dateMatch;
    });

    /* Calculate report for each student */
    const getStudentReport = (studentId) => {
        const records = filteredAttendance.filter(
            (item) =>
                Number(item.studentId) === Number(studentId)
        );

        const total = records.length;

        const present = records.filter(
            (item) =>
                item.status?.toLowerCase() === "present"
        ).length;

        const absent = records.filter(
            (item) =>
                item.status?.toLowerCase() === "absent"
        ).length;

        const percentage =
            total > 0
                ? Math.round((present / total) * 100)
                : 0;

        return {
            total,
            present,
            absent,
            percentage
        };
    };

    /* Search students */
    const filteredStudents = students.filter((student) => {
        const searchText = search.toLowerCase();

        return (
            student.name
                ?.toLowerCase()
                .includes(searchText) ||
            student.rollNo
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    /* Overall filtered statistics */
    const totalRecords = filteredAttendance.length;

    const totalPresent = filteredAttendance.filter(
        (item) =>
            item.status?.toLowerCase() === "present"
    ).length;

    const totalAbsent = filteredAttendance.filter(
        (item) =>
            item.status?.toLowerCase() === "absent"
    ).length;

    const overallPercentage =
        totalRecords > 0
            ? Math.round(
                  (totalPresent / totalRecords) * 100
              )
            : 0;

    /* Clear filters */
    const clearFilters = () => {
        setSearch("");
        setSubject("");
        setDate("");
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="page">
                    <h1>Attendance Reports</h1>
                    <p>Loading attendance reports...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="page">
                <h1>Attendance Reports</h1>

                <div className="dashboard-card">
                    <h2>Student-wise Attendance</h2>

                    {/* Filters */}
                    <div className="report-filters">

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search student name or roll number..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        {/* Subject */}
                        <select
                            value={subject}
                            onChange={(e) =>
                                setSubject(e.target.value)
                            }
                        >
                            <option value="">
                                All Subjects
                            </option>

                            {subjects.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>

                        {/* Date */}
                        <input
                            type="date"
                            value={date}
                            onChange={(e) =>
                                setDate(e.target.value)
                            }
                        />

                        {/* Clear */}
                        <button
                            type="button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Roll No</th>
                                    <th>Student Name</th>
                                    <th>Total Classes</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Attendance %</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="8">
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map(
                                        (student) => {
                                            const report =
                                                getStudentReport(
                                                    student.id
                                                );

                                            const isGood =
                                                report.percentage >=
                                                75;

                                            return (
                                                <tr
                                                    key={
                                                        student.id
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            student.id
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            student.rollNo
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            student.name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            report.total
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            report.present
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            report.absent
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong
                                                            className={
                                                                isGood
                                                                    ? "attendance-good"
                                                                    : "attendance-low"
                                                            }
                                                        >
                                                            {
                                                                report.percentage
                                                            }
                                                            %
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                isGood
                                                                    ? "status-good"
                                                                    : "status-low"
                                                            }
                                                        >
                                                            {isGood
                                                                ? "Good"
                                                                : "Low"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Overall Attendance */}
                <div
                    className="dashboard-card"
                    style={{
                        marginTop: "25px"
                    }}
                >
                    <h2>Overall Attendance</h2>

                    <p>
                        Total Attendance Records:{" "}
                        <strong>
                            {totalRecords}
                        </strong>
                    </p>

                    <p>
                        Total Present:{" "}
                        <strong>
                            {totalPresent}
                        </strong>
                    </p>

                    <p>
                        Total Absent:{" "}
                        <strong>
                            {totalAbsent}
                        </strong>
                    </p>

                    <p>
                        Overall Percentage:{" "}
                        <strong
                            className={
                                overallPercentage >= 75
                                    ? "attendance-good"
                                    : "attendance-low"
                            }
                        >
                            {overallPercentage}%
                        </strong>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Reports;
