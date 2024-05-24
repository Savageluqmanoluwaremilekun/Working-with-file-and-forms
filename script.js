const http = require('http');
const fs = require('fs');
const path = require('path');


function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            serveFile(res, path.join(__dirname, 'index.html'), 'text/html');
        } else if (req.url === '/script.js') {
            serveFile(res, path.join(__dirname, 'script.js'), 'application/javascript');
        }
    } else if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = JSON.parse(body);
            const filePath = path.join(__dirname, 'database.json');
            const fileData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
            fileData.push(data);
            fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Form submitted successfully!' }));
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
