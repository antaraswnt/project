var Display = {
    clients: undefined,
    callbacks: {
        customMessage: undefined,
        clientConnect: undefined,
        clientDisconnect: undefined,
        clientListChange: undefined,
    },
    initialize: function() {
        if (window.addEventListener) {
            addEventListener("message", Display.processMessageFromPortal, false);
        } else {
            attachEvent("onmessage", Display.processMessageFromPortal);
        }
    },
    registerForClientListChange: function(f) {
        Display.callbacks.clientListChange = f;
    },
    registerForCustomMessage: function(f) {
        Display.callbacks.customMessage = f;
    },
    registerForClientConnect: function(f) {
        Display.callbacks.clientConnect = f;
    },
    registerForClientDisconnect: function(f) {
        Display.callbacks.clientDisconnect = f;
    },
    sendMessageToPortal: function(data) {
        var msg = {
            'type': 'message',
            'data': data,
            'client': null,
        }
        Display._sendData(msg);
    },
    sendMessageToClient: function(data, client) {
        var msg = {
            'type': 'message',
            'data': data,
            'client': client,
        }
        Display._sendData(msg);
    },
    getClients: function() {
        return Display.clients;
    },
    _sendData: function(data) {
        parent.postMessage(data, '*');
    },
    processMessageFromPortal: function(event) {
        var data = event.data;
        switch(data.type) {
            case 'connect':
                if (typeof(Display.callbacks.clientConnect) == 'function') {
                    Display.callbacks.clientConnect(data.data);
                }
                break;
            case 'disconnect':
                if (typeof(Display.callbacks.clientConnect) == 'function') {
                    Display.callbacks.clientDisconnect(data.data);
                }
                break;
            case 'listchange':
                clients = data.data;
                Display.callbacks.clientListChange();
                break;
            case 'message':
                if (typeof(Display.callbacks.customMessage) == 'function') {
                    Display.callbacks.customMessage(data.data, data.from);
                }
                break;
        }
    },
}