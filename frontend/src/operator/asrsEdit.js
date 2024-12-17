import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './operator.css';
import logo from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo.png';
import logo1 from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo1.png';


function AsrsEdit() {
    const matrixTemplate = [
        ['RM_24', 'RM_22', 'RM_19', 'RM_15'],
        ['RM_23', 'RM_20', 'RM_16', 'RM_11'],
        ['RM_21', 'RM_17', 'RM_12', 'RM_07'],
        ['RM_18', 'RM_13', 'RM_08', 'RM_05'],
        ['RM_14', 'RM_09', 'RM_04', 'RM_02'],
        ['RM_10', 'RM_06', 'RM_03', 'RM_01'],
    ];
    const [cellStates, setCellStates] = useState(
        Array(6)
            .fill()
            .map(() => Array(4).fill(false))
    );

    useEffect(() => {
        const fetchRackStatus = async () => {
            try {
                const response = await fetch('https://gui-smartassemblyline-1.onrender.com/getRackStatus');
                const result = await response.json();

                if (result.success) {
                    const updatedCellStates = Array(6)
                        .fill()
                        .map(() => Array(4).fill(false));

                    result.data.forEach(({ rowNumber, colNumber, status }) => {
                        if (rowNumber >= 0 && rowNumber < 6 && colNumber >= 0 && colNumber < 4) {
                            updatedCellStates[rowNumber][colNumber] = status === 'filled';
                            console.log(rowNumber, colNumber, status);
                            console.log(updatedCellStates[rowNumber][colNumber]);
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

    useEffect(() => {
        console.log(cellStates);
    },[cellStates])

    const updateRackStatus = async (row, col, status) => {
        try {
            const rackID = matrixTemplate[row ][col ];
            console.log(rackID);
            const response = await fetch('https://gui-smartassemblyline-1.onrender.com/updateRackStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rackID, status }),
            });
    
            const result = await response.json();
            if (result.success) {
                console.log(`Successfully updated Rack ${rackID} to ${status}`);
                
                // Re-fetch rack statuses after successful update
                const fetchUpdatedRackStatus = async () => {
                    try {
                        const updatedResponse = await fetch('https://gui-smartassemblyline-1.onrender.com/getRackStatus');
                        const updatedResult = await updatedResponse.json();
    
                        if (updatedResult.success) {
                            const updatedCellStates = Array(6).fill().map(() => Array(4).fill(false));
    
                            updatedResult.data.forEach(({ rowNumber, colNumber, status }) => {
                                if (rowNumber >= 0 && rowNumber <6 && colNumber >= 0 && colNumber < 4) {
                                    updatedCellStates[rowNumber][colNumber] = status === 'filled';
                                }
                            });
    
                            setCellStates(updatedCellStates);
                        }
                    } catch (error) {
                        console.error('Error fetching updated rack status:', error);
                    }
                };
    
                fetchUpdatedRackStatus();
            } else {
                console.error(`Failed to update Rack ${rackID}:`, result.message);
            }
        } catch (error) {
            console.error('Error updating rack status:', error);
        }
    };    

    return (
        <div className="operator">
            <header className="navbar1">
            <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px'}} />
            <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '-2%'}}/>
                <nav className="nav-links">
                    <Link to="/statusAsrsRM" className="Nav-link" style={{fontSize: '20px'}}>
                        Back
                    </Link>
                </nav>
            </header>
            <h1 className="heading" style={{fontSize: '60px'}}>ASRS Raw Material - Edit Mode</h1>
            <div className="matrixgrid-edit">
                {matrixTemplate.map((row, rowIndex) => (
                    <div key={rowIndex} className="row-edit">
                        {row.map((rackID, colIndex) => (
                            <div
                                key={colIndex}
                                className={`cell-edit ${cellStates[rowIndex][colIndex] ? 'filled' : 'empty'}`}
                            >
                                <span className="rackid-edit">{rackID}</span>
                                <div className="buttongroup-edit">
                                    <button
                                        className="actionbutton-edit fillbutton-edit"
                                        onClick={() =>
                                            updateRackStatus(rowIndex , colIndex , 'filled')
                                        }
                                    >
                                        Fill
                                    </button>
                                    <button
                                        className="actionbutton-edit emptybutton-edit"
                                        onClick={() =>
                                            updateRackStatus(rowIndex , colIndex , 'empty')
                                        }
                                    >
                                        Empty
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AsrsEdit;
