import React from 'react';
import TaskItem from './TaskItem';

const ToDoList = ({ tasks, onEdit, onDelete, activeView }) => {
    return (
        <div className="task-columns">
            {tasks.map(task => (
                <TaskItem key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} activeView={activeView} />
            ))}
        </div>
    );
};

export default ToDoList;
