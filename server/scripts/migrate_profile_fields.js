const db = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Employees Table
        const employeeColumns = [
            'ADD COLUMN dob DATE',
            'ADD COLUMN gender ENUM("Male", "Female", "Other")',
            'ADD COLUMN marital_status ENUM("Single", "Married", "Divorced", "Widowed")',
            'ADD COLUMN nationality VARCHAR(50)',
            'ADD COLUMN personal_email VARCHAR(100)',
            'ADD COLUMN location VARCHAR(100)',
            'ADD COLUMN manager_id INT',
            'ADD COLUMN about TEXT',
            'ADD COLUMN skills TEXT',
            'ADD COLUMN interests TEXT',
            'ADD COLUMN certifications TEXT',
            'ADD COLUMN bank_name VARCHAR(100)',
            'ADD COLUMN account_number VARCHAR(50)',
            'ADD COLUMN ifsc_code VARCHAR(20)',
            'ADD COLUMN pan_no VARCHAR(20)',
            'ADD COLUMN uan_no VARCHAR(20)'
        ];

        for (const col of employeeColumns) {
            try {
                await db.execute(`ALTER TABLE employees ${col}`);
                console.log(`Updated employees: ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_COLUMN_NAME' || e.errno === 1060) {
                    console.log(`Column already exists in employees: ${col.split(' ').pop()}`);
                } else {
                    console.error(`Error updating employees ${col}:`, e.message);
                }
            }
        }

        // 2. Salary Structures Table
        const salaryColumns = [
            'ADD COLUMN monthly_wage DECIMAL(10,2)',
            'ADD COLUMN working_days INT DEFAULT 5',
            'ADD COLUMN working_hours INT DEFAULT 8',
            'ADD COLUMN basic_pct DECIMAL(5,2) DEFAULT 50.00',
            'ADD COLUMN hra_pct DECIMAL(5,2) DEFAULT 50.00',
            'ADD COLUMN lta_pct DECIMAL(5,2) DEFAULT 8.33',
            'ADD COLUMN standard_allowance DECIMAL(10,2) DEFAULT 0',
            'ADD COLUMN performance_bonus_pct DECIMAL(5,2) DEFAULT 8.33',
            'ADD COLUMN pf_pct DECIMAL(5,2) DEFAULT 12.00',
            'ADD COLUMN prof_tax DECIMAL(10,2) DEFAULT 200.00'
        ];

        for (const col of salaryColumns) {
            try {
                await db.execute(`ALTER TABLE salary_structures ${col}`);
                console.log(`Updated salary_structures: ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_COLUMN_NAME' || e.errno === 1060) {
                    console.log(`Column already exists in salary_structures: ${col.split(' ').pop()}`);
                } else {
                    console.error(`Error updating salary_structures ${col}:`, e.message);
                }
            }
        }

        // 3. Users Table
        try {
            await db.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL');
            console.log('Updated users: last_login added');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME' || e.errno === 1060) {
                console.log('Column last_login already exists in users');
            } else {
                console.error('Error updating users last_login:', e.message);
            }
        }

        console.log('Migration process finished.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
