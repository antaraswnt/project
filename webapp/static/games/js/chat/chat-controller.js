$(document).ready(function() {
    Client.initialize();
    
    Client.registerForClientConnect(function(data) {
        ChatModel.messages.push(data.name + ' connected');
    });

    Client.registerForClientDisconnect(function(data) {
        ChatModel.messages.push(data.name + ' disconnected');
    });
    
    Client.registerForCustomMessage(function(data, client) {
        ChatModel.messages.push(client + ' says: ' + data);
    });
    
    Client.registerForClientListChange(function() {
        ChatModel.populateClients();
    });
    
    var ChatModel = {
        messages: ko.observableArray([]),
        message: ko.observable(''),
        clients: ko.observableArray([]),
        selectedClient: ko.observable(undefined),
        populateClients: function () {
            var clients = Client.getClients();
            var clientlist = [];
            for (key in clients) {
                clientlist.push(clients[key]);
            }
            clientlist.push({'id': 'all', 'name': 'All'});
            ChatModel.clients(clientlist);
        },
        sendMessage: function () {
            Client.sendMessageToClient(ChatModel.message(), ChatModel.selectedClient()); 
        }
    }
    
    ko.applyBindings(ChatModel);
});