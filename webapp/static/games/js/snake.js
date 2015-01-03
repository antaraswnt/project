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

var Snake = function () {
    this.listOfBlocks = ko.observableArray([]);
    this.directionOfMovement = DIRECTION_DOWN;
    this.interval = undefined;
}

Snake.prototype = {
    initialize: function() {
        var self = this;
        this.put(0,0);
        this.put(0,1);
        this.put(0,2);
        this.put(0,3);
        this.put(0,4);
        this.put(0,5);
        this.put(0,6);
        this.put(0,7);
        this.put(0,8);
        this.put(0,9);
        this.put(0,10);
        this.interval = setInterval(function() {
            self.move();
        }, 200);
    },

    put: function(x, y) {
        var block = new Block(x, y);
        this.listOfBlocks.push(block);
        Field.setOccupied(x, y);
    },

    pop: function() {
        var block = this.listOfBlocks.splice(0,1)[0];
        Field.setEmpty(block.x(), block.y());
    },

    head: function() {
        return this.listOfBlocks()[this.listOfBlocks().length - 1];
    },

    moveLeft: function() {
        this.pop();
        var headBlock = this.head();
        this.put((GRIDSIZE + (headBlock.x() - 1)) % GRIDSIZE,headBlock.y());
    },

    moveRight: function() {
        this.pop();
        var headBlock = this.head();
        this.put((headBlock.x() + 1) % GRIDSIZE,headBlock.y());
    },

    moveUp: function() {
        this.pop();
        var headBlock = this.head();
        this.put(headBlock.x(),(GRIDSIZE + (headBlock.y() - 1)) % GRIDSIZE);
    },

    moveDown: function() {
        this.pop();
        var headBlock = this.head();
        this.put(headBlock.x(),(headBlock.y() + 1) % GRIDSIZE);
    },

    isClashing: function() {
        var headBlock = this.head();
        if(this.directionOfMovement == DIRECTION_LEFT) {
            return Field.isOccupied((GRIDSIZE + (headBlock.x() - 1)) % GRIDSIZE,headBlock.y());
        } else if(this.directionOfMovement == DIRECTION_RIGHT) {
            return Field.isOccupied((headBlock.x() + 1) % GRIDSIZE,headBlock.y());
        } else if(this.directionOfMovement == DIRECTION_DOWN) {
            return Field.isOccupied(headBlock.x(),(headBlock.y() + 1) % GRIDSIZE);
        } else if(this.directionOfMovement == DIRECTION_UP) {
            return Field.isOccupied(headBlock.x(),(GRIDSIZE + (headBlock.y() - 1)) % GRIDSIZE);
        }
    },

    changeDirectionAfterClash: function() {
        var tail = this.listOfBlocks()[0];
        var subTail = this.listOfBlocks()[1];
        if(tail.x() == subTail.x()) {
            if(tail.y() == (GRIDSIZE - subTail.y() + 1) % GRIDSIZE) {
                this.directionOfMovement = DIRECTION_DOWN;
            } else {
                this.directionOfMovement = DIRECTION_UP;
            }
        } else if(tail.y() == subTail.y()) {
            if(tail.x() > subTail.x()) {
                this.directionOfMovement = DIRECTION_RIGHT;
            } else {
                this.directionOfMovement = DIRECTION_LEFT;
            }
        }
    },

    move: function() {
        if (this.isClashing()) {
            this.changeDirectionAfterClash();
            this.listOfBlocks.reverse();
        }
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

var Field = {
    blocks: new Array(GRIDSIZE * GRIDSIZE),
    snake: new Snake(),
    staticWall: [],

    setOccupied: function (x,y) {
        Field.blocks[x * GRIDSIZE + y] = 1;
    },

    setEmpty: function (x,y) {
        Field.blocks[x * GRIDSIZE + y] = 0;
    },

    isOccupied: function (x, y) {
        return (Field.blocks[x * GRIDSIZE + y] === 1);
    },

    initialize: function () {
        Field.staticWall.push(new Block(10,5));
        Field.staticWall.push(new Block(10,6));
        Field.staticWall.push(new Block(10,7));
        Field.staticWall.push(new Block(10,8));
        Field.staticWall.push(new Block(10,9));
        Field.staticWall.push(new Block(10,10));
        Field.setOccupied(10, 5);
        Field.setOccupied(10, 6);
        Field.setOccupied(10, 7);
        Field.setOccupied(10, 8);
        Field.setOccupied(10, 9);
        Field.setOccupied(10, 10);
        
        Field.snake.initialize();
    }
}

$(document).ready(function() {
    Field.initialize();
    ko.applyBindings(Field);

    $(document).keydown(function(event) {
        var key = event.keyCode;
        Field.snake.changeDirection(key);
    });
});