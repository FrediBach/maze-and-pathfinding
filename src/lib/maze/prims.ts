// src/lib/maze/prims.ts

/**
 * Generates a maze using a modified version of Prim's algorithm.
 * The maze is represented as a 2D array where 1 is a wall and 0 is a path.
 * The grid size will be (2*height + 1) x (2*width + 1) to include outer walls and walls between cells.
 *
 * @param width - The number of cells horizontally.
 * @param height - The number of cells vertically.
 * @returns A 2D array representing the generated maze.
 */
export function generatePrimsMaze(width: number, height: number): number[][] {
  // Initialize grid with all walls (1)
  const gridHeight = height * 2 + 1;
  const gridWidth = width * 2 + 1;
  const maze: number[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(1));

  // List of walls to be processed (frontier)
  const walls: [number, number][] = [];

  // Helper function to check if a cell is within bounds and is a cell (odd indices)
  const isCell = (r: number, c: number) =>
    r > 0 && r < gridHeight - 1 && c > 0 && c < gridWidth - 1 && r % 2 === 1 && c % 2 === 1;

  // Directions for moving to adjacent cells (skipping walls)
  const directions = [
    [-2, 0], // Up
    [2, 0],  // Down
    [0, -2], // Left
    [0, 2],  // Right
  ];

  // Directions for checking adjacent walls (including walls)
  const wallDirections = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  // Start from a random cell (must be an odd-indexed cell)
  const startRow = Math.floor(Math.random() * height) * 2 + 1;
  const startCol = Math.floor(Math.random() * width) * 2 + 1;

  // Mark the starting cell as a path
  maze[startRow][startCol] = 0;

  // Add the walls adjacent to the starting cell to the wall list
  for (const [dr, dc] of wallDirections) {
    const wallR = startRow + dr;
    const wallC = startCol + dc;
    // Check if the adjacent position is a wall within bounds
    if (wallR > 0 && wallR < gridHeight - 1 && wallC > 0 && wallC < gridWidth - 1 && maze[wallR][wallC] === 1) {
       walls.push([wallR, wallC]);
    }
  }


  // While there are walls in the list
  while (walls.length > 0) {
    // Pick a random wall from the list
    const wallIndex = Math.floor(Math.random() * walls.length);
    const [wallR, wallC] = walls.splice(wallIndex, 1)[0]; // Remove the wall from the list

    // Determine the two cells separated by this wall
    let cell1: [number, number] | null = null;
    let cell2: [number, number] | null = null;

    // Check the two cells adjacent to the wall
    for (const [dr, dc] of wallDirections) {
        const cellR = wallR + dr;
        const cellC = wallC + dc;
        if (isCell(cellR, cellC)) {
            if (cell1 === null) {
                cell1 = [cellR, cellC];
            } else {
                cell2 = [cellR, cellC];
                break; // Found both cells
            }
        }
    }

    // If we found two cells and exactly one of them is a path (0)
    if (cell1 && cell2) {
        const [r1, c1] = cell1;
        const [r2, c2] = cell2;

        if (maze[r1][c1] === 0 && maze[r2][c2] === 1) {
            // Carve the wall and the unvisited cell
            maze[wallR][wallC] = 0;
            maze[r2][c2] = 0;

            // Add the walls adjacent to the newly carved cell (cell2) to the wall list
            for (const [dr, dc] of wallDirections) {
                const nextWallR = r2 + dr;
                const nextWallC = c2 + dc;
                 // Check if the adjacent position is a wall within bounds and not already in the list (basic check)
                 // A more robust check would ensure it's not already a path or already in the walls list
                if (nextWallR > 0 && nextWallR < gridHeight - 1 && nextWallC > 0 && nextWallC < gridWidth - 1 && maze[nextWallR][nextWallC] === 1) {
                    // Avoid adding duplicates if possible, though the algorithm handles them
                    if (!walls.some(([wr, wc]) => wr === nextWallR && wc === nextWallC)) {
                         walls.push([nextWallR, nextWallC]);
                    }
                }
            }
        } else if (maze[r1][c1] === 1 && maze[r2][c2] === 0) {
             // Carve the wall and the unvisited cell
            maze[wallR][wallC] = 0;
            maze[r1][c1] = 0;

            // Add the walls adjacent to the newly carved cell (cell1) to the wall list
            for (const [dr, dc] of wallDirections) {
                const nextWallR = r1 + dr;
                const nextWallC = c1 + dc;
                 if (nextWallR > 0 && nextWallR < gridHeight - 1 && nextWallC > 0 && nextWallC < gridWidth - 1 && maze[nextWallR][nextWallC] === 1) {
                     if (!walls.some(([wr, wc]) => wr === nextWallR && wc === nextWallC)) {
                         walls.push([nextWallR, nextWallC]);
                     }
                }
            }
        }
        // If both cells are already paths, this wall connects two parts of the maze,
        // we discard it (it was already removed from the list).
    }
  }

  // Ensure there's an entrance and exit (optional, but good for pathfinding later)
  // Simple entrance at top-left, exit at bottom-right
  maze[1][0] = 0; // Entrance
  maze[gridHeight - 2][gridWidth - 1] = 0; // Exit

  return maze;
}