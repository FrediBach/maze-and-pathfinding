// src/lib/maze/aldousBroder.ts

/**
 * Generates a maze using the Aldous-Broder algorithm.
 * The maze is represented as a 2D array where 1 is a wall and 0 is a path.
 * The grid size will be (2*height + 1) x (2*width + 1) to include outer walls and walls between cells.
 * This algorithm guarantees a Uniform Spanning Tree (UST) maze.
 *
 * @param width - The number of cells horizontally.
 * @param height - The number of cells vertically.
 * @returns A 2D array representing the generated maze.
 */
export function generateAldousBroderMaze(width: number, height: number): number[][] {
  const gridHeight = height * 2 + 1;
  const gridWidth = width * 2 + 1;
  const maze: number[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(1)); // Start with all walls

  // Keep track of visited cells (the cells at odd indices)
  const visitedCells = new Set<string>(); // Store as "r,c" strings (cell coordinates, not grid)

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

  // 1. Pick a random cell to start
  let currentCellR = Math.floor(Math.random() * height);
  let currentCellC = Math.floor(Math.random() * width);
  let [currentGridR, currentGridC] = cellToGrid(currentCellR, currentCellC);

  // Mark the starting cell as visited and carve it
  visitedCells.add(`${currentCellR},${currentCellC}`);
  maze[currentGridR][currentGridC] = 0;

  let cellsVisitedCount = 1;
  const totalCells = width * height;

  // 2. Perform a random walk until all cells are visited
  while (cellsVisitedCount < totalCells) {
    // Pick a random direction
    const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
    const nextGridR = currentGridR + dr;
    const nextGridC = currentGridC + dc;

    // Check if the next grid position is a valid cell
    if (isGridCell(nextGridR, nextGridC)) {
      const [nextCellR, nextCellC] = gridToCell(nextGridR, nextGridC);
      const nextCellKey = `${nextCellR},${nextCellC}`;

      // If the next cell hasn't been visited yet
      if (!visitedCells.has(nextCellKey)) {
        // Carve the wall between the current cell and the next cell
        const wallR = (currentGridR + nextGridR) / 2;
        const wallC = (currentGridC + nextGridC) / 2;
        maze[wallR][wallC] = 0;

        // Carve the next cell
        maze[nextGridR][nextGridC] = 0;

        // Mark the next cell as visited
        visitedCells.add(nextCellKey);
        cellsVisitedCount++;
      }

      // Move to the next cell (whether it was visited or not)
      currentGridR = nextGridR;
      currentGridC = nextGridC;
    }
    // If the next grid position is out of bounds or not a cell, stay in the current cell
  }

  // Ensure there's an entrance and exit
  maze[1][0] = 0; // Entrance
  maze[gridHeight - 2][gridWidth - 1] = 0; // Exit

  return maze;
}