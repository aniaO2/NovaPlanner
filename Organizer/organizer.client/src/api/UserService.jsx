import axiosInstance from './axiosInstance';

const UserService = {
    login: async (username, password) => {
        const response = await axiosInstance.post('/user/login', { username, password });
        return response.data;
    },

    register: async (username, email, password) => {
        const response = await axiosInstance.post('/user/register', {username, email, password});
        return response.data;
    }
};

export default UserService;
