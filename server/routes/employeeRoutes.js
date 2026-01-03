const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all employees with current status
router.get('/', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const query = `
            SELECT 
                e.*, 
                u.employee_code,
                u.role,
                u.email as auth_email,
                a.status as attendance_status,
                lr.id as on_leave
            FROM employees e
            JOIN users u ON e.user_id = u.id
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = ?
            LEFT JOIN leave_requests lr ON e.id = lr.employee_id 
                AND lr.status = 'Approved' 
                AND ? BETWEEN lr.start_date AND lr.end_date
        `;

        const [rows] = await db.execute(query, [today, today]);

        const processedRows = rows.map(row => {
            let derivedStatus = 'Absent';
            if (row.attendance_status === 'Present') derivedStatus = 'Present';
            else if (row.on_leave) derivedStatus = 'On Leave';

            return {
                ...row,
                derivedStatus
            };
        });

        res.json(processedRows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET profile by employee_id or user_id
router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const isUserId = req.query.type === 'user';

    try {
        let query = `
            SELECT e.*, u.employee_code, u.role, u.email as auth_email, u.last_login
            FROM employees e
            JOIN users u ON e.user_id = u.id
            WHERE ${isUserId ? 'e.user_id' : 'e.id'} = ?
        `;
        const [empRows] = await db.execute(query, [id]);

        if (empRows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const employee = empRows[0];

        // Fetch salary structure
        const [salaryRows] = await db.execute(
            'SELECT * FROM salary_structures WHERE employee_id = ?',
            [employee.id]
        );

        res.json({
            ...employee,
            salary: salaryRows[0] || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// UPDATE profile
router.put('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        // Fields that can be updated
        const fields = [
            'full_name', 'phone', 'address', 'designation', 'department',
            'dob', 'gender', 'marital_status', 'nationality', 'personal_email',
            'location', 'about', 'skills', 'interests', 'certifications',
            'bank_name', 'account_number', 'ifsc_code', 'pan_no', 'uan_no'
        ];

        let updateParts = [];
        let params = [];

        fields.forEach(field => {
            if (data[field] !== undefined) {
                updateParts.push(`${field} = ?`);
                params.push(data[field]);
            }
        });

        if (updateParts.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        params.push(id);
        const query = `UPDATE employees SET ${updateParts.join(', ')} WHERE id = ?`;

        await db.execute(query, params);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// UPDATE salary structure
router.put('/salary/:id', async (req, res) => {
    const { id } = req.params; // employee_id
    const data = req.body;

    try {
        const fields = [
            'monthly_wage', 'working_days', 'working_hours',
            'basic_pct', 'hra_pct', 'lta_pct', 'standard_allowance',
            'performance_bonus_pct', 'pf_pct', 'prof_tax'
        ];

        // Check if record exists
        const [existing] = await db.execute(
            'SELECT id FROM salary_structures WHERE employee_id = ?',
            [id]
        );

        if (existing.length > 0) {
            let updateParts = [];
            let params = [];
            fields.forEach(field => {
                if (data[field] !== undefined) {
                    updateParts.push(`${field} = ?`);
                    params.push(data[field]);
                }
            });
            params.push(id);
            const query = `UPDATE salary_structures SET ${updateParts.join(', ')} WHERE employee_id = ?`;
            await db.execute(query, params);
        } else {
            let colNames = ['employee_id'];
            let placeholders = ['?'];
            let params = [id];
            fields.forEach(field => {
                if (data[field] !== undefined) {
                    colNames.push(field);
                    placeholders.push('?');
                    params.push(data[field]);
                }
            });
            const query = `INSERT INTO salary_structures (${colNames.join(', ')}) VALUES (${placeholders.join(', ')})`;
            await db.execute(query, params);
        }

        res.json({ message: 'Salary structure updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
