import React from 'react';
import { ProgressBar } from 'react-bootstrap';

const TaskItem = ({ task, type }) => {
    return (
        <div className="task-item d-flex flex-column mb-3">
            {type === 'daily' && (
                <div className="d-flex align-items-center">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="me-2"
                    />
                    <span>
                        <strong>{task.title}</strong> — Streak: {task.streak ?? 0}
                    </span>
                </div>
            )}

            {type === 'goal' && (
                <>
                    <strong>{task.title}</strong>
                    <ProgressBar
                        now={task.progress ?? 0}
                        label={`${task.progress ?? 0}%`}
                        className="mt-2"
                    />
                </>
            )}

            {type === 'todo' && (
                <div className="d-flex align-items-center">
                    <input
                        type="checkbox"
                        checked={task.isCompleted}
                        readOnly
                        className="me-2"
                    />
                    <span>
                        <strong>{task.title}</strong> — {task.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TaskItem;
