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
        if (slot.value === 'empty')
            set(slot, value);
    };

    let reset = function() {
        for (let row of array)
            for (let slot of row)
                set(slot, 'empty');
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

    let generateMove = function() {
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
        let possibleSlots = [];
        for (condition of possibleConditions) {
            for (let i=0; i<3; i++) {
                let row = winConditions[condition][i][0];
                let col = winConditions[condition][i][1];
                if (array[row][col].value === 'empty')
                    possibleSlots.push(winConditions[condition][i]);
            }
        }
        console.log(possibleSlots);
        
        // Pick random slot from possible slots, add slot
        let num = Math.floor(Math.random() * possibleSlots.length);
        let row = possibleSlots[num][0];
        let col = possibleSlots[num][1];
        console.log({row, col});

        add(row, col, 'cross');
    }

    return {add, reset, check, generateMove};
})();

let game = (function() {

    let currentTurn = 'none';
    let gameMode = 'standby';

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
            board.add(row, col, 'circle');
            checkBoard();
            if (gameMode === 'one-player'){
                setTimeout(board.generateMove, 500);
                checkBoard();
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