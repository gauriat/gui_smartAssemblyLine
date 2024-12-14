import React, { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './logo.png';

function LoginOperator({ onLogin }) {
    const [values, setValues] = useState({
        username: '',
        password: ''
    });
    const [errors] = useState({});
    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleLogin = () => {
        onLogin('operator'); // Pass 'operator' as the role
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (Object.keys(errors).length === 0) {
            try {
                const response = await axios.post('http://localhost:8081/loginOperator', {
                    username: values.username,
                    password: values.password
                });

                if (response.data.success) {
                    sessionStorage.setItem('operatorId', response.data.operatorId);
                    navigate('/dashboardOperator');
                } else {
                    alert('Invalid credentials');
                }
            } catch (error) {
                console.error('Error during login:', error);
            }
        }
    };

    return (
        <div className="operatorlogin-container">
            <div className='login-box' style={{justifyContent:'center'}}>
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo" />
            </div>
                <h2 style={{ fontStyle: 'italic', marginTop: '1rem', fontSize: '3rem'}}>Sign-In</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username"><strong>Enter Username:</strong></label><br/>
                        <input type="text" placeholder="Enter Username" name="username" onChange={handleInput} className="form-control rounded-0" />
                        {errors.username && <span className="text-danger">{errors.username}</span>}
                    </div>
                    <div className="mb-3">
                        <br/><label htmlFor="password"><strong>Enter Password:</strong></label><br/>
                        <input type="password" placeholder="Enter Password" name="password" onChange={handleInput} className="form-control rounded-0" />
                        {errors.password && <span className="text-danger">{errors.password}</span>}
                    </div>
                    <br/><button onClick={handleLogin} type="submit" className="btn btn-success w-100 rounded-0">Log in</button>
                    <p style={{ fontStyle: 'italic', marginTop: '1rem', color: '#FFF7D1' }}>
                        "Need to check your order status?"<br/>
                        <Link to='/login'style={{color: '#3B1E54', textDecoration: 'none'}} >Login as Customer</Link>
                    </p>
                </form>
            </div> 
        </div>
    );
}

export default LoginOperator;
