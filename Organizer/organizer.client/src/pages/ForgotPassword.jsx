import { useState } from 'react';
import UserService from '../api/UserService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await UserService.requestPasswordReset(email);
            setMessage('If this email exists, a reset link was sent.');
        } catch {
            setMessage('Error sending reset instructions. Please try again later.');
        }
    };

    return (
        <div className="wrapper">
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Reset Password</h2>
                    {message && <div className="info-message">{message}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">Send Reset Link</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
