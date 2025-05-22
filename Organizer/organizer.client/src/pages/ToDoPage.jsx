import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import TasksByType from '../hooks/TasksByType';
import ToDoList from '../components/ToDoList';

const ToDoPage = () => {
    const { tasks, loading } = TasksByType('todo');

    return (
        <>
            <h3 className="mb-3 text-center">To-Do Tasks</h3>

            {loading ? (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                        <ToDoList name="Your To-Do Tasks" tasks={tasks} type="todo" />
                    ) : (
                        <Alert variant="info" className="text-center">
                            No to-do tasks found.
                        </Alert>
                    )}
                </>
            )}
        </>
    );
};

export default ToDoPage;
