import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from 'D:/gui/Code/frontend/src/logo.png';
import loginImage from './6670985.jpg';

function Login({ onLogin }) {
    const [values, setValues] = useState({
        username: '',
        password: ''
    });
    const [errors, setError] = useState({});
    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleLogin = () => {
        // Simulate successful login
        onLogin('customer'); // Pass 'customer' or 'operator' based on user role
    };
    
     const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); // Clear previous error

        try {
            const response = await axios.post('http://localhost:8081/login', {
                username: values.username,
                password: values.password
            });

            if (response.data.success) {
                const { userId, userType } = response.data;

                // Store user information in session storage
                sessionStorage.setItem('userId', userId);
                sessionStorage.setItem('role', userType);
                console.log(userId);
                onLogin(userType); // Notify parent component of login

                // Navigate to the appropriate dashboard
                if (userType === 'customer') {
                    navigate('/dashboardCustomer');
                } else if (userType === 'operator') {
                    navigate('/dashboardOperator');
                } else {
                    setError('Unknown user type');
                }
            } else {
                setError(response.data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Something went wrong. Please try again later.');
        }
    };

    return (
        <div style={{ display: 'flex'}}>
            <div className="login-container" style={{ flex: 1}}>
                <div className="login-box">
                    <div className="logo-container">
                        <img src={logo} alt="Logo" className="logo" />
                    </div>
                    <div className="login-form-container">
                        <h2 style={{color: '#FFF7D1'}}>Welcome Back!</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="username" style={{color: '#FFF7D1', fontStyle: 'italic'}}><strong>Enter Username:</strong></label><br/>
                                <input type="text" placeholder="Enter Username" name="username" onChange={handleInput} className="form-control rounded-0" />
                                {errors.username && <span className="text-danger">{errors.username}</span>}
                            </div>
                            <div className="mb-3">
                                <br/><label htmlFor="password" style={{color: '#FFF7D1', fontStyle: 'italic'}}><strong>Enter Password:</strong></label><br/>
                                <input type="password" placeholder="Enter Password" name="password" onChange={handleInput} className="form-control rounded-0" />
                                {errors.password && <span className="text-danger">{errors.password}</span>}
                            </div>
                            <br/><button onClick={handleLogin} type="submit" className="btn btn-success w-100 rounded-0">Log in</button>
                            <p className="description">
                                "Need to streamline your assembly process?" <br/>
                               
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <img
                    src={loginImage}
                    alt="Login Illustration"
                    style={{ width: '100%', height: '80%', marginTop:'40px', objectFit: 'cover' }}
                />
            </div>
        </div>
    );
}

export default Login;
