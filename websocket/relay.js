const SERVER_PORT = parseInt(process.argv.slice(2));

var MessageTypes = {
    CLIENTLIST: 'clientlist',
    CLIENTDISCONNECT: 'clientdisconnect',
    CLIENTCONNECT: 'clientconnect',
    CUSTOMMESSAGE: 'message',
    OPENPAGE: 'openpage',
};

console.log('Server running on port ' + SERVER_PORT);

var io = require('socket.io')();
io.listen(SERVER_PORT);

var socket_map = {};

var Relay = {
    processPlatformMessage: function(code, client, socket, data) {
        switch(data.type) {
            case MessageTypes.CLIENTLIST:
                var clientlist = {};
                var map = socket_map[code];
                for (var key in map) {
                    if (socket === map[key].socket) continue;
                    clientlist[key] = map[key].extra;
                }
                Relay.sendMessage(socket, {'type': MessageTypes.CLIENTLIST, 'from': 'platform', 'data': clientlist});
                break;
            case MessageTypes.CUSTOMMESSAGE:
                try {
                    if (data.to == 'all') {
                        Relay.sendBroadCast(code, {'type': MessageTypes.CUSTOMMESSAGE, 'from': client, 'data': data.data}, client);
                        break;
                    }
                    var tosocket = socket_map[code][data.to].socket;
                    Relay.sendMessage(tosocket, {'type': MessageTypes.CUSTOMMESSAGE, 'from': client, 'data': data.data});
                } catch (e) {

                }
                break;
            case MessageTypes.OPENPAGE:
                try {
                    if (data.to == 'all') {
                        Relay.sendBroadCast(code, {'type': MessageTypes.OPENPAGE, 'from': 'portal', 'data': data.data}, 'portal');
                        break;
                    }
                    var tosocket = socket_map[code][data.to].socket;
                    Relay.sendMessage(tosocket, {'type': MessageTypes.OPENPAGE, 'from': 'portal', 'data': data.data}, 'portal');
                } catch (e) {

                }
                break;
        }
    },

    sendMessage: function(socket, data) {
        socket.emit('ondata', data);
    },

    sendBroadCast: function(code, data, client) {
        var map = socket_map[code];
        for (var key in map) {
            if (key == client) continue;
            Relay.sendMessage(map[key].socket, data);
        }
    },
};

io.on('connection', function (socket) {

    var connectcode = socket.handshake.query.connectcode;
    var uuid = socket.handshake.query.uuid;
    var extra = JSON.parse(socket.handshake.query.extra);
    extra.uuid = uuid;
    
    if ((extra.information.id == 'portal' && !extra.isPortal) ||
        (extra.information.id == 'all' && !extra.isPortal) ||
        (socket_map[connectcode] && extra.uuid in socket_map[connectcode])) {
        socket.disconnect();
    }

    console.log('Connect received from uuid ' + uuid + ' for connect code: ' + connectcode);
    
    if (socket_map[connectcode] == undefined) {
        socket_map[connectcode] = {};
    }

    if (socket_map[connectcode][uuid] == undefined) {
        socket_map[connectcode][uuid] = {'socket' : socket, 'extra' : extra };
    }

    var clientlist = {};
    var map = socket_map[connectcode];
    for (var key in map) {
        if (socket === map[key].socket) continue;
        clientlist[key] = map[key].extra;
    }
    Relay.sendMessage(socket, {'type': MessageTypes.CLIENTLIST, 'from': 'platform', 'data': clientlist});
    Relay.sendBroadCast(connectcode, {'type': MessageTypes.CLIENTCONNECT, 'from': 'platform', 'data': extra});

    socket.on('ondata', function (data) {
        console.log('Get data request received');
        console.log(data);
        Relay.processPlatformMessage(connectcode, uuid, socket, data);
    });

    socket.on('disconnect', function (data) {
        console.log('Disconnect received from uuid ' + uuid);
        var extra = socket_map[connectcode][uuid].extra;
        delete socket_map[connectcode][uuid];
        Relay.sendBroadCast(connectcode, {'type': MessageTypes.CLIENTDISCONNECT, 'from': 'platform', 'data':extra});
    });
});
