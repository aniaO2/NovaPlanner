import React, { useState } from 'react';
import { Card, Button, Container, Form } from 'react-bootstrap';
import axios from '../api/AxiosInstance';
import { useNavigate } from 'react-router-dom';

import ToDoPage from './ToDoPage';
import DailiesPage from './DailiesPage';
import GoalsPage from './GoalsPage';

import '../styles/Dashboard.css';
import '../styles/TaskPopup.css';

const Dashboard = () => {
    const [activeView, setActiveView] = useState('todo');
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const [newTask, setNewTask] = useState({
        title: '',
        type: 'todo',
        isCompleted: false,
        streak: 0,
        progress: 0,
        dueDate: '',
    });

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
            dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(),
            streak: newTask.type === 'daily' ? Number(newTask.streak) : null,
            progress: newTask.type === 'goal' ? Number(newTask.progress) : null,
        };

        try {
            await axios.post('/tasks', payload);
            togglePopup();
            window.location.reload(); // Ideally refresh via state
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const handleLogout = () => {
        // Clear auth token or session
        localStorage.removeItem('token'); // or whatever storage you use
        navigate('/');
    };

    return (
        <div className="dashboard-page">
            <Container className="py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-2">Welcome Back!</h1>
                        <p>Here's a snapshot of your day.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="success" onClick={togglePopup}>➕ Add Task</Button>
                        <Button variant="outline-danger" onClick={handleLogout}>🔓 Logout</Button>
                    </div>
                </div>

                <div className="text-center mb-4">
                    <Button
                        variant={activeView === 'todo' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveView('todo')}
                        className="mx-2"
                    >
                        To-Do
                    </Button>
                    <Button
                        variant={activeView === 'dailies' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveView('dailies')}
                        className="mx-2"
                    >
                        Dailies
                    </Button>
                    <Button
                        variant={activeView === 'goals' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveView('goals')}
                        className="mx-2"
                    >
                        Goals
                    </Button>
                </div>

                <Card className="glass-card shadow p-4">
                    {activeView === 'todo' && <ToDoPage />}
                    {activeView === 'dailies' && <DailiesPage />}
                    {activeView === 'goals' && <GoalsPage />}
                </Card>
            </Container>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <button className="popup-close" onClick={togglePopup}>✖</button>
                        <h4 className="mb-3">Add New Task</h4>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="taskTitle">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={newTask.title}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="taskType">
                                <Form.Label>Type</Form.Label>
                                <Form.Select
                                    name="type"
                                    value={newTask.type}
                                    onChange={handleChange}
                                >
                                    <option value="todo">To-Do</option>
                                    <option value="daily">Daily</option>
                                    <option value="goal">Goal</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="dueDate">
                                <Form.Label>Due Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dueDate"
                                    value={newTask.dueDate}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {newTask.type === 'daily' && (
                                <Form.Group className="mb-3" controlId="streak">
                                    <Form.Label>Streak</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="streak"
                                        min={0}
                                        value={newTask.streak}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}

                            {newTask.type === 'goal' && (
                                <Form.Group className="mb-3" controlId="progress">
                                    <Form.Label>Progress (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="progress"
                                        min={0}
                                        max={100}
                                        value={newTask.progress}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3" controlId="isCompleted">
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
