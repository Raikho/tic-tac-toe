const Slot = (x, y) => {
    const obj = {};
    obj.x = x;
    obj.y = y;
    obj.num = 0;
    obj.node = document.querySelector(`.slot[data-col="${x}"][data-row="${y}"]`);
    Object.defineProperty(obj, 'token', {
        get() {return obj.node.dataset.token;},
        set(value) {
            obj.node.dataset.token = value;
            if (value === 'empty') obj.num = 0;
            else if (value === 'circle') obj.num = 1;
            else if (value === 'cross') obj.num = -1;
        }
    });
    obj.highlight = function () {
        this.node.classList.add('highlight');
    };
    obj.clear = function () {
        this.token = 'empty';
        this.node.classList.remove('highlight');
    };
    return obj;
};

let board = (function () {

    let slots = new Array(new Array(3), new Array(3), new Array(3));
    for (let x=0; x<3; x++)
        for(let y=0; y<3; y++)
            slots[x][y] = Slot(x, y);
    Object.defineProperty(slots, 'winConditions', {
        value: {
            row1: [[0, 0], [1, 0], [2, 0]],
            row2: [[0, 1], [1, 1], [2, 1]],
            row3: [[0, 2], [1, 2], [2, 2]],
            col1: [[0, 0], [0, 1], [0, 2]],
            col2: [[1, 0], [1, 1], [1, 2]],
            col3: [[2, 0], [2, 1], [2, 2]],
            diagonal1: [[0, 0], [1, 1], [2, 2]],
            diagonal2: [[2, 0], [1, 1], [0, 2]],
        },
    });
    slots.highlightCondition = function(condition) {
        for ([x,y] of this.winConditions[condition])
            this[x][y].highlight();
    }
    slots.sumCondition = function(condition) {
        let sum = 0;
        for ([x,y] of this.winConditions[condition])
            sum += this[x][y].num;
        return sum;
    }
    slots.hasToken = function(condition, token) {
        for (let [x,y] of this.winConditions[condition])
            if (this[x][y].token === token)
                return true;
        return false;
    }
    slots.getEmpty = function(condition) {
        for ([x,y] of this.winConditions[condition]) {
            if (this[x][y].token === 'empty')
                return [x,y];
        }
    }
    slots.isFull = function() {
        for (let slot of this.flat())
            if (slot.num === 0) return false;
        return true;
    }

    const addToken = function(x, y, token) {
        if (slots[x][y].token === 'empty')
            slots[x][y].token = token;
    };

    const clear = function() {
        for (let slot of slots.flat())
            slot.clear();
    }

    const Result = function(state, score, condition) {
        let out = {};
        out.state = (state || 'noWinner');
        out.shape = null;
        out.direction = null;
        if (state === 'win') {
            out.shape = (score == 3) ? 'circle' : 'cross';
            out.direction = condition;
        }
        return out;
    }

    const check = function() {
        for (let condition in slots.winConditions) {
            let score = slots.sumCondition(condition);
            if (Math.abs(score) == 3) {
                slots.highlightCondition(condition);
                return Result('win', score, condition);
            }
        }

        if (slots.isFull())
            return Result('tie');

        return Result();
    };

    const generateMove = function(token) {
        let oppositeToken = (token === 'circle') ? 'cross' : 'circle';

        // Check for immediate winning moves
        for (let condition in slots.winConditions) {
            let score = slots.sumCondition(condition);
            if (token === 'circle' && score == 2 || token === 'cross' && score == -2)
                return slots.getEmpty(condition);
        }

        // Check for moves to block opponent from immediately winning
        for (let condition in slots.winConditions) {
            let score = slots.sumCondition(condition);
            if (token === 'circle' && score == -2 || token === 'cross' && score == 2)
                return slots.getEmpty(condition);
        }

        // Get possibleConditions still available to win
        const possibleConditions = [];
        for (let condition in slots.winConditions)
            if (!slots.hasToken(condition, oppositeToken))
                possibleConditions.push(condition);

        // Get possible moves, giving each empty slot at least 1 frequency
        const possibleMoves = [[{},{},{}], [{},{},{}], [{},{},{}]];
        for (let x=0; x<3; x++) {
            for (let y=0; y<3; y++) {
                possibleMoves[x][y].frequency = (slots[x][y].token === 'empty') ? 1 : 0;
                possibleMoves[x][y].x = x;
                possibleMoves[x][y].y = y;
            }
        }

        // Increase each move's frequency for each win condition they are in
        for (let condition of possibleConditions)
            for (let [x,y] of slots.winConditions[condition])
                if (slots[x][y].token === 'empty')
                    possibleMoves[x][y].frequency++;

        // FIlter only moves with max frequency
        let maxFrequency = possibleMoves.flat().reduce((prev, move) => {
            return (move.frequency > prev) ? move.frequency : prev;
        }, 0);
        const bestMoves = possibleMoves.flat().filter((move) => {
            return (move.frequency === maxFrequency)
        });

        // Pick a move
        let num = Math.floor(Math.random() * bestMoves.length);
        return [bestMoves[num].x, bestMoves[num].y];
    }

    return {addToken, clear, check, generateMove};
})();

board.addToken(0, 0, 'empty');
board.addToken(1, 0, 'empty');
board.addToken(2, 0, 'cross');
board.addToken(0, 1, 'cross');
board.addToken(1, 1, 'circle');
board.addToken(2, 1, 'cross');
board.addToken(0, 2, 'circle');
board.addToken(1, 2, 'empty');
board.addToken(2, 2, 'circle');
let token = 'cross';
[x,y] = board.generateMove(token);
console.log(`move for ${token} generated at x:${x}, y:${y}`);

const Node = (name) => {
    const obj = {};
    obj.name = name;
    obj.node = document.getElementById(name);
    Object.defineProperty(obj, 'active', {
        get() {
            if (obj.node.dataset.active === 'true') return true;
            return false;
        },
        set(bool) {
            if (bool) obj.node.dataset.active = 'true';
            else obj.node.dataset.active = 'false';
        },
    })
    obj.addListener = function(callback) {
        this.node.addEventListener('click', () => callback(obj));
    };
    return obj;
};

let game = (function(){

    let state = 'chooseMode';
    let numPlayers = 0;

    let nodes = (function() {
        let obj = {};
        obj.reset = Node('reset');
        obj.onePlayer = Node('onePlayer');
        obj.diffTitle = Node('diffTitle');
        obj.diffEasy = Node('diffEasy');
        obj.diffMed = Node('diffMed');
        obj.diffHard = Node('diffHard')
        obj.twoPlayer = Node('twoPlayer');
        obj.turnTitle = Node('turnTitle');
        obj.turnCircle = Node('turnCircle');
        obj.turnCross = Node('turnCross');
        obj.results = Node('results');
        for (prop in obj)
            obj[prop].addListener(onClick);

        obj.activate = function() {
            for (arg of arguments)
                obj[arg].active = true;
        }
        obj.deactivate = function() {
            for (arg of arguments)
                obj[arg].active = false;
        }
        obj.deactivateAll = function() {
            for (prop in obj)
                obj[prop].active = false;
        }

        return obj;
    })();

    function onClick(node) {
        if(!node.active) return;
        switch (node.name) {
            case 'onePlayer':
                console.log('one player was clicked');
                nodes.deactivate('twoPlayer');
                nodes.activate('reset', 'diffTitle', 'diffEasy', 'diffMed', 'diffHard');
                break;
            case 'twoPlayer':
                console.log('two player was clicked');
                nodes.deactivate('onePlayer');
                nodes.activate('reset', 'turnTitle', 'turnCircle', 'turnCross');
                break;
            case 'reset':
                console.log('reset was clicked');
                nodes.reset.active = false;
                nodes.onePlayer.active = true;
                nodes.twoPlayer.active = true;
                nodes.deactivateAll();
                nodes.activate('onePlayer', 'twoPlayer');
                break;
        }

    };

    return {state, nodes, onClick};
})();

// console.log(game.nodes);