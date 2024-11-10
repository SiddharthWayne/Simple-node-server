const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

const emailsFile = path.join(__dirname, 'emails.txt');

// Function to handle writing emails to a file
function saveEmail(email) {
    fs.appendFile(emailsFile, email + '\n', (err) => {
        if (err) console.error('Error saving email:', err);
        else console.log(`Saved email: ${email}`);
    });
}

// Create server
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Serve the HTML file
        fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.method === 'POST' && req.url === '/submit-email') {
        // Handle email submission
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { email } = JSON.parse(body);

            // Validate and save email
            if (email && email.includes('@')) {
                saveEmail(email);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email saved successfully!' }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid email address' }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/emails') {
        // Display all saved emails in the console and return response
        fs.readFile(emailsFile, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Could not read emails');
            } else {
                console.log('Saved Emails:\n' + data);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start server on port 5000
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
