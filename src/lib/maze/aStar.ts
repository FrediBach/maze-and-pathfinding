// src/lib/maze/aStar.ts

/**
 * Finds a path from start to end in a maze using A* Search algorithm.
 * The maze is a 2D array where 0 is a path and 1 is a wall.
 * A* guarantees finding the shortest path in an unweighted grid like this.
 *
 * @param maze - The 2D array representing the maze.
 * @param start - The starting coordinates [row, col].
 * @param end - The ending coordinates [row, col].
 * @returns An object containing the path (array of coordinates) and the ordered list of visited cells. Returns null for path if no path exists.
 */
export function findPathAStar(maze: number[][], start: [number, number], end: [number, number]): { path: [number, number][] | null, visitedOrder: [number, number][] } {
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

  // Heuristic function (Manhattan distance)
  const heuristic = (r1: number, c1: number, r2: number, c2: number): number => {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2);
  };

  // Data structure for the open set (priority queue).
  // In a simple grid with uniform costs (1 per step), a standard array sorted by f-cost works.
  // Each element in the open set will be [f_cost, g_cost, row, col].
  const openSet: [number, number, number, number][] = [];

  // Keep track of g-costs (cost from start) and parent pointers
  const gCosts = new Map<string, number>(); // Maps "r,c" to g_cost
  const parentMap = new Map<string, [number, number] | null>(); // Maps "r,c" to its parent

  // Initialize start node
  gCosts.set(startKey, 0);
  parentMap.set(startKey, null);
  const startH = heuristic(start[0], start[1], end[0], end[1]);
  openSet.push([startH, 0, start[0], start[1]]); // f = g + h = 0 + startH

  // Directions for moving (up, down, left, right)
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  while (openSet.length > 0) {
    // Sort openSet to get the node with the lowest f-cost (simulating priority queue)
    // If f-costs are equal, prioritize lower h-cost (closer to end) or higher g-cost (further from start)
    // Sorting by f-cost primarily: openSet.sort((a, b) => a[0] - b[0]);
    // A common tie-breaking is by h-cost: openSet.sort((a, b) => a[0] - b[0] || a[2] - b[2]); // Sort by f, then h
    // Another common tie-breaking is by g-cost (encourages exploring further): openSet.sort((a, b) => a[0] - b[0] || b[1] - a[1]); // Sort by f, then reverse g
    // Let's use the simple f-cost sort for now.
     openSet.sort((a, b) => a[0] - b[0]);


    const [currentF, currentG, currentRow, currentCol] = openSet.shift()!; // Get and remove the node with the lowest f-cost
    const currentKey = `${currentRow},${currentCol}`;

    // If we already visited this cell with a better or equal path, skip it
    // This check is important if we don't use a proper priority queue that updates nodes in place
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

      // Check if neighbor is within bounds and is a path (0)
      if (
        neighborRow >= 0 && neighborRow < numRows &&
        neighborCol >= 0 && neighborCol < numCols &&
        maze[neighborRow][neighborCol] === 0
      ) {
        // Calculate tentative g-cost for the neighbor
        const tentativeGCost = currentG + 1; // Cost to move to neighbor is 1

        // If the neighbor has not been visited OR we found a shorter path to it
        if (!visited.has(neighborKey) || tentativeGCost < (gCosts.get(neighborKey) ?? Infinity)) {
            // Update g-cost and parent
            gCosts.set(neighborKey, tentativeGCost);
            parentMap.set(neighborKey, [currentRow, currentCol]);

            // Calculate f-cost and add/update neighbor in the open set
            const neighborH = heuristic(neighborRow, neighborCol, end[0], end[1]);
            const neighborF = tentativeGCost + neighborH;

            // Check if neighbor is already in the open set and update if the new path is better
            // (This is less efficient with array.some + splice than a proper priority queue)
            const existingIndex = openSet.findIndex(item => item[2] === neighborRow && item[3] === neighborCol);

            if (existingIndex !== -1) {
                 // If already in open set, update if this path is better
                 if (openSet[existingIndex][1] > tentativeGCost) { // Compare g-costs
                     openSet[existingIndex][0] = neighborF; // Update f
                     openSet[existingIndex][1] = tentativeGCost; // Update g
                     // Parent is already set above
                 }
            } else {
                // If not in open set, add it
                openSet.push([neighborF, tentativeGCost, neighborRow, neighborCol]);
            }
        }
      }
    }
  }

  // If the open set is empty and we haven't reached the end, no path exists
  return { path: null, visitedOrder: visitedOrder }; // Return null path and the visited order
}