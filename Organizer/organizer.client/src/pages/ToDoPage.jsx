import React from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import TasksByType from '../components/TasksByType';

const ToDoPage = () => {
    const { tasks, loading } = TasksByType('todo');

    const placeholderTasks = [
        { id: '1', title: 'Finish React component', isCompleted: false },
        { id: '2', title: 'Review pull requests', isCompleted: true },
        { id: '3', title: 'Update project documentation', isCompleted: false }
    ];

    return (
        <>
            <h3 className="mb-3 text-center">📝 To-Do Tasks</h3>

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
                                    <strong>{task.title}</strong> - {task.isCompleted ? 'Completed' : 'Pending'}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <>
                            <Alert variant="info" className="text-center">
                                No tasks yet. Here are some examples!
                            </Alert>
                            <ListGroup>
                                {placeholderTasks.map(task => (
                                    <ListGroup.Item key={task.id}>
                                        <strong>{task.title}</strong> - {task.isCompleted ? 'Completed' : 'Pending'}
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

export default ToDoPage;
