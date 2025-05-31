import axios from './axiosInstance';

const UserService = {
    login: async (credentials) => {
        const response = await axios.post(`/user/login`, credentials);
        return response.data;
    },

    register: async (username, email, password) => {
        const response = await axios.post('/user/register', {username, email, password});
        return response.data;
    },

    requestPasswordReset(email) {
        return axios.post('/user/forgot-password', { email });
    },
    resetPassword({ token, newPassword }) {
        return axios.post('/user/reset-password', { token, newPassword });
    }
};

export default UserService;
