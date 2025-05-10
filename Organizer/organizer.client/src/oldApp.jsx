import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Assuming Dashboard is in the correct path

function App() {
    const [taskLists, setTaskLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); // Check if token exists
    const userId = "sampleUserId"; // Replace this later with auth context

    useEffect(() => {
        if (isLoggedIn) {
            setLoading(true);
            fetch("/api/tasklists")
                .then((res) => res.json())
                .then((data) => {
                    setTaskLists(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching task lists:", error);
                    setLoading(false);
                });
        }
    }, [isLoggedIn]);

    const addTask = async (listId, title) => {
        if (!title) return;

        const newTask = {
            title,
            userId,
            isCompleted: false,
            dueDate: new Date(),
            listId
        };

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });

            if (!res.ok) throw new Error("Failed to add task");

            const createdTask = await res.json();

            setTaskLists(prevLists =>
                prevLists.map(list =>
                    list.id === listId
                        ? { ...list, tasks: [...list.tasks, createdTask] }
                        : list
                )
            );
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const toggleTaskCompletion = async (taskId, currentStatus, listId) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted: !currentStatus }),
            });

            if (!res.ok) throw new Error("Failed to update task");

            const updatedTask = await res.json();

            setTaskLists(prevLists =>
                prevLists.map(list =>
                    list.id === listId
                        ? {
                            ...list,
                            tasks: list.tasks.map(task =>
                                task.id === taskId ? updatedTask : task
                            )
                        }
                        : list
                )
            );
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleLogin = () => {
        setIsLoggedIn(true); // Update state when the user logs in
    };

    return (
        <Router>
            <Routes>
                {/* If logged in, redirect to Dashboard; otherwise, show Login */}
                <Route
                    path="/"
                    element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
                />
                {/* Dashboard route */}
                <Route
                    path="/dashboard"
                    element={
                        isLoggedIn ? (
                            <div style={{ padding: "2rem" }}>
                                <h1>Task Organizer</h1>
                                {loading ? (
                                    <p>Loading task lists...</p>
                                ) : (
                                    <Dashboard
                                        taskLists={taskLists}
                                        addTask={addTask}
                                        toggleTaskCompletion={toggleTaskCompletion}
                                    />
                                )}
                            </div>
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
