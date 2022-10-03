console.log('Hello, World!');

let board = (function() {


    let array = (function() {
        let full = [];
        for (let i=0; i<3; i++){
            let row = [];
            for (let j=0; j<3; j++)
                row.push('empty');
            full.push(row);
        }
        return full;
    })();

    let add = function(row, col) {
        array[row][col] = 'added';
    }
    
    return {array, add};
})();

let game = (function() {
    return {};
})();

console.log('board:', board, board.array);
console.log('game:', game);