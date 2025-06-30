const morgan = require('morgan');
const { createStream } = require('rotating-file-stream');
const path = require('path');
const fs = require('fs');

const logDirectory = path.resolve(__dirname, '../../log');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const accessLogStream = createStream('access.log', {
    interval: '1d',
    path: logDirectory
});

module.exports = {
    dev: morgan('dev'),
    combined: morgan('combined', { stream: accessLogStream })
};
