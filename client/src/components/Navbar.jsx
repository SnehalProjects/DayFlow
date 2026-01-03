import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ activeTab, setActiveTab, user, onLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const tabs = ['Employees', 'Attendance', 'Time Off'];

    return (
        <nav className="navbar">
            <div className="nav-left">
                <div className="logo-section" onClick={() => {
                    if (setActiveTab) setActiveTab('Employees');
                    navigate('/dashboard');
                }}>
                    <div className="logo-icon">HR</div>
                    <span className="logo-text">Dayflow</span>
                </div>

                <div className="nav-tabs">
                    {tabs.map(tab => (
                        <div 
                            key={tab}
                            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => {
                                if (setActiveTab) {
                                    setActiveTab(tab);
                                    navigate('/dashboard');
                                }
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
            </div>

            <div className="nav-right">
                <div className="search-box">
                    <span>🔍</span>
                    <input type="text" placeholder="Search..." />
                </div>

                <div className="status-indicator online"></div>

                <div className="profile-avatar" onClick={() => setShowDropdown(!showDropdown)}>
                    <img src={`https://ui-avatars.com/api/?name=${user?.fullName}&background=random`} alt="User" />
                </div>

                {showDropdown && (
                    <div className="profile-dropdown">
                        <div className="dropdown-item" onClick={() => navigate('/profile', { state: { fromNav: true } })}>
                            My Profile
                        </div>
                        <div className="dropdown-item" onClick={onLogout}>Log Out</div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
