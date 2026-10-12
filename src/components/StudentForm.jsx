import { useState } from "react";

function StudentForm({ onAdd }) {
    const [rollNo, setRollNo] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [section, setSection] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        await onAdd({
            rollNo,
            name,
            department,
            year,
            section
        });

        setRollNo("");
        setName("");
        setDepartment("");
        setYear("");
        setSection("");
    };

    return (
        <form onSubmit={handleSubmit} className="form-card">
            <input
                type="text"
                placeholder="Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                required
            />

            <button type="submit">
                Add Student
            </button>
        </form>
    );
}

export default StudentForm;