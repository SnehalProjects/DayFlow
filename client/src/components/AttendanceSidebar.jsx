import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceSidebar = ({ user }) => {
    const [status, setStatus] = useState({ checkedIn: false, checkedOut: false });
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        if (user) {
            fetchStatus();
        }
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, [user]);

    const fetchStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/attendance/status/${user.id}`);
            setStatus(response.data);
        } catch (error) {
            console.error('Error fetching attendance status:', error);
        }
    };

    const handleCheckIn = async () => {
        try {
            await axios.post('http://localhost:5000/api/attendance/check-in', { employeeId: user.id });
            fetchStatus();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await axios.post('http://localhost:5000/api/attendance/check-out', { employeeId: user.id });
            fetchStatus();
        } catch (error) {
            alert(error.response?.data?.message || 'Check-out failed');
        }
    };

    return (
        <div className="sidebar-panels">
            <div className="sidebar-panel">
                <div className="panel-title">
                    <span>🕒</span> Attendance
                </div>

                <button 
                    className="check-btn" 
                    onClick={handleCheckIn}
                    disabled={status.checkedIn}
                >
                    Check IN <span>→</span>
                </button>

                <div className="attendance-status-box">
                    <div className={`status-dot-text ${status.checkedIn ? 'online' : ''}`}>
                        <div className={`status-indicator ${status.checkedIn ? 'online' : ''}`}></div>
                        {status.checkedIn ? 'Checked In' : 'Not Checked In'}
                    </div>
                    <p className="summary-label">Since {status.checkInTime || '00:00 PM'}</p>
                </div>

                <button 
                    className="check-btn" 
                    onClick={handleCheckOut}
                    disabled={!status.checkedIn || status.checkedOut}
                >
                    Check Out <span>→</span>
                </button>

                <div className="summary-title">Today's Summary</div>
                <div className="summary-row">
                    <span className="summary-label">Shift</span>
                    <span className="summary-value">09:00 - 18:00</span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Duration</span>
                    <span className="summary-value">0h 00m</span>
                </div>
            </div>

            <div className="maintenance-box">
                <span>ℹ️</span>
                <div className="maintenance-text">
                    <div className="maintenance-title">System Maintenance</div>
                    Scheduled for Friday at 10 PM. Please save your work.
                </div>
            </div>
        </div>
    );
};

export default AttendanceSidebar;
