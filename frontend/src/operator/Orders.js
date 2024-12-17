import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo.png';
import logo1 from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo1.png';
import './operator.css';
import axios from 'axios';

const Orders = ({ onLogout }) => {
    const [orders, setOrders] = useState([]);
    const [error] = useState('');
    const operatorId = sessionStorage.getItem('userId'); // Replace with actual operator ID if available
    console.log(operatorId);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('https://gui-smartassemblyline-1.onrender.com/orders');
                const fetchedOrders = response.data.orders;
                setOrders(fetchedOrders);
            } catch (err) {
                console.error('Error fetching orders from the server:', err);
            }
        };

        fetchOrders();
    }, []);

    const handleStartProduction = async (orderId) => {
        try {
            const response1=await axios.post('https://gui-smartassemblyline-1.onrender.com/startProduction', { orderId, operatorId });
            alert('Production started successfully!');
            const {productionId}=response1.data;
            sessionStorage.setItem('productionID',productionId);
            console.log("Production ID:",productionId);
            navigate('/status');
        } catch (err) {
            console.error('Error starting production:', err);
            alert('Failed to start production');
        }
    };

    return (
        <div>
            <header className="navbar1">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '5%'}}/>
                <nav className="nav-links">
                    <Link to="/dashboardOperator" className="Nav-link" style={{fontSize: '20px'}}>Home</Link>
                    <Link onClick={onLogout} to="/" className="Nav-link" style={{fontSize: '20px'}}>Logout</Link>
                </nav>
            </header>
            <h2>Your Orders</h2>
            {error && <div>{error}</div>} {/* Display any errors */}
            {orders.length > 0 ? (
                <ul>
                    {orders.map((order) => {
                        const createdTime = new Date(order.orderDate).toLocaleDateString();
                        return (
                            <li key={order.OrderItem_ID}>
                                <img
                                    src={`https://gui-smartassemblyline.onrender.com/uploads/${order.image_path.split('uploads\\')[1]}`}
                                    alt={`Pattern ${order.Pattern_ID}`}
                                    width="100"
                                    height="120"
                                />
                                <div className="order-details">
                                    <p><strong>Order ID:</strong> {order.Order_ID}</p>
                                    <p><strong>Pattern ID:</strong> {order.Pattern_ID}</p>
                                    <p><strong>Quantity:</strong> {order.Quantity}</p>
                                    <p><strong>Ordered On:</strong> {createdTime}</p>
                                </div>
                                <button
                                    className="production-btn"
                                    onClick={() => handleStartProduction(order.Order_ID)}
                                >
                                    Start Production
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default Orders;
