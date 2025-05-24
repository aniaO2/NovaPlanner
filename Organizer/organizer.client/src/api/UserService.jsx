import axios from './axiosInstance';

const UserService = {
    login: async (credentials) => {
        const response = await axios.post(`/user/login`, credentials);
        return response.data;
    },

    register: async (username, email, password) => {
        const response = await axios.post('/user/register', {username, email, password});
        return response.data;
    }
};

export default UserService;
