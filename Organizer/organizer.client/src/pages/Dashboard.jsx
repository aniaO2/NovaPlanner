import React, { useState} from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../api/AxiosInstance';

import ToDoPage from './ToDoPage';
import DailiesPage from './DailiesPage';
import GoalsPage from './GoalsPage';

import '../styles/Dashboard.css';
import '../styles/TaskPopup.css';

const Dashboard = () => {
    const [activeView, setActiveView] = useState('todo');
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newTask, setNewTask] = useState({
        title: '',
        isCompleted: false,
        streak: 0,
        progress: 0,
        dueDate: '',
    });

    // Fetch all tasks on mount and whenever tasks change
    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/tasks'); // Assumes this returns all tasks
            setTasks(response.data);
        } catch (err) {
            setError('Failed to fetch tasks.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTasks();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const togglePopup = () => setShowPopup(prev => !prev);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...newTask,
            type: activeView === 'dailies' ? 'daily' : 'goal', 
            dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(),
            streak: activeView === 'dailies' ? Number(newTask.streak) : null,
            progress: activeView === 'goals' ? Number(newTask.progress) : null,
        };

        try {
            await axios.post('/tasks', payload);
            togglePopup();
            setNewTask({
                title: '',
                isCompleted: false,
                streak: 0,
                progress: 0,
                dueDate: '',
            });
            await fetchTasks(); // Re-fetch tasks to update state without reload
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    // Filter tasks by type for passing to children
    const filteredTasks = {
        todo: tasks.filter(task => task.type === 'todo'),
        daily: tasks.filter(task => task.type === 'daily'),
        goal: tasks.filter(task => task.type === 'goal'),
    };

    return (
        <div className="dashboard-container">
            <header className="topbar">
                <h3 className="logo">NovaPlanner</h3>
                <nav className="top-nav-links">
                    <button
                        onClick={() => setActiveView('todo')}
                        className={activeView === 'todo' ? 'active' : ''}
                    >
                        📋 To-Do
                    </button>
                    <button
                        onClick={() => setActiveView('dailies')}
                        className={activeView === 'dailies' ? 'active' : ''}
                    >
                        📅 Dailies
                    </button>
                    <button
                        onClick={() => setActiveView('goals')}
                        className={activeView === 'goals' ? 'active' : ''}
                    >
                        🎯 Goals
                    </button>
                </nav>
                <Button variant="outline-danger" onClick={handleLogout} className="logout-btn">
                    🔓
                </Button>
            </header>

            <main className="main-content">
                <div className="header">
                    <h2>
                        {activeView === 'todo'
                            ? 'To-Do Tasks'
                            : activeView === 'dailies'
                                ? 'Dailies'
                                : 'Goals'}
                    </h2>
                    <Button variant="success" onClick={togglePopup}>
                        ➕ New Task
                    </Button>
                </div>

                <div className="task-columns">
                    {loading && (
                        <div className="d-flex justify-content-center my-4">
                            <Spinner animation="border" />
                        </div>
                    )}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {!loading && !error && activeView === 'todo' && (
                        <ToDoPage tasks={filteredTasks.todo} />
                    )}
                    {!loading && !error && activeView === 'dailies' && (
                        <DailiesPage tasks={filteredTasks.daily} />
                    )}
                    {!loading && !error && activeView === 'goals' && (
                        <GoalsPage tasks={filteredTasks.goal} />
                    )}
                </div>
            </main>

            {/* Popup Modal */}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <button className="popup-close" onClick={togglePopup}>
                            ✖
                        </button>
                        <h4 className="mb-3">Add New Task</h4>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={newTask.title}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Due Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dueDate"
                                    value={newTask.dueDate}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {activeView === 'dailies' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Streak</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="streak"
                                        value={newTask.streak}
                                        min={0}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}

                            {activeView === 'goals' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Progress (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="progress"
                                        value={newTask.progress}
                                        min={0}
                                        max={100}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Completed"
                                    name="isCompleted"
                                    checked={newTask.isCompleted}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Button type="submit" variant="primary" className="w-100">
                                Add Task
                            </Button>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
