$(document).ready(function() {
    Client.initialize();
    
    Client.registerForClientConnect(function(data) {

    });

    Client.registerForClientDisconnect(function(data) {

    });
    
    Client.registerForCustomMessage(function(data, client) {

    });
    
    Client.registerForClientListChange(function() {

    });
    
    var ControllerModel = {
        joinGame: function () {
            ControllerModel.joinedGame(true);
            Client.sendMessageToPortal({type: "joingame"});
        },
        moveLeft: function () {
            Client.sendMessageToPortal({type: "left"});
        },
        moveRight: function () {
            Client.sendMessageToPortal({type: "right"});
        },
        moveUp: function() {
            Client.sendMessageToPortal({type: "up"});
        },
        moveDown: function() {
            Client.sendMessageToPortal({type: "down"});
        },
        joinedGame: ko.observable(false),
    }
    
    ko.applyBindings(ControllerModel);
});