import React from 'react';
import TaskItem from './TaskItem';

const ToDoList = ({ tasks, onEdit, onDelete }) => {
    return (
        <div className="task-columns">
            {tasks.map(task => (
                <TaskItem key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
};

export default ToDoList;
