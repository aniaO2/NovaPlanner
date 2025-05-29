import React from 'react';
import { Button } from 'react-bootstrap';

const TaskItem = ({ task, onEdit, onDelete }) => {
    return (
        <div className="task-card">
            <h5>{task.title}</h5>
            {task.streak !== undefined && <p>Streak: {task.streak}</p>}
            {task.progress !== undefined && <p>Progress: {task.progress}%</p>}
            <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
            <p>Status: {task.isCompleted ? 'Completed' : 'Pending'}</p>
            <div className="actions">
                <Button variant="outline-primary" size="sm" onClick={() => onEdit(task)}>
                    <i className="bi bi-pencil-fill edit"></i>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onDelete(task._id)}>
                    <i className="bi bi-trash2-fill delete"></i>
                </Button>
            </div>
        </div>
    );
};

export default TaskItem;
