import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import path from 'path';
import socketio from 'socket.io';



let app = express();
app.server = http.createServer(app);
let io = socketio(app.server);

//app.use(express.static(path.join(__dirname, 'public')));
//
//// 3rd party middleware
//app.use(cors({
//	exposedHeaders: config.corsHeaders
//}));
//
//app.use(bodyParser.json({
//	limit : config.bodyLimit
//}));
//
//// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
    app.use('/api', api({ config, db }));

});

app.use('/node_modules', express.static(__dirname + '/../node_modules'));
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
	res.sendfile('public/index.html', {root: __dirname});
});

app.server.listen(process.env.PORT || config.port);

console.log(`Started on port ${app.server.address().port}`);

const sockets = [];
let character = {};

io.on('connection', function (socket) {
    sockets.push(socket);
    socket.emit('msg', 'Welcome to static swag online!');
    socket.emit('character', character);
    socket.on('character', function (data) {
        character = data;
        sockets.filter(val => val !== socket).forEach(val => {
            val.emit('character', character);
        });
    });
    socket.on('msg', msg => {
        sockets.filter(val => val !== socket).forEach(val => val.emit('msg', msg));
    });
    socket.on('run', str => {
        sockets.filter(val => val !== socket).forEach(val => val.emit('run', str));
    });
});

export default app;
