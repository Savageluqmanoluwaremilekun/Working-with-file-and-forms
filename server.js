const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
                if (err) throw err;
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            });
        } else if (req.url === '/script.js') {
            fs.readFile(path.join(__dirname, 'script.js'), (err, content) => {
                if (err) throw err;
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(content);
            });
        }
    } else if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = JSON.parse(body);
            const errors = {};

            if (!data.firstName || /\d/.test(data.firstName)) {
                errors.firstName = 'First name is required and cannot contain numbers.';
            }

            if (!data.lastName || /\d/.test(data.lastName)) {
                errors.lastName = 'Last name is required and cannot contain numbers.';
            }

            if (data.otherNames && /\d/.test(data.otherNames)) {
                errors.otherNames = 'Other names cannot contain numbers.';
            }

            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.email = 'Invalid email address.';
            }

            if (!data.phone || !/^\d{10}$/.test(data.phone)) {
                errors.phone = 'Phone number must be 10 digits.';
            }

            if (!data.gender) {
                errors.gender = 'Gender is required.';
            }

            if (Object.keys(errors).length > 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ errors }));
            } else {
                const filePath = path.join(__dirname, 'database.json');
                const fileData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
                fileData.push(data);
                fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Form submitted successfully!' }));
            }
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
