import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';

const ToDoPage = ({ tasks, loading }) => {
    return (
        <div className="task-column">
            <h4 className="text-center mb-3">To-Do Tasks</h4>

            {loading ? (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                        tasks.map(task => (
                            <div className="task-card" key={task._id}>
                                <p className="task-title">{task.title}</p>
                                <div className="task-actions">
                                    <button className="edit-btn">✏️</button>
                                    <button className="delete-btn">🗑️</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Alert variant="info" className="text-center">
                            No to-do tasks found.
                        </Alert>
                    )}
                </>
            )}
        </div>
    );
};

export default ToDoPage;
