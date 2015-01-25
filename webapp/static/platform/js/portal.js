var MessageTypes = {
    CLIENTLIST: 'clientlist',
    CLIENTDISCONNECT: 'clientdisconnect',
    CLIENTCONNECT: 'clientconnect',
    CUSTOMMESSAGE: 'message',
    OPENPAGE: 'openpage',
};

var Portal = {
    relay: undefined,
    uuid: undefined,
    code: undefined,
    extra: {
        'isPortal': true,
        'information' : { 'id': 'portal' },
    },
    
    socket: undefined,
    clients: undefined,
    ready: false,

    clientList: ko.observable(undefined),
    url: ko.observable('http://www.ee.iitb.ac.in/'),

    register: function() {
        var uuid = Cookies.get('uuid');
        $.post('/devices/register/', {'csrfmiddlewaretoken': CSRF_TOKEN, 'uuid': uuid, 'type': 'Display'}, function(response) {
            console.log(response);
            var response = JSON.parse(response);
            if (response.success) {
                var device = response.device;
                Portal.relay = device.relay.host + ':' + device.relay.port;
                Portal.code = device.code;
                Portal.uuid = device.uuid;
                Cookies.set('uuid', Portal.uuid);
                Portal.initialize();
            }
        });
    },

    initialize: function() {
        Portal.socket = new SocketWrapper(Portal.uuid, Portal.relay, Portal.code, Portal.extra);
        Portal.socket.initialize(Portal._relayCallback);

        Portal.clientList.subscribe(function() {
            Portal._sendMessageToFrontend({'type': 'listchange', 'data': Portal.clientList()});
        });
    
    },

    sendMessageToClient: function (data, client) {
        try {
            var clientid = client;
            if (Portal.clientList()[client]) {
                clientid = Portal.clientList()[client].uuid;
            }
            Portal._sendMessage(MessageTypes.CUSTOMMESSAGE, data, clientid);
        } catch(e) {

        }
    },

    sendOpenPageMessage: function (data, client) {
        Portal._sendMessage(MessageTypes.OPENPAGE, data, client);
    },

    _raiseClientConnectEvent: function(data) {
        var id = data.information.id;
        var client = data.information;
        client.uuid = data.uuid;
        Portal._sendMessageToFrontend({'type': 'connect', 'data': client});
    },

    _raiseClientDisconnectEvent: function(data) {
        var id = data.information.id;
        var client = data.information;
        client.uuid = data.uuid;
        Portal._sendMessageToFrontend({'type': 'disconnect', 'data': client});
    },

    _raiseClientMessageEvent: function(data) {
        Portal._sendMessageToFrontend({'type': 'message', 'data': data.data, 'from': data.from});
    },

    _updateClientList: function(data) {
        var clientList = {};
        for(var key in Portal.clients) {
            var id = Portal.clients[key].information.id;
            clientList[id] = Portal.clients[key].information;
            clientList[id].uuid = Portal.clients[key].uuid;
        }
        Portal.clientList(clientList);
    },

    _sendMessageToFrontend: function(data) {
        var portalframe = document.getElementById("portalframe").contentWindow;
        portalframe.postMessage(data,'*');
    },

    processMessageFromFrontend: function(event) {
        var data = event.data;
        switch(data.type) {
            case 'message':
                if(data.client == null) {
                    // Portal message yet to be handled
                } else {
                    Portal.sendMessageToClient(data.data, data.client);
                }
                break;
        }
    },

    _updateClients: function () {
        Portal._sendMessage(MessageTypes.CLIENTLIST);
    },

    _processMessageFromRelay: function(data) {
        switch(data.type) {
            case MessageTypes.CLIENTLIST:
                Portal.clients = data.data;
                Portal._updateClientList();
                Portal.sendOpenPageMessage({'url': Portal.url()}, 'all');
                break;
            case MessageTypes.CLIENTCONNECT:
                var uuid = data.data.uuid;
                Portal.clients[uuid] = data.data;
                Portal._updateClientList();
                Portal._raiseClientConnectEvent(data.data);
                Portal.sendOpenPageMessage({'url': Portal.url()}, uuid);
                break;
            case MessageTypes.CLIENTDISCONNECT:
                var uuid = data.data.uuid;
                delete Portal.clients[uuid];
                Portal._updateClientList();
                Portal._raiseClientDisconnectEvent(data.data);
                break;
            case MessageTypes.CUSTOMMESSAGE:
                Portal._raiseClientMessageEvent(data);
                break;
        }
    },

    _sendMessage: function (type, data, client) {
        if (Portal.ready) {
            msg = {'type': type, 'data': data, 'to': client};
            Portal.socket.send(msg);
        }
    },

    _relayCallback: function(type, data) {
        if (type == 'connect') {
            Portal.ready = true;
            Portal._updateClients();
        } else if(type == 'disconnect') {
            Portal.ready = false;
        } else if(type == 'ondata') {
            Portal._processMessageFromRelay(data);
        }
    },
};

$(document).ready(function() {
    Portal.register();

    if (window.addEventListener) {
        addEventListener("message", Portal.processMessageFromFrontend, false);
    } else {
        attachEvent("onmessage", Portal.processMessageFromFrontend);
    }

    ko.applyBindings(Portal);
});