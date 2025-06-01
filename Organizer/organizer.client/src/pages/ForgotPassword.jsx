import { useState } from 'react';
import UserService from '../api/UserService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await UserService.requestPasswordReset(email);
            setMessage('If this email exists, a password reset link was sent.');
        } catch {
            setMessage('Error sending reset instructions. Please try again later.');
        }
    };

    return (
        <div className="wrapper">
            <div className="reset-container">
                <div className="reset-card">
                    <h2 className="reset-title">Reset Password</h2>
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
            <div className="bubbles">
                {[...Array(10)].map((_, i) => <span key={i}></span>)}
            </div>
        </div>
    );
};

export default ForgotPassword;
