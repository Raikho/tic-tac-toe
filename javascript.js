let board = (function() {

    let array = (function() {
        let full =[[{}, {}, {}], [{}, {}, {}], [{}, {}, {}]];
        
        for (let row of full)
            for (let slot of row)
                slot.value = 'empty';

        let slotNodes = document.querySelectorAll('.slot');
        for (let node of [...slotNodes])
            full[node.dataset.row][node.dataset.col].node = node;

        return full;
    })();

    const winConditions = {
        row1: [[0,0], [0,1], [0,2]],
        row2: [[1,0], [1,1], [1,2]],
        row3: [[2,0], [2,1], [2,2]],
        col1: [[0,0], [1,0], [2,0]],
        col2: [[0,1], [1,1], [2,1]],
        col3: [[0,2], [1,2], [2,2]],
        diagonal1: [[0,0], [1,1], [2,2]],
        diagonal2: [[0,2], [1,1], [2,0]],
    };

    // sets slot value in both array and DOM
    let set = function(slot, value) {
        slot.value = value;
        slot.node.dataset.value = value;
    };

    let add = function(row, col, value) {
        let slot = array[row][col];
        if (slot.value === 'empty') {
            set(slot, value);
            return true;
        } else {
            return false
        }
    };

    let reset = function() {
        for (let row of array) {
            for (let slot of row) {
                set(slot, 'empty');
                slot.node.classList.remove('highlight');
            }
        }
    };

    let toNumber = function(value) {
        if (value === 'empty') return 0;
        if (value === 'circle') return 1;
        if (value === 'cross') return -1;
    };

    let check = function() {
        let result = {
            state: 'inProgress',
            shape: null,
            direction: null
        }

        // Check for win
        for (let condition in winConditions) {
            let sum = 0;
            for (let i=0; i<3; i++) {
                let row = winConditions[condition][i][0];
                let col = winConditions[condition][i][1];
                sum += toNumber(array[row][col].value);
            }
            
            if (Math.abs(sum) == 3){
                result.state = 'won';
                result.shape = (sum == 3) ? 'Circle' : 'Cross';
                result.direction = condition;
                highlightWinningCondition(condition);
                return result;
            }
        }

        // Check for stalemate
        let sum = 0;
        for (let row of array) {
            for (let slot of row) {
                sum += Math.abs(toNumber(slot.value));
            }
        }
        if (sum === 9) {
            result.state = 'tie';
            return result;
        }

        return result;
    };

    let highlightWinningCondition = function(condition) {
        let slotNodes = document.querySelectorAll('.slot');
        for (let node of [...slotNodes]) {
            for (let slot of winConditions[condition]) {
                let nodeRow = +node.dataset.row;
                let nodeCol = +node.dataset.col;
                let slotRow = slot[0];
                let slotCol = slot[1];
                if (nodeRow === slotRow && nodeCol === slotCol) {
                    node.classList.add('highlight');
                }
            }
        }
    }

    let generateMove = function() {
        //TODO: Recreate using sums, auto fill if 2/3 slots
        console.log('AI is thinking...');

        // Add win conditions without Circle to array
        let possibleConditions = [];
        for (condition in winConditions) {
            let possible = true;
            for (let i=0; i<3; i++) {
                let row = winConditions[condition][i][0];
                let col = winConditions[condition][i][1];
                if (array[row][col].value === 'circle')
                    possible = false;
            }
            if (possible)
                possibleConditions.push(condition);
        }
        console.log(possibleConditions);

        // Add non-occupied slots from win conditions to array, can repeat
        const possibleSlots = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
        for (condition of possibleConditions) {
            for (let i=0; i<3; i++) {
                let row = winConditions[condition][i][0];
                let col = winConditions[condition][i][1];
                if (array[row][col].value === 'empty')
                    possibleSlots[row][col] += 1;
            }
        }

        // Get slots included in the most win conditions
        let max = 1;
        for (let i=0; i<3; i++)
            for (let j=0; j<3; j++)
                if (possibleSlots[i][j] > max) 
                    max = possibleSlots[i][j];

        const bestSlots = [];
        for (let i=0; i<3; i++)
            for (let j=0; j<3; j++)
                if (possibleSlots[i][j] === max)
                    bestSlots.push({row: i, col: j});
        console.log('Best Slots:');
        console.log(bestSlots);

        // Pick random slot from possible slots
        let num = Math.floor(Math.random() * bestSlots.length);
        add(bestSlots[num].row, bestSlots[num].col, 'cross');
    }

    return {add, reset, check, generateMove};
})();

let game = (function() {

    let currentTurn = 'none';
    let gameMode = 'standby';
    let thinking = false;

    let toggleTurn = function() {
        if (currentTurn === 'circle') currentTurn = 'cross';
        else if (currentTurn === 'cross') currentTurn = 'circle';
        updateTurn();
    };

    let updateTurn = function() {
        circleTurnNode.classList.remove('active');
        crossTurnNode.classList.remove('active');
        if (currentTurn === 'circle')
            circleTurnNode.classList.add('active');
        if (currentTurn === 'cross')
            crossTurnNode.classList.add('active');
    }

    let updateGameMode = function(mode) {
        gameMode = mode;
        onePlayerButtonNode.classList.remove('active');
        twoPlayerButtonNode.classList.remove('active');
        if (gameMode === 'one-player') {
            onePlayerButtonNode.classList.add('active');
            twoPlayerButtonNode.classList.add('inactive');
            boardNode.classList.add('active');
            resetButtonNode.classList.remove('inactive');;
            resultsNode.textContent = 'Playing vs AI';
        }
        if (gameMode === 'two-player') {
            twoPlayerButtonNode.classList.add('active');
            onePlayerButtonNode.classList.add('inactive');
            currentTurn = 'circle';
            boardNode.classList.add('active');
            resetButtonNode.classList.remove('inactive');;
            resultsNode.textContent = 'Playing locally';
            updateTurn();
        }
        if (gameMode === 'standby') {
            boardNode.classList.remove('active');
            resetButtonNode.classList.add('inactive');
            onePlayerButtonNode.classList.remove('inactive');
            twoPlayerButtonNode.classList.remove('inactive');
            resultsNode.textContent = 'Select a game mode';
        }
    }

    let clickSlot = function(row, col) {
        if (gameMode === 'standby' || gameMode === 'results')
            return;
        
        if (gameMode === 'two-player') {
            board.add(row, col, currentTurn);
            toggleTurn();
            checkBoard();
        }

        if (gameMode === 'one-player') {
            if (thinking) return;

            let isSuccessful = board.add(row, col, 'circle');
            
            if (isSuccessful) {
                checkBoard();
                if (gameMode === 'one-player'){
                    setTimeout(() => {
                        board.generateMove();
                        checkBoard();
                        thinking = false;
                    }, 500);
                    thinking = true;
                }
            }
        }
    }

    let checkBoard = function() {
        let result = board.check();
        console.log(result)
        if (result.state === 'won') {
            resultsNode.textContent = `${result.shape} has won!`;
            updateGameMode('results');
        }
        else if (result.state === 'tie') {
            resultsNode.textContent = `You have tied!`;
            updateGameMode('results');
        }
    }

    let reset = function() {
        board.reset();
        currentTurn = 'none';
        updateTurn();
        updateGameMode('standby');
        resultsNode.textContent = ``;
    }
    return {clickSlot, reset, updateGameMode};
})();

const circleTurnNode = document.querySelector('.circle-turn');
const crossTurnNode = document.querySelector('.cross-turn');

const onePlayerButtonNode = document.getElementById('one-player');
const twoPlayerButtonNode = document.getElementById('two-player');
const resetButtonNode = document.getElementById('reset');
onePlayerButtonNode.addEventListener('click', () => {
    if (onePlayerButtonNode.classList.contains('inactive')) return;
    game.updateGameMode('one-player');
});
twoPlayerButtonNode.addEventListener('click', () => {
    if (twoPlayerButtonNode.classList.contains('inactive')) return;
    game.updateGameMode('two-player');
});
resetButtonNode.addEventListener("click", game.reset);

const resultsNode = document.getElementById('results');

const slotNodeList = document.querySelectorAll('.slot');
[...slotNodeList].forEach((slotNode) => {
    slotNode.addEventListener('click', () => {
        game.clickSlot(slotNode.dataset.row, slotNode.dataset.col);
    })
});
const boardNode = document.querySelector('.container.board');


console.log('board:', board);
console.log('game:', game);

const Slot = (row, col) => {

    const obj = {
        
    }
    
    obj.row = row;
    obj.col = col;
    obj.token = 'empty';
    obj.num = 0;
    obj.node = document.querySelector(`.slot[data-row="${row}"][data-col="${col}"]`);

    obj.setToken = function(token) {
        this.token = token;
        this.node.dataset.value = token;
        this.updateNum();
    }

    obj.updateNum = function() {
        if (this.token === 'empty') this.num = 0;
        else if (this.token === 'circle') this.num = 1;
        else if (this.token === 'cross') this.num = -1;
    }

    return obj;
}

const slot = Slot(2, 2);
console.log(slot);
slot.setToken('cross');
console.log(slot);
