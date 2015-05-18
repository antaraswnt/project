var GRIDSIZE_HORIZONTAL = 60;
var GRIDSIZE_VERTICAL = 35;
var BLOCKSIZE = 20;
var STARTLENGTH = 5

var DIRECTION_DOWN = 0;
var DIRECTION_LEFT = 1;
var DIRECTION_UP = 2;
var DIRECTION_RIGHT = 3;

var MOVE_RIGHT = 0;
var MOVE_LEFT = 1;
var MOVE_UP = 2;
var MOVE_DOWN = 3;

var Block = function (x, y) {
    var self = this;
    
    this.x = x;
    this.y = y;
}

var Snake = function (id) {
    this.id = id;
    this.sid = id + 2;
    this.listOfBlocks = ko.observableArray([]);
    this.directionOfMovement = DIRECTION_RIGHT;
}

Snake.prototype = {
    initialize: function(x, y, horizontal) {
        var self = this;
        for(var i=0; i < STARTLENGTH; i++) {
            if (horizontal) {
                this.put(x + i, y);
            } else {
                this.put(x, y + i);
            }
        }
        document.addEventListener("left_" + this.id, function(ev) {
            self.changeDirection(MOVE_LEFT);
        });
        document.addEventListener("right_" + this.id, function(ev) {
            self.changeDirection(MOVE_RIGHT);
        });
        document.addEventListener("up_" + this.id, function(ev) {
            self.changeDirection(MOVE_UP);
        });
        document.addEventListener("down_" + this.id, function(ev) {
            self.changeDirection(MOVE_DOWN);
        });
    },

    put: function(x, y) {
        var block = new Block(x, y);
        this.listOfBlocks.push(block);
        Field.setOccupied(x, y, this.sid);
    },

    pop: function() {
        var block = this.listOfBlocks.splice(0,1)[0];
        Field.setEmpty(block.x, block.y);
    },

    head: function() {
        return this.listOfBlocks()[this.listOfBlocks().length - 1];
    },

    moveLeft: function() {
        var headBlock = this.head();
        this.put((GRIDSIZE_HORIZONTAL + (headBlock.x - 1)) % GRIDSIZE_HORIZONTAL,headBlock.y);
    },

    moveRight: function() {
        var headBlock = this.head();
        this.put((headBlock.x + 1) % GRIDSIZE_HORIZONTAL,headBlock.y);
    },

    moveUp: function() {
        var headBlock = this.head();
        this.put(headBlock.x,(GRIDSIZE_VERTICAL + (headBlock.y - 1)) % GRIDSIZE_VERTICAL);
    },

    moveDown: function() {
        var headBlock = this.head();
        this.put(headBlock.x,(headBlock.y + 1) % GRIDSIZE_VERTICAL);
    },

    isClashing: function() {
        var headBlock = this.head();
        if(this.directionOfMovement == DIRECTION_LEFT) {
            return Field.isOccupied((GRIDSIZE_HORIZONTAL + (headBlock.x - 1)) % GRIDSIZE_HORIZONTAL,headBlock.y);
        } else if(this.directionOfMovement == DIRECTION_RIGHT) {
            return Field.isOccupied((headBlock.x + 1) % GRIDSIZE_HORIZONTAL,headBlock.y);
        } else if(this.directionOfMovement == DIRECTION_DOWN) {
            return Field.isOccupied(headBlock.x,(headBlock.y + 1) % GRIDSIZE_VERTICAL);
        } else if(this.directionOfMovement == DIRECTION_UP) {
            return Field.isOccupied(headBlock.x,(GRIDSIZE_VERTICAL + (headBlock.y - 1)) % GRIDSIZE_VERTICAL);
        }
    },

    isFruited: function() {
        var headBlock = this.head();
        if(this.directionOfMovement == DIRECTION_LEFT) {
            return Field.isFruit((GRIDSIZE_HORIZONTAL + (headBlock.x - 1)) % GRIDSIZE_HORIZONTAL,headBlock.y);
        } else if(this.directionOfMovement == DIRECTION_RIGHT) {
            return Field.isFruit((headBlock.x + 1) % GRIDSIZE_HORIZONTAL,headBlock.y);
        } else if(this.directionOfMovement == DIRECTION_DOWN) {
            return Field.isFruit(headBlock.x,(headBlock.y + 1) % GRIDSIZE_VERTICAL);
        } else if(this.directionOfMovement == DIRECTION_UP) {
            return Field.isFruit(headBlock.x,(GRIDSIZE_VERTICAL + (headBlock.y - 1)) % GRIDSIZE_VERTICAL);
        }
    },

    changeDirectionAfterClash: function() {
        var tail = this.listOfBlocks()[0];
        var subTail = this.listOfBlocks()[1];
        if(tail.x == subTail.x) {
            if(tail.y == (subTail.y + 1) % GRIDSIZE_VERTICAL) {
                this.directionOfMovement = DIRECTION_DOWN;
            } else {
                this.directionOfMovement = DIRECTION_UP;
            }
        } else if(tail.y == subTail.y) {
            if(tail.x == (subTail.x + 1) % GRIDSIZE_HORIZONTAL) {
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
            return;
        }
        if (!this.isFruited()) {
            this.pop();
        }
        if(this.directionOfMovement == DIRECTION_LEFT) this.moveLeft();
        if(this.directionOfMovement == DIRECTION_RIGHT) this.moveRight();
        if(this.directionOfMovement == DIRECTION_DOWN) this.moveDown();
        if(this.directionOfMovement == DIRECTION_UP) this.moveUp();
    },

    changeDirection: function(directionCode) {
        if ((directionCode == MOVE_RIGHT) && (this.directionOfMovement != DIRECTION_LEFT)) {
            this.directionOfMovement = DIRECTION_RIGHT;
        } else if((directionCode == MOVE_LEFT) && (this.directionOfMovement != DIRECTION_RIGHT)) {
            this.directionOfMovement = DIRECTION_LEFT;
        } else if ((directionCode == MOVE_DOWN) && (this.directionOfMovement != DIRECTION_UP)) {
            this.directionOfMovement = DIRECTION_DOWN;
        } else if((directionCode == MOVE_UP) && (this.directionOfMovement != DIRECTION_DOWN)) {
            this.directionOfMovement = DIRECTION_UP;
        }
    }
}

var Field = {
    blocks: {},
    snakes: [],
    element: '#playarea',
    interval: undefined,
    clients: {},
    gameStarted: ko.observable(false),
    fruit: ko.observable(null),

    setOccupied: function (x,y,value) {
        Field.blocks[x * GRIDSIZE_VERTICAL + y] = value;
        $(Field.element).append('<div id="' + x + '_' + y + '" class="block type_' + value + '" style="left: ' + x * BLOCKSIZE + 'px; top: ' + y * BLOCKSIZE + 'px; height: ' + BLOCKSIZE + 'px; width: ' + BLOCKSIZE + 'px;"></div>');
    },

    setEmpty: function (x,y) {
        $('#' + x + '_' + y).remove();
        delete Field.blocks[x * GRIDSIZE_VERTICAL + y];
    },

    isOccupied: function (x, y) {
        return (Field.blocks[x * GRIDSIZE_VERTICAL + y] > 0);
    },

    isFruit: function(x, y) {
        var fruit = Field.fruit();
        if (fruit) {
            if ((x == fruit.x) && (y == fruit.y)) {
                console.log('Fruit eaten');
                Field.fruit(null);
                return true;
            }
        }
        return false;
    },

    setFruit: function() {
        if (!Field.fruit()) {
            var x_rnd, y_rnd;
            while(1) {
                y_rnd = Math.floor(Math.random() * GRIDSIZE_VERTICAL);
                x_rnd = Math.floor(Math.random() * GRIDSIZE_HORIZONTAL);
                if (!Field.isOccupied(x_rnd, y_rnd)) break;
            }
            Field.fruit({x: x_rnd, y: y_rnd});
        }
    },

    addSnake: function (client) {
        var index = Field.snakes.length;
        var snake = new Snake(index);
        snake.initialize(0,index * 2,true);
        Field.clients[client] = {"snake": index};
        Field.snakes.push(snake);
    },

    getClientCount: function() {
        return Field.snakes.length;
    },

    initialize: function () {
        Field.setOccupied(10, 8, 1);
        Field.setOccupied(10, 9, 1);
        Field.setOccupied(10, 10, 1);
        Field.setOccupied(10, 11, 1);
        Field.setOccupied(10, 12, 1);
        Field.setOccupied(10, 13, 1);
        Field.setOccupied(10, 14, 1);
        Field.setOccupied(10, 15, 1);

        Field.fruit.subscribe(function (value) {
            if (value) {
                $('#fruit').remove();
                $(Field.element).append('<div id="fruit" class="fruit block" style="left: ' + value.x * BLOCKSIZE + 'px; top: ' + value.y * BLOCKSIZE + 'px; height: ' + BLOCKSIZE + 'px; width: ' + BLOCKSIZE + 'px;"></div>');
            }
        });
        
        Field.gameStarted(true);

        Field.interval = setInterval(function() {
            for (var index in Field.snakes) {
                Field.snakes[index].move();
            }
            Field.setFruit();
        }, 150);
    }
}

$(document).ready(function() {
    Display.initialize();
    
    Display.registerForClientConnect(function(data) {
        
    });
    
    Display.registerForClientDisconnect(function(data) {
        
    });

    Display.registerForCustomMessage(function(data, client) {
        switch(data.type) {
            case "joingame":
                if (Field.getClientCount() < 2) {
                    if (Field.clients[client] == undefined) {
                        Field.addSnake(client);
                    }
                    if (Field.getClientCount() == 1) Field.initialize();
                }
                break;
            case "left":
            case "right":
            case "up":
            case "down":
                var ev = document.createEvent("HTMLEvents");
                ev.initEvent(data.type + '_' + Field.clients[client].snake, true, true);
                document.dispatchEvent(ev);
                break;
            case "stopgame":
                break;
        }
    });
});