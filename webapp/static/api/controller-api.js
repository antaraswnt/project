var Client = {
    clients: undefined,
    callbacks: {
        customMessage: undefined,
        clientConnect: undefined,
        clientDisconnect: undefined,
        clientListChange: undefined,
    },
    initialize: function() {
        if (window.addEventListener) {
            addEventListener("message", Client.processMessageFromPortal, false);
        } else {
            attachEvent("onmessage", Client.processMessageFromPortal);
        }
    },
    registerForClientListChange: function(f) {
        Client.callbacks.clientListChange = f;
    },
    registerForCustomMessage: function(f) {
        Client.callbacks.customMessage = f;
    },
    registerForClientConnect: function(f) {
        Client.callbacks.clientConnect = f;
    },
    registerForClientDisconnect: function(f) {
        Client.callbacks.clientDisconnect = f;
    },
    sendMessageToPortal: function(data) {
        var msg = {
            'type': 'message',
            'data': data,
            'client': 'portal',
        }
        Client._sendData(msg);
    },
    sendMessageToClient: function(data, client) {
        var msg = {
            'type': 'message',
            'data': data,
            'client': client,
        }
        Client._sendData(msg);
    },
    getClients: function() {
        return Client.clients;
    },
    _sendData: function(data) {
        parent.postMessage(data, '*');
    },
    processMessageFromPortal: function(event) {
        var data = event.data;
        switch(data.type) {
            case 'connect':
                if (typeof(Client.callbacks.clientConnect) == 'function') {
                    Client.callbacks.clientConnect(data.data);
                }
                break;
            case 'disconnect':
                if (typeof(Client.callbacks.clientConnect) == 'function') {
                    Client.callbacks.clientDisconnect(data.data);
                }
                break;
            case 'listchange':
                Client.clients = data.data;
                Client.callbacks.clientListChange();
                break;
            case 'message':
                if (typeof(Client.callbacks.customMessage) == 'function') {
                    Client.callbacks.customMessage(data.data, data.from);
                }
                break;
        }
    },
}