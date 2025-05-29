import React from 'react';
import { Button } from 'react-bootstrap';

const GoalWithCheckpoints = ({ goal, checkpoints, onEdit, onDelete, onAddCheckpoint }) => {
    return (
        
        <div className="goal-with-checkpoints">
            <div className="task-card">
                <h5>{goal.title}</h5>
                <p>Progress: {goal.progress}%</p>
                <p>Due: {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'N/A'}</p>
                <p>Status: {goal.isCompleted ? 'Completed' : 'Pending'}</p>
                <div className="actions">
                    <Button variant="outline-primary" size="sm" onClick={() => onEdit(goal)}>
                        <i className="bi bi-pencil-fill edit"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(goal._id)}>
                        <i className="bi bi-trash2-fill delete"></i>
                    </Button>
                    <Button variant="outline-success" size="sm" onClick={() => onAddCheckpoint(goal._id)}>
                        <i className="bi bi-flag-fill checkpoint"></i>
                    </Button>
                </div>
            </div>

            {checkpoints.length > 0 && (
                <div className="checkpoint-list ms-4 mt-2">
                    {checkpoints.map(cp => (
                        <div key={cp._id} className="checkpoint-card p-2 mb-2 border rounded bg-light">
                            <h6 className="mb-1">{cp.title}</h6>
                            <p className="mb-1">Due: {cp.dueDate ? new Date(cp.dueDate).toLocaleDateString() : 'N/A'}</p>
                            <p className="mb-1">Status: {cp.isCompleted ? 'Completed' : 'Pending'}</p>
                            <div className="actions">
                                <Button variant="outline-primary" size="sm" onClick={() => onEdit(cp)}>
                                    <i className="bi bi-pencil-fill edit"></i>
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => onDelete(cp._id)}>
                                    <i className="bi bi-trash2-fill delete"></i>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
    );
};

export default GoalWithCheckpoints;
