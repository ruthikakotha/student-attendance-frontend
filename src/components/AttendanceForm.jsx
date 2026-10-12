import { useState } from "react";

function AttendanceForm({ students, onAdd }) {
    const [studentId, setStudentId] = useState("");
    const [date, setDate] = useState("");
    const [subject, setSubject] = useState("");
    const [status, setStatus] = useState("Present");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!studentId) {
            alert("Please select a student.");
            return;
        }

        await onAdd({
            studentId: Number(studentId),
            date: date,
            subject: subject,
            status: status
        });

        setStudentId("");
        setDate("");
        setSubject("");
        setStatus("Present");
    };

    return (
        <form onSubmit={handleSubmit} className="attendance-form">

            <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
            >
                <option value="">
                    Select Student
                </option>

                {students.map((student) => (
                    <option
                        key={student.id}
                        value={student.id}
                    >
                        {student.rollNo} - {student.name}
                    </option>
                ))}
            </select>

            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
            />

            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="Present">
                    Present
                </option>

                <option value="Absent">
                    Absent
                </option>
            </select>

            <button type="submit">
                Add Attendance
            </button>

        </form>
    );
}

export default AttendanceForm;