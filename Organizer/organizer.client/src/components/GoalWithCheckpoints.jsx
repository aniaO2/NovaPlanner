import React from 'react';
import { Button } from 'react-bootstrap';

const GoalWithCheckpoints = ({ goal, checkpoints, onEdit, onDelete, onQuickUpdate, onAddCheckpoint }) => {
    const handleCheckpointToggle = async (cpId, isNowCompleted) => {
        // Update the toggled checkpoint first
        await onQuickUpdate(cpId, { isCompleted: isNowCompleted });

        // Count how many checkpoints are unchecked BEFORE toggling this one
        const uncheckedBefore = checkpoints.filter(cp => !cp.isCompleted).length;

        // Calculate remaining progress based on current goal.progress
        const currentProgress = goal.progress ?? 0;
        const remainingProgress = Math.max(0, 100 - currentProgress);

        // Calculate progress gain per unchecked checkpoint (avoid div by zero)
        const progressGain = uncheckedBefore > 0 ? (remainingProgress / uncheckedBefore) : 0;

        // Calculate new progress
        let newProgress;
        if (isNowCompleted) {
            // Checking a checkpoint: increase progress by progressGain
            newProgress = currentProgress + progressGain;
        } else {
            // Unchecking a checkpoint: decrease progress by progressGain
            newProgress = currentProgress - progressGain;
        }

        // Clamp progress between 0 and 100
        newProgress = Math.min(100, Math.max(0, newProgress));

        // Check if after toggle, all checkpoints are checked (goal is completed)
        const allChecked = checkpoints.every(cp =>
            cp._id === cpId ? isNowCompleted : cp.isCompleted
        );

        if (allChecked) newProgress = 100;

        // Update goal with new progress and completed status
        await onQuickUpdate(goal._id, {
            progress: newProgress,
            isCompleted: newProgress === 100,
        });
    };


    const handleGoalToggle = async (isNowCompleted) => {
        // When goal is checked, mark all checkpoints completed
        // When unchecked, mark all checkpoints uncompleted
        await onQuickUpdate(goal._id, {
            isCompleted: isNowCompleted,
            progress: isNowCompleted ? 100 : 0,
        });

        await Promise.all(
            checkpoints.map(cp =>
                onQuickUpdate(cp._id, { isCompleted: isNowCompleted })
            )
        );
    };

    return (
        <div className="goal-with-checkpoints">
            <div className="task-card">
                <div className="task-header">
                    <label className="aero-checkbox">
                        <input
                            type="checkbox"
                            checked={goal.isCompleted}
                            onChange={(e) => handleGoalToggle(e.target.checked)}
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
                        {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }): 'N/A'}
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
                                            onChange={(e) => handleCheckpointToggle(cp._id, e.target.checked)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="custom-check"></span>
                                    </label>
                                    <span className="checkpoint-title">{cp.title}</span>
                                </div>
                                <span className="checkpoint-meta">
                                    <i className="bi bi-calendar-week calendar"></i> {cp.dueDate ? new Date(cp.dueDate).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
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
