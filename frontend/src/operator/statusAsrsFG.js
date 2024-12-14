import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './operator.css';
import asrs from 'D:/gui/Code/frontend/src/operator/asrs.webp';
import { Link } from 'react-router-dom';
import logo from 'D:/gui/Code/frontend/src/logo.png';
import logo1 from 'D:/gui/Code/frontend/src/logo1.png';

function StatusASRSFG() {
    const productionId = sessionStorage.getItem('productionId');
    const [productionDetails, setProductionDetails] = useState([]);

    // Fetch production details on component mount
    useEffect(() => {
        const fetchProductionDetails = async () => {
            try {
                const response = await axios.get('http://localhost:8081/productionDetails', {
                    params: { machineId: 6, productionId:productionId},
                });
                console.log('API Response:', response.data);
                if (response.data.success) {
                    setProductionDetails(response.data.data); // Set the data array directly
                } else {
                    console.error('Failed to fetch production details:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching production details:', error);
            }
        };

        fetchProductionDetails();
    }, []);
    // Extract the first production detail (if available)
    const detail = productionDetails.length > 0 ? productionDetails[productionDetails.length - 1] : null;

    return (
        <div className="operator">
            <header className="navbar1">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '3%'}}/>
                <nav className="nav-links">
                    <Link to='/statusAsrsFG' className='Nav-link' style={{fontSize: '20px'}}>Edit</Link>
                    <Link to="/status" className="Nav-link" style={{fontSize: '20px'}}>Back</Link>
                </nav>
            </header>
            <div className="container">
                {/* Left panel with System and GPIO status */}
                <div className="left-panel">
                    <div className="system-status">
                        <h2>System Status</h2>
                        <div className="button-container">
                            <div className="circle-group">
                                <button
                                    className={`circle ${detail ? (detail.Status === 'Idle' ? 'red-bright' : 'grey') :(
                                        <p>No production details available.</p>
                                    )}`}
                                   
                                ></button>
                                <p>Stop</p>
                            </div>
                            <div className="circle-group">
                                <button
                                    className={`circle ${ detail ? (detail.Status === 'Running' ? 'green-bright' : 'grey'):(
                                        <p>No production details available.</p>
                                    )}`}  
                                ></button>
                                <p>Start</p>
                            </div>
                        </div>
                    </div>
                    <div className="gpio-status">
                        <h2>Production Details:</h2>
                        {detail ? (
                            <div className="order-status">
                                <p><strong>Production ID:</strong> {detail.Production_ID}</p>
                                <p><strong>Order ID:</strong> {detail.Order_ID}</p>
                                <p><strong>Order Item ID:</strong> {detail.OrderItem_ID}</p>
                                <p><strong>Customer ID:</strong> {detail.Customer_ID}</p>
                                <p><strong>Operator ID:</strong> {detail.Operator_ID}</p>
                                <p><strong>Process:</strong> {detail.ProcessName}</p>
                                <p><strong>Start Date:</strong> {detail.StartedDate}</p>
                                <p><strong>Rack RM:</strong> {detail.Rack_RM}</p>
                                <p><strong>Rack FG:</strong> {detail.Rack_FG}</p>
                                <p><strong>Operation performing:</strong> {detail.OperationName}</p>
                                <p><strong>Machine Name:</strong> {detail.Machine_Name}</p>
                                <p><strong>Machine Status:</strong> {detail.Machine_Status}</p>
                            </div>
                        ) : (
                            <p>No production details available.</p>
                        )}
                    </div>
                </div>
                <div className="right-panel">
                    <div className="current-order">
                        <h2>Current Order</h2>
                        <div className="current-order-info">
                            <div className="order-details">
                                <p><strong>Start:</strong> {detail?(detail.Machine_StartTime || 'N/A'):(
                                    <p>No production details available.</p>
                                )}</p>
                                <p><strong>Stop:</strong> {detail?(detail.Machine_EndTime || 'N/A'):(
                                    <p>No production details available.</p>
                                )}</p>
                            </div>
                            <img src={asrs} alt="ASRS System" width={350} />
                        </div>
                        <div className="job-details">
                            <p><strong>Jobs:</strong> X1R5X1T6L134X1, R6X1T5C002</p>
                            <p><strong>Prod:</strong> MOSAIC_V2</p>
                            <p><strong>Serial:</strong> N00011</p>
                            <p><strong>Assembly:</strong> 101100</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatusASRSFG;