import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import UserService from '../api/UserService';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setName] = useState('');
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
        <div className="auth-page futuristic-bg">
            <Container className="d-flex justify-content-center align-items-center">
                <Card className="auth-card shadow-lg">
                    <Card.Body>
                        <h2 className="futuristic-text text-center">Create Account</h2>
                        <p className="text-center futuristic-subtext">Join our community</p>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleRegister}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your name"
                                    value={username}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">
                                Register
                            </Button>
                        </Form>
                        <p className="text-center mt-3 futuristic-subtext">
                            Already have an account? <a href="/">Login</a>
                        </p>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Register;
