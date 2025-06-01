import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserService from '../api/UserService';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const query = new URLSearchParams(useLocation().search);
    const token = query.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await UserService.resetPassword({ token, newPassword });
            setMessage("Password reset successfully. You can now log in.");
            setTimeout(() => navigate('/'), 2000);
        } catch {
            setMessage("Reset failed. Token may be invalid or expired.");
        }
    };

    return (
        <div className="wrapper">
            <div className="reset-container">
                <div className="reset-card">
                    <h2 className="reset-title">Reset Your Password</h2>
                    {message && <div className="info-message">{message}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">Reset Password</button>
                    </form>
                </div>
            </div>
            <div className="bubbles">
                {[...Array(10)].map((_, i) => <span key={i}></span>)}
            </div>
        </div>

    );
};

export default ResetPassword;
