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
        try {
            await UserService.register(username, email, password);
            navigate('/');
        } catch {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="wrapper">
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Create Account</h2>
                <p className="register-subtitle">Join our community</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
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
        </div>
    );
};

export default Register;
