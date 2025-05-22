import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import TasksByType from '../hooks/TasksByType';
import ToDoList from '../components/ToDoList';

const GoalsPage = () => {
    const { tasks, loading } = TasksByType('goal');

    return (
        <>
            <h3 className="mb-3 text-center">🎯 Goals</h3>

            {loading ? (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                        <ToDoList name="Your Goals" tasks={tasks} type="goal" />
                    ) : (
                        <Alert variant="info" className="text-center">
                            No goals found.
                        </Alert>
                    )}
                </>
            )}
        </>
    );
};

export default GoalsPage;
