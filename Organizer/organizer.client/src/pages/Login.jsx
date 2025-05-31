import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../api/UserService';
import '../styles/Login.css';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const { token, userId } = await UserService.login({ identifier, password });
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            navigate('/dashboard', { replace: true });
        } catch {
            setError('Invalid credentials. Please try again.');
        }
    };
    const goToRegister = () => {
        navigate('/register');
        };

    return (
        <div className="wrapper">
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username or E-mail</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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
                        <div className="forgot-password" style={{marginBottom: '1rem'} }>
                        <span onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer', color: '#007bff' }}>
                                Forgot your password?
                        </span>
                    </div>
                    <div className="button-group">
                            <button type="submit" className="btn-primary">Sign In</button>
                            <button type="button" onClick={goToRegister} className="btn-secondary">Create Account</button>
                    </div>
                </form>
            </div>
            </div>
            <div className="bubbles">
                {[...Array(10)].map((_, i) => <span key={i}></span>)}
            </div>
        </div>
    );
};

export default Login;
