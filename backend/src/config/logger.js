const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' });

const logRequest = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLine = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms\n`;
        accessLogStream.write(logLine);
        process.stdout.write(logLine); // También registrar en consola
    });
    next();
};

const logError = (err, req, res, next) => {
    const logLine = `[${new Date().toISOString()}] ERROR: ${err.message}\nStack: ${err.stack}\n`;
    errorLogStream.write(logLine);
    console.error(logLine);
    next(err);
};

module.exports = { logRequest, logError };
