// src/lib/maze/recursiveBacktracker.ts

/**
 * Generates a maze using the Recursive Backtracker algorithm.
 * The maze is represented as a 2D array where 1 is a wall and 0 is a path.
 * The grid size will be (2*height + 1) x (2*width + 1) to include outer walls and walls between cells.
 *
 * @param width - The number of cells horizontally.
 * @param height - The number of cells vertically.
 * @returns A 2D array representing the generated maze.
 */
export function generateRecursiveBacktrackerMaze(width: number, height: number): number[][] {
  // Initialize grid with all walls (1)
  const gridHeight = height * 2 + 1;
  const gridWidth = width * 2 + 1;
  const maze: number[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(1));

  // Helper function to check if a cell is within bounds and is a wall cell
  const isCell = (r: number, c: number) =>
    r > 0 && r < gridHeight - 1 && c > 0 && c < gridWidth - 1 && r % 2 === 1 && c % 2 === 1;

  // Directions (dr, dc) for moving to adjacent cells (skipping walls)
  const directions = [
    [-2, 0], // Up
    [2, 0],  // Down
    [0, -2], // Left
    [0, 2],  // Right
  ];

  // Recursive function to carve paths
  function carvePath(r: number, c: number) {
    // Mark the current cell as a path
    maze[r][c] = 0;

    // Randomize the order of directions
    const shuffledDirections = directions.sort(() => Math.random() - 0.5);

    for (const [dr, dc] of shuffledDirections) {
      const nr = r + dr; // Neighbor row
      const nc = c + dc; // Neighbor column

      // Check if the neighbor is a valid, unvisited cell
      if (isCell(nr, nc) && maze[nr][nc] === 1) {
        // Carve path through the wall between current cell and neighbor
        maze[r + dr / 2][c + dc / 2] = 0;

        // Recursively call for the neighbor cell
        carvePath(nr, nc);
      }
    }
  }

  // Start carving from a random cell (must be an odd-indexed cell)
  const startRow = Math.floor(Math.random() * height) * 2 + 1;
  const startCol = Math.floor(Math.random() * width) * 2 + 1;
  carvePath(startRow, startCol);

  // Ensure there's an entrance and exit (optional, but good for pathfinding later)
  // Simple entrance at top-left, exit at bottom-right
  maze[1][0] = 0; // Entrance
  maze[gridHeight - 2][gridWidth - 1] = 0; // Exit

  return maze;
}