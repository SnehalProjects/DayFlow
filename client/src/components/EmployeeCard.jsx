import React from 'react';

const EmployeeCard = ({ employee }) => {
    // Status indicators:
    // Present -> 🟢
    // On Leave -> ✈️
    // Absent -> 🟡
    
    const renderStatusIcon = () => {
        switch (employee.derivedStatus) {
            case 'Present':
                return <span style={{ color: '#22c55e' }}>●</span>;
            case 'On Leave':
                return <span>✈️</span>;
            case 'Absent':
                return <span style={{ color: '#eab308' }}>●</span>;
            default:
                return null;
        }
    };

    return (
        <div className="employee-card">
            <div className="card-status">
                {renderStatusIcon()}
            </div>
            
            <div className="card-avatar">
                <img src={`https://ui-avatars.com/api/?name=${employee.full_name}&background=random`} alt={employee.full_name} />
            </div>

            <div className="card-name">{employee.full_name}</div>
            <div className="card-role">{employee.designation || 'Specialist'}</div>

            <div className="card-footer">
                <span>ID: {employee.employee_code}</span>
                <span>→</span>
            </div>
        </div>
    );
};

export default EmployeeCard;
