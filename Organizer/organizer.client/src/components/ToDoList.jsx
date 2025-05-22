import React from 'react';
import TaskItem from './TaskItem';

const ToDoList = ({ name, tasks, type }) => {
    return (
        <div className="task-list mb-4">
            <h4>{name}</h4>
            {tasks.map(task => (
                <TaskItem key={task.id} task={task} type={type} />
            ))}
        </div>
    );
};

export default ToDoList;
