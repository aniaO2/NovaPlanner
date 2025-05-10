import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../api/UserService';
import Register from './Register';

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
        <div>
            <h2>Login</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                <button onClick={goToRegister}>Register</button>
            </form>
        </div>
    );
};

export default Login;
