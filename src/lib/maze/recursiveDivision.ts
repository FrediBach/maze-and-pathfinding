// src/lib/maze/recursiveDivision.ts

/**
 * Generates a maze using the Recursive Division algorithm.
 * The maze is represented as a 2D array where 1 is a wall and 0 is a path.
 * The grid size will be (2*height + 1) x (2*width + 1) to include outer walls and walls between cells.
 * This algorithm starts with an open grid and adds walls.
 *
 * @param width - The number of cells horizontally.
 * @param height - The number of cells vertically.
 * @returns A 2D array representing the generated maze.
 */
export function generateRecursiveDivisionMaze(width: number, height: number): number[][] {
  const gridHeight = height * 2 + 1;
  const gridWidth = width * 2 + 1;

  // Initialize grid with all paths (0)
  const maze: number[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(0));

  // Add outer walls
  for (let r = 0; r < gridHeight; r++) {
    maze[r][0] = 1;
    maze[r][gridWidth - 1] = 1;
  }
  for (let c = 0; c < gridWidth; c++) {
    maze[0][c] = 1;
    maze[gridHeight - 1][c] = 1;
  }

  // Recursive function to divide chambers
  // r1, c1, r2, c2 are grid coordinates defining the chamber boundaries (inclusive)
  function divide(r1: number, c1: number, r2: number, c2: number) {
    // Base case: If the chamber is too small (less than 2x2 cells), stop.
    // A 1x1 cell chamber is a 3x3 grid area (cell + surrounding walls/paths).
    // A 2x2 cell chamber is a 5x5 grid area.
    // We need at least a 2x2 cell area to divide into two smaller chambers of at least 1x1 cell each.
    // The grid dimensions of the chamber are (r2 - r1 + 1) x (c2 - c1 + 1).
    // We need (r2 - r1 + 1) >= 5 and (c2 - c1 + 1) >= 5, which means r2 - r1 >= 4 and c2 - c1 >= 4.
    if (r2 - r1 < 4 || c2 - c1 < 4) {
      return;
    }

    // Decide whether to divide horizontally or vertically
    // Prefer the longer dimension, or randomly if dimensions are equal
    const divideHorizontally = (r2 - r1 > c2 - c1) || ((r2 - r1 === c2 - c1) && Math.random() < 0.5);

    if (divideHorizontally) {
      // Choose a random row for the wall (must be an even grid index between r1 and r2)
      // Possible wall rows are r1+1, r1+3, ..., r2-1. These are all even.
      // The number of possible wall rows is (r2 - 1 - (r1 + 1)) / 2 + 1 = (r2 - r1 - 2) / 2 + 1 = (r2 - r1) / 2.
      const wallRowOptions = (r2 - r1) / 2; // Number of possible even rows for the wall
      const wallRow = r1 + 1 + 2 * Math.floor(Math.random() * wallRowOptions); // r1+1 is the first possible even row

      // Choose a random column for the passage (must be an odd grid index between c1 and c2)
      // Possible passage columns are c1, c1+2, ..., c2. These are all odd.
      // The number of possible passage columns is (c2 - c1) / 2 + 1.
      const passageColOptions = (c2 - c1) / 2 + 1; // Number of possible odd columns for the passage
      const passageCol = c1 + 2 * Math.floor(Math.random() * passageColOptions); // c1 is the first possible odd column

      // Draw the horizontal wall
      for (let c = c1; c <= c2; c++) {
        if (c !== passageCol) {
          maze[wallRow][c] = 1;
        }
      }

      // Recursively divide the two new chambers
      // Chamber above the wall: from r1 to wallRow - 1
      divide(r1, c1, wallRow - 1, c2);
      // Chamber below the wall: from wallRow + 1 to r2
      divide(wallRow + 1, c1, r2, c2);

    } else { // Divide vertically
      // Choose a random column for the wall (must be an even grid index between c1 and c2)
      // Possible wall columns are c1+1, c1+3, ..., c2-1. These are all even.
      // The number of possible wall columns is (c2 - c1) / 2.
      const wallColOptions = (c2 - c1) / 2; // Number of possible even columns for the wall
      const wallCol = c1 + 1 + 2 * Math.floor(Math.random() * wallColOptions); // c1+1 is the first possible even column

      // Choose a random row for the passage (must be an odd grid index between r1 and r2)
      // Possible passage rows are r1, r1+2, ..., r2. These are all odd.
      // The number of possible passage rows is (r2 - r1) / 2 + 1.
      const passageRowOptions = (r2 - r1) / 2 + 1; // Number of possible odd rows for the passage
      const passageRow = r1 + 2 * Math.floor(Math.random() * passageRowOptions); // r1 is the first possible odd row

      // Draw the vertical wall
      for (let r = r1; r <= r2; r++) {
        if (r !== passageRow) {
          maze[r][wallCol] = 1;
        }
      }

      // Recursively divide the two new chambers
      // Chamber left of the wall: from c1 to wallCol - 1
      divide(r1, c1, r2, wallCol - 1);
      // Chamber right of the wall: from wallCol + 1 to c2
      divide(r1, wallCol + 1, r2, c2);
    }
  }

  // Start the recursive division process on the entire inner grid (excluding outer walls)
  // The inner grid starts at [1, 1] and ends at [gridHeight - 2, gridWidth - 2]
  divide(1, 1, gridHeight - 2, gridWidth - 2);

  // Ensure there's an entrance and exit
  maze[1][0] = 0; // Entrance
  maze[gridHeight - 2][gridWidth - 1] = 0; // Exit

  return maze;
}