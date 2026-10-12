const API_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "https://student-attendance-production-3786.up.railway.app/api"
).replace(/\/+$/, "");

const getHeaders = (json = false) => {
    const token = sessionStorage.getItem("token");

    return {
        ...(json ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

// STUDENTS
export const getStudents = async () => {
    const response = await fetch(`${API_URL}/students`, {
        headers: getHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch students");
    return response.json();
};

export const addStudent = async (student) => {
    const response = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(student)
    });

    if (!response.ok) throw new Error("Failed to add student");
    return response.json();
};

export const updateStudent = async (id, student) => {
    const response = await fetch(`${API_URL}/students/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(student)
    });

    if (!response.ok) throw new Error("Failed to update student");
    return response.json();
};

export const deleteStudent = async (id) => {
    const response = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });

    if (!response.ok) throw new Error("Failed to delete student");
};

// ATTENDANCE
export const getAttendance = async () => {
    const response = await fetch(`${API_URL}/attendance`, {
        headers: getHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch attendance");
    return response.json();
};

export const getAttendanceByDateAndSubject = async (date, subject) => {
    const params = new URLSearchParams({ date, subject });

    const response = await fetch(
        `${API_URL}/attendance/date-subject?${params}`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch attendance for selected date and subject");
    }

    return response.json();
};

export const getAttendanceSession = async (session) => {
    const params = new URLSearchParams({
        date: session.date,
        subject: session.subject,
        department: session.department,
        year: session.year,
        section: session.section,
        startTime: session.startTime,
        endTime: session.endTime
    });

    const response = await fetch(
        `${API_URL}/attendance/session?${params}`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        throw new Error("Failed to load the selected class session");
    }

    return response.json();
};

export const saveAttendanceSession = async (session) => {
    const response = await fetch(`${API_URL}/attendance/session`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(session)
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save attendance session");
    }

    return response.json();
};

export const getAttendanceByStudent = async (studentId) => {
    const response = await fetch(
        `${API_URL}/attendance/student/${studentId}`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch student attendance");
    }

    return response.json();
};

export const addAttendance = async (attendance) => {
    const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(attendance)
    });

    if (!response.ok) throw new Error("Failed to add attendance");
    return response.json();
};

export const updateAttendance = async (id, attendance) => {
    const response = await fetch(`${API_URL}/attendance/${id}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(attendance)
    });

    if (!response.ok) throw new Error("Failed to update attendance");
    return response.json();
};

export const deleteAttendance = async (id) => {
    const response = await fetch(`${API_URL}/attendance/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });

    if (!response.ok) throw new Error("Failed to delete attendance");
};