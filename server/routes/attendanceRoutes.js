const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET current user attendance status for today
router.get('/status/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    try {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await db.execute(
            'SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?',
            [employeeId, today]
        );

        if (rows.length === 0) {
            return res.json({ checkedIn: false });
        }

        const record = rows[0];
        res.json({
            checkedIn: !!record.check_in,
            checkedOut: !!record.check_out,
            checkInTime: record.check_in,
            checkOutTime: record.check_out,
            status: record.status
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// CHECK IN
router.post('/check-in', async (req, res) => {
    const { employeeId } = req.body;
    try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

        // Check if already checked in
        const [existing] = await db.execute(
            'SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?',
            [employeeId, today]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        await db.execute(
            'INSERT INTO attendance (employee_id, attendance_date, check_in, status, source) VALUES (?, ?, ?, ?, ?)',
            [employeeId, today, now, 'Present', 'ONLINE']
        );

        res.json({ message: 'Checked in successfully', time: now });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// CHECK OUT
router.post('/check-out', async (req, res) => {
    const { employeeId } = req.body;
    try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

        const [existing] = await db.execute(
            'SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?',
            [employeeId, today]
        );

        if (existing.length === 0 || !existing[0].check_in) {
            return res.status(400).json({ message: 'Must check in first' });
        }

        if (existing[0].check_out) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        await db.execute(
            'UPDATE attendance SET check_out = ? WHERE id = ?',
            [now, existing[0].id]
        );

        res.json({ message: 'Checked out successfully', time: now });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
