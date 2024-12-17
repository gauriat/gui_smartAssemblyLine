import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import Calendar from 'react-calendar'; // Import Calendar component
import 'react-calendar/dist/Calendar.css'; // Import Calendar CSS
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './operator.css';
import logo from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo.png';
import logo1 from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo1.png';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function HomePage({ onLogout }) {
    const [orderCount, setOrderCount] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [dispatchedOrders, setDispatchedOrders] = useState(0);
    const [ordersPerDay, setOrdersPerDay] = useState([]);
    const [ordersByCustomer, setOrdersByCustomer] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchOrderCount = async () => {
            try {
                const totalResponse = await axios.get('https://gui-smartassemblyline-1.onrender.com/totalOrdersCount');
                if (totalResponse.data.success) {
                    setOrderCount(totalResponse.data.totalOrders);
                }
                const pendingResponse = await axios.get('https://gui-smartassemblyline-1.onrender.com/pendingOrdersCount');
                if (pendingResponse.data.success) {
                    setPendingOrders(pendingResponse.data.pendingOrders);
                }
                const dispatchedResponse = await axios.get('https://gui-smartassemblyline-1.onrender.com/dispatchedOrdersCount');
                if (dispatchedResponse.data.success) {
                    setDispatchedOrders(dispatchedResponse.data.dispatchedOrders);
                }
            } catch (err) {
                console.error('Error fetching orders count:', err);
            }
        };

        const fetchOrdersPerDay = async () => {
            try {
                const response = await axios.get('https://gui-smartassemblyline-1.onrender.com/ordersPerDay');
                if (response.data.success) {
                    setOrdersPerDay(response.data.ordersPerDay);
                } else {
                    console.error('Failed to fetch orders per day');
                }
            } catch (err) {
                console.error('Error fetching orders per day:', err);
            }
        };

        const fetchOrdersByCustomer = async () => {
            try {
                const response = await axios.get('https://gui-smartassemblyline-1.onrender.com/ordersByCustomer');
                if (response.data.success) {
                    setOrdersByCustomer(response.data.ordersByCustomer);
                } else {
                    console.error('Failed to fetch orders by customer');
                }
            } catch (err) {
                console.error('Error fetching orders by customer:', err);
            }
        };

        fetchOrderCount();
        fetchOrdersPerDay();
        fetchOrdersByCustomer();
    }, []);

    const barData = {
        labels: ordersPerDay.map(order =>
            new Date(order.orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        ),
        datasets: [
            {
                label: 'Orders Per Day',
                data: ordersPerDay.map(order => order.orderCount),
                backgroundColor: 'rgba(54, 162, 235, 0.8)', // Vibrant blue
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                hoverBackgroundColor: 'rgba(54, 162, 235, 1)',
            },
        
        ],
    };
    
    
    const pieData = {
        labels: ordersByCustomer.map(customer => customer.Customer_Name),
        datasets: [
            {
                label: 'Orders by Customer',
                data: ordersByCustomer.map(customer => customer.orderCount),
                backgroundColor: [
                    
                    
                    
                    'rgba(0, 188, 212, 0.8)',  // Cyan
                    'rgba(255, 87, 34, 0.8)',  // Deep Orange
                    'rgba(156, 39, 176, 0.8)', // Vibrant Violet
                    'rgba(102, 51, 153, 0.8)', // Deep Purple
                    'rgba(33, 150, 243, 0.8)', // Sky Blue
                    'rgba(255, 193, 7, 0.8)',  // Amber
                    'rgba(244, 67, 54, 0.8)',  // Bright Red 
                    
                ],                
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2,
                hoverOffset: 10, // Adds a "pop-out" effect on hover
            },
        ],
    };    

    return (
        <div className='operator'>
            <header className="navbar1">
                <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px'}} />
                <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '23%'}}/>
                <nav className="nav-links">
                    <Link to="/orders1" className="Nav-link" style={{fontSize: '18.5px'}}>View Orders</Link>
                    <Link to="/status" className="Nav-link" style={{fontSize: '18.5px'}}>Status</Link>
                    <Link to="/productionHistory" className="Nav-link" style={{fontSize: '18.5px'}}>Production History</Link>
                    <Link onClick={onLogout} to="/" className="Nav-link" style={{fontSize: '18.5px'}}>Logout</Link>
                </nav>
            </header>

            <div className="order-summary">
                <div className="order-count-box">
                    <h3 style={{fontSize: '20px'}}>Total Orders</h3>
                    <p style={{fontSize: '20px'}}>{orderCount}</p>
                </div>
                <div className="order-count-box">
                    <h3 style={{fontSize: '20px'}}>Pending Orders</h3>
                    <p style={{fontSize: '20px'}}>{pendingOrders}</p>
                </div>
                <div className="order-count-box">
                    <h3 style={{fontSize: '20px'}}>Completed Orders</h3>
                    <p style={{fontSize: '20px'}}>{dispatchedOrders}</p>
                </div>
            </div>

            <div className="graphs-layout">
                <h1>Orders Visualization</h1>
                <div className="graphs-row">
                    {/* Bar Graph */}
                    <div className="graph-box">
                        <label style={{fontSize: '20px', fontFamily: 'serif'}}>Number of orders per day</label>
                        <Bar data={barData} />
                        
                    </div>
                    
                    {/* Doughnut Chart */}
                    <div className="graph-box">
                        <label style={{fontSize: '20px', fontFamily: 'serif'}}>Orders by different customers</label>
                        <Doughnut data={pieData} />
                      
                    </div>
                    
                    {/* Calendar */}
                    <div className="calendar-container">
                        <div className='react-calender'>
                            <h2 style={{fontSize: '30px', fontFamily: 'serif'}}>Calendar</h2>
                            <Calendar
                                onChange={setSelectedDate}
                                value={selectedDate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
