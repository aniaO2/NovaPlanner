import React from 'react';
import { ListGroup, Spinner, ProgressBar, Alert } from 'react-bootstrap';
import TasksByType from '../components/TasksByType';

const GoalsPage = () => {
    const { tasks, loading } = TasksByType('goal');

    const placeholderGoals = [
        { id: '1', title: 'Launch MVP', progress: 40 },
        { id: '2', title: 'Write thesis', progress: 70 },
        { id: '3', title: 'Run a 5K', progress: 25 }
    ];

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
                        <ListGroup>
                            {tasks.map(task => (
                                <ListGroup.Item key={task.id}>
                                    <strong>{task.title}</strong>
                                    <ProgressBar
                                        now={task.progress ?? 0}
                                        label={`${task.progress ?? 0}%`}
                                        className="mt-2"
                                    />
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <>
                            <Alert variant="info" className="text-center">
                                No goals added yet. Here's some inspiration!
                            </Alert>
                            <ListGroup>
                                {placeholderGoals.map(goal => (
                                    <ListGroup.Item key={goal.id}>
                                        <strong>{goal.title}</strong>
                                        <ProgressBar
                                            now={goal.progress}
                                            label={`${goal.progress}%`}
                                            className="mt-2"
                                        />
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

export default GoalsPage;
