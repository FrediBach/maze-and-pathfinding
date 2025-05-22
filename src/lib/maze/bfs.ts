// src/lib/maze/bfs.ts

/**
 * Finds a path from start to end in a maze using Breadth-First Search (BFS).
 * The maze is a 2D array where 0 is a path and 1 is a wall.
 *
 * @param maze - The 2D array representing the maze.
 * @param start - The starting coordinates [row, col].
 * @param end - The ending coordinates [row, col].
 * @returns An object containing the path (array of coordinates) and the ordered list of visited cells. Returns null for path if no path exists.
 */
export function findPathBFS(maze: number[][], start: [number, number], end: [number, number]): { path: [number, number][] | null, visitedOrder: [number, number][] } {
  const numRows = maze.length;
  const numCols = maze[0].length;

  // Keep track of visited cells and the path taken to reach them
  const visited = new Set<string>(); // Store as "r,c" strings
  const visitedOrder: [number, number][] = []; // Store order of visited cells
  const parentMap = new Map<string, [number, number] | null>(); // Maps cell string "r,c" to its parent

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

  // Queue for BFS
  const queue: [number, number][] = [start];

  visited.add(startKey);
  visitedOrder.push(start); // Add start to visited order
  parentMap.set(startKey, null);

  // Directions for moving (up, down, left, right)
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift()!; // Dequeue the current cell
    const currentKey = `${currentRow},${currentCol}`;

    // If we reached the end, reconstruct the path and return it with visited cells
    if (currentRow === end[0] && currentCol === end[1]) {
      const path: [number, number][] = [];
      let current: [number, number] | null = end;
      while (current !== null) {
        path.push(current);
        const parent = parentMap.get(`${current[0]},${current[1]}`);
        current = parent || null; // Use null if parent is undefined
      }
      return { path: path.reverse(), visitedOrder: visitedOrder }; // Reverse to get path from start to end
    }

    // Explore neighbors
    for (const [dr, dc] of directions) {
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
        queue.push([neighborRow, neighborCol]); // Enqueue neighbor
      }
    }
  }

  // If the queue is empty and we haven't reached the end, no path exists
  return { path: null, visitedOrder: visitedOrder }; // Return null path and the visited order
}