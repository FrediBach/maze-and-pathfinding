// src/lib/maze/greedy.ts

/**
 * Finds a path from start to end in a maze using Greedy Best-First Search algorithm.
 * The maze is a 2D array where 0 is a path and 1 is a wall.
 * Note: Greedy Best-First Search does NOT guarantee finding the shortest path.
 *
 * @param maze - The 2D array representing the maze.
 * @param start - The starting coordinates [row, col].
 * @param end - The ending coordinates [row, col].
 * @returns An object containing the path (array of coordinates) and the ordered list of visited cells. Returns null for path if no path exists.
 */
export function findPathGreedy(maze: number[][], start: [number, number], end: [number, number]): { path: [number, number][] | null, visitedOrder: [number, number][] } {
  const numRows = maze.length;
  const numCols = maze[0].length;

  // Keep track of visited cells (closed set)
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

  // Heuristic function (Manhattan distance) - used to estimate distance to end
  const heuristic = (r1: number, c1: number, r2: number, c2: number): number => {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2);
  };

  // Data structure for the open set (priority queue).
  // Each element in the open set will be [h_cost, row, col].
  // We prioritize nodes with the lowest h_cost.
  const openSet: [number, number, number][] = [];

  // Keep track of parent pointers to reconstruct the path
  const parentMap = new Map<string, [number, number] | null>(); // Maps "r,c" to its parent

  // Initialize start node
  parentMap.set(startKey, null);
  const startH = heuristic(start[0], start[1], end[0], end[1]);
  openSet.push([startH, start[0], start[1]]); // Add start node to open set with its h-cost

  // Directions for moving (up, down, left, right)
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  while (openSet.length > 0) {
    // Sort openSet to get the node with the lowest h-cost (simulating priority queue)
    openSet.sort((a, b) => a[0] - b[0]);

    const [currentH, currentRow, currentCol] = openSet.shift()!; // Get and remove the node with the lowest h-cost
    const currentKey = `${currentRow},${currentCol}`;

    // If we already visited this cell, skip it
    if (visited.has(currentKey)) {
        continue;
    }

    // Add the current node to the visited set (closed set) and visited order
    visited.add(currentKey);
    visitedOrder.push([currentRow, currentCol]);

    // If we reached the end, reconstruct the path and return it with visited cells
    if (currentRow === end[0] && currentCol === end[1]) {
      const path: [number, number][] = [];
      let current: [number, number] | null = end;
      while (current !== null) {
        path.push(current);
        const parent = parentMap.get(`${current[0]},${current[1]}`);
        current = parent || null;
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
        !visited.has(neighborKey) // Only consider unvisited neighbors
      ) {
        // Calculate h-cost for the neighbor
        const neighborH = heuristic(neighborRow, neighborCol, end[0], end[1]);

        // Add the neighbor to the open set
        openSet.push([neighborH, neighborRow, neighborCol]);
        // Record parent (this is where Greedy differs - it doesn't track g-cost or update if a better path is found *to* the neighbor)
        parentMap.set(neighborKey, [currentRow, currentCol]);
      }
    }
  }

  // If the open set is empty and we haven't reached the end, no path exists
  return { path: null, visitedOrder: visitedOrder }; // Return null path and the visited order
}