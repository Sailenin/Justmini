import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Import all your components and pages
import Navbar from './components/Navbar';
import About from './components/about';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './components/AdminDashboard';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import PendingApproval from './pages/PendingApproval';

/**
 * ProtectedRoute for donors/recipients.
 * Checks for authentication token and specific user type in sessionStorage.
 * Renders children if authenticated and authorized, otherwise redirects.
 */
const ProtectedRoute = ({ children, requiredUserType }) => {
    const [userType, setUserType] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const checkAuth = () => {
            const token = sessionStorage.getItem('authToken');
            const type = sessionStorage.getItem('userType');
            if (isMounted) {
                setUserType(type || '');
                setIsAuthenticated(!!token);
                setLoading(false);
            }
        };
        checkAuth();
        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        // Display a loading indicator while authentication status is being checked
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl font-medium text-gray-700">Loading user data...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login if no authentication token is found
        return <Navigate to="/login" replace />;
    }

    if (requiredUserType && userType !== requiredUserType) {
        // Redirect to unauthorized page if authenticated but does not have the required user type
        return <Navigate to="/unauthorized" replace />;
    }

    // Render the children components if authenticated and authorized
    return children;
};

/**
 * PrivateAdminRoute for admin dashboard.
 * Checks for admin-specific token and user type stored in localStorage.
 * Renders the AdminDashboard component if authenticated as admin, otherwise redirects.
 */
const PrivateAdminRoute = ({ element: Element }) => {
    // Retrieve admin token and user type from localStorage
    const adminToken = localStorage.getItem('adminToken');
    const adminUserType = localStorage.getItem('adminUserType');

    // Only allow access if adminToken exists and userType is 'admin'
    if (!adminToken || adminUserType !== 'admin') {
        // Redirect to login page if not an authenticated admin
        return <Navigate to="/login" replace />;
    }

    // Render the AdminDashboard component
    return <Element />;
};

/**
 * Unauthorized component displayed when a user tries to access a restricted page.
 */
const Unauthorized = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 text-center p-8 rounded-lg shadow-md m-4">
        <h2 className="text-4xl font-extrabold mb-4">403 - Unauthorized Access</h2>
        <p className="text-lg">You do not have permission to view this page. Please log in with appropriate credentials.</p>
        <button
            onClick={() => window.location.href = '/login'} // Redirect to login on button click
            className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105"
        >
            Go to Login
        </button>
    </div>
);

/**
 * Main App Component managing routes.
 * Defines the application's routing structure.
 */
const App = () => (
    <Router>
        <Navbar /> {/* Global Navigation Bar */}
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} /> {/* Unified Login Page */}
            <Route path="/about" element={<About />} />
            <Route path="/pendingapproval" element={<PendingApproval />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Route - Protected for admin userType */}
            <Route
                path="/admin"
                element={<PrivateAdminRoute element={AdminDashboard} />}
            />

            {/* Donor Dashboard - Protected for 'donor' userType */}
            <Route
                path="/donor-dashboard"
                element={
                    <ProtectedRoute requiredUserType="donor">
                        <DonorDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Recipient Dashboard - Protected for 'recipient' userType */}
            <Route
                path="/recipient-dashboard"
                element={
                    <ProtectedRoute requiredUserType="recipient">
                        <RecipientDashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    </Router>
);

export default App;
