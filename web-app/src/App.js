import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lease from './pages/Lease';
import Property from './pages/Property';
import Tenant from './pages/Tenant';
import Rent from './pages/Rent';
import Cheque from './pages/Cheque';
import Reports from './pages/Reports';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" />;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/lease" element={<PrivateRoute><Lease /></PrivateRoute>} />
                <Route path="/property" element={<PrivateRoute><Property /></PrivateRoute>} />
                <Route path="/tenant" element={<PrivateRoute><Tenant /></PrivateRoute>} />
                <Route path="/rent" element={<PrivateRoute><Rent /></PrivateRoute>} />
                <Route path="/cheque" element={<PrivateRoute><Cheque /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            </Routes>
        </Router>
    );
};

export default App;
