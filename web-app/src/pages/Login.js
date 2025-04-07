import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await login(username, password);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #007bff, #00d4ff)',
        }}>
            <div style={{
                background: '#fff',
                padding: '40px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
            }}>
                <img src="/logo.png" alt="Logo" style={{ width: '60px', marginBottom: '20px' }} />
                <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '30px' }}>TRAITS-PMS</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Login ID"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px',
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'background 0.3s',
                        }}
                        onMouseOver={(e) => e.target.style.background = '#0056b3'}
                        onMouseOut={(e) => e.target.style.background = '#007bff'}
                    >
                        Login
                    </button>
                    {error && <p style={{ color: '#dc3545', marginTop: '10px' }}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Login;
