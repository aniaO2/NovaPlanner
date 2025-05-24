import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../api/AxiosInstance';

import ToDoPage from './ToDoPage';
import HabitsPage from './HabitsPage';
import GoalsPage from './GoalsPage';

import '../styles/Dashboard.css';
import '../styles/TaskPopup.css';

const Dashboard = () => {
    const [activeView, setActiveView] = useState('dailies');
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentTask, setCurrentTask] = useState({
        title: '',
        isCompleted: false,
        streak: 0,
        progress: 0,
        dueDate: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date()); 

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/tasks');
            const normalized = response.data.map(task => ({
                ...task,
                _id: task.id,
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
    const toggleMenu = () => setMenuOpen(prev => !prev);

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

    const openEditPopup = (task) => {
        setIsEditing(true);
        setActiveView(
            task.type === 'habit'
                ? 'habits'
                : task.type === 'goal'
                    ? 'goals'
                    : task.type === 'daily'
                        ? 'dailies'
                        : 'todo'
        );
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

        const payload = {
            ...currentTask,
            type:
                activeView === 'habits' ? 'habit' :
                activeView === 'goals' ? 'goal' :
                activeView === 'dailies' ? 'daily' :
                'todo',
            dueDate: currentTask.dueDate ? new Date(currentTask.dueDate) : new Date(),
            streak: activeView === 'habits' ? Number(currentTask.streak) : null,
            progress: activeView === 'goals' ? Number(currentTask.progress) : null,
        };

        try {
            if (isEditing) {
                await axios.put(`/tasks/${currentTask._id}`, payload);
            } else {
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

    const filteredTasks = {
        todo: tasks.filter(task => task.type === 'todo'),
        dailies: tasks.filter(task =>
            task.type === 'daily' &&
            new Date(task.dueDate).toDateString() === selectedDate.toDateString()
        ),
        habit: tasks.filter(task => task.type === 'habit'),
        goal: tasks.filter(task => task.type === 'goal'),
    };


    const renderTasksWithControls = (tasksArray) =>
        tasksArray.map(task => (
            <div key={task._id} className="task-card">
                <h5>{task.title}</h5>
                {activeView === 'habits' && <p>Streak: {task.streak}</p>}
                {activeView === 'goals' && <p>Progress: {task.progress}%</p>}
                <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                <p>Status: {task.isCompleted ? 'Completed' : 'Pending'}</p>
                <div className="actions">
                    <Button variant="outline-primary" size="sm" onClick={() => openEditPopup(task)}>
                        ✏️ Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(task._id)}>
                        🗑️ Delete
                    </Button>
                </div>
            </div>
        ));

    return (
        <div className="dashboard-container">
            <header className="topbar">
                <h3 className="logo">NovaPlanner</h3>
                <nav className="top-nav-links">
                    <button onClick={() => setActiveView('dailies')} className={activeView === 'dailies' ? 'active' : ''}>
                        🌞 My day
                    </button>
                    <button onClick={() => setActiveView('todo')} className={activeView === 'todo' ? 'active' : ''}>
                        📋 To-Do
                    </button>
                    <button onClick={() => setActiveView('habits')} className={activeView === 'habits' ? 'active' : ''}>
                        📅 Habits
                    </button>
                    <button onClick={() => setActiveView('goals')} className={activeView === 'goals' ? 'active' : ''}>
                        🎯 Goals
                    </button>
                </nav>

                {/* Hamburger Menu */}
                <div className="hamburger-container">
                    <button className="hamburger-icon" onClick={toggleMenu}>☰</button>
                    {menuOpen && (
                        <div className="hamburger-menu">
                            <Button variant="outline-secondary" size="sm" className="menu-btn">⚙️ Settings</Button>
                            <Button variant="outline-danger" size="sm" className="menu-btn" onClick={handleLogout}>
                                🔓 Logout
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            <main className="main-content">
                <div className="header d-flex justify-content-between align-items-center">
                    <h2>
                        {activeView === 'todo'
                            ? 'To-Do Tasks'
                            : activeView === 'dailies'
                                ? "Today's Tasks"
                                : activeView === 'habits'
                                    ? 'Habits'
                                    : 'Goals'}
                    </h2>

                    <div className="d-flex align-items-center gap-2">
                        {activeView === 'dailies' && (
                            <input
                                type="date"
                                value={selectedDate.toISOString().substring(0, 10)}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="form-control"
                                style={{ width: 'auto' }}
                            />
                        )}
                        <Button variant="success" onClick={openAddPopup}>➕ New Task</Button>
                    </div>
                </div>


                <div className="task-columns">
                    {loading && (
                        <div className="d-flex  my-4">
                            <Spinner animation="border" />
                        </div>
                    )}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {!loading && !error && activeView === 'todo' && renderTasksWithControls(filteredTasks.todo)}
                    {!loading && !error && activeView === 'dailies' && renderTasksWithControls(filteredTasks.dailies)}
                    {!loading && !error && activeView === 'habits' && renderTasksWithControls(filteredTasks.habit)}
                    {!loading && !error && activeView === 'goals' && renderTasksWithControls(filteredTasks.goal)}
            </div>
            </main>

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

                            {activeView === 'habits' && (
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
