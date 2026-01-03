const db = require('../config/db');

async function check() {
    try {
        const [users] = await db.execute('DESCRIBE users');
        console.log('Users columns:', users.map(c => c.Field));
        const [employees] = await db.execute('DESCRIBE employees');
        console.log('Employees columns:', employees.map(c => c.Field));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
