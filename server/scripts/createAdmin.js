const db = require('../config/db');
const { hashPassword } = require('../utils/authUtils');

const createAdmin = async () => {
    const email = 'admin@dayflow.com';
    const password = 'admin123';
    const fullName = 'System Admin';
    const employeeCode = 'DFAD20260001';

    try {
        const hashedPassword = await hashPassword(password);

        // Insert into users
        const [userResult] = await db.execute(
            'INSERT INTO users (employee_code, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
            [employeeCode, email, hashedPassword, 'ADMIN', true]
        );

        const userId = userResult.insertId;

        // Insert into employees
        await db.execute(
            'INSERT INTO employees (user_id, full_name, designation, department) VALUES (?, ?, ?, ?)',
            [userId, fullName, 'Administrator', 'IT']
        );

        console.log('Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
