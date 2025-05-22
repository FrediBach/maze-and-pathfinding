// src/lib/maze/wilsons.ts

/**
 * Generates a maze using Wilson's algorithm (Loop-Erased Random Walk).
 * The maze is represented as a 2D array where 1 is a wall and 0 is a path.
 * The grid size will be (2*height + 1) x (2*width + 1) to include outer walls and walls between cells.
 * This algorithm generates a Uniform Spanning Tree maze, known for long, complex paths.
 *
 * @param width - The number of cells horizontally.
 * @param height - The number of cells vertically.
 * @returns A 2D array representing the generated maze.
 */
export function generateWilsonsMaze(width: number, height: number): number[][] {
  const gridHeight = height * 2 + 1;
  const gridWidth = width * 2 + 1;
  const maze: number[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(1)); // Start with all walls

  // Keep track of visited cells (cells that are part of the maze)
  const visitedCells = new Set<string>(); // Store as "r,c" strings

  // Helper to convert cell coordinates (0 to height-1, 0 to width-1) to grid coordinates (odd indices)
  const cellToGrid = (r: number, c: number): [number, number] => [r * 2 + 1, c * 2 + 1];

  // Helper to convert grid coordinates to cell coordinates
  const gridToCell = (r: number, c: number): [number, number] => [(r - 1) / 2, (c - 1) / 2];

  // Helper to check if grid coordinates are within the cell area (odd indices)
  const isGridCell = (r: number, c: number) =>
    r > 0 && r < gridHeight - 1 && c > 0 && c < gridWidth - 1 && r % 2 === 1 && c % 2 === 1;

  // Directions for moving between adjacent cells (skipping walls)
  const directions = [
    [-2, 0], // Up
    [2, 0],  // Down
    [0, -2], // Left
    [0, 2],  // Right
  ];

  // 1. Pick a random cell and add it to the maze (mark as visited)
  const initialCellR = Math.floor(Math.random() * height);
  const initialCellC = Math.floor(Math.random() * width);
  const [initialGridR, initialGridC] = cellToGrid(initialCellR, initialCellC);
  maze[initialGridR][initialGridC] = 0; // Carve the cell
  visitedCells.add(`${initialGridR},${initialGridC}`);

  // 2. While there are unvisited cells
  while (visitedCells.size < width * height) {
    // 3. Pick a random unvisited cell to start a new random walk
    let startWalkR, startWalkC, startWalkGridR, startWalkGridC;
    do {
      startWalkR = Math.floor(Math.random() * height);
      startWalkC = Math.floor(Math.random() * width);
      [startWalkGridR, startWalkGridC] = cellToGrid(startWalkR, startWalkC);
    } while (visitedCells.has(`${startWalkGridR},${startWalkGridC}`)); // Ensure it's unvisited

    // 4. Perform a random walk from the starting cell until a visited cell is reached
    const path: [number, number][] = [[startWalkGridR, startWalkGridC]]; // Path of grid coordinates
    const pathVisited = new Set<string>(); // Keep track of cells visited *in this walk*
    pathVisited.add(`${startWalkGridR},${startWalkGridC}`);

    let currentGridR = startWalkGridR;
    let currentGridC = startWalkGridC;

    while (!visitedCells.has(`${currentGridR},${currentGridC}`)) {
      // Pick a random direction
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const nextGridR = currentGridR + dr;
      const nextGridC = currentGridC + dc;

      // Check if the next cell is within the cell grid bounds
      if (isGridCell(nextGridR, nextGridC)) {
        const nextCellKey = `${nextGridR},${nextGridC}`;

        // Check if the next cell is already in the current path (loop detection)
        if (pathVisited.has(nextCellKey)) {
          // Loop detected: Erase the loop
          let loopStartIndex = path.findIndex(([r, c]) => `${r},${c}` === nextCellKey);
          // Remove cells from the path and pathVisited set from the loop start onwards
          for (let i = loopStartIndex + 1; i < path.length; i++) {
            pathVisited.delete(`${path[i][0]},${path[i][1]}`);
          }
          path.splice(loopStartIndex + 1); // Keep the cell where the loop was detected
          currentGridR = nextGridR;
          currentGridC = nextGridC;
        } else {
          // No loop: Add the next cell to the path
          path.push([nextGridR, nextGridC]);
          pathVisited.add(nextCellKey);
          currentGridR = nextGridR;
          currentGridC = nextGridC;
        }
      }
      // If the next cell is out of bounds, the walk effectively stops there,
      // and we'll pick a new random direction in the next iteration.
    }

    // 5. Add the path to the maze
    // The path goes from the starting unvisited cell to the first visited cell it hit.
    // Carve out all cells and the walls between them along this path.
    for (let i = 0; i < path.length; i++) {
      const [r, c] = path[i];
      maze[r][c] = 0; // Carve the cell

      // Carve the wall connecting this cell to the previous one in the path (if not the first cell)
      if (i > 0) {
        const [prevR, prevC] = path[i - 1];
        const wallR = (r + prevR) / 2;
        const wallC = (c + prevC) / 2;
        maze[wallR][wallC] = 0; // Carve the wall
      }
      // Add the cell to the main visited set
      visitedCells.add(`${r},${c}`);
    }
  }

  // Ensure there's an entrance and exit
  maze[1][0] = 0; // Entrance
  maze[gridHeight - 2][gridWidth - 1] = 0; // Exit

  return maze;
}