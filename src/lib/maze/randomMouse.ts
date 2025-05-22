// src/lib/maze/randomMouse.ts

/**
 * Finds a path from start to end in a maze using the Random Mouse algorithm.
 * The maze is a 2D array where 0 is a path and 1 is a wall.
 * Note: This algorithm is highly inefficient and does NOT guarantee finding the shortest path.
 * It performs a random walk until the end is reached or a step limit is hit.
 *
 * @param maze - The 2D array representing the maze.
 * @param start - The starting coordinates [row, col].
 * @param end - The ending coordinates [row, col].
 * @param maxSteps - The maximum number of steps to take before giving up.
 * @returns An object containing the path (array of coordinates) and the ordered list of visited cells. Returns null for path if no path exists.
 */
export function findPathRandomMouse(maze: number[][], start: [number, number], end: [number, number], maxSteps: number): { path: [number, number][] | null, visitedOrder: [number, number][] } {
  const numRows = maze.length;
  const numCols = maze[0].length;

  // Keep track of visited cells (for the visitedOrder list)
  const visitedCheck = new Set<string>(); // Use a Set for quick lookup
  const visitedOrder: [number, number][] = []; // Store order of visited cells

  const startKey = `${start[0]},${start[1]}`;
  const endKey = `${end[0]},${end[1]}`;

  // Check if start or end are walls or out of bounds
  if (
    start[0] < 0 || start[0] >= numRows || start[1] < 0 || start[1] >= numCols || maze[start[0]][start[1]] === 1 ||
    end[0] < 0 || end[0] >= numRows || end[1] < 0 || end[1] >= numCols || maze[end[0]][end[1]] === 1
  ) {
    console.error("Start or end point is invalid (wall or out of bounds).");
    return { path: null, visitedOrder: [] }; // Return empty visited order
  }

  // Use a stack to keep track of the current path for backtracking
  const path: [number, number][] = [start];
  visitedCheck.add(startKey);
  visitedOrder.push(start); // Add start to visited order

  // Directions for moving (up, down, left, right)
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  let currentRow = start[0];
  let currentCol = start[1];

  let steps = 0;

  while ((currentRow !== end[0] || currentCol !== end[1]) && steps < maxSteps) {
    steps++;
    const currentKey = `${currentRow},${currentCol}`;

    // Find valid neighbors (within bounds, is a path, and preferably unvisited)
    const possibleMoves: [number, number][] = [];
    const unvisitedMoves: [number, number][] = [];

    for (const [dr, dc] of directions) {
      const neighborRow = currentRow + dr;
      const neighborCol = currentCol + dc;
      const neighborKey = `${neighborRow},${neighborCol}`;

      if (
        neighborRow >= 0 && neighborRow < numRows &&
        neighborCol >= 0 && neighborCol < numCols &&
        maze[neighborRow][neighborCol] === 0
      ) {
        possibleMoves.push([neighborRow, neighborCol]);
        if (!visitedCheck.has(neighborKey)) {
          unvisitedMoves.push([neighborRow, neighborCol]);
        }
      }
    }

    if (unvisitedMoves.length > 0) {
      // Move to a random unvisited neighbor
      const [nextRow, nextCol] = unvisitedMoves[Math.floor(Math.random() * unvisitedMoves.length)];
      currentRow = nextRow;
      currentCol = nextCol;
      path.push([currentRow, currentCol]);
      visitedCheck.add(`${currentRow},${currentCol}`);
      visitedOrder.push([currentRow, currentCol]); // Add to visited order
    } else if (possibleMoves.length > 1) {
        // If no unvisited neighbors but more than one possible move (excluding the one we just came from),
        // pick a random *visited* neighbor that is not the previous cell in the path.
        // This handles simple backtracking from dead ends.
        const previousCell = path.length > 1 ? path[path.length - 2] : null;
        const backtrackMoves = possibleMoves.filter(([r, c]) =>
             !(previousCell && r === previousCell[0] && c === previousCell[1])
        );

        if (backtrackMoves.length > 0) {
             const [nextRow, nextCol] = backtrackMoves[Math.floor(Math.random() * backtrackMoves.length)];
             currentRow = nextRow;
             currentCol = nextCol;
             path.push([currentRow, currentCol]); // Add the cell again (path might contain loops)
             // Note: visitedCheck and visitedOrder are not updated here as we are revisiting
        } else {
             // This case should ideally not happen in a standard maze unless completely boxed in
             console.warn("Random Mouse: Stuck with no unvisited neighbors and nowhere to backtrack except immediately previous cell.");
             break; // Exit loop if truly stuck
        }

    } else if (possibleMoves.length === 1 && path.length > 1) {
        // If only one possible move and it's the cell we just came from (a dead end)
        // Backtrack by removing the current cell from the path
        path.pop();
        if (path.length > 0) {
             [currentRow, currentCol] = path[path.length - 1]; // Move back to the previous cell
        } else {
             // Should not happen if start is valid
             console.error("Random Mouse: Backtracked to start and no other moves.");
             break; // Exit if back at start with no options
        }
    } else {
        // No possible moves (should only happen if start is a dead end or maze is 1x1)
        console.warn("Random Mouse: No possible moves from current cell.");
        break; // Exit loop if stuck
    }
  }

  // If we reached the end, return the path and visited cells
  if (currentRow === end[0] && currentCol === end[1]) {
      // The 'path' array might contain loops due to random backtracking.
      // For visualization, we can return the raw path, or try to clean it up.
      // Let's return the raw path for now to show the exploration.
      // The visitedOrder correctly shows the sequence of *first* visits to cells.
      return { path: path, visitedOrder: visitedOrder };
  } else {
      console.warn(`Random Mouse: Max steps (${maxSteps}) reached or stuck before reaching end.`);
      return { path: null, visitedOrder: visitedOrder }; // Return null path if end not reached
  }
}