import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo.png';
import logo1 from 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/logo1.png';
import 'C:/Users/gauri/OneDrive/Documents/IRP1/gui_smartAssemblyLine/frontend/src/App.css';

function AddPattern({ onLogout }) {
    const [imageFile, setImageFile] = useState(null); // To store the actual file
    const [preview, setPreview] = useState(null); // To store the preview URL
    const [message, setMessage] = useState('');
    const userId = sessionStorage.getItem('userId');  // Retrieve userId from session storage
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // Store the file for form submission
            setPreview(URL.createObjectURL(file)); // Create a preview URL for the selected file
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('image', imageFile);

        try {
            const response = await axios.post('https://gui-smartassemblyline-1.onrender.com/addPattern', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setMessage('Pattern added successfully!');
                navigate('/addCart');
            } else {
                setMessage('Failed to add pattern.');
            }
        } catch (error) {
            console.error('Error adding pattern:', error);
            setMessage('An error occurred while adding the pattern.');
        }
    };

    return (
        <div className='customer'>
            <div className="add-pattern-container">
                <header className="navbar">
                <img src={logo1} alt="Logo" className="logo1" style={{width: '100px', height: '80px', marginLeft: '15px'}} />
                <img src={logo} alt="Logo" className="logo" style={{width: '100px', height: '80px', marginLeft: '15%'}}/>
                    <nav className="nav-links">
                        <Link to="/dashboardCustomer" className="Nav-link" style={{fontSize: '20px'}}>
                            Home
                        </Link>
                        <Link to="/addCart" className="Nav-link" style={{fontSize: '20px'}}>
                            Order
                        </Link>
                        <Link to="/orders" className="Nav-link" style={{fontSize: '20px'}}>
                            Order History
                        </Link>
                        <Link onClick={onLogout} to="/" className="Nav-link" style={{fontSize: '20px', marginRight: '15px'}}>
                            Logout
                        </Link>
                    </nav>
                </header>
                <h2>Add New Pattern</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="image">Upload Image</label>
                        <input
                            type="file"
                            id="image"
                            onChange={handleImageChange}
                            required
                        />
                    </div>

                    {/* Preview section */}
                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="Selected Pattern" />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary">Add Pattern</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default AddPattern;
