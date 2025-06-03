import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
    const feedbackRef = useRef(null);
    const menuRef = useRef(null);
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
            const clickedOutsideFeedback = feedbackRef.current && !feedbackRef.current.contains(event.target);

            if (menuOpen && clickedOutsideMenu) {
                setMenuOpen(false);
            }

            if (feedback && clickedOutsideFeedback) {
                setFeedback(null);
            }
        };

        if (menuOpen || feedback) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen, feedback]);



    const openEditPopup = (task) => {
        setIsEditing(true);
        const newView = task.type === 'habit'
            ? 'habits'
            : task.type === 'goal'
                ? 'goals'
                : task.type === 'daily'
                    ? 'dailies'
                    : task.type === 'checkpoint'
                        ? 'goals'
                        : 'todo';

        if (activeView !== newView) setActiveView(newView);
        console.log(activeView);
        setCurrentTask({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-CA') : '',
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
                .filter(t => (isEditing ? t._id !== currentTask._id : true))
                .reduce((sum, t) => sum + (Number(t.estimatedTime) || 0), 0)
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

    const handleQuickUpdate = async (taskId, updatedFields) => {
        try {
            await axios.put(`/tasks/${taskId}`, updatedFields);
            await fetchTasks();
        } catch (error) {
            console.error('Failed to quick-update task:', error.response?.data || error.message);
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

    return (
        <div className="dashboard-container">
            <header className="topbar">
                <div className="logo-container">
                    <h3 className="logo">NovaPlanner</h3>
                    <img src="../../public/fish.png" alt="Logo Icon" className="logo-icon" />
                </div>
                <nav className="top-nav-links">
                    <button onClick={() => setActiveView('dailies')} className={activeView === 'dailies' ? 'active' : ''}>
                        <i class="bi bi-brightness-high-fill sun"></i> My day
                    </button>
                    <button onClick={() => setActiveView('todo')} className={activeView === 'todo' ? 'active' : ''}>
                        <i class="bi bi-clipboard-check-fill clipboard"></i> To-Do
                    </button>
                    <button onClick={() => setActiveView('habits')} className={activeView === 'habits' ? 'active' : ''}>
                        <i class="bi bi-calendar-week-fill calendar"></i> Habits
                    </button>
                    <button onClick={() => setActiveView('goals')} className={activeView === 'goals' ? 'active' : ''}>
                        <i class="bi bi-bullseye target"></i> Goals
                    </button>
                </nav>

                {/* Hamburger Menu */}
                <div className="hamburger-container" ref={menuRef}>
                    <button className="hamburger-icon" onClick={toggleMenu}><i class="bi bi-list"></i></button>
                    {menuOpen && (
                        <div className="hamburger-menu">
                            <Button variant="outline-secondary" size="sm" className="menu-btn" onClick={goToSettings}><i class="bi bi-file-lock2-fill password"></i> Change password</Button>
                            <Button variant="outline-danger" size="sm" className="menu-btn" onClick={handleLogout}>
                                <i class="bi bi-door-open-fill logout"></i> Logout
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
                        <Button variant="success" className="new-task" onClick={() => openAddPopup()}><i class="bi bi-plus-square-fill add"></i> New Task</Button>
                        {activeView === 'dailies' && (
                            <div className="date-picker-wrapper" style={{ position: "relative", display: "inline-block" }}>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control aero-filter"
                                    calendarClassName="aero-calendar"
                                />
                                <div
                                    className="calendar-icon"
                                    onClick={() => document.querySelector(".react-datepicker__input-container input").focus()}
                                />
                            </div>
                        )}
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
                        <ToDoList tasks={filteredTasks.todo}
                            onEdit={openEditPopup}
                            onDelete={handleDelete}
                            onQuickUpdate={handleQuickUpdate}
                            activeView={activeView}
                        />
                    )}

                    {!loading && !error && activeView === 'dailies' && (
                        <ToDoList
                            tasks={filteredTasks.dailies}
                            onEdit={openEditPopup}
                            onDelete={handleDelete}
                            onQuickUpdate={handleQuickUpdate}
                            activeView={activeView}
                        />
                    )}

                    {!loading && !error && activeView === 'habits' && (
                        <ToDoList tasks={filteredTasks.habit} onEdit={openEditPopup} onDelete={handleDelete} onQuickUpdate={handleQuickUpdate} activeView={activeView} />
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
                                        onQuickUpdate={handleQuickUpdate}
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
                    <div className="popup frutiger-aero-popup">
                        <button className="popup-close" onClick={togglePopup}>✖</button>
                        <h3 className="mb-3">{isEditing ? 'Edit Task' : 'Add New Task'}</h3>
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
                                    className="aero-input"
                                />
                            </Form.Group>

                            {/* Due Date - only for todo and dailies */}
                            {(activeView === 'todo' || activeView === 'dailies') && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Due Date</Form.Label>
                                    <DatePicker
                                        selected={currentTask.dueDate ? new Date(currentTask.dueDate) : null}
                                        onChange={(date) =>
                                            setCurrentTask((prev) => ({
                                                ...prev,
                                                dueDate: date.toLocaleDateString('en-CA'),
                                            }))
                                        }
                                        dateFormat="yyyy-MM-dd"
                                        className="form-control aero-input"
                                        calendarClassName="aero-calendar"
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
                                            className="aero-input"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Due Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="dueTime"
                                            value={currentTask.dueTime || ''}
                                            onChange={handleChange}
                                            className="aero-input"
                                        />
                                    </Form.Group>
                                </>
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
                                        className="aero-input"
                                    />
                                </Form.Group>
                            )}

                            {/* Button */}
                            <Button type="submit" variant="primary" className="w-100">
                                {isEditing ? 'Save Changes' : 'Add Task'}
                            </Button>
                        </Form>
                    </div>
                </div>
            )}

            {/* Nova Assistant Button */}
            <div className="nova-button-container" onClick={handleEvaluate} title="Evaluate today's plan">
                <div className="nova-button">
                    <img src="/nova.png" alt="Nova" className="nova-icon" />
                </div>
                <span className="nova-label">Ask Nova about your daily plan</span>
            </div>

            {/* Feedback bubble */}
            {feedback && (
                <div className="nova-feedback" ref={feedbackRef}>
                    <div className="speech-bubble">
                        <strong>Nova says:</strong><br /> {feedback}
                    </div>
                </div>
            )}
            <div className="bubbles">
                {[...Array(10)].map((_, i) => <span key={i}></span>)}
            </div>
        </div>
    );
};

export default Dashboard;
 //comm for pushing