$(document).ready(function() {
    $('.carousel').carousel({
        interval: 5000,
        pause: "",
    });

    Display.initialize();
    Display.registerForClientConnect(function(data) {
        
    });
    Display.registerForClientDisconnect(function(data) {

    });
    Display.registerForCustomMessage(function(data, client) {
        
    });

    var MainViewModel = {
        games: ko.observableArray([])
    }

    $.get('/api/games/', {}, function (response) {
        response = JSON.parse(response);
        $.each(response.games, function(i, item) {
            MainViewModel.games.push(item);
        });
    });

    ko.applyBindings(MainViewModel);
});