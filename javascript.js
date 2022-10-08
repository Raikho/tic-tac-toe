const Slot = (x, y) => {
    const obj = {}
    obj.x = x;
    obj.y = y;
    obj.num = 0;
    obj.node = document.querySelector(`.slot[data-col="${x}"][data-row="${y}"]`);
    Object.defineProperty(obj, 'token', {
        get() {return obj.node.dataset.token;},
        set(value) {
            obj.node.dataset.toke = value;
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

    let array = new Array(new Array(3), new Array(3), new Array(3));
    for (let x=0; x<3; x++)
        for(let y=0; y<3; y++)
            array[x][y] = Slot(x, y);

//     const winConditions = {
//         row1: [[0, 0], [0, 1], [0, 2]],
//         row2: [[1, 0], [1, 1], [1, 2]],
//         row3: [[2, 0], [2, 1], [2, 2]],
//         col1: [[0, 0], [1, 0], [2, 0]],
//         col2: [[0, 1], [1, 1], [2, 1]],
//         col3: [[0, 2], [1, 2], [2, 2]],
//         diagonal1: [[0, 0], [1, 1], [2, 2]],
//         diagonal2: [[0, 2], [1, 1], [2, 0]],
//     };

//     let Result = function (state = 'inProgress', score, condition) {
//         let obj = {};
//         obj.state = state;
//         if (state === 'win') {
//             obj.shape = (score == 3) ? 'circle' : 'cross';
//             obj.direction = condition;
//         } else {
//             obj.shape = null;
//             obj.direction = null;
//         }
//         return obj;
//     }

//     let highlightWinCondition = function (condition) {
//         for (let [row, col] of winConditions[condition])
//             array[row][col].node.classList.add('highlight');
//     };

//     let clear = function () {
//         for (let slot of array.flat())
//             slot.clear();
//     };

//     let addToken = function (row, col, token) {
//         let slot = array[row][col];
//         if (slot.token === 'empty')
//             slot.setToken(token);
//     };

//     let check = function () {
//         // CHECK FOR WIN
//         for (let condition in winConditions) {
//             let score = 0;
//             for (let [row, col] of winConditions[condition])
//                 score += array[row][col].num;

//             if (Math.abs(score) == 3) {
//                 highlightWinCondition(condition);
//                 return Result('win', score, condition);;
//             }
//         }

//         // CHECK FOR STALEMATE
//         let numTokens = 0;
//         for (let slot of array.flat())
//             numTokens += Math.abs(slot.num);
//         if (numTokens == 4) {
//             return Result('tie');
//         };

//         return Result();
//     };

//     let generateMove = function (token) {
//         let oppositeToken = (token === 'circle') ? 'cross' : 'circle';

//         // Get immediate moves to win or prevent losing
//         let immediateMoves = { circle: [], cross: []};
//         for (let condition in winConditions) {
//             let numCircle = 0;
//             let numCross = 0;
//             let lastEmptySlot = null;

//             for (let [row, col] of winConditions[condition]) {
//                 let slot = array[row][col];
//                 if (slot.token === 'circle') numCircle++;
//                 else if (slot.token === 'cross') numCross++;
//                 else if (slot.token === 'empty') lastEmptySlot = slot;
//             }

//             if (numCircle === 2 && lastEmptySlot)
//                 immediateMoves.circle.push(lastEmptySlot);
//             else if (numCross === 2 && lastEmptySlot)
//                 immediateMoves.cross.push(lastEmptySlot);
//         }

//         // Pick move if possible to win or prevent losing
//         if (immediateMoves[token].length)
//             return {row: immediateMoves[token][0].row, col: immediateMoves[token][0].col};
//         if (immediateMoves[oppositeToken].length)
//             return {row: immediateMoves[oppositeToken][0].row, col: immediateMoves[oppositeToken][0].col};

//         // get possibleConditions still available to win
//         let possibleConditions = [];
//         for (let condition in winConditions) {
//             let possible = true;
//             for (let [row, col] of winConditions[condition])
//                 if (array[row][col].token === 'circle')
//                     possible = false;
//             if (possible)
//                 possibleConditions.push(condition);
//         }

//         // set each empty slot to frequency of at least once
//         let possibleMoves = [[], [], []];
//         for (let i=0; i<3; i++) {
//             for (let j=0; j<3; j++) {
//                 let obj = {};
//                 obj.slot = array[i][j];
//                 obj.frequency = (obj.slot.token === 'empty') ? 1 : 0;
//                 possibleMoves[i].push(obj);
//             }
//         }

//         // Add empty slots again for each win condition they are in
//         for (let condition of possibleConditions) {
//             for (let [row, col] of winConditions[condition]) {
//                 if (possibleMoves[row][col].slot.token === 'empty')
//                     possibleMoves[row][col].frequency += 1;
//             }
//         }

//         // Get max frequency of possible moves
//         let maxFrequency = 0;
//         for (move of possibleMoves.flat())
//             if (move.frequency > maxFrequency)
//                 maxFrequency = move.frequency;

//         // Filter only max values;
//         maxFrequencyMoves =  possibleMoves.flat().filter((move) => {
//             return (move.frequency === maxFrequency);
//         });

//         // Pick a move;
//         let num = Math.floor(Math.random() * maxFrequencyMoves.length);
//         return {row: maxFrequencyMoves[num].slot.row, col: maxFrequencyMoves[num].slot.col};
//     };

    // return {clear, addToken, check, generateMove};
    return {array};
})();

console.dir(board.array);
console.log(board.array[2][2].token);
board.array[2][2].highlight();



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
