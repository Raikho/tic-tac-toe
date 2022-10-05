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

    let winConditions = {
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
            hasWon: false,
            shape: null,
            direction: null
        }
        for (let condition in winConditions) {
            let sum = 0;
            for (let i=0; i<3; i++) {
                let row = winConditions[condition][i][0];
                let col = winConditions[condition][i][1];
                sum += toNumber(array[row][col].value);
            }
            
            if (Math.abs(sum) == 3){
                result.hasWon = true;
                result.shape = (sum == 3) ? 'circle' : 'cross';
                result.direction = condition;
                return result;
            }
        }
        return result;
    };

    return {add, reset, check};
})();

let game = (function() {

    let turnShape = 'circle';

    let toggleTurn = function() {
        turnShape = (turnShape === 'circle') ? 'cross' : 'circle';
    };

    let clickSlot = function(row, col, type) {
        board.add(row, col, turnShape);
        toggleTurn();

        let result = board.check();
        console.log(result)
    }

    let reset = function() {
        board.reset();
    }
    return {clickSlot, reset};
})();

const slotNodeList = document.querySelectorAll('.slot');
[...slotNodeList].forEach((slotNode) => {
    slotNode.addEventListener('click', (e) => {
        let row = slotNode.dataset.row;
        let col = slotNode.dataset.col;
        game.clickSlot(row, col, 'leftClick');
    })
    slotNode.addEventListener('auxclick', (e) => {
        let row = slotNode.dataset.row;
        let col = slotNode.dataset.col;
        game.clickSlot(row, col, 'middleClick');
    })
});
const resetButtonNode = document.getElementById('reset');
resetButtonNode.addEventListener("click", game.reset);

board.add(0,2,'circle');
console.log('board:', board);
console.log('game:', game);