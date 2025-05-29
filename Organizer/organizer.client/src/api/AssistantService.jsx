import axiosInstance from './axiosInstance';

export async function evaluateDailies(userId, todayTasks) {
    const response = await axiosInstance.post('/assistant/evaluate-dailies', {
        userId,
        todayTasks
    });

    return response.data;
}