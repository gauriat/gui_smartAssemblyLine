import React, { useEffect,useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo.png';
import logo1 from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo1.png';
import machineImage from './SMART MANUFACTURING LAB.JPG';

const MachineStatusMap = () => {
    const navigate = useNavigate();
    const productionId = sessionStorage.getItem('productionID');
    console.log("Fetched Production ID:", productionId);
    // Handle redirection when clicking on areas
    const handleNavigation = (path) => {
        navigate(path);
    };

    // Start production
    const startProduction = async () => {
        try {
            const response = await axios.post('https://gui-smartassemblyline-1.onrender.com/resumeProd',{ productionId });
            alert(response.data.message || 'Production started successfully!');
        } catch (error) {
            console.error('Error starting production:', error);
            alert('Failed to start production. Please try again.');
        }
    };

    // Stop production
    const stopProduction = async () => {
        try {
            const response = await axios.post('https://gui-smartassemblyline-1.onrender.com/stopProduction',{
                productionId: productionId,
            });
            alert(response.data.message || 'Production stopped successfully!');
        } catch (error) {
            console.error('Error stopping production:', error);
            alert('Failed to stop production. Please try again.');
        }
    };

    return (
        <div className='operator'>
            <header className="navbar1">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '23%'}}/>
                <nav className="nav-links">
                    <button onClick={startProduction} className="nav-button" >Resume Production</button>
                    <button onClick={stopProduction} className="nav-button">Stop Production</button>
                    <Link to='/dashboardOperator' className='nav-link' style={{fontSize: '20px', marginTop: '5px'}}>Back</Link>
                </nav>
            </header>
            <div style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ position: 'relative', width: '100vw' }}>
                    {/* Display the machine image */}
                    <img
                        src={machineImage}
                        alt="Smart Assembly Line"
                        style={{ width: '100vw', height:'100vh', borderRadius: '10px', border: '2px solid #ccc' }}
                    />

                    {/* Define clickable areas */}
                    <div
                        onClick={() => handleNavigation('/statusASRS_RM')}
                        style={{
                            position: 'absolute',
                            top: '25%',
                            left: '1%',
                            width: '20%',
                            height: '70%',
                            border: '2px solid transparent',
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => (e.target.style.border = '2px solid red')}
                        onMouseOut={(e) => (e.target.style.border = '2px solid transparent')}
                    ></div>
                    
                    <div
                        onClick={() => handleNavigation('/statusScara')}
                        style={{
                            position: 'absolute',
                            top: '49%',
                            left: '23%',
                            width: '12%',
                            height: '20%',
                            border: '2px solid transparent',
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => (e.target.style.border = '2px solid red')}
                        onMouseOut={(e) => (e.target.style.border = '2px solid transparent')}
                    ></div>
                    
                    <div
                        onClick={() => handleNavigation('/statusCobot')}
                        style={{
                            position: 'absolute',
                            top: '23%',
                            left: '23%',
                            width: '10%',
                            height: '30%',
                            border: '2px solid transparent',
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => (e.target.style.border = '2px solid red')}
                        onMouseOut={(e) => (e.target.style.border = '2px solid transparent')}
                    ></div>

                    <div
                        onClick={() => handleNavigation('/statusVision')}
                        style={{
                            position: 'absolute',
                            top: '30%',
                            left: '42%',
                            width: '10%',
                            height: '20%',
                            border: '2px solid transparent',
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => (e.target.style.border = '2px solid red')}
                        onMouseOut={(e) => (e.target.style.border = '2px solid transparent')}
                    ></div>

                    <div
                        onClick={() => handleNavigation('/statusViper')}
                        style={{
                            position: 'absolute',
                            top: '14%',
                            left: '60%',
                            width: '15%',
                            height: '22%',
                            border: '2px solid transparent',
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => (e.target.style.border = '2px solid red')}
                        onMouseOut={(e) => (e.target.style.border = '2px solid transparent')}
                    ></div>

                    <div
                        onClick={() => handleNavigation('/statusASRS_FG')}
                        style={{
                            position: 'absolute',
                            top: '2%',
                            left: '77%',
                            width: '20%',
                            height: '60%',
                            border: '2px solid transparent',
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => (e.target.style.border = '2px solid red')}
                        onMouseOut={(e) => (e.target.style.border = '2px solid transparent')}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default MachineStatusMap;
