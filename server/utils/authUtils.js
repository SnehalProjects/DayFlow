const bcrypt = require('bcryptjs');
const db = require('../config/db');

const generateEmployeeCode = async (companyName, fullName, joiningDate) => {
    const companyPrefix = companyName.substring(0, 2).toUpperCase();
    const names = fullName.split(' ');
    const firstInitials = names[0].substring(0, 2).toUpperCase();
    const lastInitials = names.length > 1 ? names[names.length - 1].substring(0, 2).toUpperCase() : 'XX';

    const year = new Date(joiningDate).getFullYear();

    // Find the next serial number for this year
    const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE employee_code LIKE ?',
        [`%${year}%`]
    );

    const serialNumber = (rows[0].count + 1).toString().padStart(4, '0');

    return `${companyPrefix}${firstInitials}${lastInitials}${year}${serialNumber}`;
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashed) => {
    return await bcrypt.compare(password, hashed);
};

module.exports = {
    generateEmployeeCode,
    hashPassword,
    comparePassword
};
