import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css'; // Import the new CSS file

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    const fetchUsers = async (userTypeFilter = 'all') => {
        setLoading(true);
        setError(null);
        setUsers([]);

        const adminToken = localStorage.getItem('adminToken');

        if (!adminToken) {
            navigate('/login');
            return;
        }

        let url = 'http://localhost:5000/api/admin/users';
        if (userTypeFilter === 'donor') {
            url = 'http://localhost:5000/api/admin/donors';
        } else if (userTypeFilter === 'recipient') {
            url = 'http://localhost:5000/api/admin/recipients';
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUsers(data.data);
            } else {
                setError(data.error || 'Failed to fetch users. Please try again.');
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUserType');
                    localStorage.removeItem('userName');
                    navigate('/login');
                }
            }
        } catch (err) {
            setError('Network error. Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(filter);
    }, [filter, navigate]);

    // Helper function to get CSS class for user type
    const getUserTypeColor = (type) => {
        switch (type) {
            case 'donor': return 'user-type-donor';
            case 'recipient': return 'user-type-recipient';
            case 'admin': return 'user-type-admin';
            default: return 'user-type-default';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUserType');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    return (
        <div className="admin-page-container"> {/* Container for the entire page, equivalent to body styling */}
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="user-info">
                    <span>
                        Welcome, {localStorage.getItem('userName') || 'Admin'}!
                    </span>
                    <button
                        onClick={handleLogout}
                        className="button-base button-logout" // Apply custom button styles
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="admin-main-content"> {/* Main content wrapper */}
                <section className="admin-section"> {/* Section for users overview */}
                    <h2>Registered Users Overview</h2>

                    <div className="button-group"> {/* Button group for filters */}
                        <button
                            onClick={() => setFilter('all')}
                            className={`button-base ${filter === 'all' ? 'button-primary' : 'button-gray'}`}
                        >
                            All Users
                        </button>
                        <button
                            onClick={() => setFilter('donor')}
                            className={`button-base ${filter === 'donor' ? 'button-green' : 'button-gray'}`}
                        >
                            Donors
                        </button>
                        <button
                            onClick={() => setFilter('recipient')}
                            className={`button-base ${filter === 'recipient' ? 'button-blue' : 'button-gray'}`}
                        >
                            Recipients
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-600">Loading users...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600 font-medium">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No users found for this category.</div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                            <table className="data-table"> {/* Apply data-table class */}
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>User Type</th>
                                        <th>Phone Number</th>
                                        <th>Blood Type (Donor)</th>
                                        <th>Organs (Donor)</th>
                                        <th>Needed Blood (Recipient)</th>
                                        <th>Needed Organ (Recipient)</th>
                                        <th>Registration Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200"> {/* Tailwind's divide-y can remain */}
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td className={`capitalize ${getUserTypeColor(user.userType)}`}>
                                                {user.userType}
                                            </td>
                                            <td>{user.phoneNumber || 'N/A'}</td>
                                            <td>{user.bloodType || 'N/A'}</td>
                                            <td>{user.organs || 'N/A'}</td>
                                            <td>{user.neededBloodType || 'N/A'}</td>
                                            <td>{user.neededOrgan || 'N/A'}</td>
                                            <td>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
