// src/lib/maze/kruskals.ts

/**
 * Generates a maze using Kruskal's algorithm.
 * The maze is represented as a 2D array where 1 is a wall and 0 is a path.
 * The grid size will be (2*height + 1) x (2*width + 1) to include outer walls and walls between cells.
 *
 * @param width - The number of cells horizontally.
 * @param height - The number of cells vertically.
 * @returns A 2D array representing the generated maze.
 */
export function generateKruskalsMaze(width: number, height: number): number[][] {
  const gridHeight = height * 2 + 1;
  const gridWidth = width * 2 + 1;
  const maze: number[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(1)); // Start with all walls

  // Disjoint Set Union (DSU) structure to keep track of connected cells
  // We need a way to map cell coordinates [r, c] to a unique identifier or index.
  // A simple index `r * width + c` works for the `cellSets` grid (0 to height-1, 0 to width-1).
  // Let's use a flat array for the DSU parent structure, indexed by `r * width + c`.

  const parent: number[] = Array(height * width).fill(0).map((_, i) => i); // Initialize parent array
  const rank: number[] = Array(height * width).fill(0); // For union by rank

  const findSetByIndex = (i: number): number => {
      if (parent[i] === i) {
          return i;
      }
      parent[i] = findSetByIndex(parent[i]); // Path compression
      return parent[i];
  };

  const unionSetsByIndex = (i: number, j: number): void => {
      const rootI = findSetByIndex(i);
      const rootJ = findSetByIndex(j);
      if (rootI !== rootJ) {
          if (rank[rootI] < rank[rootJ]) {
              parent[rootI] = rootJ;
          } else if (rank[rootJ] < rank[rootI]) {
              parent[rootJ] = rootI;
          } else {
              parent[rootJ] = rootI;
              rank[rootI]++;
          }
      }
  };

  // Initialize DSU for each cell and carve initial cells
  for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
          const index = r * width + c;
          parent[index] = index;
          rank[index] = 0;
          maze[r * 2 + 1][c * 2 + 1] = 0; // Carve out the initial cells
      }
  }

  // List of all internal walls
  const walls: { r: number; c: number; cells: [[number, number], [number, number]] }[] = [];

  // Add horizontal walls
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width - 1; c++) {
      walls.push({
        r: r * 2 + 1,
        c: c * 2 + 2,
        cells: [[r, c], [r, c + 1]], // Cells on either side (in cellSets grid)
      });
    }
  }

  // Add vertical walls
  for (let r = 0; r < height - 1; r++) {
    for (let c = 0; c < width; c++) {
      walls.push({
        r: r * 2 + 2,
        c: c * 2 + 1,
        cells: [[r, c], [r + 1, c]], // Cells on either side (in cellSets grid)
      });
    }
  }

  // Shuffle the walls randomly
  walls.sort(() => Math.random() - 0.5);

  // Process walls
  for (const wall of walls) {
      const [[r1, c1], [r2, c2]] = wall.cells;
      const index1 = r1 * width + c1;
      const index2 = r2 * width + c2;

      const root1 = findSetByIndex(index1);
      const root2 = findSetByIndex(index2);

      // If the cells on either side of the wall are in different sets
      if (root1 !== root2) {
          // Carve the wall
          maze[wall.r][wall.c] = 0;
          // Union the sets
          unionSetsByIndex(index1, index2);
      }
  }

  // Ensure there's an entrance and exit
  maze[1][0] = 0; // Entrance
  maze[gridHeight - 2][gridWidth - 1] = 0; // Exit

  return maze;
}