const checkForDraw = (updatedBoard: string[][]) => {
    for (let row of updatedBoard) {
        if (row.includes('')) {
            return false;
        }
    }

    return true;
}

export { checkForDraw };