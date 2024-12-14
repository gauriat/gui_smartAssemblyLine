import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from 'D:/gui/Code/frontend/src/logo.png';
import logo1 from 'D:/gui/Code/frontend/src/logo1.png';
import 'D:/gui/Code/frontend/src/App.css';

const ViewOrders = () => {
    const [groupedOrders, setGroupedOrders] = useState([]);
    const userId = sessionStorage.getItem('userId');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:8081/viewOrders', {
                    params: { userId },
                });

                // Group orders by Order_ID
                const grouped = response.data.orders.reduce((acc, order) => {
                    if (!acc[order.Order_ID]) {
                        acc[order.Order_ID] = [];
                    }
                    acc[order.Order_ID].push(order);
                    return acc;
                }, {});
                setGroupedOrders(grouped);
            } catch (err) {
                console.error('Error fetching orders:', err);
            }
        };

        fetchOrders();
    }, [userId]);

    return (
        <div className="customer">
            <header className="navbar">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px', marginLeft: '15px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '3%'}}/>
                <nav className="nav-links">
                    <Link to="/dashboardCustomer" className="Nav-link" style={{fontSize: '20px'}}>Home</Link>
                    <Link to="/" className="Nav-link" style={{fontSize: '20px', marginRight: '15px'}}>Logout</Link>
                </nav>
            </header>

            <div className="order-section">
                <h2>Your Orders</h2>
                <div className="order-list">
                    {Object.keys(groupedOrders).length > 0 ? (
                        Object.entries(groupedOrders).map(([orderId, orders]) => (
                            <div className="order-group" key={orderId}>
                                <h3>Order ID: {orderId}</h3>
                                <div className="order-items">
                                    {orders.map((order) => {
                                        const createdTime = new Date(order.orderDate).toLocaleDateString();
                                        const dispatchedTime = order.dispatched_time
                                            ? new Date(order.dispatched_time).toLocaleDateString()
                                            : 'Not yet dispatched';

                                        return (
                                            <div className="order-item" key={order.OrderItem_ID}>
                                                <img
                                                    src={`http://localhost:8081/uploads/${order.image_path.split('uploads\\')[1]}`}
                                                    alt={`Pattern ${order.Pattern_ID}`}
                                                    className="order-image"
                                                />
                                                <div className="order-details">
                                                    <p><strong>Pattern ID:</strong> {order.Pattern_ID}</p>
                                                    <p><strong>Quantity:</strong> {order.Quantity}</p>
                                                    <p><strong>Order Date:</strong> {createdTime}</p>
                                                    <p><strong>Dispatched Date:</strong> {dispatchedTime}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No orders found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewOrders;