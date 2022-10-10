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

const board = (function () {

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
    };
    slots.sumCondition = function(condition) {
        let sum = 0;
        for ([x,y] of this.winConditions[condition])
            sum += this[x][y].num;
        return sum;
    };
    slots.hasToken = function(condition, token) {
        for (let [x,y] of this.winConditions[condition])
            if (this[x][y].token === token)
                return true;
        return false;
    };
    slots.getEmpty = function(condition) {
        for ([x,y] of this.winConditions[condition]) {
            if (this[x][y].token === 'empty')
                return [x,y];
        }
    };
    slots.isFull = function() {
        for (let slot of this.flat())
            if (slot.num === 0) return false;
        return true;
    };

    const addToken = function(x, y, token) {
        if (slots[x][y].token === 'empty')
            slots[x][y].token = token;
    };

    const isEmpty = function(x, y) {
        return (slots[x][y].token === 'empty');
    };

    const clear = function() {
        for (let slot of slots.flat())
            slot.clear();
    };

    const Result = function(state='inProgress', score, condition) {
        let out = {};
        out.state = state;
        out.shape = null;
        out.direction = null;
        if (state === 'win') {
            out.shape = (score == 3) ? 'circle' : 'cross';
            out.direction = condition;
        }
        return out;
    };

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
    };

    return {addToken, isEmpty, clear, check, generateMove};
})();

// board.addToken(0, 0, 'empty');
// board.addToken(1, 0, 'empty');
// board.addToken(2, 0, 'cross');
// board.addToken(0, 1, 'cross');
// board.addToken(1, 1, 'circle');
// board.addToken(2, 1, 'cross');
// board.addToken(0, 2, 'circle');
// board.addToken(1, 2, 'empty');
// board.addToken(2, 2, 'circle');
// let token = 'cross';
// [x,y] = board.generateMove(token);
// console.log(`move for ${token} generated at x:${x}, y:${y}`);

const Node = (name, isGroup=false, groupNode) => {
    const obj = {};
    obj.name = name;
    if (isGroup)
        obj.node = document.getElementById('board');
    else
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
        if (name === 'board') {
            return;
        } else if (isGroup) {
            let nodeList = document.querySelectorAll('.slot');
            for (let node of [...nodeList]) {
                node.addEventListener('click', () => {
                    callback(obj, node.dataset.col, node.dataset.row);
                });
            }
        } else {
            this.node.addEventListener('click', () => callback(obj));
        }
    };
    return obj;
};

const Game = (playerType1, tokenType1, playerType2, tokenType2) => {
    const obj = {};
    obj.state = 'inProgress';
    obj.turn = 0;
    obj.players = [{}, {}];

    obj.players[0].type = playerType1;
    obj.players[0].token = tokenType1;
    obj.players[0].play = function(x, y) {
        board.addToken(x, y, this.token);
    };

    obj.players[1].type = playerType2;
    obj.players[1].token = tokenType2;
    obj.players[1].play = function(x, y) {
        board.addToken(x, y, this.token)
    };

    obj.nextTurn = function() {obj.turn = (obj.turn == 0) ? 1 : 0;};
    Object.defineProperty(obj, 'currentPlayer', {
        get() {return obj.players[obj.turn];},
    });
    Object.defineProperty(obj, 'token', {
        get() {return obj.currentPlayer.token;},
    });
    obj.play = function(x, y) {
        let player = obj.currentPlayer;
        if (player.type === 'player') return [x, y];
        else return board.generateMove(obj.currentPlayer.token);
    };

    return obj;
};

const run = (function(){

    let game = '';

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
        obj.board = Node('board');
        obj.slots = Node('slots', true);
        Object.defineProperty(obj, 'results', {enumerable: false});
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

    function onClick(node, x, y) {
        if(!node.active) return;
        switch (node.name) {
            case 'onePlayer':
                nodes.deactivate('twoPlayer');
                nodes.activate('reset', 'diffTitle', 'diffEasy', 'diffMed', 'diffHard');
                break;
            case 'twoPlayer':
                nodes.deactivate('onePlayer');
                nodes.activate('reset', 'turnTitle', 'turnCircle', 'board');
                game = Game('player', 'circle', 'player', 'cross');
                updateResults();
                break;
            case 'reset':
                board.clear();
                nodes.deactivateAll();
                nodes.activate('onePlayer', 'twoPlayer');
                updateResults('Select a game mode');
                break;
            case 'diffEasy': case 'diffMed': case 'diffHard':
                nodes.activate('board');
                game = Game('player', 'circle', 'ai', 'cross');
                break;
            case 'slots':
                clickSlot(x, y);
                break;
            default:
                console.log(`${node.name} was clicked, with x:${x} and y:${y}`);
        }
    };

    function flipTurnIndicator() {
        if (game.turn == 0) {
            nodes.deactivate('turnCircle');
            nodes.activate('turnCross');
        }
        if (game.turn == 1) {
            nodes.deactivate('turnCross');
            nodes.activate('turnCircle');
        }
    }

    function updateResults(text='') {
        nodes.results.node.textContent = text;
    }

    function clickSlot(x, y, passthrough) {
        if(game.state !== 'inProgress') return;
        if(!board.isEmpty(x, y) && game.state === 'paused') return

        [xNew, yNew] = game.play(x, y);

        board.addToken(xNew, yNew, game.token);

        results = board.check();
        game.state = results.state;
        switch (game.state) {
            case 'inProgress':
                if (nodes.twoPlayer.active)
                    flipTurnIndicator();
                game.nextTurn();
                break;
            case 'tie':
                updateResults(`You have tied!`);
                break;
            case 'win':
                if (results.shape === 'circle')
                    updateResults('Cricle has won!');
                else if (results.shape === 'cross')
                    updateResults('Cross has won!');
                break;
        }

        if (game.state === 'inProgress' && game.currentPlayer.type === 'ai') {
            console.log('do the second turn');
            game.state = 'paused';
            setTimeout(() => {
                console.log('did the second turn');
                game.state = 'inProgress';
                clickSlot(x, y, true);
            }, 500);
        }
    };

    return { nodes, onClick};
})();