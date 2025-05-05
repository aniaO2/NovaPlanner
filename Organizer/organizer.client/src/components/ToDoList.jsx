import React from 'react';
import TaskItem from './TaskItem';

const ToDoList = ({ list }) => {
    return (
        <div className="task-list">
            <h3>{list.name}</h3>
            {list.tasks.map(task => (
                <TaskItem key={task.id} task={task} />
            ))}
        </div>
    );
};

export default ToDoList;
