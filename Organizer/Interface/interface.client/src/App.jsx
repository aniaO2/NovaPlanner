import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        const response = await fetch('/tasks'); // Endpoint API pentru task-uri
        const data = await response.json();
        setTasks(data);
    }

    async function addTask() {
        if (!newTask.trim()) return;
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTask })
        });
        if (response.ok) {
            fetchTasks(); // Reîncarcă lista după adăugare
            setNewTask('');
        }
    }

    return (
        <div>
            <h1>Task Manager</h1>
            <p>Organizează-ți task-urile eficient.</p>

            <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Adaugă un task..."
            />
            <button onClick={addTask}>Adaugă</button>

            <ul>
                {tasks.map(task => (
                    <li key={task.id}>{task.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
