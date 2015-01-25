function SocketWrapper(uuid, address, connectcode, extra) {
    this.connectcode = connectcode;
    this.uuid = uuid;
    this.callback = undefined;
    this.socket = undefined;
    this.address = address;
    this.extra = encodeURIComponent(JSON.stringify(extra));
}

SocketWrapper.prototype = {
    initialize: function(callback) {
        var _this = this;

        this.socket = io.connect(this.address, { query: 'connectcode='+_this.connectcode+'&uuid='+_this.uuid+'&extra='+_this.extra, reconnectionAttempts: 8, 'force new connection': true });
        this.socket.on('connect', function (data) {
            console.log('Connected to the relay.');
            callback('connect');
        });

        this.socket.on('ondata', function (data) {
            callback('ondata', data);
        });

        this.socket.on('disconnect', function (data) {
            callback('disconnect');
        });

        this.socket.on('reconnect_failed', function (data) {
            callback('connection_failed');
        });
    },

    send: function(data) {
        this.socket.emit('ondata', data);
    }
}