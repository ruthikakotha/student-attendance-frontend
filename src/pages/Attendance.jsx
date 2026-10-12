import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
    getAttendance,
    getAttendanceSession,
    getStudents,
    addAttendance,
    updateAttendance,
    saveAttendanceSession
} from "../services/api";

const emptyDetails = {
    date: "",
    subject: "",
    department: "",
    year: "",
    section: "",
    startTime: "",
    endTime: ""
};

const normalized = (value) => String(value ?? "").trim().toLowerCase();

const uniqueValues = (values) => {
    const seen = new Set();
    return values
        .filter((value) => value !== null && value !== undefined && String(value).trim())
        .filter((value) => {
            const key = normalized(value);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((left, right) => String(left).localeCompare(String(right)));
};

function Attendance() {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [details, setDetails] = useState(emptyDetails);
    const [loadedSession, setLoadedSession] = useState(null);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [legacyRecordsAvailable, setLegacyRecordsAvailable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSession, setLoadingSession] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadData = async () => {
        try {
            const [studentData, attendanceData] = await Promise.all([
                getStudents(),
                getAttendance()
            ]);
            setStudents(studentData);
            setAttendance(attendanceData);
            setError("");
        } catch (loadError) {
            console.error("Error loading attendance data:", loadError);
            setError("Unable to load students and attendance. Check the server connection and retry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        Promise.all([getStudents(), getAttendance()])
            .then(([studentData, attendanceData]) => {
                if (cancelled) return;
                setStudents(studentData);
                setAttendance(attendanceData);
            })
            .catch((loadError) => {
                if (cancelled) return;
                console.error("Error loading attendance data:", loadError);
                setError("Unable to load students and attendance. Check the server connection and retry.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const departments = useMemo(
        () => uniqueValues(students.map((student) => student.department)),
        [students]
    );
    const years = useMemo(
        () => uniqueValues(students.map((student) => student.year)),
        [students]
    );
    const sections = useMemo(
        () => uniqueValues(students.map((student) => student.section)),
        [students]
    );
    const subjectOptions = useMemo(
        () => uniqueValues(attendance.map((record) => record.subject)),
        [attendance]
    );

    const matchingStudents = useMemo(
        () => students.filter((student) =>
            normalized(student.department) === normalized(details.department)
            && normalized(student.year) === normalized(details.year)
            && normalized(student.section) === normalized(details.section)
        ),
        [students, details.department, details.year, details.section]
    );

    const updateDetail = (field, value) => {
        setDetails((current) => ({ ...current, [field]: value }));
        setLoadedSession(null);
        setAttendanceRows([]);
        setLegacyRecordsAvailable([]);
        setNotice("");
    };

    const validateDetails = () => {
        if (Object.values(details).some((value) => !String(value).trim())) {
            return "Complete all class session details.";
        }
        if (details.endTime <= details.startTime) {
            return "End time must be later than start time.";
        }
        return "";
    };

    const handleLoadStudents = async (event) => {
        event.preventDefault();
        setNotice("");
        const validationError = validateDetails();
        if (validationError) {
            setError(validationError);
            return;
        }
        if (matchingStudents.length === 0) {
            setError("No registered students match this department, year, and section.");
            setLoadedSession(null);
            setAttendanceRows([]);
            return;
        }

        setError("");
        setLegacyRecordsAvailable([]);
        setLoadingSession(true);
        try {
            const existingRecords = await getAttendanceSession(details);
            if (existingRecords.length === 0) {
                const oldRecords = attendance.filter((record) =>
                    record.date === details.date
                    && normalized(record.subject) === normalized(details.subject)
                    && !record.sessionKey
                    && matchingStudents.some((student) =>
                        Number(student.id) === Number(record.studentId)
                    )
                );
                if (oldRecords.length > 0) {
                    setLegacyRecordsAvailable(oldRecords);
                    setNotice("Older attendance exists for this date and subject, but it has no saved section or time. Load it explicitly to edit its original records.");
                    setLoadedSession(null);
                    setAttendanceRows([]);
                    return;
                }
            }
            const recordsByStudent = new Map(
                existingRecords.map((record) => [Number(record.studentId), record])
            );
            const rows = matchingStudents.map((student) => {
                const record = recordsByStudent.get(Number(student.id));
                return {
                    studentId: student.id,
                    rollNo: student.rollNo,
                    name: student.name,
                    status: record?.status || "Present",
                    attendanceId: record?.id || null
                };
            });
            setAttendanceRows(rows);
            setLegacyRecordsAvailable([]);
            setLoadedSession({ ...details, existing: existingRecords.length > 0 });
            setNotice(existingRecords.length > 0
                ? "Saved session loaded. You can review or update its attendance."
                : "Students loaded. Choose a status for each student and save the session.");
        } catch (loadError) {
            console.error("Error loading class session:", loadError);
            setError("Unable to load this class session. Check the server connection and retry.");
        } finally {
            setLoadingSession(false);
        }
    };

    const handleLoadLegacyRecords = () => {
        const recordsByStudent = new Map(
            legacyRecordsAvailable.map((record) => [Number(record.studentId), record])
        );
        const rows = matchingStudents.map((student) => {
            const record = recordsByStudent.get(Number(student.id));
            return {
                studentId: student.id,
                rollNo: student.rollNo,
                name: student.name,
                status: record?.status || "Present",
                attendanceId: record?.id || null
            };
        });
        setAttendanceRows(rows);
        setLoadedSession({
            date: details.date,
            subject: details.subject.trim(),
            existing: true,
            legacy: true
        });
        setLegacyRecordsAvailable([]);
        setNotice("Older date-and-subject attendance loaded. Class and time details were not recorded for these entries.");
    };

    const handleStartNewSession = () => {
        setAttendanceRows(matchingStudents.map((student) => ({
            studentId: student.id,
            rollNo: student.rollNo,
            name: student.name,
            status: "Present",
            attendanceId: null
        })));
        setLoadedSession({ ...details, existing: false, legacy: false });
        setLegacyRecordsAvailable([]);
        setNotice("A separate time-based session is ready. Older date-and-subject records will remain unchanged.");
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceRows((rows) => rows.map((row) =>
            Number(row.studentId) === Number(studentId) ? { ...row, status } : row
        ));
    };

    const handleSaveAttendance = async () => {
        if (!loadedSession || attendanceRows.length === 0) return;
        setSaving(true);
        setError("");
        setNotice("");
        try {
            if (loadedSession.legacy) {
                const savedRecords = [];
                for (const row of attendanceRows) {
                    const recordData = {
                        studentId: Number(row.studentId),
                        date: loadedSession.date,
                        subject: loadedSession.subject,
                        status: row.status
                    };
                    const saved = row.attendanceId
                        ? await updateAttendance(row.attendanceId, recordData)
                        : await addAttendance(recordData);
                    savedRecords.push(saved);
                }
                setAttendanceRows((rows) => rows.map((row) => {
                    const saved = savedRecords.find((record) =>
                        Number(record.studentId) === Number(row.studentId)
                    );
                    return saved ? { ...row, attendanceId: saved.id, status: saved.status } : row;
                }));
                setAttendance((current) => {
                    const replacedIds = new Set(savedRecords.map((record) => Number(record.id)));
                    return [
                        ...current.filter((record) => !replacedIds.has(Number(record.id))),
                        ...savedRecords
                    ];
                });
                setLoadedSession((current) => ({ ...current, existing: true }));
                setNotice("Older attendance updated. Its original records remain without section or time metadata.");
                return;
            }

            const savedRecords = await saveAttendanceSession({
                ...loadedSession,
                students: attendanceRows.map(({ studentId, status }) => ({
                    studentId: Number(studentId),
                    status
                }))
            });
            const savedByStudent = new Map(
                savedRecords.map((record) => [Number(record.studentId), record])
            );
            setAttendanceRows((rows) => rows.map((row) => ({
                ...row,
                status: savedByStudent.get(Number(row.studentId))?.status || row.status
            })));
            setLoadedSession((current) => ({ ...current, existing: true }));
            setAttendance((current) => {
                const replacedIds = new Set(savedRecords.map((record) => Number(record.id)));
                return [
                    ...current.filter((record) => !replacedIds.has(Number(record.id))),
                    ...savedRecords
                ];
            });
            setNotice("Attendance saved successfully.");
        } catch (saveError) {
            console.error("Error saving attendance session:", saveError);
            setError(saveError.message || "Unable to save attendance. Please retry.");
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        setDetails(emptyDetails);
        setLoadedSession(null);
        setAttendanceRows([]);
        setLegacyRecordsAvailable([]);
        setError("");
        setNotice("");
    };

    const fields = [
        { key: "date", label: "Date", type: "date" },
        { key: "subject", label: "Subject", type: "text" },
        { key: "department", label: "Department", type: "select", options: departments },
        { key: "year", label: "Year", type: "select", options: years },
        { key: "section", label: "Section", type: "select", options: sections },
        { key: "startTime", label: "Start Time", type: "time" },
        { key: "endTime", label: "End Time", type: "time" }
    ];

    return (
        <>
            <Navbar />
            <main className="page attendance-page">
                <div className="page-heading">
                    <div>
                        <h1>Attendance Management</h1>
                        <p className="dashboard-welcome">Create, reopen, and update attendance for a specific class session.</p>
                    </div>
                </div>

                {error && (
                    <div className="dashboard-card attendance-message attendance-error" role="alert">
                        <span>{error}</span>
                        {!students.length && !loading && (
                            <button type="button" className="secondary-button" onClick={() => {
                                setLoading(true);
                                loadData();
                            }}>Retry</button>
                        )}
                    </div>
                )}
                {notice && <div className="attendance-message attendance-notice" role="status">{notice}</div>}

                {legacyRecordsAvailable.length > 0 && (
                    <div className="dashboard-card attendance-message attendance-legacy-message" role="note">
                        <div>
                            <strong>Older date-and-subject attendance found</strong>
                            <p>These saved records do not contain section or time details. Load them as legacy records to edit them without assigning new session details.</p>
                        </div>
                        <button type="button" className="secondary-button" onClick={handleLoadLegacyRecords}>
                            Load older attendance
                        </button>
                        <button type="button" className="primary-button" onClick={handleStartNewSession}>
                            Start a new time session
                        </button>
                    </div>
                )}

                <section className="dashboard-card attendance-session-card" aria-labelledby="session-details-title">
                    <div className="panel-heading">
                        <div>
                            <h2 id="session-details-title">Class Session Details</h2>
                            <p>Choose the class and time slot for this attendance session.</p>
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading class options…</p>
                    ) : (
                        <form onSubmit={handleLoadStudents}>
                            <div className="session-fields">
                                {fields.map((field) => (
                                    <label className="session-field" key={field.key}>
                                        <span>{field.label}</span>
                                        {field.type === "select" ? (
                                            <select
                                                value={details[field.key]}
                                                onChange={(event) => updateDetail(field.key, event.target.value)}
                                                required
                                            >
                                                <option value="">Select {field.label.toLowerCase()}</option>
                                                {field.options.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={details[field.key]}
                                                onChange={(event) => updateDetail(field.key, event.target.value)}
                                                placeholder={field.key === "subject" ? "Enter subject" : undefined}
                                                list={field.key === "subject" ? "attendance-subject-options" : undefined}
                                                required
                                            />
                                        )}
                                    </label>
                                ))}
                            </div>
                            <datalist id="attendance-subject-options">
                                {subjectOptions.map((item) => <option key={item} value={item} />)}
                            </datalist>
                            <div className="session-actions">
                                <button className="primary-button" type="submit" disabled={loadingSession || loading}>
                                    {loadingSession ? "Loading…" : "Load Students"}
                                </button>
                                <button className="secondary-button" type="button" onClick={handleClear}>
                                    Clear
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {loadedSession && (
                    <section className="dashboard-card mark-attendance-card" aria-labelledby="mark-attendance-title">
                        <div className="panel-heading">
                            <div>
                                <h2 id="mark-attendance-title">Mark Attendance</h2>
                                <p>{loadedSession.existing ? "Review or update the saved class session." : "Set each student's attendance status."}</p>
                            </div>
                            <span className={`session-state ${loadedSession.legacy ? "session-legacy" : loadedSession.existing ? "session-saved" : "session-new"}`}>
                                {loadedSession.legacy ? "Legacy records" : loadedSession.existing ? "Saved session" : "New session"}
                            </span>
                        </div>

                        {loadedSession.legacy ? (
                            <div className="session-summary" aria-label="Legacy attendance details">
                                <span><small>Date</small><strong>{loadedSession.date}</strong></span>
                                <span><small>Subject</small><strong>{loadedSession.subject}</strong></span>
                                <p className="legacy-session-note">Section and time were not recorded for these older attendance entries.</p>
                            </div>
                        ) : (
                            <div className="session-summary" aria-label="Selected class session">
                                <span><small>Date</small><strong>{loadedSession.date}</strong></span>
                                <span><small>Subject</small><strong>{loadedSession.subject}</strong></span>
                                <span><small>Department</small><strong>{loadedSession.department}</strong></span>
                                <span><small>Year / Section</small><strong>{loadedSession.year} / {loadedSession.section}</strong></span>
                                <span><small>Time</small><strong>{loadedSession.startTime}–{loadedSession.endTime}</strong></span>
                            </div>
                        )}

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Roll Number</th>
                                        <th>Student Name</th>
                                        <th>Attendance Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceRows.map((row) => (
                                        <tr key={row.studentId}>
                                            <td>{row.rollNo}</td>
                                            <td>{row.name}</td>
                                            <td>
                                                <div className="attendance-status-toggle" role="group" aria-label={`Attendance status for ${row.name}`}>
                                                    <button
                                                        type="button"
                                                        className={`status-choice status-present ${row.status === "Present" ? "selected" : ""}`}
                                                        aria-pressed={row.status === "Present"}
                                                        onClick={() => handleStatusChange(row.studentId, "Present")}
                                                    >Present</button>
                                                    <button
                                                        type="button"
                                                        className={`status-choice status-absent ${row.status === "Absent" ? "selected" : ""}`}
                                                        aria-pressed={row.status === "Absent"}
                                                        onClick={() => handleStatusChange(row.studentId, "Absent")}
                                                    >Absent</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="session-actions session-save-actions">
                            <button className="primary-button" type="button" onClick={handleSaveAttendance} disabled={saving || attendanceRows.length === 0}>
                                {saving ? "Saving…" : loadedSession.legacy ? "Update Older Attendance" : loadedSession.existing ? "Update Attendance" : "Save Attendance"}
                            </button>
                            <span className="muted-copy">{attendanceRows.length} matching student{attendanceRows.length === 1 ? "" : "s"}</span>
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}

export default Attendance;
