import React, { useState, useEffect } from 'react';
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

    // To hold the new task data OR the task being edited
    const [currentTask, setCurrentTask] = useState({
        title: '',
        isCompleted: false,
        streak: 0,
        progress: 0,
        dueDate: '',
    });

    // Track whether popup is for editing or adding new
    const [isEditing, setIsEditing] = useState(false);

    // Fetch all tasks
    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/tasks');
            const normalized = response.data.map(task => ({
                ...task,
                _id: task.id, // ensure _id is available
            }));
            setTasks(normalized);
        } catch (err) {
            setError('Failed to fetch tasks.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTasks();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const togglePopup = () => setShowPopup(prev => !prev);

    // Open popup for adding new task
    const openAddPopup = () => {
        setIsEditing(false);
        setCurrentTask({
            title: '',
            isCompleted: false,
            streak: 0,
            progress: 0,
            dueDate: '',
        });
        togglePopup();
    };

    // Open popup for editing existing task
    const openEditPopup = (task) => {
        setIsEditing(true);
        setActiveView(task.type === 'daily' ? 'dailies' : task.type === 'goal' ? 'goals' : 'todo');
        setCurrentTask({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '',
            streak: task.streak ?? 0,
            progress: task.progress ?? 0,
        });
        togglePopup();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Normalize payload
        const payload = {
            ...currentTask,
            type: activeView === 'dailies' ? 'daily' : activeView === 'goals' ? 'goal' : 'todo',
            dueDate: currentTask.dueDate ? new Date(currentTask.dueDate) : new Date(),
            streak: activeView === 'dailies' ? Number(currentTask.streak) : null,
            progress: activeView === 'goals' ? Number(currentTask.progress) : null,
        };

        try {
            if (isEditing) {
                // PUT update existing
                await axios.put(`/tasks/${currentTask._id}`, payload);
            } else {
                // POST new
                await axios.post('/tasks', payload);
            }
            togglePopup();
            setCurrentTask({
                title: '',
                isCompleted: false,
                streak: 0,
                progress: 0,
                dueDate: '',
            });
            await fetchTasks();
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await axios.delete(`/tasks/${taskId}`);
            await fetchTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    // Filter tasks by type
    const filteredTasks = {
        todo: tasks.filter(task => task.type === 'todo'),
        daily: tasks.filter(task => task.type === 'daily'),
        goal: tasks.filter(task => task.type === 'goal'),
    };

    // Render task cards with Edit/Delete buttons
    const renderTasksWithControls = (tasksArray) =>
        tasksArray.map(task => (
            <div key={task._id} className="task-card">
                <h5>{task.title}</h5>
                {activeView === 'dailies' && <p>Streak: {task.streak}</p>}
                {activeView === 'goals' && <p>Progress: {task.progress}%</p>}
                <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                <p>Status: {task.isCompleted ? 'Completed' : 'Pending'}</p>
                <Button variant="outline-primary" size="sm" onClick={() => openEditPopup(task)}>
                    ✏️ Edit
                </Button>{' '}
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(task._id)}>
                    🗑️ Delete
                </Button>
            </div>
        ));

    return (
        <div className="dashboard-container">
            <header className="topbar">
                <h3 className="logo">NovaPlanner</h3>
                <nav className="top-nav-links">
                    <button onClick={() => setActiveView('todo')} className={activeView === 'todo' ? 'active' : ''}>
                        📋 To-Do
                    </button>
                    <button onClick={() => setActiveView('dailies')} className={activeView === 'dailies' ? 'active' : ''}>
                        📅 Dailies
                    </button>
                    <button onClick={() => setActiveView('goals')} className={activeView === 'goals' ? 'active' : ''}>
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
                    <Button variant="success" onClick={openAddPopup}>
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

                    {!loading && !error && activeView === 'todo' && renderTasksWithControls(filteredTasks.todo)}
                    {!loading && !error && activeView === 'dailies' && renderTasksWithControls(filteredTasks.daily)}
                    {!loading && !error && activeView === 'goals' && renderTasksWithControls(filteredTasks.goal)}
                </div>
            </main>

            {/* Popup Modal */}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <button className="popup-close" onClick={togglePopup}>✖</button>
                        <h4 className="mb-3">{isEditing ? 'Edit Task' : 'Add New Task'}</h4>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={currentTask.title}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Due Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dueDate"
                                    value={currentTask.dueDate}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {activeView === 'dailies' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Streak</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="streak"
                                        value={currentTask.streak}
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
                                        value={currentTask.progress}
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
                                    checked={currentTask.isCompleted}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Button type="submit" variant="primary" className="w-100">
                                {isEditing ? 'Save Changes' : 'Add Task'}
                            </Button>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
