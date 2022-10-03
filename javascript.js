console.log('Hello, World!');

let board = (function() {

    let array = (function() {
        let out = [];
        for (let i=0; i<9; i++)
            out.push('empty');
        return out;
    })();

    let add = function() {
        console.log('added');
    }  

    return {array, add};
})();

let game = (function() {
    return {};
})();

console.log('board:', board, board.array);
console.log('game:', game);
board.add(1, 3);