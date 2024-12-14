import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from 'D:/gui/Code/frontend/src/logo.png';
import logo1 from 'D:/gui/Code/frontend/src/logo1.png';
import 'D:/gui/Code/frontend/src/App.css';

function Cart({ onLogout }) {
    const [patterns, setPatterns] = useState([]);

    const [quantities, setQuantities] = useState({});
    const userId = sessionStorage.getItem('userId');
    const navigate = useNavigate();

    // Fetch patterns for the logged-in user
    useEffect(() => {
        const fetchPatterns = async () => {
            try {
                const response = await axios.get('http://localhost:8081/viewPatterns', {
                    params: { userId }
                });

                if (response.data.success) {
                    const fetchedPatterns = response.data.patterns;
                    setPatterns(fetchedPatterns);

                    // Initialize quantities for the fetched patterns
                    const initialQuantities = {};
                    fetchedPatterns.forEach(pattern => {
                        initialQuantities[pattern.Pattern_ID] = 0;
                    });
                    setQuantities(initialQuantities);
                } else {
                    console.error('Failed to fetch patterns');
                }
            } catch (error) {
                console.error('Error fetching patterns:', error);
            }
        };

        // Only fetch patterns if not already in local storage
        if (patterns.length === 0) {
            fetchPatterns();
        } else {
            // Initialize quantities for patterns from local storage
            const initialQuantities = {};
            patterns.forEach(pattern => {
                initialQuantities[pattern.Pattern_ID] = 0;
            });
            setQuantities(initialQuantities);
        }
    }, [userId, patterns]);

    // Update the quantity for a pattern
    const updateQuantity = (patternId, quantity) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [patternId]: Math.max(quantity, 0) // Ensure quantity is non-negative
        }));
    };

    // Confirm order and send the cart data to the backend
    const confirmOrder = async () => {
        const cartItems = Object.entries(quantities)
            .filter(([idPattern, quantity]) => quantity > 0)
            .map(([idPattern, quantity]) => ({
                idPattern: parseInt(idPattern),
                quantity
            }));

        if (cartItems.length === 0) {
            alert('No items with valid quantities to order.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/placeOrder', {
                userId,
                cartItems
            });

            if (response.data.success) {
                alert('Order placed successfully!');
                navigate('/orders'); // Redirect to the orders page
            } else {
                alert('Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    return (
        <div className="customer">
            <header className="navbar">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px', marginLeft: '15px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '11%'}}/>
                <nav className="nav-links">
                    <Link to="/dashboardCustomer" className="Nav-link" style={{fontSize: '20px'}}>
                        Home
                    </Link>
                    <Link to="/orders" className="Nav-link" style={{fontSize: '20px'}}>
                        Order History
                    </Link>
                    <Link onClick={onLogout} to="/" className="Nav-link" style={{fontSize: '20px', marginRight: '15px'}}>
                        Logout
                    </Link>
                </nav>
            </header>

            <main>
                <section className="pattern-section">
                    <ul className="pattern-list">
                        {patterns.map(pattern => (
                            <li key={pattern.Pattern_ID}>
                                <img
                                    src={`http://localhost:8081/uploads/${pattern.image_path.split('uploads\\')[1]}`}
                                    alt={`Pattern ${pattern.Pattern_ID}`}
                                />
                                <div>
                                    <button
                                        onClick={() => updateQuantity(pattern.Pattern_ID, quantities[pattern.Pattern_ID] - 1)}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantities[pattern.Pattern_ID]}
                                        readOnly
                                    />
                                    <button
                                        onClick={() => updateQuantity(pattern.Pattern_ID, quantities[pattern.Pattern_ID] + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="confirm-order-container">
                    <button
                        className="confirm-order-btn"
                        onClick={confirmOrder}
                        disabled={Object.values(quantities).every(quantity => quantity === 0)}
                    >
                        Confirm Order
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Cart;