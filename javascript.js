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
        col3: [[0,2], [1,2], [02,2]],
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

    return {add, reset, check};
})();

let game = (function() {

    let currentTurn = 'circle';
    let gameMode = 'standby';

    let updateTurn = function() {
        if (currentTurn === 'circle') {
            crossTurnNode.classList.remove('active');
            circleTurnNode.classList.add('active');
        } else {
            crossTurnNode.classList.add('active');
            circleTurnNode.classList.remove('active');
        }
    }

    let updateGameMode = function(mode) {
        gameMode = mode;
        onePlayerButtonNode.classList.remove('active');
        twoPlayerButtonNode.classList.remove('active');
        if (gameMode === 'one-player')
            onePlayerButtonNode.classList.add('active');
        if (gameMode === 'two-player')
            twoPlayerButtonNode.classList.add('active');
    }

    let toggleTurn = function() {
        currentTurn = (currentTurn === 'circle') ? 'cross' : 'circle';
        updateTurn();
    };

    let clickSlot = function(row, col) {
        board.add(row, col, currentTurn);
        toggleTurn();

        let result = board.check();
        console.log(result)
        if (result.state === 'won')
            resultsNode.textContent = `${result.shape} has won!`;
        else if (result.state === 'tie')
            resultsNode.textContent = `You have tied!`
    }

    let reset = function() {
        board.reset();
        currentTurn = 'circle';
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
onePlayerButtonNode.addEventListener('click', () => {
    game.updateGameMode('one-player');
});
twoPlayerButtonNode.addEventListener('click', () => {
    game.updateGameMode('two-player');
});

const resultsNode = document.getElementById('results');

const slotNodeList = document.querySelectorAll('.slot');
[...slotNodeList].forEach((slotNode) => {
    slotNode.addEventListener('click', () => {
        game.clickSlot(slotNode.dataset.row, slotNode.dataset.col);
    })
});
const resetButtonNode = document.getElementById('reset');
resetButtonNode.addEventListener("click", game.reset);

console.log('board:', board);
console.log('game:', game);