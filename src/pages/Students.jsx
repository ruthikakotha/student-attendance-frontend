import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StudentForm from "../components/StudentForm";
import {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent
} from "../services/api";

function Students() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [editForm, setEditForm] = useState({
        rollNo: "",
        name: "",
        department: "",
        year: "",
        section: ""
    });

    const loadStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Error loading students:", error);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleAddStudent = async (student) => {
        try {
            await addStudent(student);
            await loadStudents();
        } catch (error) {
            console.error("Error adding student:", error);
            alert("Unable to add student.");
        }
    };

    const handleDeleteStudent = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteStudent(id);
            await loadStudents();
        } catch (error) {
            console.error("Error deleting student:", error);
            alert("Unable to delete student.");
        }
    };

    const startEditing = (student) => {
        setEditingId(student.id);

        setEditForm({
            rollNo: student.rollNo || "",
            name: student.name || "",
            department: student.department || "",
            year: student.year || "",
            section: student.section || ""
        });
    };

    const cancelEditing = () => {
        setEditingId(null);

        setEditForm({
            rollNo: "",
            name: "",
            department: "",
            year: "",
            section: ""
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleUpdateStudent = async (id) => {
        if (
            !editForm.rollNo ||
            !editForm.name ||
            !editForm.department ||
            !editForm.year ||
            !editForm.section
        ) {
            alert("Please fill all student details.");
            return;
        }

        try {
            await updateStudent(id, editForm);

            setEditingId(null);

            await loadStudents();
        } catch (error) {
            console.error("Error updating student:", error);
            alert("Unable to update student.");
        }
    };

    const filteredStudents = students.filter((student) => {
        const searchText = search.toLowerCase();

        return (
            student.name?.toLowerCase().includes(searchText) ||
            student.rollNo?.toLowerCase().includes(searchText) ||
            student.department?.toLowerCase().includes(searchText) ||
            student.year?.toLowerCase().includes(searchText) ||
            student.section?.toLowerCase().includes(searchText)
        );
    });

    return (
        <>
            <Navbar />

            <div className="page">
                <h1>Students</h1>

                <StudentForm onAdd={handleAddStudent} />

                {/* Search */}
                <div className="student-search">
                    <input
                        type="text"
                        placeholder="Search by name, roll number, department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Section</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>

                                        {editingId === student.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="rollNo"
                                                        value={editForm.rollNo}
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={editForm.name}
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type="text"
                                                        name="department"
                                                        value={
                                                            editForm.department
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type="text"
                                                        name="year"
                                                        value={editForm.year}
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type="text"
                                                        name="section"
                                                        value={
                                                            editForm.section
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="save-button"
                                                            onClick={() =>
                                                                handleUpdateStudent(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="cancel-button"
                                                            onClick={
                                                                cancelEditing
                                                            }
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{student.rollNo}</td>
                                                <td>{student.name}</td>
                                                <td>{student.department}</td>
                                                <td>{student.year}</td>
                                                <td>{student.section}</td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="edit-button"
                                                            onClick={() =>
                                                                startEditing(
                                                                    student
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDeleteStudent(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Students;