import React, { useEffect, useState } from 'react';
import TaskList from '../components/ToDoList';

const Dashboard = () => {
    const [lists, setLists] = useState([]);

    useEffect(() => {
        fetch('/api/tasklists')
            .then(res => res.json())
            .then(data => setLists(data))
            .catch(err => console.error('Failed to fetch task lists:', err));
    }, []);

    return (
        <div>
            <h2>Your Task Lists</h2>
            {lists.map(list => (
                <TaskList key={list.id} list={list} />
            ))}
        </div>
    );
};

export default Dashboard;
