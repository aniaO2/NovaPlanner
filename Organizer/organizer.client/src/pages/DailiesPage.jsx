import React from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import TasksByType from '../components/TasksByType';

const DailiesPage = () => {
    const { tasks, loading } = TasksByType('daily');

    const placeholderTasks = [
        { id: '1', title: 'Drink water', streak: 3 },
        { id: '2', title: 'Exercise', streak: 1 },
        { id: '3', title: 'Read 10 pages', streak: 5 }
    ];

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
                        <ListGroup>
                            {tasks.map(task => (
                                <ListGroup.Item key={task.id}>
                                    <strong>{task.title}</strong> — Streak: {task.streak ?? 0}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <>
                            <Alert variant="info" className="text-center">
                                No daily tasks yet. Here are some examples!
                            </Alert>
                            <ListGroup>
                                {placeholderTasks.map(task => (
                                    <ListGroup.Item key={task.id}>
                                        <strong>{task.title}</strong> — Streak: {task.streak}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default DailiesPage;
