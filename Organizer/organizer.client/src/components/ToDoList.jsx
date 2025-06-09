import React from 'react';
import TaskItem from './TaskItem';
import GoalWithCheckpoints from './GoalWithCheckpoints';

const ToDoList = ({
    tasks,
    onEdit,
    onDelete,
    onQuickUpdate,
    onAddCheckpoint,
    activeView
}) => {
    if (activeView === 'goals') {
        // Separate goals and checkpoints
        const goals = tasks.filter(t => t.type === 'goal');
        const checkpoints = tasks.filter(t => t.type === 'checkpoint');

        return (
            <div className="task-columns">
                {goals.map(goal => {
                    const goalCheckpoints = checkpoints.filter(cp => cp.goalId === goal._id);
                    return (
                        <GoalWithCheckpoints
                            key={goal._id}
                            goal={goal}
                            checkpoints={goalCheckpoints}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onQuickUpdate={onQuickUpdate}
                            onAddCheckpoint={onAddCheckpoint}
                        />
                    );
                })}
            </div>
        );
    }

    // Default rendering for other views
    return (
        <div className="task-columns">
            {tasks.map(task => (
                <TaskItem
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onQuickUpdate={onQuickUpdate}
                    activeView={activeView}
                />
            ))}
        </div>
    );
};

export default ToDoList;
