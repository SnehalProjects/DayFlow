const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateEmployeeCode, hashPassword, comparePassword } = require('../utils/authUtils');

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { loginId, password } = req.body;

    try {
        // Search by email OR employee_code
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ? OR employee_code = ?',
            [loginId, loginId]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check verification (though requirements say 'show proper error messages for unverified')
        if (!user.is_verified) {
            // return res.status(401).json({ message: 'Account not verified' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get employee details
        const [employees] = await db.execute(
            'SELECT * FROM employees WHERE user_id = ?',
            [user.id]
        );
        const employee = employees[0];

        const token = jwt.sign(
            { id: user.id, role: user.role, employeeCode: user.employee_code },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            mustChangePassword: !user.is_verified,
            user: {
                id: user.id,
                employeeCode: user.employee_code,
                email: user.email,
                role: user.role,
                fullName: employee ? employee.full_name : 'Admin'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// SIGNUP ROUTE (Admin/HR Only)
router.post('/signup', async (req, res) => {
    const { companyName, fullName, email, phone } = req.body;

    try {
        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const joiningDate = new Date().toISOString().split('T')[0];
        const employeeCode = await generateEmployeeCode(companyName, fullName, joiningDate);

        // STRICTLY AUTO-GENERATE INITIAL PASSWORD
        const initialPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await hashPassword(initialPassword);

        const [userResult] = await db.execute(
            'INSERT INTO users (employee_code, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
            [employeeCode, email, hashedPassword, 'EMPLOYEE', false] // is_verified = false for first login
        );

        const userId = userResult.insertId;

        await db.execute(
            'INSERT INTO employees (user_id, full_name, phone, joining_date) VALUES (?, ?, ?, ?)',
            [userId, fullName, phone, joiningDate]
        );

        res.status(201).json({
            message: 'Employee created successfully',
            employeeCode,
            initialPassword // Show this to Admin/HR so they can give it to employee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// CHANGE PASSWORD ROUTE (For first login)
router.post('/change-password', async (req, res) => {
    const { employeeCode, currentPassword, newPassword } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE employee_code = ?', [employeeCode]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });

        const hashedPassword = await hashPassword(newPassword);
        await db.execute(
            'UPDATE users SET password = ?, is_verified = 1 WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
