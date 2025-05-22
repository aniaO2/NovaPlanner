import { useEffect, useState } from 'react';
import axios from '../api/AxiosInstance';

const TasksByType = (type) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`/tasks/type/${type}`);
                setTasks(response.data);
                console.log('Fetched tasks:', response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [type]);

    return { tasks, loading };
};

export default TasksByType;
