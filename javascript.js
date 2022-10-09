const Slot = (x, y) => {
    const obj = {}
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
                ;//return slots.getEmpty(condition);
        }

        // Check for moves to block opponent from immediately winning
        for (let condition in slots.winConditions) {
            let score = slots.sumCondition(condition);
            if (token === 'circle' && score == -2 || token === 'cross' && score == 2)
                ;//return slots.getEmpty(condition);
        }

        // Get possibleConditions still available to win
        const possibleConditions = [];
        for (let condition in slots.winConditions)
            if (!slots.hasToken(condition, oppositeToken))
                possibleConditions.push(condition);
        console.log(token, 'can still win at', possibleConditions); // LOG

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

    return {addToken, clear, check, generateMove, slots};
})();

// board.addToken(1, 0, 'cross')
board.addToken(0, 0, 'empty');
board.addToken(1, 0, 'empty');
board.addToken(2, 0, 'cross');
board.addToken(0, 1, 'cross');
board.addToken(1, 1, 'circle');
board.addToken(2, 1, 'cross');
board.addToken(0, 2, 'circle');
board.addToken(1, 2, 'empty');
board.addToken(2, 2, 'circle');
// console.log('diagonal1', board.slots.sumCondition('diagonal1'));
// console.log('col2', board.slots.sumCondition('col2'));
// console.log('checking...');
// console.log(board.check());
let token = 'cross';
console.log('generating move for', token, '...');
[x,y] = board.generateMove(token);
console.log(`move for ${token} generated at x:${x}, y:${y}`);
// board.array[2][2].highlight();
// board.clear();


// board2.addToken(1, 0, 'cross');
// board2.addToken(1, 1, 'cross');
// board2.addToken(1, 2, 'circle');
// // board2.addToken(2, 2, 'circle');
// board2.addToken(2, 0, 'cross');
// board2.addToken(0,2,'circle');
// console.log('result: ', board2.check());
// console.log('place in:', board2.generateMove('circle'));


// for (slot of document.querySelectorAll('.slot'))
    // slot.addEventListener('click', onClick);

// let game2 = (function() {
//     let state = 'pickMode';

//     let nodes = (function() {
//         let obj = {};
//         obj.onePlayer = document.getElementById('one-player');
//         obj.twoPlayer = document.getElementById('two-player');
//         obj.reset = document.getElementById('reset');
//         obj.circleTurn = document.querySelector('.circle-turn');
//         obj.crossTurn = document.querySelector('.cross-turn');
//         obj.results = document.getElementById('results');
//         let n = 1;
//         for (slot of document.querySelectorAll('.slot')) {
//             obj['node'+n] = slot;
//             n++;
//         }

//         for (property in obj)
//             obj[property].addEventListener('click', onClick);

//         return obj;
//     })();

//     let isActive = function(node) {
//         return !node.classList.contains('inactive');
//     }
//     let setInactive = function(node) {
//         node.classList.add('inactive');
//     }
//     let setActive = function(node) {
//         node.classList.remove('inactive');
//     }

//     function onClick() {
//         console.log(`active: ${isActive(this)}, this was clicked:`, this);
//         setInactive(this);
//     };

//     return {nodes, onClick};
// })();
