import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AttendanceSidebar from '../components/AttendanceSidebar';
import EmployeeCard from '../components/EmployeeCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('Employees');
    const [employees, setEmployees] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!storedUser || !token) {
            navigate('/login');
            return;
        }
        setUser(storedUser);
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/employees');
            setEmployees(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Filter employees based on role
    // Admin/HR see all
    // Employee sees only themselves
    const filteredEmployees = user?.role === 'EMPLOYEE' 
        ? employees.filter(emp => emp.user_id === user.id)
        : employees;

    return (
        <div className="dashboard-container">
            <Navbar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                user={user} 
                onLogout={handleLogout}
            />

            <main className="dashboard-main">
                <div className="dashboard-content">
                    {activeTab === 'Employees' && (
                        <div className="employees-tab">
                            <div className="section-header">
                                {(user?.role === 'ADMIN' || user?.role === 'HR') && (
                                    <button className="btn-primary" onClick={() => navigate('/signup')}>
                                        <span>+</span> NEW
                                    </button>
                                )}
                                <input 
                                    type="text" 
                                    className="search-employees" 
                                    placeholder="Search employees..." 
                                />
                            </div>

                            <div className="employee-grid">
                                {filteredEmployees.map(emp => (
                                    <EmployeeCard key={emp.id} employee={emp} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Attendance' && (
                        <div className="attendance-tab">
                            <h1>Attendance Records</h1>
                            <p>Coming soon...</p>
                        </div>
                    )}

                    {activeTab === 'Time Off' && (
                        <div className="timeoff-tab">
                            <h1>Leave Requests</h1>
                            <p>Coming soon...</p>
                        </div>
                    )}
                </div>

                <aside className="dashboard-sidebar">
                    <AttendanceSidebar user={user} />
                </aside>
            </main>
        </div>
    );
};

export default Dashboard;
