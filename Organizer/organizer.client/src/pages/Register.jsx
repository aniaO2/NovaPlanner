import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../api/UserService';
import '../styles/Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        const isValidEmail = (email) =>
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email); 

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            await UserService.register(username, email, password);
            navigate('/', { replace: true });
        } catch {
            setError('Registration failed. Please try again.');
        }
    };


    return (
        <div className="wrapper">
            <div className="register-container">
                <div className="register-card">
                    <h2 className="register-title">Create Account</h2>
                    <p className="register-subtitle">Start organizing the future you were promised</p>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">Register</button>
                    </form>
                    <p className="register-footer">
                        Already have an account? <a href="/">Login</a>
                    </p>
                </div>
            </div>

            {/* Bubble background added outside register content */}
            <div className="bubbles">
                {[...Array(10)].map((_, i) => <span key={i}></span>)}
            </div>
        </div>
    );
};

export default Register;
