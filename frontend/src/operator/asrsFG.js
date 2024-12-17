import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './operator.css';
import logo from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo.png';
import logo1 from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo1.png';

function AsrsFG() {
    const matrixTemplate = [
        ['FG_24', 'FG_22', 'FG_19', 'FG_15'],
        ['FG_23', 'FG_20', 'FG_16', 'FG_11'],
        ['FG_21', 'FG_17', 'FG_12', 'FG_07'],
        ['FG_18', 'FG_13', 'FG_08', 'FG_05'],
        ['FG_14', 'FG_09', 'FG_04', 'FG_02'],
        ['FG_10', 'FG_06', 'FG_03', 'FG_01'],
    ];

    const [matrix] = useState(matrixTemplate);
    const [cellStates, setCellStates] = useState(Array(6).fill().map(() => Array(4).fill(false)));

    // Fetch rack statuses from the server
    useEffect(() => {
        const fetchRackStatus = async () => {
            try {
                const response = await fetch('https://gui-smartassemblyline-1.onrender.com/getRackStatusFG');
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
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '23%'}}/>
                <nav className="nav-links">
                    <Link to="/statusASRS_FG" className="Nav-link" style={{fontSize: '20px'}}>Back</Link>
                </nav>
            </header>
            <h1 className="heading" style={{fontSize: '60px'}}>ASRS Finished Goods</h1>
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

export default AsrsFG;
