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
        slot.value = value;
        slot.node.classList.replace('empty', value);
    }

    let reset = function() {
        for (let row of array) {
            for (let slot of row) {
                slot.value = 'empty';
                slot.node.classList.remove('cross', 'circle');
                slot.node.classList.add('empty');
            }
        }
    }

    return {array, add, reset};
})();

let game = (function() {
    return {};
})();

const nodeList = document.querySelectorAll('.slot');
[...nodeList].forEach((node) => {
    node.addEventListener("click", () => {
        let row = node.dataset.row;
        let col = node.dataset.col;
        board.add(row, col, 'circle');
        console.log('clicked', row, col);
    })
});
const resetButtonNode = document.getElementById('reset');
resetButtonNode.addEventListener("click", board.reset);

board.add(0,2,'circle');
console.log('board:', board, board.array);
console.log('game:', game);