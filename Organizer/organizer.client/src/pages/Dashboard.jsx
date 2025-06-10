import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from 'react-datepicker';
import Select from 'react-select'
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import axios from '../api/AxiosInstance';

import ToDoList from '../components/ToDoList';
import TaskPopup from '../components/TaskPopup';

import '../styles/Dashboard.css';

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
    const [showCompleted, setShowCompleted] = useState('all');
    const [feedback, setFeedback] = useState(null);

    const singularLabels = {
        todo: 'Task',
        dailies: 'Daily',
        habits: 'Habit',
        goals: 'Goal',
        checkpoint: 'Checkpoint'
    };

    const options = [
        { value: 'all', label: 'All Tasks' },
        { value: 'true', label: 'Completed' },
        { value: 'false', label: 'In Progress' },
    ];


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

    const filteredTasks = useMemo(() => {
        const matchesCompletion = (task => 
           showCompleted === 'all' || task.isCompleted === showCompleted
        );

        return {
            todo: tasks.filter(task =>
                task.type === 'todo' && matchesCompletion(task)
            ),
            dailies: tasks.filter(task =>
                task.type === 'daily' &&
                matchesCompletion(task) &&
                new Date(task.dueDate).toLocaleDateString('ro-RO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) === selectedDate.toLocaleDateString('ro-RO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
            ),
            habit: tasks.filter(task =>
                task.type === 'habit' && matchesCompletion(task)
            ),
            goal: tasks.filter(task =>
                task.type === 'goal' && matchesCompletion(task)
            ),
            checkpoint: tasks.filter(task =>
                task.type === 'checkpoint' && matchesCompletion(task)
            ),
        };
    }, [tasks, selectedDate, showCompleted]);




    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    const goToChangePassword = () => {
        navigate('/change-password');
    };

    const togglePopup = () => setShowPopup(prev => !prev);
    const toggleMenu = () => setMenuOpen(prev => !prev);

    const openAddPopup = (goalId = null) => {
        setIsEditing(false);
        setParentGoalId(goalId); // goalId is the ID or null
        const today = new Date();
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
            dueDate: task.dueDate ? new Date(task.dueDate) : '',
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
                new Date(task.dueDate).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }) === selectedDate.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
                        <i class="bi bi-brightness-high-fill sun"></i> <span className = "aero-label">My day</span>
                    </button>
                    <button onClick={() => setActiveView('todo')} className={activeView === 'todo' ? 'active' : ''}>

                        <i class="bi bi-clipboard-check-fill clipboard"></i> <span className="aero-label">To-Do</span>
                    </button>
                    <button onClick={() => setActiveView('habits')} className={activeView === 'habits' ? 'active' : ''}>
                        <i class="bi bi-calendar-week-fill calendar"></i> <span className="aero-label">Habits</span>
                    </button>
                    <button onClick={() => setActiveView('goals')} className={activeView === 'goals' ? 'active' : ''}>
                        <i class="bi bi-bullseye target"></i> <span className="aero-label">Goals</span>
                    </button>
                </nav>

                {/* Hamburger Menu */}
                <div className="hamburger-container" ref={menuRef}>
                    <button className="hamburger-icon" onClick={toggleMenu}><i class="bi bi-list"></i></button>
                    {menuOpen && (
                        <div className="hamburger-menu">
                            <Button variant="outline-secondary" size="sm" className="menu-btn" onClick={goToChangePassword}><i class="bi bi-file-lock2-fill password"></i> Change password</Button>
                            <Button variant="outline-danger" size="sm" className="menu-btn" onClick={handleLogout}>
                                <i class="bi bi-door-open-fill logout"></i> Logout
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            <main className="main-content">
                <div className="header ">
                    <h2>
                        {activeView === 'todo'
                            ? 'To-Do Tasks'
                            : activeView === 'dailies'
                                ? "Today's Tasks"
                                : activeView === 'habits'
                                    ? 'Habits'
                                    : 'Goals'}
                    </h2>

                    <div className="toolbar">
                        <Button variant="success" className="new-task" onClick={() => openAddPopup()}>
                            <i className="bi bi-plus-square-fill add"></i><span className="aero-label"> New {singularLabels[activeView]}</span>
                        </Button>
                        <div className="filters">
                        {activeView === 'dailies' && (
                            <div className="date-picker-wrapper">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    dateFormat="dd.MM.yyyy"
                                    className="form-control aero-filter"
                                    calendarClassName="aero-calendar"
                                />
                                <div
                                    className="calendar-icon"
                                    onClick={() => document.querySelector(".react-datepicker__input-container input").focus()}
                                />
                            </div>
                            )}
                        
                            <div>
                                <Select
                                    classNamePrefix="aero-select"
                                    options={options}
                                    value={options.find(opt => String(opt.value) === String(showCompleted))}
                                    onChange={(selectedOption) => {
                                        const value = selectedOption.value;
                                        setShowCompleted(value === 'all' ? 'all' : value === 'true');
                                    }}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            background: 'linear-gradient(to bottom right, rgba(173, 239, 255, 0.85), rgba(192, 255, 240, 0.9))',
                                            borderRadius: 12,
                                            borderColor: 'rgba(0, 180, 200, 0.6)',
                                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), 0 2px 4px rgba(0,120,160,0.3)',
                                            color: '#00575d',
                                            fontSize: 15,
                                            minHeight: '38px',
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            borderRadius: 12,
                                            background: 'linear-gradient(to bottom right, #c8ffff, #f0ffff)',
                                            boxShadow: '0 4px 10px rgba(0, 150, 180, 0.3)',
                                            color: '#004d55',
                                            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                            width: '100%'
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? 'rgba(0, 180, 200, 0.2)' : 'transparent',
                                            color: '#004d55',
                                            cursor: 'pointer',
                                            fontWeight: state.isSelected ? 'bold' : 'normal',
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: '#00575d',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,
                                            color: '#00575d',
                                            ':hover': { color: '#008fa0' },
                                        }),
                                        indicatorSeparator: () => ({ display: 'none' }),
                                    }}
                                    />
                            </div>

                        </div>
                        </div>
                    </div>


                {!loading && !error && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ToDoList
                                tasks={
                                    activeView === 'todo'
                                        ? filteredTasks.todo
                                        : activeView === 'dailies'
                                            ? filteredTasks.dailies
                                            : activeView === 'habits'
                                                ? filteredTasks.habit
                                                : [...filteredTasks.goal, ...filteredTasks.checkpoint]
                                }
                                onEdit={openEditPopup}
                                onDelete={handleDelete}
                                onQuickUpdate={handleQuickUpdate}
                                onAddCheckpoint={openAddPopup}
                                activeView={activeView}
                            />
                        </motion.div>
                    </AnimatePresence>
                )}


            </main>

            <TaskPopup
                showPopup={showPopup}
                togglePopup={togglePopup}
                isEditing={isEditing}
                activeView={activeView}
                singularLabels={singularLabels}
                currentTask={currentTask}
                setCurrentTask={setCurrentTask}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
            />


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