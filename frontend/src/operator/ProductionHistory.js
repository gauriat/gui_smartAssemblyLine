import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './operator.css';
import logo from 'D:/gui/Code/frontend/src/logo.png';
import logo1 from 'D:/gui/Code/frontend/src/logo1.png';

function ProductionHistory({ onLogout }) {
    const [productionHistory, setProductionHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductionHistory = async () => {
            try {
                const response = await fetch('http://localhost:8081/allProductionDetails');
                const result = await response.json();

                if (result.success) {
                    setProductionHistory(result.data);
                } else {
                    console.error('Failed to fetch production history:', result.message);
                }
            } catch (error) {
                console.error('Error fetching production history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductionHistory();
    }, []);

    const handleDispatch = async (production) => {
        try {
            const response = await fetch('http://localhost:8081/dispatchProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: production.Order_ID,
                    orderItemId: production.OrderItem_ID,
                    customerId: production.Customer_ID,
                    rackFg: production.Rack_FG,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Product dispatched successfully!');
                setProductionHistory((prev) =>
                    prev.filter((item) => item.Production_ID !== production.Production_ID)
                );
            } else {
                alert('Failed to dispatch product: ' + result.message);
            }
        } catch (error) {
            console.error('Error during dispatch operation:', error);
            alert('Error dispatching product.');
        }
    };

    return (
        <div>
            <header className="navbar1">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '3%'}}/>
                <nav className="nav-links">
                    <Link to="/dashboardOperator" className="nav-link" style={{fontSize: '20px'}}>Back</Link>
                    <Link onClick={onLogout} to="/" className="nav-link" style={{fontSize: '20px'}}>Logout</Link>
                </nav>
            </header>
            <div className="production-history-container">
                <h1>Production History</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="cards-container">
                        {productionHistory.map((production) => (
                            <div className="card" key={production.Production_ID}>
                                <h2>Production ID: {production.Production_ID}</h2>
                                <p><strong>Order ID:</strong> {production.Order_ID}</p>
                                <p><strong>Order Item ID:</strong> {production.OrderItem_ID}</p>
                                <p><strong>Customer:</strong> {production.Customer_ID}</p>
                                <p><strong>Operator:</strong> {production.Operator_ID}</p>
                                <p><strong>Process:</strong> {production.ProcessName}</p>
                                <p><strong>Started Date:</strong> {production.StartedDate}</p>
                                <p><strong>Last Worked:</strong> {production.LastWorked}</p>
                                <p><strong>Rack RM:</strong> {production.Rack_RM}</p>
                                <p><strong>Rack FG:</strong> {production.Rack_FG}</p>

                                {production.Order_Status === 'dispatched' ? (
                                    <>
                                        <h3>Product Details:</h3>
                                        <p><strong>Product ID:</strong> {production.Product_ID}</p>
                                        <p><strong>Dispatch Date:</strong> {new Date(production.Dispatch_Date).toLocaleDateString()}</p>
                                    </>
                                ) : (
                                    <button
                                        className="dispatch-btn"
                                        onClick={() => handleDispatch(production)}
                                    >
                                        Dispatch
                                    </button>
                                )}

                                <div className="machines-list">
                                    <h3>Machines Involved:</h3>
                                    {production.Machines.map((machine) => (
                                        <div className="machine-card" key={machine.Machine_ID}>
                                            <p><strong>Machine Name:</strong> {machine.Machine_Name}</p>
                                            <p><strong>Status:</strong> {machine.Machine_Status}</p>
                                            <p><strong>Start Time:</strong> {machine.Machine_StartTime}</p>
                                            <p><strong>End Time:</strong> {machine.Machine_EndTime}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductionHistory;