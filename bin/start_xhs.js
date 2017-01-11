#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app     = require(__dirname + '/../app'),
    debug   = require('debug')('xhs_comment_node:server'),
    http    = require('http'),
    fs      = require("fs"),
    config  = require(__dirname + '/../config/config.json'),
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    numCPUs = 1;

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(config.port);

app.set('port', port);

/**
 * Create HTTP server.
 */
if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('death', function(worker) {
        console.log('worker ' + worker.pid + ' died');
        cluster.fork();
    });
    cluster.on('exit', function(worker) {
        console.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
    });
} else {

    var server = http.createServer(app);

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    console.log("Server has started.");
}

/**
 * Listen on provided port, on all network interfaces.
 */


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
            process.exit(1);
            break;
            default:
                throw error;
        }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
        debug('Listening on ' + bind);
}

fs.createWriteStream("../logs/pids", {
    flags: "w",
    encoding: "utf-8",
    mode: 0666
}).write(process.pid + "\n");

