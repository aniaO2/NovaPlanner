import React from 'react';
import { Button } from 'react-bootstrap';

const TaskItem = ({ task, onEdit, onDelete, activeView }) => {
    const handleStreakIncrement = () => {
        const updatedTask = { ...task, streak: (task.streak || 0) + 1 };
        onEdit(updatedTask);
    };
    return (
        <div className="task-card">
            <div className="task-checkbox-title">
                <label className="aero-checkbox">
                    <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => onEdit({ ...task, isCompleted: !task.isCompleted })}
                    />
                    <span className="custom-check"></span>
                </label>
                <h5>{task.title}</h5>
            </div>
            {activeView == "dailies" && (
                <>
                    <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString('en-CA') || 'N/A'}</p>
                    <p><strong>Time:</strong> {task.dueTime || '—'}</p>
                    <p><strong>Estimated hours:</strong> {task.estimatedTime ?? '—'}</p>
                </>
            )} 
            {activeView == 'todo' && (
                <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString('en-CA') || 'N/A'}</p>
            )}
            {activeView == 'habits' && (
                <div className="d-flex align-items-center gap-2">
                    <p>
                        <strong>Streak:</strong> {task.streak}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // prevent parent click events if any
                                handleStreakIncrement(task._id);
                            }}
                            style={{ marginLeft: '8px' }}
                            title="Increase streak"
                        >
                            +
                        </button>
                    </p>

                </div>
            )}
            {activeView == 'goals' && (
                <p><strong>Progress:</strong> {task.progress ?? 0}%</p>
            )}
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
