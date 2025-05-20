import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../api/UserService';
import '../styles/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const { token } = await UserService.login(username, password);
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } catch {
            setError('Invalid credentials. Please try again.');
        }
    };
    const goToRegister = () => {
        navigate('/register');
        };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLogin}>
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
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn-primary">Login</button>
                        <button onClick={goToRegister} className="btn-secondary">Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
