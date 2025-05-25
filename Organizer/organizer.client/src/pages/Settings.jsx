import { useState } from 'react';
import axios from '../api/axiosInstance';

const Settings = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("New passwords don't match.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/user/change-password',
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(response.data);
            setError(null);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data || 'Failed to change password.');
            setMessage(null);
        }
    };

    return (
        <div className="settings-container">
            <h2>Change Password</h2>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleChangePassword}>
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">Change Password</button>
            </form>
        </div>
    );
};

export default Settings;
