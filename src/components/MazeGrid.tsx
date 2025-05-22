import React from 'react';
import { cn } from '@/lib/utils';

interface MazeGridProps {
  maze: number[][]; // Assuming maze is a 2D array of numbers (e.g., 0 for path, 1 for wall)
  path?: [number, number][] | null; // Optional path to display
  // visitedCells?: Set<string>; // No longer needed for gradient
  visitedOrder?: [number, number][]; // New: Ordered list of visited cells for gradient
  startPoint?: [number, number] | null; // Optional start point to highlight
  endPoint?: [number, number] | null; // Optional end point to highlight
}

const MazeGrid: React.FC<MazeGridProps> = ({ maze, path, visitedOrder = [], startPoint, endPoint }) => {
  if (!maze || maze.length === 0) {
    return <p>No maze data to display.</p>;
  }

  const numRows = maze.length;
  const numCols = maze[0].length;

  // Create a Set for quick path lookup
  const pathSet = new Set<string>();
  if (path) {
    path.forEach(([r, c]) => pathSet.add(`${r},${c}`));
  }

  const startKey = startPoint ? `${startPoint[0]},${startPoint[1]}` : null;
  const endKey = endPoint ? `${endPoint[0]},${endPoint[1]}` : null;

  // Create a Map to store the order index for visited cells
  const visitedOrderMap = new Map<string, number>();
  visitedOrder.forEach(([r, c], index) => {
      const key = `${r},${c}`;
      if (!visitedOrderMap.has(key)) { // Only record the first time a cell is visited
          visitedOrderMap.set(key, index);
      }
  });

  // Function to interpolate color between two colors based on a ratio
  // Assumes colors are in [R, G, B] format (0-255)
  const interpolateColor = (color1: [number, number, number], color2: [number, number, number], ratio: number): string => {
      const r = Math.round(color1[0] + (color2[0] - color1[0]) * ratio);
      const g = Math.round(color1[1] + (color2[1] - color1[1]) * ratio);
      const b = Math.round(color1[2] + (color2[2] - color1[2]) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
  };

  // Define gradient colors (e.g., from light pink to light blue)
  const startGradientColor: [number, number, number] = [255, 182, 193]; // Light Pink
  const endGradientColor: [number, number, number] = [173, 216, 230]; // Light Blue


  return (
    <div
      className="inline-grid border border-gray-400"
      style={{
        gridTemplateColumns: `repeat(${numCols}, 8px)`,
        gridTemplateRows: `repeat(${numRows}, 8px)`,
      }}
    >
      {maze.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          const cellKey = `${rowIndex},${colIndex}`;
          const isPathCell = cell === 0;
          const isOnPath = isPathCell && pathSet.has(cellKey);
          const isStart = isPathCell && startKey === cellKey;
          const isEnd = isPathCell && endKey === cellKey;

          // Determine background color based on state
          let bgColor = 'bg-gray-800'; // Default to wall color

          if (isPathCell) {
              bgColor = 'bg-white'; // Default path color

              const visitedIndex = visitedOrderMap.get(cellKey);
              const totalVisited = visitedOrderMap.size;

              // Apply gradient if the cell was visited and is not on the final path, start, or end
              if (visitedIndex !== undefined && !isOnPath && !isStart && !isEnd && totalVisited > 1) {
                  const ratio = visitedIndex / (totalVisited - 1); // Ratio from 0 to 1
                  const gradientColor = interpolateColor(startGradientColor, endGradientColor, ratio);
                  // Use inline style for the gradient color
                  return (
                      <div
                          key={`${rowIndex}-${colIndex}`}
                          className="w-full h-full"
                          style={{ backgroundColor: gradientColor }}
                      >
                          {/* Cell content */}
                      </div>
                  );
              }

              // Apply specific colors for path, start, and end
              if (isOnPath) {
                  bgColor = 'bg-blue-500'; // Blue for path cells
              }
              if (isStart) {
                  bgColor = 'bg-green-500'; // Green for start (overrides blue if start is on path)
              }
              if (isEnd) {
                  bgColor = 'bg-red-500'; // Red for end (overrides others)
              }
          }


          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                'w-full h-full',
                bgColor // Apply the determined background color class
              )}
            >
              {/* Cell content goes here if needed */}
            </div>
          );
        })
      ))}
    </div>
  );
};

export default MazeGrid;