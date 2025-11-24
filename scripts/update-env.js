const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const content = `
NEXTAUTH_SECRET=supersecretkey123
NEXTAUTH_URL=http://localhost:3000
`;

try {
    fs.appendFileSync(envPath, content);
    console.log('Successfully appended to .env');
} catch (err) {
    console.error('Error appending to .env:', err);
    process.exit(1);
}
