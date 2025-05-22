// src/lib/maze/growingTree.ts

/**
 * Generates a maze using the Growing Tree algorithm.
 * The maze is represented as a 2D array where 1 is a wall and 0 is a path.
 * The grid size will be (2*height + 1) x (2*width + 1) to include outer walls and walls between cells.
 * The 'method' parameter controls how cells are chosen from the active list:
 * 'newest': Mimics Recursive Backtracker (deep recursion, long winding paths)
 * 'random': Mimics Prim's Algorithm (more organic, less biased)
 * 'oldest': Tends to create mazes with more straight passages
 *
 * @param width - The number of cells horizontally.
 * @param height - The number of cells vertically.
 * @param method - The method for picking cells from the active list ('newest', 'random', 'oldest'). Defaults to 'newest'.
 * @returns A 2D array representing the generated maze.
 */
export function generateGrowingTreeMaze(width: number, height: number, method: 'newest' | 'random' | 'oldest' = 'newest'): number[][] {
  const gridHeight = height * 2 + 1;
  const gridWidth = width * 2 + 1;
  const maze: number[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(1)); // Start with all walls

  // List of cells that are part of the maze but have unvisited neighbors
  const activeCells: [number, number][] = []; // Store as cell coordinates [r, c] (0 to height-1, 0 to width-1)

  // Keep track of visited cells (the cells at odd indices)
  const visitedCells = new Set<string>(); // Store as "r,c" strings (cell coordinates)

  // Helper to convert cell coordinates (0 to height-1, 0 to width-1) to grid coordinates (odd indices)
  const cellToGrid = (r: number, c: number): [number, number] => [r * 2 + 1, c * 2 + 1];

  // Helper to convert grid coordinates to cell coordinates
  const gridToCell = (r: number, c: number): [number, number] => [(r - 1) / 2, (c - 1) / 2];

  // Helper to check if cell coordinates are within bounds
  const isCell = (r: number, c: number) =>
    r >= 0 && r < height && c >= 0 && c < width;

  // Directions for moving between adjacent cells (in cell coordinates)
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  // 1. Pick a random cell to start and add it to the active list
  const startCellR = Math.floor(Math.random() * height);
  const startCellC = Math.floor(Math.random() * width);
  activeCells.push([startCellR, startCellC]);
  visitedCells.add(`${startCellR},${startCellC}`);
  const [startGridR, startGridC] = cellToGrid(startCellR, startCellC);
  maze[startGridR][startGridC] = 0; // Carve the starting cell

  // 2. While the active list is not empty
  while (activeCells.length > 0) {
    let cellIndex: number;

    // Choose a cell from the active list based on the method
    if (method === 'newest') {
      cellIndex = activeCells.length - 1; // Pick the last (newest) cell
    } else if (method === 'oldest') {
      cellIndex = 0; // Pick the first (oldest) cell
    } else { // 'random'
      cellIndex = Math.floor(Math.random() * activeCells.length); // Pick a random cell
    }

    const [currentCellR, currentCellC] = activeCells[cellIndex];
    const [currentGridR, currentGridC] = cellToGrid(currentCellR, currentCellC);

    // Find unvisited neighbors of the current cell
    const unvisitedNeighbors: [number, number][] = [];
    for (const [dr, dc] of directions) {
      const neighborCellR = currentCellR + dr;
      const neighborCellC = currentCellC + dc;

      if (isCell(neighborCellR, neighborCellC) && !visitedCells.has(`${neighborCellR},${neighborCellC}`)) {
        unvisitedNeighbors.push([neighborCellR, neighborCellC]);
      }
    }

    // If the current cell has unvisited neighbors
    if (unvisitedNeighbors.length > 0) {
      // Pick a random unvisited neighbor
      const [nextCellR, nextCellC] = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
      const [nextGridR, nextGridC] = cellToGrid(nextCellR, nextCellC);

      // Carve the wall between the current cell and the chosen neighbor
      const wallR = (currentGridR + nextGridR) / 2;
      const wallC = (currentGridC + nextGridC) / 2;
      maze[wallR][wallC] = 0;

      // Carve the neighbor cell
      maze[nextGridR][nextGridC] = 0;

      // Mark the neighbor as visited and add it to the active list
      visitedCells.add(`${nextCellR},${nextCellC}`);
      activeCells.push([nextCellR, nextCellC]);

    } else {
      // If the current cell has no unvisited neighbors, remove it from the active list
      activeCells.splice(cellIndex, 1);
    }
  }

  // Ensure there's an entrance and exit
  maze[1][0] = 0; // Entrance
  maze[gridHeight - 2][gridWidth - 1] = 0; // Exit

  return maze;
}