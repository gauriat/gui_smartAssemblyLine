import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './operator.css';
import logo from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo.png';
import logo1 from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo1.png';

function AsrsRM() {
    const matrixTemplate = [
        ['RM_24', 'RM_22', 'RM_19', 'RM_15'],
        ['RM_23', 'RM_20', 'RM_16', 'RM_11'],
        ['RM_21', 'RM_17', 'RM_12', 'RM_07'],
        ['RM_18', 'RM_13', 'RM_08', 'RM_05'],
        ['RM_14', 'RM_09', 'RM_04', 'RM_02'],
        ['RM_10', 'RM_06', 'RM_03', 'RM_01'],
    ];

    const [matrix] = useState(matrixTemplate);
    const [cellStates, setCellStates] = useState(Array(6).fill().map(() => Array(4).fill(false)));

    // Fetch rack statuses from the server
    useEffect(() => {
        const fetchRackStatus = async () => {
            try {
                const response = await fetch('https://gui-smartassemblyline-1.onrender.com/getRackStatus');
                const result = await response.json();
    
                if (result.success) {
                    const updatedCellStates = Array(6).fill().map(() => Array(4).fill(false));
    
                    result.data.forEach(({ rowNumber, colNumber, status }) => {
                        if (rowNumber >= 0 && rowNumber < 6 && colNumber >= 0 && colNumber < 4) {
                            updatedCellStates[rowNumber][colNumber] = status === 'filled';
                        }
                    });
                    
                    setCellStates(updatedCellStates);
                }
            } catch (error) {
                console.error('Error fetching rack status:', error);
            }
        };
    
        fetchRackStatus();
    }, []);    

    return (
        <div className="operator">
            <header className="navbar1">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '5%'}}/>
                <nav className="nav-links">
                    <Link to="/edit" className="Nav-link" style={{fontSize: '20px'}}>Edit</Link>
                    <Link to="/statusASRS_RM" className="Nav-link" style={{fontSize: '20px'}}>Back</Link>
                </nav>
            </header>
            <h1 className="heading" style={{fontSize: '60px'}}>ASRS Raw Material</h1>
            <div className="matrix-grid">
                {matrix.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cell, colIndex) => (
                            <div 
                                key={colIndex} 
                                className={`cell ${cellStates[rowIndex][colIndex] ? 'filled' : 'empty'}`}
                            >
                                {cell}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AsrsRM;
