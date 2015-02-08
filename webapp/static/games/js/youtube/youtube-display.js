function Player() {
    this.player = undefined;
    this.video = ko.observable(null);

    this.video.subscribe(function(newvalue) {
        Display.sendMessageToClient({"type": "content", "video": newvalue}, "all");
    });
}

Player.prototype = {
    initialize: function(id) {
        this.player = new YT.Player("ytplayer", {
            videoId: id,
        });

        this.player.addEventListener("onStateChange", this.onStateChanged);
    },
    onStateChanged: function(state) {
        console.log(state);
        switch(state.data) {
            case YT.PlayerState.PLAYING:
                Display.sendMessageToClient({"type": "playback", "state": "playing"}, "all");
                break;
            case YT.PlayerState.PAUSED:
                Display.sendMessageToClient({"type": "playback", "state": "paused"}, "all");
                break;
            case YT.PlayerState.ENDED:
                Display.sendMessageToClient({"type": "playback", "state": "ended"}, "all");
                player.video(null);
                break;
        }
    },
    play: function() {
        if (this.player) {
            this.player.playVideo();
        }
    },
    pause: function() {
        if (this.player) {
            this.player.pauseVideo();
        }
    },
    stop: function() {
        if (this.player) {
            this.player.seekTo(0);
            this.player.stopVideo();
            this.video(null);
        }
    },
    forward: function() {
        if (this.player) {
            var stime = this.player.getCurrentTime() + 20;
            this.player.seekTo(stime, true);
        }
    },
    backward: function() {
        if (this.player) {
            var stime = this.player.getCurrentTime() - 20;
            this.player.seekTo(stime, true);
        }
    },
    toggleMute: function() {
        if (this.player) {
            if(this.player.isMuted()) {
                this.player.unMute();
            } else {
                this.player.mute();
            }
            Display.sendMessageToClient({"type": "sound", "muted": !this.player.isMuted()}, "all");
        }
    },
    increaseVolume: function() {
        if (this.player) {
            var volume = this.player.getVolume() + 5;
            this.player.setVolume(volume);
        }
    },
    decreaseVolume: function() {
        if (this.player) {
            var volume = this.player.getVolume() - 5;
            this.player.setVolume(volume);
        }
    },
    loadVideo: function (video) {
        this.video(video);
        if (this.player) {
            this.player.loadVideoById({"videoId": video.id, "startSeconds": 0});
        } else {
            this.initialize(video.id);
        }
    },
    getState: function() {
        var playback = this.player.getPlayerState();
        return {"video": this.video(), "muted": this.player.isMuted(), "playing": (playback == YT.PlayerState.PLAYING)};
    }
}

var player;

function onYouTubePlayerAPIReady() {
    player = new Player();
    player.initialize();

    ko.applyBindings(player);
}

$(document).ready(function() {
    Display.initialize();
    Display.registerForClientConnect(function(data) {
        console.log(data);
    });
    Display.registerForClientDisconnect(function(data) {
        console.log(data);
    });
    Display.registerForCustomMessage(function(data, client) {
        console.log(data);
        switch(data.command) {
            case "play":
                player.play();
                break;
            case "pause":
                player.pause();
                break;
            case "stop":
                player.stop();
                break;
            case "forward":
                player.forward();
                break;
            case "backward":
                player.backward();
                break;
            case "togglemute":
                player.toggleMute();
                break;
            case "increaseVolume":
                player.increaseVolume();
                break;
            case "decreaseVolume":
                player.decreaseVolume();
                break;
            case "load":
                player.loadVideo(data.video);
                break;
            case "getstate":
                Display.sendMessageToClient({"type": "state", "state": player.getState()}, client);
                break;
        }
    });
});