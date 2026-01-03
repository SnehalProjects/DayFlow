const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all employees with current status
router.get('/', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Query to get employee info + today's attendance + active leave
        // join employees with attendance for today
        // join employees with leave_requests for today
        const query = `
            SELECT 
                e.*, 
                u.employee_code,
                u.role,
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

        // Derive final status: Present, On Leave, Absent
        const processedRows = rows.map(row => {
            let derivedStatus = 'Absent'; // Default yellow dot
            if (row.attendance_status === 'Present') derivedStatus = 'Present'; // Green dot
            else if (row.on_leave) derivedStatus = 'On Leave'; // Airplane icon

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

module.exports = router;
