const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET leave requests (all for Admin/HR, own for Employee)
router.get('/:employeeId/:role', async (req, res) => {
    const { employeeId, role } = req.params;
    try {
        let query = `
            SELECT lr.*, lt.name as leave_type_name, e.full_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            JOIN employees e ON lr.employee_id = e.id
        `;
        let params = [];

        if (role === 'EMPLOYEE') {
            query += ' WHERE lr.employee_id = ?';
            params.push(employeeId);
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// APPLY FOR LEAVE
router.post('/apply', async (req, res) => {
    const { employeeId, leaveTypeId, startDate, endDate, reason } = req.body;
    try {
        await db.execute(
            'INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
            [employeeId, leaveTypeId, startDate, endDate, reason]
        );
        res.status(201).json({ message: 'Leave request submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// APPROVE/REJECT LEAVE (Admin/HR Only)
router.put('/action', async (req, res) => {
    const { requestId, status, adminComment } = req.body;
    try {
        await db.execute(
            'UPDATE leave_requests SET status = ?, admin_comment = ? WHERE id = ?',
            [status, adminComment, requestId]
        );
        res.json({ message: `Leave request ${status.toLowerCase()}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET LEAVE TYPES
router.get('/types', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM leave_types');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
