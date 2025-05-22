// src/lib/maze/dfs.ts

/**
 * Finds a path from start to end in a maze using Depth-First Search (DFS).
 * The maze is a 2D array where 0 is a path and 1 is a wall.
 * Note: DFS does NOT guarantee finding the shortest path.
 *
 * @param maze - The 2D array representing the maze.
 * @param start - The starting coordinates [row, col].
 * @param end - The ending coordinates [row, col].
 * @returns An object containing the path (array of coordinates) and the ordered list of visited cells. Returns null for path if no path exists.
 */
export function findPathDFS(maze: number[][], start: [number, number], end: [number, number]): { path: [number, number][] | null, visitedOrder: [number, number][] } {
  const numRows = maze.length;
  const numCols = maze[0].length;

  // Keep track of visited cells
  const visited = new Set<string>(); // Store as "r,c" strings
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

  // Stack for DFS (using an array)
  const stack: [number, number][] = [start];
  const parentMap = new Map<string, [number, number] | null>(); // To reconstruct path
  parentMap.set(startKey, null);
  visited.add(startKey); // Mark start as visited immediately
  visitedOrder.push(start); // Add start to visited order

  // Directions for moving (up, down, left, right)
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  let pathFound = false;
  let finalPath: [number, number][] | null = null;

  // DFS using an explicit stack
  while (stack.length > 0) {
    const [currentRow, currentCol] = stack.pop()!; // Pop the current cell (LIFO)
    const currentKey = `${currentRow},${currentCol}`;

    // If we reached the end
    if (currentRow === end[0] && currentCol === end[1]) {
      pathFound = true;
      break; // Exit the loop
    }

    // Explore neighbors (in reverse order to match typical recursive DFS exploration order if desired, or just random)
    // Shuffling directions can make the path less predictable
    const shuffledDirections = directions.sort(() => Math.random() - 0.5);

    for (const [dr, dc] of shuffledDirections) {
      const neighborRow = currentRow + dr;
      const neighborCol = currentCol + dc;
      const neighborKey = `${neighborRow},${neighborCol}`;

      // Check if neighbor is within bounds, is a path (0), and hasn't been visited
      if (
        neighborRow >= 0 && neighborRow < numRows &&
        neighborCol >= 0 && neighborCol < numCols &&
        maze[neighborRow][neighborCol] === 0 &&
        !visited.has(neighborKey)
      ) {
        visited.add(neighborKey);
        visitedOrder.push([neighborRow, neighborCol]); // Add neighbor to visited order
        parentMap.set(neighborKey, [currentRow, currentCol]); // Record parent
        stack.push([neighborRow, neighborCol]); // Push neighbor onto the stack
      }
    }
  }

  // If path was found, reconstruct it
  if (pathFound) {
      const path: [number, number][] = [];
      let current: [number, number] | null = end;
      while (current !== null) {
        path.push(current);
        const parent = parentMap.get(`${current[0]},${current[1]}`);
        current = parent || null; // Use null if parent is undefined
      }
      finalPath = path.reverse(); // Reverse to get path from start to end
  }


  return { path: finalPath, visitedOrder: visitedOrder }; // Return the path and the visited order
}