$(document).ready(function() {
    Client.initialize();
    Client.registerForClientConnect(function(data) {
        console.log(data);
    });
    Client.registerForClientDisconnect(function(data) {
        console.log(data);
    });
    Client.registerForCustomMessage(function(data, client) {
        console.log(data);
    });
    Client.registerForClientListChange(function() {

    });

    var MainViewModel = {
        games: ko.observableArray([]),
        loadGame: function (game) {
            console.log(game);
            Client.loadGame(game.slug);
        }
    }

    $.get('/api/games/', {}, function (response) {
        response = JSON.parse(response);
        $.each(response.games, function(i, item) {
            MainViewModel.games.push(item);
        });
    });

    ko.applyBindings(MainViewModel);
});