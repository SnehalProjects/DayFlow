import React, { useState } from 'react';

const Navbar = ({ activeTab, setActiveTab, user, onLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const tabs = ['Employees', 'Attendance', 'Time Off'];

    return (
        <nav className="navbar">
            <div className="nav-left">
                <div className="logo-section" onClick={() => setActiveTab('Employees')}>
                    <div className="logo-icon">HR</div>
                    <span className="logo-text">Dayflow</span>
                </div>

                <div className="nav-tabs">
                    {tabs.map(tab => (
                        <div 
                            key={tab}
                            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
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
                        <div className="dropdown-item">My Profile</div>
                        <div className="dropdown-item" onClick={onLogout}>Log Out</div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
