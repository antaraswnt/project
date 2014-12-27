var Block = function (x, y) {
    var self = this;
    
    this.x = ko.observable(x);
    this.y = ko.observable(y);
    this.block_size = BLOCKSIZE;

    this.actualX = ko.computed(function() {
        return self.x() * self.block_size;
    });

    this.actualY = ko.computed(function() {
        return self.y() * self.block_size;
    });
}

var Snake = {
    listOfBlocks: ko.observableArray([]),
    directionOfMovement: DIRECTION_DOWN,
    interval: undefined,

    initialize: function() {
        var self = this;
        this.put(0,0);
        this.put(0,1);
        this.put(0,2);
        this.interval = setInterval(function() {
            self.move();
        }, 100);
    },

    put: function(x, y) {
        block = new Block(x, y);
        this.listOfBlocks.push(block);
    },

    pop: function() {
        this.listOfBlocks.splice(0,1);
    },

    head: function() {
        return this.listOfBlocks()[this.listOfBlocks().length - 1];
    },

    moveLeft: function() {
        this.pop();
        headBlock = this.head();
        this.put((GRIDSIZE + (headBlock.x() - 1)) % GRIDSIZE,headBlock.y());
    },

    moveRight: function() {
        this.pop();
        headBlock = this.head();
        this.put((headBlock.x() + 1) % GRIDSIZE,headBlock.y());
    },

    moveUp: function() {
        this.pop();
        headBlock = this.head();
        this.put(headBlock.x(),(GRIDSIZE + (headBlock.y() - 1)) % GRIDSIZE);
    },

    moveDown: function() {
        this.pop();
        headBlock = this.head();
        this.put(headBlock.x(),(headBlock.y() + 1) % GRIDSIZE);
    },

    move: function() {
        if(this.directionOfMovement == DIRECTION_LEFT) this.moveLeft();
        if(this.directionOfMovement == DIRECTION_RIGHT) this.moveRight();
        if(this.directionOfMovement == DIRECTION_DOWN) this.moveDown();
        if(this.directionOfMovement == DIRECTION_UP) this.moveUp();
    },

    changeDirection: function(keyCode) {
        if ((keyCode == KEYCODE_RIGHT) && (this.directionOfMovement != DIRECTION_LEFT)) {
            this.directionOfMovement = DIRECTION_RIGHT;
        } else if((keyCode == KEYCODE_LEFT) && (this.directionOfMovement != DIRECTION_RIGHT)) {
            this.directionOfMovement = DIRECTION_LEFT;
        } else if ((keyCode == KEYCODE_DOWN) && (this.directionOfMovement != DIRECTION_UP)) {
            this.directionOfMovement = DIRECTION_DOWN;
        } else if((keyCode == KEYCODE_UP) && (this.directionOfMovement != DIRECTION_DOWN)) {
            this.directionOfMovement = DIRECTION_UP;
        }
    }
}

$(document).ready(function() {
    Snake.initialize();
    ko.applyBindings(Snake);

    $(document).keydown(function(event) {
        var key = event.keyCode;
        Snake.changeDirection(key);
    });
});