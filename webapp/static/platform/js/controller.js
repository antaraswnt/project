var MessageTypes = {
    CLIENTLIST: 'clientlist',
    CLIENTDISCONNECT: 'clientdisconnect',
    CLIENTCONNECT: 'clientconnect',
    CUSTOMMESSAGE: 'message',
    OPENPAGE: 'openpage',
};

var Controller = {
    relay: undefined,
    uuid: undefined,
    code: undefined,
    extra: {
        'isPortal': false,
        'information' : USER,
    },
    
    socket: undefined,
    clients: undefined,
    ready: false,

    clientList: ko.observable(undefined),
    url: ko.observable(undefined),

    register: function(code, callback) {
        Controller.code = code;
        var uuid = Cookies.get('uuid');
        $.post('/devices/register/', {'csrfmiddlewaretoken': CSRF_TOKEN, 'code': code, 'uuid': uuid, 'type': 'Controller'}, function(response) {
            var response = JSON.parse(response);
            if (response.success) {
                var device = response.device;
                Controller.relay = device.relay.host + ':' + device.relay.port;
                Controller.uuid = device.uuid;
                Cookies.set('uuid', Controller.uuid);
                Controller.initialize();
                callback(true, null);
            } else {
                callback(false, response.error);
            }
        });
    },

    initialize: function() {
        Controller.socket = new SocketWrapper(Controller.uuid, Controller.relay, Controller.code, Controller.extra);
        Controller.socket.initialize(Controller._relayCallback);

        Controller.clientList.subscribe(function() {
            Controller._sendMessageToFrontend({'type': 'listchange', 'data': Controller.clientList()});
        });
    },

    sendMessageToClient: function (data, client) {
        try {
            var clientid = client;
            if (Controller.clientList()[client]) {
                clientid = Controller.clientList()[client].uuid;
            }
            Controller._sendMessage(MessageTypes.CUSTOMMESSAGE, data, clientid);
        } catch(e) {

        }
    },

    _raiseClientConnectEvent: function(data) {
        var id = data.information.id;
        var client = data.information;
        client.uuid = data.uuid;
        Controller._sendMessageToFrontend({'type': 'connect', 'data': client});
    },

    _raiseClientDisconnectEvent: function(data) {
        var id = data.information.id;
        var client = data.information;
        client.uuid = data.uuid;
        Controller._sendMessageToFrontend({'type': 'disconnect', 'data': client});
    },

    _raiseClientMessageEvent: function(data) {
        var clientid = Controller.clients[data.from].information.id;
        Controller._sendMessageToFrontend({'type': 'message', 'data': data.data, 'from': clientid});
    },

    _updateClientList: function(data) {
        var clientList = {};
        for(var key in Controller.clients) {
            var id = Controller.clients[key].information.id;
            clientList[id] = Controller.clients[key].information;
            clientList[id].uuid = Controller.clients[key].uuid;
        }
        Controller.clientList(clientList);
        console.log(Controller.clients);
    },

    _sendMessageToFrontend: function(data) {
        var controllerframe = document.getElementById("controllerframe").contentWindow;
        controllerframe.postMessage(data,'*');
    },

    processMessageFromFrontend: function(event) {
        var data = event.data;
        switch(data.type) {
            case 'message':
                if(data.client == null) {
                    // Controller message yet to be handled
                } else {
                    Controller.sendMessageToClient(data.data, data.client);
                }
                break;
        }
    },

    _updateClients: function () {
        Controller._sendMessage(MessageTypes.CLIENTLIST);
    },

    _processMessageFromRelay: function(data) {
        switch(data.type) {
            case MessageTypes.CLIENTLIST:
                Controller.clients = data.data;
                Controller._updateClientList();
                break;
            case MessageTypes.CLIENTCONNECT:
                var uuid = data.data.uuid;
                Controller.clients[uuid] = data.data;
                Controller._updateClientList();
                Controller._raiseClientConnectEvent(data.data);
                break;
            case MessageTypes.CLIENTDISCONNECT:
                var uuid = data.data.uuid;
                delete Controller.clients[uuid];
                Controller._updateClientList();
                Controller._raiseClientDisconnectEvent(data.data);
                break;
            case MessageTypes.OPENPAGE:
                console.log('Openpage: ');
                console.log(data);
                break;
            case MessageTypes.CUSTOMMESSAGE:
                console.log('Message from client: ' + data.from);
                console.log(data);
                Controller._raiseClientMessageEvent(data);
                break;
        }
    },

    _sendMessage: function (type, data, client) {
        if (Controller.ready) {
            msg = {'type': type, 'data': data, 'to': client};
            Controller.socket.send(msg);
        }
    },

    _relayCallback: function(type, data) {
        if (type == 'connect') {
            Controller.ready = true;
            Controller._updateClients();
        } else if(type == 'disconnect') {
            Controller.ready = false;
        } else if(type == 'ondata') {
            Controller._processMessageFromRelay(data);
        }
    },
};

var ControllerView = {
    code: ko.observable(''),
    isRegistered: ko.observable(false),
    isLoading: ko.observable(false),
    errorMsg: ko.observable(''),

    register: function() {
        ControllerView.isLoading(true);
        ControllerView.errorMsg('');
        Controller.register(ControllerView.code(), ControllerView.registerCallback);
    },

    registerCallback: function(success, errormsg) {
        ControllerView.isLoading(false);
        if (success) {
            ControllerView.isRegistered(true);
        } else {
            ControllerView.errorMsg(errormsg);
        }
    }
}

$(document).ready(function() {

    if (window.addEventListener) {
        addEventListener("message", Controller.processMessageFromFrontend, false);
    } else {
        attachEvent("onmessage", Controller.processMessageFromFrontend);
    }

    ko.applyBindings(ControllerView);
});