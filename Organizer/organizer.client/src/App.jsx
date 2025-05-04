import React, { useState, useEffect } from 'react';

function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");

    useEffect(() => {
        fetch("/api/tasks")
            .then(res => res.json())
            .then(setTasks);
    }, []);

    const addTask = async () => {
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        });
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
        setTitle("");
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h1>To-Do List</h1>
            <input value={title} onChange={e => setTitle(e.target.value)} />
            <button onClick={addTask}>Add</button>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>{task.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
