import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../api/AxiosInstance';

import GoalWithCheckpoints from '../components/GoalWithCheckpoints';
import ToDoList from '../components/ToDoList';

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
        estimatedTime: '',
        dueTime: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [parentGoalId, setParentGoalId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [feedback, setFeedback] = useState(null);

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
        navigate('/', { replace: true });
    };

    const goToSettings = () => {
        navigate('/settings');
    };

    const togglePopup = () => setShowPopup(prev => !prev);
    const toggleMenu = () => setMenuOpen(prev => !prev);

    const openAddPopup = (goalId = null) => {
        setIsEditing(false);
        setParentGoalId(goalId); // goalId is the ID or null
        const today = new Date().toLocaleDateString('en-CA');
        setCurrentTask({
            title: '',
            isCompleted: false,
            streak: 0,
            progress: 0,
            dueDate: today,
            estimatedTime: '',
            dueTime: '',
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
                        : task.type === 'checkpoint'
                            ? 'goals' // associate checkpoints with goals
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
        console.log('parentGoalId:', parentGoalId);
        // For dailies: validate estimated time total does not exceed 24 hours
        if (activeView === 'dailies') {
            const totalEstimatedTime = filteredTasks.dailies
                .filter(t => isEditing ? t._id !== currentTask._id : true)
                .reduce((sum, t) => sum + (t.estimatedTime || 0), 0)
                + Number(currentTask.estimatedTime || 0);

            if (totalEstimatedTime > 24) {
                alert('Total estimated time for dailies exceeds 24 hours.');
                return;
            }
        }
        const payload = {
            ...currentTask,
            type:
                isEditing ? currentTask.type :
                    parentGoalId ? 'checkpoint' :
                        activeView === 'habits' ? 'habit' :
                            activeView === 'goals' ? 'goal' :
                                activeView === 'dailies' ? 'daily' :
                                    'todo',

            dueDate: currentTask.dueDate ? new Date(currentTask.dueDate) : new Date(),
            streak: activeView === 'habits' ? Number(currentTask.streak) : null,
            progress: activeView === 'goals' ? Number(currentTask.progress) : null,
            estimatedTime: activeView === 'dailies' ? Number(currentTask.estimatedTime || 0) : null,
            dueTime: activeView === 'dailies' && currentTask.dueTime ? currentTask.dueTime : null,
            goalId: isEditing ? currentTask.goalId : parentGoalId, // null for non-checkpoints
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
                estimatedTime: '',
                dueTime: '',
            });
            await fetchTasks();
            if (!isEditing && parentGoalId) {
                setParentGoalId(null); // Only reset if we just created a checkpoint
            }
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

    const handleEvaluate = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const todayDailies = tasks.filter(task =>
                task.type === 'daily' &&
                new Date(task.dueDate).toDateString() === selectedDate.toDateString()
            );

            const response = await axios.post('/assistant/evaluate-dailies', {
                userId,
                todayTasks: todayDailies.map(task => ({
                    Title: task.title,
                    EstimatedTime: task.estimatedTime || 0,
                    IsCompleted: !!task.isCompleted
                }))
            });
            setFeedback(response.data);
        } catch (error) {
            console.error('Error evaluating dailies:', error);
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
        checkpoint: tasks.filter(task => task.type === 'checkpoint'),
    };

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
                            <Button variant="outline-secondary" size="sm" className="menu-btn" onClick={goToSettings}>⚙️ Settings</Button>
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
                                value={selectedDate.toLocaleDateString('en-CA')}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="form-control"
                                style={{ width: 'auto' }}
                            />
                        )}
                        <Button variant="success" onClick={() => openAddPopup()}>➕ New Task</Button>
                    </div>
                </div>


                <div>
                    {loading && (
                        <div className="d-flex my-4">
                            <Spinner animation="border" />
                        </div>
                    )}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {!loading && !error && activeView === 'todo' && (
                        <ToDoList tasks={filteredTasks.todo} onEdit={openEditPopup} onDelete={handleDelete} />
                    )}

                    {!loading && !error && activeView === 'dailies' && (
                        <ToDoList tasks={filteredTasks.dailies} onEdit={openEditPopup} onDelete={handleDelete} />
                    )}

                    {!loading && !error && activeView === 'habits' && (
                        <ToDoList tasks={filteredTasks.habit} onEdit={openEditPopup} onDelete={handleDelete} />
                    )}

                    {!loading && !error && activeView === 'goals' && (
                        <div className="task-columns">
                            {filteredTasks.goal.map(goal => {
                                const checkpoints = filteredTasks.checkpoint.filter(cp => cp.goalId === goal._id);
                                return (
                                    <GoalWithCheckpoints
                                        key={goal._id}
                                        goal={goal}
                                        checkpoints={checkpoints}
                                        onEdit={openEditPopup}
                                        onDelete={handleDelete}
                                        onAddCheckpoint={openAddPopup}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

            </main>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <button className="popup-close" onClick={togglePopup}>✖</button>
                        <h4 className="mb-3">{isEditing ? 'Edit Task' : 'Add New Task'}</h4>
                        <Form onSubmit={handleSubmit}>
                            {/* Title - shown for all types */}
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

                            {/* Due Date - only for todo and dailies */}
                            {(activeView === 'todo' || activeView === 'dailies') && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Due Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dueDate"
                                        value={currentTask.dueDate}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}

                            {/* Dailies extra fields */}
                            {activeView === 'dailies' && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estimated Time (hours)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="estimatedTime"
                                            value={currentTask.estimatedTime || ''}
                                            min={0}
                                            max={24}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Due Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="dueTime"
                                            value={currentTask.dueTime || ''}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </>
                            )}

                            {/* Habits - streak only */}
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

                            {/* Goals - progress only */}
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

                            {/* All types get isCompleted checkbox */}
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
            {/* Butonul cu beculeț */}
            <button
                onClick={handleEvaluate}
                title="Evaluate today's plan"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    padding: '10px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    zIndex: 1000,
                }}
            > <i class="bi bi-lightbulb-fill lightbulb"></i>
            </button>

            {/* Feedback asistent */}
            {feedback && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '20px',
                        backgroundColor: '#f9fafb',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        maxWidth: '300px',
                        zIndex: 1000,
                    }}
                >
                    <strong> Your Novassistant:</strong><br /> {feedback}
                </div>
            )}

        </div>
    );
};

export default Dashboard;