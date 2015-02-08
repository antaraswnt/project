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
        if (client == "portal") {
            switch(data.type) {
                case "content":
                    Remote.selectedvideo(data.video);
                    break;
                case "sound":
                    Remote.muted(data.muted);
                    break;
                case "playback":
                    Remote.playing((data.state == "playing"));
                    break;
                case "state":
                    Remote.selectedvideo(data.state.video);
                    Remote.muted(data.state.muted);
                    Remote.playing(data.state.playing);
                    break;
            }
        }
    });
    Client.registerForClientListChange(function() {
        Client.sendMessageToPortal({"command": "getstate"});
    });
    var Remote = {
        videos: ko.observableArray([
            {
                "id": "aeSqYuboqtU",
                "title": "Kotak Mahindra Junior Bank Account Aaj ki Chillar Kal Ke Note Latest TV AD 2013",
                "description": "kotak mahindra bank junuor account aaj ki chillar kal ke note latest new tv ad 2013 Media/Origin: TV / Indian Product Group: Banking | Financial Services | I...",
                "thumbnail": "https://i.ytimg.com/vi/aeSqYuboqtU/default.jpg",
            },
            {
                "id": "QPuRKzia-_g",
                "title": "Kotak Mahindra Bank Vinay Pathak TVC 'Subbu Sab Janta Hai'",
                "description": "http://www.afaqs.com/advertising/creative_showcase/index.html Creative Showcase to view more TV, print,radio, outdoor and digital ads Creative ...",
                "thumbnail": "https://i.ytimg.com/vi/QPuRKzia-_g/default.jpg",
            },
            {
                "id": "c0G_RdXztL0",
                "title": "Kotak Mahindra Bank Ad",
                "description": "Director: Mr. Amit Sharma Producer: Mr. Hemant Bhandari Production House: Chrome Pictures Pvt. Ltd.",
                "thumbnail": "https://i.ytimg.com/vi/c0G_RdXztL0/default.jpg",
            },
            {
                "id": "fllg6iziA-M",
                "title": "Jifi - back-to-back",
                "description": "",
                "thumbnail": "https://i.ytimg.com/vi/fllg6iziA-M/default.jpg",
            },
            {
                "id": "a4lKgwzBLy4",
                "title": "Priyank Tatariya - Kotak Mahindra Ad- Money Ka Matlab",
                "description": "",
                "thumbnail": "https://i.ytimg.com/vi/a4lKgwzBLy4/default.jpg",
            },
        ]),
        selectedvideo: ko.observable(null),
        showControls: ko.observable(true),
        muted: ko.observable(false),
        playing: ko.observable(false),
        play: function () {
            Client.sendMessageToPortal({"command": "play"});
        },
        pause: function () {
            Client.sendMessageToPortal({"command": "pause"});
        },
        stop: function () {
            Client.sendMessageToPortal({"command": "stop"});
        },
        forward: function () {
            Client.sendMessageToPortal({"command": "forward"});
        },
        backward: function () {
            Client.sendMessageToPortal({"command": "backward"});
        },
        togglemute: function () {
            Client.sendMessageToPortal({"command": "togglemute"});
        },
        increaseVolume: function () {
            Client.sendMessageToPortal({"command": "increaseVolume"});
        },
        decreaseVolume: function () {
            Client.sendMessageToPortal({"command": "decreaseVolume"});
        },
        loadVideo: function (video) {
            Client.sendMessageToPortal({"command": "load", "video": video});
        },
        toggleControls: function() {
            Remote.showControls(!Remote.showControls());
        }
    }
    ko.applyBindings(Remote);
});