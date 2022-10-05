let board = (function() {

    let array = (function() {
        let full = [];
        for (let i=0; i<3; i++){
            let row = [];
            for (let j=0; j<3; j++)
                row.push({value: 'empty'});
            full.push(row);
        }
        let slotNodes = document.querySelectorAll('.slot');
        for (let i=0; i<slotNodes.length; i++) {
            let slotNode = slotNodes[i]
            let row = slotNode.dataset.row;
            let col = slotNode.dataset.col;
            full[row][col].node = slotNode
        }
        return full;
    })();

    let add = function(row, col, value) {
        let slot = array[row][col];
        if (slot.value === 'empty') {
            slot.value = value;
            slot.node.dataset.value = value;
        }
    }

    let reset = function() {
        for (let row of array) {
            for (let slot of row) {
                slot.value = 'empty';
                slot.node.dataset.value = 'empty';
            }
        }
    }

    let toNumber = function(value) {
        if (value === 'empty')
            return 0;
        if (value === 'circle')
            return 1;
        if (value === 'cross')
            return -1;
    }

    let check = function() {
        let result = {
            hasWon: false,
            shape: null,
            direction: null
        }

        let winConditions = {
            row1: [0, 1, 2],
            row2: [3, 4, 5],
            row3: [6, 7, 8],
            col1: [3, 3, 6],
            col2: [1, 4, 7],
            col3: [2, 5, 8],
            diagonal1: [0, 4, 8],
            diagonal2: [2, 4, 6]
        }

        let flatArray = [];
        for (let i=0; i<3; i++) {
            for (let j=0; j<3; j++)
                flatArray[(i*3+j)] = toNumber(array[i][j].value);
        }   

        for (let x in winConditions) {
            let sum = flatArray[winConditions[x][0]] + flatArray[winConditions[x][1]] + flatArray[winConditions[x][2]];
            if (Math.abs(sum) == 3){
                result.hasWon = true;
                result.shape = (sum == 3) ? 'circle' : 'cross';
                result.direction = x;
                return result;
            }
        }

        return result;
    }
    return {array, add, reset, check};
})();

let game = (function() {

    let clickSlot = function(row, col, type) {
        if (type === 'leftClick')
            board.add(row, col, 'circle');
        else
            board.add(row, col, 'cross');

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
console.log('board:', board, board.array);
console.log('game:', game);