import { useEffect, useState } from 'react';
import axios from 'axios';

const TasksByType = (type) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get(`/api/tasks/type/${type}`);
                setTasks(res.data);
            } catch (error) {
                console.error(`Error loading ${type} tasks`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [type]);

    return { tasks, loading };
};

export default TasksByType;
