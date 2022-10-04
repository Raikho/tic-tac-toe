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
        if (slot.value = 'empty') {
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

    return {array, add, reset};
})();

let game = (function() {
    let click = function(row, col, type) {
        if (type === 'leftClick')
            board.add(row, col, 'circle');
        else
            board.add(row, col, 'cross');
    }

    return {click};
})();

const slotNodeList = document.querySelectorAll('.slot');
[...slotNodeList].forEach((slotNode) => {
    slotNode.addEventListener('click', (e) => {
        let row = slotNode.dataset.row;
        let col = slotNode.dataset.col;
        game.click(row, col, 'leftClick');
    })
    slotNode.addEventListener('auxclick', (e) => {
        let row = slotNode.dataset.row;
        let col = slotNode.dataset.col;
        game.click(row, col, 'middleClick');
    })
});
const resetButtonNode = document.getElementById('reset');
resetButtonNode.addEventListener("click", board.reset);

board.add(0,2,'circle');
console.log('board:', board, board.array);
console.log('game:', game);