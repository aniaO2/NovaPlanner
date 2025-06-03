import React from 'react';
import TaskItem from './TaskItem';

const ToDoList = ({ tasks, onEdit, onDelete, onQuickUpdate, activeView }) => {
    return (
        <div className="task-columns">
            {tasks.map(task => (
                <TaskItem key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} onQuickUpdate={onQuickUpdate} activeView={activeView} />
            ))}
        </div>
    );
};

export default ToDoList;
