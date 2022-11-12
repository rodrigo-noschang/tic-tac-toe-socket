import { rooms } from "../database/data";
import { IRoom } from "../database/types";

const checkForRowWin = (board: string[][], line: number, column: number) => {
    // For a row Win, all of the elements in the same row must be the same.
    const playedCell = board[line][column];
    
    const boardRow = board[line];
    const rowWin = boardRow.every(cell => cell === playedCell)

    return rowWin;
}

const checkForColumnWin = (board: string[][], line: number, column: number) => {
    // For a column win, the elements in every row of that column, must be the same.
    const playedCell = board[line][column];

    const boardColumn = board.map(row => row[column]);
    const columnWin = boardColumn.every(cell => cell === playedCell);

    return columnWin;
}

const checkForDiagonalWin = (board: string[][], line: number, column: number) => {
    // For a diagonal win, all the cells in the main diagonal or in the secondary diagonal must be the same.
    const playedCell = board[line][column];
    
    const mainDiagonal = board.map((row, rowNumber) => {    
        return row[rowNumber];
    })
    const mainDiagonalWin = mainDiagonal.every(cell => cell === playedCell);

    const secondaryDiagonal = board.map((row, rowNumber) => {
        return row[2 - rowNumber];
    })
    const secondaryDiagonalWin = secondaryDiagonal.every(cell => cell === playedCell);

    return mainDiagonalWin || secondaryDiagonalWin;
}

const checkForWin = (board: string[][], line: number, column: number) => {
    const winInRow = checkForRowWin(board, line, column);
    const winInColumn = checkForColumnWin(board, line, column);
    let winInDiagonal = false;

    // If cell is in a diagonal, we must also check for a win in the diagonals
    const isCellInDiagonal = line === column || line + column === 2;
    if (isCellInDiagonal) {
        winInDiagonal = checkForDiagonalWin(board, line, column);
    }

    return winInRow || winInColumn || winInDiagonal;

}

export { checkForWin };