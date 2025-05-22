// src/lib/maze/binaryTree.ts

/**
 * Generates a maze using the Binary Tree algorithm.
 * The maze is represented as a 2D array where 1 is a wall and 0 is a path.
 * The grid size will be (2*height + 1) x (2*width + 1) to include outer walls and walls between cells.
 * This algorithm produces mazes with a strong diagonal bias.
 *
 * @param width - The number of cells horizontally.
 * @param height - The number of cells vertically.
 * @returns A 2D array representing the generated maze.
 */
export function generateBinaryTreeMaze(width: number, height: number): number[][] {
  // Initialize grid with all walls (1)
  const gridHeight = height * 2 + 1;
  const gridWidth = width * 2 + 1;
  const maze: number[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(1));

  // Iterate through each cell (odd rows and odd columns)
  for (let r = 1; r < gridHeight - 1; r += 2) {
    for (let c = 1; c < gridWidth - 1; c += 2) {
      // Carve the current cell
      maze[r][c] = 0;

      const canMoveUp = r > 1; // Can move up if not on the top edge (row 1)
      const canMoveLeft = c > 1; // Can move left if not on the left edge (col 1)

      if (canMoveUp && canMoveLeft) {
        // If both directions are possible, randomly choose one
        if (Math.random() < 0.5) {
          // Carve path upwards
          maze[r - 1][c] = 0;
        } else {
          // Carve path leftwards
          maze[r][c - 1] = 0;
        }
      } else if (canMoveUp) {
        // If only up is possible (on left edge), carve path upwards
        maze[r - 1][c] = 0;
      } else if (canMoveLeft) {
        // If only left is possible (on top edge), carve path leftwards
        maze[r][c - 1] = 0;
      }
      // If neither is possible (top-left corner cell), do nothing (cell is already carved)
    }
  }

  // Ensure there's an entrance and exit (optional, but good for pathfinding later)
  // Simple entrance at top-left, exit at bottom-right
  maze[1][0] = 0; // Entrance
  maze[gridHeight - 2][gridWidth - 1] = 0; // Exit

  return maze;
}