import React, { useState } from 'react';
import { Card, Button, Container } from 'react-bootstrap';
import '../styles/Dashboard.css';

import ToDoPage from './ToDoPage';
import DailiesPage from './DailiesPage';
import GoalsPage from './GoalsPage';

const Dashboard = () => {
    // Default active view is set to 'todo'
    const [activeView, setActiveView] = useState('todo');

    return (
        <div className="dashboard-page">
            <Container className="py-5">
                <h1 className="text-center mb-4">Welcome Back!</h1>
                <p className="text-center mb-4">Here's a snapshot of your day.</p>

                {/* Toggle Buttons */}
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

                {/* Task Content Area */}
                <Card className="glass-card shadow p-4">
                    {activeView === 'todo' && <ToDoPage />}
                    {activeView === 'dailies' && <DailiesPage />}
                    {activeView === 'goals' && <GoalsPage />}
                </Card>
            </Container>
        </div>
    );
};

export default Dashboard;
