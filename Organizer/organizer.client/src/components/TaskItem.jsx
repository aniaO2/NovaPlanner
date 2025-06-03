import React from 'react';
import { Button } from 'react-bootstrap';

const TaskItem = ({ task, onEdit, onDelete, onQuickUpdate, activeView }) => {
    const handleStreakIncrement = () => {
        const newStreak = (task.streak || 0) + 1;
        onQuickUpdate(task._id, { streak: newStreak });
    };
    return (
        <div className="task-card">
    <div className="task-header">
                {activeView !== 'habits' && (
                    <label className="aero-checkbox">
                        <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={(e) => onQuickUpdate(task._id, { isCompleted: e.target.checked })}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="custom-check"></span>
                    </label>
                )}
        <h5 className="task-title">{task.title}</h5>
    </div>

    <div className="task-details">
        {activeView === 'dailies' && (
            <>
                        <div><strong><i class="bi bi-calendar-week-fill calendar"></i> Due:</strong> {new Date(task.dueDate).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                        <div><strong><i class="bi bi-alarm-fill clock"></i> Time:</strong> {task.dueTime
                            ? new Date(`1970-01-01T${task.dueTime}`).toLocaleTimeString('ro-RO', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })
                            : '—'}</div>
                        <div><strong><i class="bi bi-hourglass-split hourglass"></i> Estimated:</strong> {task.estimatedTime ?? '—'} hrs</div>
            </>
        )}

        {activeView === 'todo' && (
                    <div><strong><i class="bi bi-calendar-week-fill calendar"></i> Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</div>
        )}

        {activeView === 'habits' && (
            <div className="streak-row">
                        <strong><i class="bi bi-fire fire"></i> Streak:</strong> {task.streak}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStreakIncrement();
                    }}
                    className="streak-btn"
                    title="Increase streak"
                        ><i class="bi bi-plus plus"></i></button>
            </div>
        )}

        {activeView === 'goals' && (
                    <div><strong><i class="bi bi-graph-up-arrow chart"></i> Progress:</strong> {task.progress ?? 0}%</div>
        )}
    </div>

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
