import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './customer/HomePage';
import Login from './login';
import AddPattern from './customer/AddPattern';
import AddCart from './customer/AddCart';
import ViewOrders from './customer/ViewOrders';
import Orders from './operator/Orders';
import Dashboard from './operator/dashboard';
import StatusCobot from './operator/statusCobot';
import StatusViper from './operator/statusViper';
import StatusASRS from './operator/statusAsrs';
import StatusASRSFG from './operator/statusAsrsFG';
import StatusScara from './operator/statusScara';
import AsrsRM from './operator/asrsRM';
import AsrsFG from './operator/asrsFG';
import Status from './operator/assemblyStatus';
import StatusVision from './operator/statusVision';
import Edit from './operator/asrsEdit';
import ProductionHistory from './operator/ProductionHistory';
import './App.css';

function App() {
    const [session, setSession] = useState({
        role: sessionStorage.getItem('role') || null,
        isLoggedIn: !!sessionStorage.getItem('role'),
    });

    // Handle login
    const handleLogin = (role) => {
        sessionStorage.setItem('role', role);
        setSession({ role, isLoggedIn: true });
    };

    // Handle logout
    const handleLogout = () => {
        sessionStorage.removeItem('role');
        localStorage.clear();
        setSession({ role: null, isLoggedIn: false });
    };

    // Protected route wrapper
    const ProtectedRoute = ({ children, allowedRole }) => {
        if (!session.isLoggedIn) {
            return <Navigate to="/login" />;
        }
        if (allowedRole && session.role !== allowedRole) {
            return <Navigate to="/" />;
        }
        return children;
    };

    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Login onLogin={handleLogin} />} />
                

                    {/* Customer Routes */}
                    <Route
                        path="/dashboardCustomer"
                        element={
                            <ProtectedRoute allowedRole="customer">
                                <HomePage onLogout={handleLogout} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/addPattern"
                        element={
                            <ProtectedRoute allowedRole="customer">
                                <AddPattern onLogout={handleLogout} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/addCart"
                        element={
                            <ProtectedRoute allowedRole="customer">
                                <AddCart onLogout={handleLogout} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute allowedRole="customer">
                                <ViewOrders onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />

                    {/* Operator Routes */}
                    <Route
                        path="/dashboardOperator"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <Dashboard onLogout={handleLogout} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders1"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <Orders onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/status"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <Status onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/statusCobot"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <StatusCobot onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/statusViper"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <StatusViper onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/statusVision"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <StatusVision onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/statusScara"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <StatusScara onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/statusASRS_RM"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <StatusASRS onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />    
                    <Route
                        path="/statusAsrsRM"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <AsrsRM onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/statusAsrsFG"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <AsrsFG onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/statusASRS_FG"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <StatusASRSFG onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/edit"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <Edit onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/productionHistory"
                        element={
                            <ProtectedRoute allowedRole="operator">
                                <ProductionHistory onLogout={handleLogout}/>
                            </ProtectedRoute>
                        }
                    />    
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
