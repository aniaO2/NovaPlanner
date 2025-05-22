import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import TasksByType from '../hooks/TasksByType';
import ToDoList from '../components/ToDoList';

const DailiesPage = () => {
    const { tasks, loading } = TasksByType('daily');

    return (
        <>
            <h3 className="mb-3 text-center">📆 Daily Tasks</h3>

            {loading ? (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                        <ToDoList name="Your Daily Tasks" tasks={tasks} type="daily" />
                    ) : (
                        <Alert variant="info" className="text-center">
                            No daily tasks found.
                        </Alert>
                    )}
                </>
            )}
        </>
    );
};

export default DailiesPage;
