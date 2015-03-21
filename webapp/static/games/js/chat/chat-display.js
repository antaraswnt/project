$(document).ready(function() {
    Display.initialize();
    
    Display.registerForClientConnect(function(data) {
        ChatModel.messages.push(data.name + ' connected.');
    });
    
    Display.registerForClientDisconnect(function(data) {
        ChatModel.messages.push(data.name + ' disconnected.');
    });

    Display.registerForCustomMessage(function(data, client) {
        ChatModel.messages.push(client + ' says: ' + data);
    });

    var ChatModel = {
        messages: ko.observableArray([])
    }
    ko.applyBindings(ChatModel);
});