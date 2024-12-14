import React from 'react';
import { Link } from 'react-router-dom';
import logo from 'D:/gui/Code/frontend/src/logo.png';
import logo1 from 'D:/gui/Code/frontend/src/logo1.png';
import Slider from "./Slider";

function HomePage({ onLogout }) {
    return (
        <div className="landing-container1">
            <header className="navbar2">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px', marginLeft: '15px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '17%'}}/>
                <nav className="nav-links2">
                    <Link to="/addPattern" className="Nav-link" style={{fontSize: '20px'}}>
                        Add Pattern
                    </Link>
                    <Link to="/addCart" className="Nav-link" style={{fontSize: '20px'}}>
                        Order
                    </Link>
                    <Link to="/orders" className="Nav-link" style={{fontSize: '20px'}}>
                        Order History
                    </Link>
                    <Link onClick={onLogout} to="/" className="Nav-link1" style={{fontSize: '20px'}}>
                        Logout
                    </Link>
                </nav>
            </header>
            <Slider/>
        </div>
    );
}

export default HomePage;
