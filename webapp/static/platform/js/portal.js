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
        'information' : { 'id': 'portal', 'name': 'Portal' },
    },
    
    socket: undefined,
    clients: undefined,
    ready: false,

    clientList: ko.observable(undefined),

    defaultGame: undefined,
    game: ko.observable(undefined),
    
    register: function() {
        var uuid = Cookies.get('uuid');
        $.post('/devices/register/', {'csrfmiddlewaretoken': CSRF_TOKEN, 'uuid': uuid, 'type': 'Display'}, function(response) {
            var response = JSON.parse(response);
            if (response.success) {
                Portal.game(response.game);
                Portal.defaultGame = response.game;
                var device = response.device;
                Portal.relay = device.relay.host + ':' + device.relay.port;
                Portal.code = device.code;
                Portal.uuid = device.uuid;
                Cookies.set('uuid', Portal.uuid);
                Portal.initialize();
                ViewModel.registerSuccess(Portal.code);
            } else {
                ViewModel.registerError(response.error);
            }
        }).fail(function() {
            ViewModel.registerError('Cannot connect to server. Please restart the display.');
        });
    },

    loadGame: function (slug) {
        $.post('/api/games/' + slug +'/', {'csrfmiddlewaretoken': CSRF_TOKEN}, function(response){
            response = JSON.parse(response);
            if (response.success) {
                Portal.game(response.game);
            }
        });
    },

    initialize: function() {
        Portal.socket = new SocketWrapper(Portal.uuid, Portal.relay, Portal.code, Portal.extra);
        Portal.socket.initialize(Portal._relayCallback);

        Portal.clientList.subscribe(function() {
            Portal._sendMessageToFrontend({'type': 'listchange', 'data': Portal.clientList()});
        });

        Portal.game.subscribe(function() {
            ViewModel.url(Portal.game().display_url);
            Portal.sendOpenPageMessage({'url': Portal.game().controller_url}, 'all');
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
        try {
            if (data.data.type == "loadgame") {
                Portal.loadGame(data.data.game);
            }
        } catch (e) {
        }
        var clientid = Portal.clients[data.from].information.id;
        Portal._sendMessageToFrontend({'type': 'message', 'data': data.data, 'from': clientid});
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
                    var msg = data.data;
                    switch(msg.type) {
                        case 'initialize':
                            Portal._sendMessageToFrontend({'type': 'listchange', 'data': Portal.clientList()});
                            break;
                    }
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
                Portal.sendOpenPageMessage({'url': Portal.game().controller_url}, 'all');
                break;
            case MessageTypes.CLIENTCONNECT:
                var uuid = data.data.uuid;
                Portal.clients[uuid] = data.data;
                Portal._updateClientList();
                Portal._raiseClientConnectEvent(data.data);
                Portal.sendOpenPageMessage({'url': Portal.game().controller_url}, uuid);
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
            ViewModel.isLoading(false);
            ViewModel.url(Portal.game().display_url);
        } else if(type == 'disconnect') {
            Portal.ready = false;
            ViewModel.isLoading(true);
        } else if(type == 'ondata') {
            Portal._processMessageFromRelay(data);
        } else if(type == 'connection_failed') {
            ViewModel.connectFailure();
        }
    },
};

var ViewModel = {
    server: ko.observable('server.mga.lan'),
    code: ko.observable(''),
    isRegistered: ko.observable(false),
    isLoading: ko.observable(false),
    errorMessage: ko.observable(''),
    url: ko.observable(undefined),
    
    register: function() {
        ViewModel.isLoading(true);
        ViewModel.errorMessage('');
        Portal.register();
    },

    registerSuccess: function(code) {
        ViewModel.isRegistered(true);
        ViewModel.code(code);
    },

    registerError: function(error) {
        ViewModel.isLoading(false);
        ViewModel.errorMessage(error);
    },

    connectFailure: function() {
        ViewModel.isLoading(false);
        ViewModel.isRegistered(false);
        ViewModel.errorMessage('Connection to relay failed. Please restart the display.');
    }
}

$(document).ready(function() {
    ViewModel.register();

    if (window.addEventListener) {
        addEventListener("message", Portal.processMessageFromFrontend, false);
    } else {
        attachEvent("onmessage", Portal.processMessageFromFrontend);
    }

    ko.applyBindings(ViewModel);
});
