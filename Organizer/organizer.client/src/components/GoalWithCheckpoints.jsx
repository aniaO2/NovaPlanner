import React from 'react';
import { Button } from 'react-bootstrap';

const GoalWithCheckpoints = ({ goal, checkpoints, onEdit, onDelete, onQuickUpdate, onAddCheckpoint }) => {
    return (
        <div className="goal-with-checkpoints">
            <div className="task-card">
                <div className="task-header">
                    <label className="aero-checkbox">
                        <input
                            type="checkbox"
                            checked={goal.isCompleted}
                            onChange={(e) => onQuickUpdate(goal._id, { isCompleted: e.target.checked })}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="custom-check"></span>
                    </label>
                    <h5 className="task-title">{goal.title}</h5>
                </div>

                <div className="task-details">
                    <div>
                        <strong><i className="bi bi-graph-up-arrow chart"></i> Progress:</strong> {goal.progress ?? 0}%
                    </div>
                    <div>
                        <strong><i className="bi bi-calendar-week-fill calendar"></i> Due:</strong>
                        {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString('en-CA') : 'N/A'}
                    </div>
                </div>

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
                <div className="checkpoint-list ms-3 mt-2">
                    {checkpoints.map(cp => (
                        <div key={cp._id} className="checkpoint-mini-card">
                            <div className="checkpoint-main">
                                <div className="checkpoint-header">
                                <label className="aero-mini-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={cp.isCompleted}
                                        onChange={(e) => onQuickUpdate(cp._id, { isCompleted: e.target.checked })}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="custom-check"></span>
                                </label>
                                    <span className="checkpoint-title">{cp.title}</span>
                                </div>
                                <span className="checkpoint-meta">
                                    <i className="bi bi-calendar-week calendar"></i> {cp.dueDate ? new Date(cp.dueDate).toLocaleDateString('en-CA') : 'N/A'}
                                </span>
                            </div>
                            <div className="checkpoint-actions">
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
