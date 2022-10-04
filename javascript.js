console.log('Hello, World!');

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

    let add = function(row, col) {
        array[row][col].value = 'circle';
        array[row][col].node.textContent = 'circle';
    }

    return {array, add};
})();

let game = (function() {
    return {};
})();

board.add(0,2);
console.log('board:', board, board.array);
console.log('game:', game);