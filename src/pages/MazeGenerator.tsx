import React, { useState, useEffect } from 'react';
import MazeGrid from '@/components/MazeGrid';
import PerformanceOverlay from '@/components/PerformanceOverlay';
import ComparativePerformanceOverlay from '@/components/ComparativePerformanceOverlay';
import { generateRecursiveBacktrackerMaze } from '@/lib/maze/recursiveBacktracker';
import { generatePrimsMaze } from '@/lib/maze/prims';
import { generateKruskalsMaze } from '@/lib/maze/kruskals';
import { generateBinaryTreeMaze } from '@/lib/maze/binaryTree';
import { generateWilsonsMaze } from '@/lib/maze/wilsons';
import { generateRecursiveDivisionMaze } from '@/lib/maze/recursiveDivision';
import { generateAldousBroderMaze } from '@/lib/maze/aldousBroder';
import { generateGrowingTreeMaze } from '@/lib/maze/growingTree';
import { findPathBFS } from '@/lib/maze/bfs';
import { findPathDFS } from '@/lib/maze/dfs';
import { findPathAStar } from '@/lib/maze/aStar';
import { findPathGreedy } from '@/lib/maze/greedy';
import { findPathRandomMouse } from '@/lib/maze/randomMouse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const DEFAULT_WIDTH = 30;
const DEFAULT_HEIGHT = 30;
const MAX_DIMENSION = 50;
const DEFAULT_PERF_RUNS = 10;
const MAX_PERF_RUNS = 1000;
const PATHFINDING_COMPARISON_RUNS = 10;
const DEFAULT_RANDOM_MOUSE_STEPS = 100000; // Default step limit for Random Mouse
const MAX_RANDOM_MOUSE_STEPS = 1000000; // Max step limit


// Define available maze generation algorithms
const mazeAlgorithms = {
  recursiveBacktracker: { name: 'Recursive Backtracker', generate: generateRecursiveBacktrackerMaze },
  prims: { name: 'Prim\'s Algorithm', generate: generatePrimsMaze },
  kruskals: { name: 'Kruskal\'s Algorithm', generate: generateKruskalsMaze },
  binaryTree: { name: 'Binary Tree', generate: generateBinaryTreeMaze },
  wilsons: { name: 'Wilson\'s Algorithm', generate: generateWilsonsMaze },
  recursiveDivision: { name: 'Recursive Division', generate: generateRecursiveDivisionMaze },
  aldousBroder: { name: 'Aldous-Broder', generate: generateAldousBroderMaze },
  growingTree: { name: 'Growing Tree', generate: generateGrowingTreeMaze },
};

type MazeAlgorithmKey = keyof typeof mazeAlgorithms;

// Define available pathfinding algorithms
const pathfindingAlgorithms = {
    bfs: { name: 'Breadth-First Search (BFS)', find: findPathBFS },
    dfs: { name: 'Depth-First Search (DFS)', find: findPathDFS },
    aStar: { name: 'A* Search', find: findPathAStar },
    greedy: { name: 'Greedy Best-First Search', find: findPathGreedy },
    randomMouse: { name: 'Random Mouse', find: findPathRandomMouse },
};

type PathfindingAlgorithmKey = keyof typeof pathfindingAlgorithms;


// Define the structure for performance results (used by both overlays)
interface PerformanceResult {
  Algorithm: string; // Can be Maze Algo Name or Pathfinding Algo Name
  Min_ms: string;
  Avg_ms: string;
  Max_ms: string;
  Runs: number;
  Dimensions: string;
  Avg_ms_Number: number; // Numeric value for charting
  Avg_Path_Length: number;
  Avg_Visited_Cells: number;
}

// Interface for the data structure holding comparative results (for maze generation)
interface ComparativePerformanceResults {
    [dimension: string]: PerformanceResult[];
}


const MazeGenerator = () => {
  const [mazeData, setMazeData] = useState<number[][]>([]);
  const [pathData, setPathData] = useState<[number, number][] | null>(null);
  // const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set()); // No longer needed
  const [visitedOrder, setVisitedOrder] = useState<[number, number][]>([]); // State for ordered visited cells

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [inputWidth, setInputWidth] = useState(String(DEFAULT_WIDTH));
  const [inputHeight, setInputHeight] = useState(String(DEFAULT_HEIGHT));
  const [selectedMazeAlgorithm, setSelectedMazeAlgorithm] = useState<MazeAlgorithmKey>('recursiveBacktracker');
  const [selectedPathfindingAlgorithm, setSelectedPathfindingAlgorithm] = useState<PathfindingAlgorithmKey>('bfs');

  // State for start and end points for pathfinding
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [inputStartRow, setInputStartRow] = useState('');
  const [inputStartCol, setInputStartCol] = useState('');
  const [inputEndRow, setInputEndRow] = useState('');
  const [inputEndCol, setInputEndCol] = useState('');

  // State for performance measurement (single size maze generation)
  const [numRuns, setNumRuns] = useState(DEFAULT_PERF_RUNS);
  const [inputNumRuns, setInputNumRuns] = useState(String(DEFAULT_PERF_RUNS));
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [performanceResults, setPerformanceResults] = useState<PerformanceResult[]>([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // State for comparative performance measurement (multiple sizes maze generation)
  const [comparativePerformanceResults, setComparativePerformanceResults] = useState<ComparativePerformanceResults>({});
  const [isComparativeOverlayOpen, setIsComparativeOverlayOpen] = useState(false);

  // State for pathfinding comparison results
  const [pathfindingComparisonResults, setPathfindingComparisonResults] = useState<PerformanceResult[]>([]);
  const [isPathfindingOverlayOpen, setIsPathfindingOverlayOpen] = useState(false);

  // State for Random Mouse step limit
  const [randomMouseStepLimit, setRandomMouseStepLimit] = useState(DEFAULT_RANDOM_MOUSE_STEPS);
  const [inputRandomMouseStepLimit, setInputRandomMouseStepLimit] = useState(String(DEFAULT_RANDOM_MOUSE_STEPS));


  // Function to generate a new maze using the selected algorithm
  const generateNewMaze = () => {
    const newWidth = parseInt(inputWidth, 10);
    const newHeight = parseInt(inputHeight, 10);

    // Basic validation
    if (isNaN(newWidth) || newWidth <= 0 || newWidth > MAX_DIMENSION) {
      showError(`Invalid width: ${inputWidth}. Please enter a number between 1 and ${MAX_DIMENSION}.`);
      setInputWidth(String(width));
      return;
    }
     if (isNaN(newHeight) || newHeight <= 0 || newHeight > MAX_DIMENSION) {
      showError(`Invalid height: ${inputHeight}. Please enter a number between 1 and ${MAX_DIMENSION}.`);
      setInputHeight(String(height));
      return;
    }

    console.log(`Generating maze with dimensions: ${newWidth}x${newHeight} using ${mazeAlgorithms[selectedMazeAlgorithm].name}`);
    setWidth(newWidth);
    setHeight(newHeight);

    // Start timing for maze generation
    console.time('Maze Generation');
    const newMaze = selectedMazeAlgorithm === 'growingTree'
        ? generateGrowingTreeMaze(newWidth, newHeight, 'newest')
        : mazeAlgorithms[selectedMazeAlgorithm].generate(newWidth, newHeight);
    console.timeEnd('Maze Generation');

    setMazeData(newMaze);
    setPathData(null);
    // setVisitedCells(new Set()); // No longer needed
    setVisitedOrder([]); // Clear visited order

    // Set default start/end points based on the generated maze dimensions
    const defaultStart: [number, number] = [1, 0];
    const defaultEnd: [number, number] = [newMaze.length - 2, newMaze[0].length - 1];
    setStartPoint(defaultStart);
    setEndPoint(defaultEnd);
    setInputStartRow(String(defaultStart[0]));
    setInputStartCol(String(defaultStart[1]));
    setInputEndRow(String(defaultEnd[0]));
    setInputEndCol(String(defaultEnd[1]));


    showSuccess(`Generated a ${newWidth}x${newHeight} maze using ${mazeAlgorithms[selectedMazeAlgorithm].name}.`);
    console.log("Maze generated.");
  };

  // Function to find the path using the selected algorithm
  const findPath = () => {
    if (mazeData.length === 0) {
      showError("Generate a maze first!");
      return;
    }

    const sRow = parseInt(inputStartRow, 10);
    const sCol = parseInt(inputStartCol, 10);
    const eRow = parseInt(inputEndRow, 10);
    const eCol = parseInt(inputEndCol, 10);

    // Validate start/end inputs
    if (isNaN(sRow) || isNaN(sCol) || isNaN(eRow) || isNaN(eCol)) {
        showError("Please enter valid numbers for start and end coordinates.");
        return;
    }

    const currentStart: [number, number] = [sRow, sCol];
    const currentEnd: [number, number] = [eRow, eCol];

    // More robust validation: check bounds and if it's a path cell
    const numRows = mazeData.length;
    const numCols = mazeData[0].length;

    const isValidPoint = (r: number, c: number) =>
        r >= 0 && r < numRows && c >= 0 && c < numCols && mazeData[r][c] === 0;

    if (!isValidPoint(currentStart[0], currentStart[1])) {
        showError(`Invalid start point [${currentStart[0]}, ${currentStart[1]}]. Must be within bounds and on a path.`);
        return;
    }
     if (!isValidPoint(currentEnd[0], currentEnd[1])) {
        showError(`Invalid end point [${currentEnd[0]}, ${currentEnd[1]}]. Must be within bounds and on a path.`);
        return;
    }

    // Update state with validated points
    setStartPoint(currentStart);
    setEndPoint(currentEnd);

    const pathfindingAlgorithm = pathfindingAlgorithms[selectedPathfindingAlgorithm];

    console.log(`Finding path from [${currentStart}] to [${currentEnd}] using ${pathfindingAlgorithm.name}...`);
    // Start timing for pathfinding
    console.time(`Pathfinding (${pathfindingAlgorithm.name})`);

    let result;
    if (selectedPathfindingAlgorithm === 'randomMouse') {
        const limit = parseInt(inputRandomMouseStepLimit, 10);
         if (isNaN(limit) || limit <= 0 || limit > MAX_RANDOM_MOUSE_STEPS) {
            showError(`Invalid step limit: ${inputRandomMouseStepLimit}. Please enter a number between 1 and ${MAX_RANDOM_MOUSE_STEPS}.`);
            setInputRandomMouseStepLimit(String(randomMouseStepLimit));
            return;
        }
        setRandomMouseStepLimit(limit);
        result = pathfindingAlgorithm.find(mazeData, currentStart, currentEnd, limit);
    } else {
        // Other algorithms don't need the step limit
        result = pathfindingAlgorithm.find(mazeData, currentStart, currentEnd);
    }

    const { path, visitedOrder: newVisitedOrder } = result; // Destructure the new visitedOrder

    console.timeEnd(`Pathfinding (${pathfindingAlgorithm.name})`);

    setVisitedOrder(newVisitedOrder); // Set the ordered visited cells

    if (path) {
      setPathData(path);
      showSuccess(`Path found using ${pathfindingAlgorithm.name}! Length: ${path.length}. Visited cells: ${newVisitedOrder.length}`);
      console.log("Path found:", path);
      console.log("Visited cells:", newVisitedOrder.length);
    } else {
      setPathData(null);
      showError(`No path found using ${pathfindingAlgorithm.name}.`);
      console.log("No path found.");
    }
  };

  // Helper function to perform a single test run for given dimensions and runs
  const performMazeGenerationTestRun = (currentWidth: number, currentHeight: number, runs: number): PerformanceResult[] => {
      const results: PerformanceResult[] = [];
      const dimensionsString = `${currentWidth}x${currentHeight}`;
      // For maze generation performance, we'll use BFS for pathfinding stats as it's standard
      const pathfindingAlgorithm = pathfindingAlgorithms['bfs']; // Use BFS for consistent pathfinding stats in maze gen tests

      console.log(`--- Testing Maze Generation: ${dimensionsString} (${runs} runs), Pathfinding with ${pathfindingAlgorithm.name} ---`);

      for (const algoKey in mazeAlgorithms) {
          const mazeAlgorithm = mazeAlgorithms[algoKey as MazeAlgorithmKey];
          const generationTimes: number[] = [];
          const pathLengths: number[] = [];
          const visitedCounts: number[] = [];
          console.log(`  Testing ${mazeAlgorithm.name}...`);

          for (let i = 0; i < runs; i++) {
              // Generate maze
              const startTimeGen = performance.now();
              const generatedMaze = algoKey === 'growingTree'
                ? generateGrowingTreeMaze(currentWidth, currentHeight, 'newest')
                : mazeAlgorithm.generate(currentWidth, currentHeight);
              const endTimeGen = performance.now();
              generationTimes.push(endTimeGen - startTimeGen);

              // Find path using the selected pathfinding algorithm (BFS for consistency)
              const mazeRows = generatedMaze.length;
              const mazeCols = generatedMaze[0].length;
              const testStart: [number, number] = [1, 0];
              const testEnd: [number, number] = [mazeRows - 2, mazeCols - 1];

              // BFS doesn't need the step limit parameter
              const { path, visitedOrder: testVisitedOrder } = pathfindingAlgorithm.find(generatedMaze, testStart, testEnd);
              if (path) {
                  pathLengths.push(path.length);
                  visitedCounts.push(testVisitedOrder.length); // Use length of visitedOrder
              } else {
                   // If no path found, still count visited cells up to the point of failure
                   visitedCounts.push(testVisitedOrder.length);
                   console.warn(`  No path found for ${mazeAlgorithm.name} run ${i + 1} at ${dimensionsString} using ${pathfindingAlgorithm.name}`);
                   pathLengths.push(0); // Record 0 path length if no path found
              }
          }

          // Calculate stats
          const minGen = Math.min(...generationTimes);
          const maxGen = Math.max(...generationTimes);
          const avgGen = generationTimes.reduce((sum, time) => sum + time, 0) / generationTimes.length;
          const avgPath = pathLengths.reduce((sum, len) => sum + len, 0) / pathLengths.length;
          const avgVisited = visitedCounts.reduce((sum, count) => sum + count, 0) / visitedCounts.length;

          results.push({
              Algorithm: mazeAlgorithm.name,
              Min_ms: minGen.toFixed(2),
              Avg_ms: avgGen.toFixed(2),
              Max_ms: maxGen.toFixed(2),
              Runs: runs,
              Dimensions: dimensionsString,
              Avg_ms_Number: avgGen,
              Avg_Path_Length: avgPath,
              Avg_Visited_Cells: avgVisited,
          });

          console.log(`    ${mazeAlgorithm.name}: Gen Time (ms) Min=${minGen.toFixed(2)}, Avg=${avgGen.toFixed(2)}, Max=${maxGen.toFixed(2)}. Avg Path Length=${avgPath.toFixed(2)}. Avg Visited Cells=${avgVisited.toFixed(2)}`);
      }
      console.log(`--- Maze Generation Test Complete for ${dimensionsString} ---`);
      return results;
  };


  // Function to run performance test for current settings (opens single overlay)
  const runPerformanceTest = () => {
    const currentWidth = parseInt(inputWidth, 10);
    const currentHeight = parseInt(inputHeight, 10);
    const runs = parseInt(inputNumRuns, 10);

    // Validation
    if (isNaN(currentWidth) || currentWidth <= 0 || currentWidth > MAX_DIMENSION) {
      showError(`Invalid width: ${inputWidth}. Please enter a number between 1 and ${MAX_DIMENSION}.`);
      setInputWidth(String(width));
      return;
    }
    if (isNaN(currentHeight) || currentHeight <= 0 || currentHeight > MAX_DIMENSION) {
      showError(`Invalid height: ${inputHeight}. Please enter a number between 1 and ${MAX_DIMENSION}.`);
      setInputHeight(String(height));
      return;
    }
    if (isNaN(runs) || runs <= 0 || runs > MAX_PERF_RUNS) {
      showError(`Invalid number of runs: ${inputNumRuns}. Please enter a number between 1 and ${MAX_PERF_RUNS}.`);
      setInputNumRuns(String(numRuns));
      return;
    }

    setWidth(currentWidth);
    setHeight(currentHeight);
    setNumRuns(runs);

    setIsMeasuring(true);
    showSuccess(`Starting maze generation performance test for ${runs} runs on ${currentWidth}x${currentHeight} mazes...`);
    console.log(`--- Starting Maze Generation Performance Test (${runs} runs, ${currentWidth}x${currentHeight}) ---`);

    // Use setTimeout to allow the UI to update before starting the potentially long test
    setTimeout(() => {
        const results = performMazeGenerationTestRun(currentWidth, currentHeight, runs);
        console.log("--- Maze Generation Performance Test Complete ---");
        console.table(results);

        setPerformanceResults(results);
        setIsMeasuring(false);
        setIsOverlayOpen(true);
        showSuccess("Maze generation performance test finished. Results displayed in overlay.");

    }, 50);
  };

  // Function to run comparative performance test across sizes (opens comparative overlay)
  const runComparativePerformanceTest = () => {
      const runs = parseInt(inputNumRuns, 10);

      if (isNaN(runs) || runs <= 0 || runs > MAX_PERF_RUNS) {
        showError(`Invalid number of runs: ${inputNumRuns}. Please enter a number between 1 and ${MAX_PERF_RUNS}.`);
        setInputNumRuns(String(numRuns));
        return;
      }

      setIsMeasuring(true);
      showSuccess(`Starting comparative maze generation performance test across sizes (${runs} runs per size)...`);
      console.log(`\n=== Starting Comparative Maze Generation Performance Test (${runs} runs per size) ===`);

      const dimensionsToTest = [
          [8, 8],
          [15, 15],
          [30, 30],
          [45, 45],
      ];

      // Use setTimeout to allow UI update and prevent blocking
      setTimeout(() => {
          const allResults: ComparativePerformanceResults = {};

          for (const [w, h] of dimensionsToTest) {
              const testWidth = Math.min(w, MAX_DIMENSION);
              const testHeight = Math.min(h, MAX_DIMENSION);
              const dimensionKey = `${testWidth}x${testHeight}`;

              const resultsForDimension = performMazeGenerationTestRun(testWidth, testHeight, runs);
              allResults[dimensionKey] = resultsForDimension;
          }

          console.log("\n=== Comparative Maze Generation Performance Test Summary ===");
          console.table(allResults);
          console.log("============================================");

          setComparativePerformanceResults(allResults);
          setIsMeasuring(false);
          setIsComparativeOverlayOpen(true);
          showSuccess("Comparative maze generation performance test finished. Results displayed in overlay.");
      }, 50);
  };

  // Function to run a comparison of pathfinding algorithms on the *current* maze
  const runPathfindingComparison = () => {
      if (mazeData.length === 0) {
          showError("Generate a maze first to compare pathfinding algorithms.");
          return;
      }

      const sRow = parseInt(inputStartRow, 10);
      const sCol = parseInt(inputStartCol, 10);
      const eRow = parseInt(inputEndRow, 10);
      const eCol = parseInt(inputEndCol, 10);

      // Validate start/end inputs
      if (isNaN(sRow) || isNaN(sCol) || isNaN(eRow) || isNaN(eCol)) {
          showError("Please enter valid numbers for start and end coordinates for pathfinding comparison.");
          return;
      }

      const currentStart: [number, number] = [sRow, sCol];
      const currentEnd: [number, number] = [eRow, eCol];

      // More robust validation: check bounds and if it's a path cell
      const numRows = mazeData.length;
      const numCols = mazeData[0].length;

      const isValidPoint = (r: number, c: number) =>
          r >= 0 && r < numRows && c >= 0 && c < numCols && mazeData[r][c] === 0;

      if (!isValidPoint(currentStart[0], currentStart[1])) {
          showError(`Invalid start point [${currentStart[0]}, ${currentStart[1]}] for comparison. Must be within bounds and on a path.`);
          return;
      }
       if (!isValidPoint(currentEnd[0], currentEnd[1])) {
          showError(`Invalid end point [${currentEnd[0]}, ${currentEnd[1]}] for comparison. Must be within bounds and on a path.`);
          return;
      }

      setStartPoint(currentStart);
      setEndPoint(currentEnd);

      const limit = parseInt(inputRandomMouseStepLimit, 10);
       if (isNaN(limit) || limit <= 0 || limit > MAX_RANDOM_MOUSE_STEPS) {
          showError(`Invalid step limit: ${inputRandomMouseStepLimit}. Please enter a number between 1 and ${MAX_RANDOM_MOUSE_STEPS}.`);
          setInputRandomMouseStepLimit(String(randomMouseStepLimit));
          return;
      }
      setRandomMouseStepLimit(limit);


      setIsMeasuring(true);
      showSuccess(`Starting pathfinding comparison on the current ${width}x${height} maze (${PATHFINDING_COMPARISON_RUNS} runs each)...`);
      console.log(`\n=== Starting Pathfinding Comparison (${PATHFINDING_COMPARISON_RUNS} runs) ===`);

      setTimeout(() => {
          const results: PerformanceResult[] = [];
          const dimensionsString = `${width}x${height}`;

          for (const algoKey in pathfindingAlgorithms) {
              const pathfindingAlgorithm = pathfindingAlgorithms[algoKey as PathfindingAlgorithmKey];
              const pathfindingTimes: number[] = [];
              const pathLengths: number[] = [];
              const visitedCounts: number[] = [];
              console.log(`  Testing ${pathfindingAlgorithm.name}...`);

              for (let i = 0; i < PATHFINDING_COMPARISON_RUNS; i++) {
                  const startTime = performance.now();
                  // Pass the step limit only to Random Mouse
                  const { path, visitedOrder: testVisitedOrder } = algoKey === 'randomMouse'
                    ? pathfindingAlgorithm.find(mazeData, currentStart, currentEnd, limit)
                    : pathfindingAlgorithm.find(mazeData, currentStart, currentEnd);

                  const endTime = performance.now();
                  pathfindingTimes.push(endTime - startTime);

                  if (path) {
                      pathLengths.push(path.length);
                      visitedCounts.push(testVisitedOrder.length); // Use length of visitedOrder
                  } else {
                       // If no path found, still count visited cells up to the point of failure
                       visitedCounts.push(testVisitedOrder.length);
                       console.warn(`  No path found for ${pathfindingAlgorithm.name} run ${i + 1} at ${dimensionsString}`);
                       pathLengths.push(0); // Record 0 path length if no path found
                  }
              }

              const minTime = Math.min(...pathfindingTimes);
              const maxTime = Math.max(...pathfindingTimes);
              const avgTime = pathfindingTimes.reduce((sum, time) => sum + time, 0) / pathfindingTimes.length;
              const avgPath = pathLengths.reduce((sum, len) => sum + len, 0) / pathLengths.length;
              const avgVisited = visitedCounts.reduce((sum, count) => sum + count, 0) / visitedCounts.length;

              results.push({
                  Algorithm: pathfindingAlgorithm.name,
                  Min_ms: minTime.toFixed(2),
                  Avg_ms: avgTime.toFixed(2),
                  Max_ms: maxTime.toFixed(2),
                  Runs: PATHFINDING_COMPARISON_RUNS,
                  Dimensions: dimensionsString,
                  Avg_ms_Number: avgTime,
                  Avg_Path_Length: avgPath,
                  Avg_Visited_Cells: avgVisited,
              });

              console.log(`    ${pathfindingAlgorithm.name}: Time (ms) Min=${minTime.toFixed(2)}, Avg=${avgTime.toFixed(2)}, Max=${maxTime.toFixed(2)}. Avg Path Length=${avgPath.toFixed(2)}. Avg Visited Cells=${avgVisited.toFixed(2)}`);
          }

          console.log("=== Pathfinding Comparison Complete ===");
          console.table(results);
          console.log("=======================================");

          setPathfindingComparisonResults(results);
          setIsMeasuring(false);
          setIsPathfindingOverlayOpen(true);
          showSuccess("Pathfinding comparison finished. Results displayed in overlay.");

      }, 50);
  };


  const closeMazeOverlay = () => {
      setIsOverlayOpen(false);
      setPerformanceResults([]);
  };

  const closeComparativeMazeOverlay = () => {
      setIsComparativeOverlayOpen(false);
      setComparativePerformanceResults({});
  };

  const closePathfindingOverlay = () => {
      setIsPathfindingOverlayOpen(false);
      setPathfindingComparisonResults([]);
  };


  // Generate a maze on initial load or when width/height/algorithm state changes
  useEffect(() => {
     if (!isNaN(width) && width > 0 && width <= MAX_DIMENSION && !isNaN(height) && height > 0 && height <= MAX_DIMENSION) {
       console.log(`Generating initial maze with dimensions: ${width}x${height} using ${mazeAlgorithms[selectedMazeAlgorithm].name}`);
       console.time('Initial Maze Generation');
       const initialMaze = selectedMazeAlgorithm === 'growingTree'
           ? generateGrowingTreeMaze(width, height, 'newest')
           : mazeAlgorithms[selectedMazeAlgorithm].generate(width, height);
       console.timeEnd('Initial Maze Generation');

       setMazeData(initialMaze);
       setPathData(null);
       // setVisitedCells(new Set()); // No longer needed
       setVisitedOrder([]); // Clear visited order

       const defaultStart: [number, number] = [1, 0];
       const defaultEnd: [number, number] = [initialMaze.length - 2, initialMaze[0].length - 1];
       setStartPoint(defaultStart);
       setEndPoint(defaultEnd);
       setInputStartRow(String(defaultStart[0]));
       setInputStartCol(String(defaultStart[1]));
       setInputEndRow(String(defaultEnd[0]));
       setInputEndCol(String(defaultEnd[1]));

       console.log("Initial maze generated.");
    }
  }, [width, height, selectedMazeAlgorithm]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputWidth(e.target.value);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputHeight(e.target.value);
  };

  const handleMazeAlgorithmChange = (value: string) => {
    setSelectedMazeAlgorithm(value as MazeAlgorithmKey);
  };

  const handlePathfindingAlgorithmChange = (value: string) => {
      setSelectedPathfindingAlgorithm(value as PathfindingAlgorithmKey);
  };

  const handleNumRunsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputNumRuns(e.target.value);
  };

  const handleRandomMouseStepLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputRandomMouseStepLimit(e.target.value);
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Maze Generator</h1>

      {/* Maze Grid */}
      <div className="flex justify-center mb-6">
        {mazeData.length > 0 ? (
          <MazeGrid
            maze={mazeData}
            path={pathData}
            // Pass visitedOrder instead of visitedCells for gradient
            visitedOrder={visitedOrder}
            startPoint={startPoint}
            endPoint={endPoint}
          />
        ) : (
          <p>Generating maze...</p>
        )}
      </div>

      {/* Controls Container: Two side-by-side blocks */}
      <div className="flex flex-col md:flex-row justify-center gap-6">

        {/* Left Block: Maze Setup and Pathfinding */}
        <div className="flex flex-col items-center space-y-6 p-6 border rounded-lg shadow-sm w-full md:w-1/2">
            <h2 className="text-xl font-semibold">Maze & Pathfinding Setup</h2>

            {/* Maze Generation Controls */}
            <div className="flex flex-col items-center space-y-4 w-full">
                <div className="flex flex-wrap justify-center items-center gap-4 w-full">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="maze-algorithm">Maze Algorithm:</Label>
                       <Select value={selectedMazeAlgorithm} onValueChange={handleMazeAlgorithmChange} disabled={isMeasuring}>
                          <SelectTrigger id="maze-algorithm" className="w-[200px]">
                            <SelectValue placeholder="Select Algorithm" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(mazeAlgorithms).map(key => (
                              <SelectItem key={key} value={key}>
                                {mazeAlgorithms[key as MazeAlgorithmKey].name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="width">Width:</Label>
                      <Input
                        id="width"
                        type="number"
                        value={inputWidth}
                        onChange={handleWidthChange}
                        className="w-20"
                        min="1"
                        max={MAX_DIMENSION}
                        disabled={isMeasuring}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="height">Height:</Label>
                      <Input
                        id="height"
                        type="number"
                        value={inputHeight}
                        onChange={handleHeightChange}
                        className="w-20"
                        min="1"
                        max={MAX_DIMENSION}
                        disabled={isMeasuring}
                      />
                    </div>
                </div>
                 <Button onClick={generateNewMaze} disabled={isMeasuring} className="w-full max-w-xs">Generate New Maze</Button>
            </div>

            <Separator className="w-full" /> {/* Separator */}

            {/* Pathfinding Controls */}
            <div className="flex flex-col items-center space-y-4 w-full">
                <h3 className="text-lg font-medium">Pathfinding</h3>
                 <div className="flex items-center space-x-2 w-full max-w-xs">
                    <Label htmlFor="pathfinding-algorithm" className="min-w-[120px]">Algorithm:</Label>
                     <Select value={selectedPathfindingAlgorithm} onValueChange={handlePathfindingAlgorithmChange} disabled={isMeasuring}>
                        <SelectTrigger id="pathfinding-algorithm" className="w-full">
                          <SelectValue placeholder="Select Algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(pathfindingAlgorithms).map(key => (
                            <SelectItem key={key} value={key}>
                              {pathfindingAlgorithms[key as PathfindingAlgorithmKey].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                 </div>
                 {/* Random Mouse Step Limit Input */}
                 {selectedPathfindingAlgorithm === 'randomMouse' && (
                     <div className="flex items-center space-x-2 w-full max-w-xs">
                        <Label htmlFor="random-mouse-steps" className="min-w-[120px]">Max Steps:</Label>
                        <Input
                            id="random-mouse-steps"
                            type="number"
                            value={inputRandomMouseStepLimit}
                            onChange={handleRandomMouseStepLimitChange}
                            className="w-24"
                            min="1"
                            max={MAX_RANDOM_MOUSE_STEPS}
                            disabled={isMeasuring}
                        />
                     </div>
                 )}
                 <div className="flex flex-wrap justify-center items-center gap-4 w-full">
                    <div className="flex items-center space-x-2">
                       <Label>Start (R, C):</Label>
                       <Input
                           type="number"
                           value={inputStartRow}
                           onChange={(e) => setInputStartRow(e.target.value)}
                           className="w-16"
                           placeholder="Row"
                           disabled={isMeasuring}
                       />
                        <Input
                           type="number"
                           value={inputStartCol}
                           onChange={(e) => setInputStartCol(e.target.value)}
                           className="w-16"
                           placeholder="Col"
                           disabled={isMeasuring}
                       />
                    </div>
                    <div className="flex items-center space-x-2">
                       <Label>End (R, C):</Label>
                        <Input
                           type="number"
                           value={inputEndRow}
                           onChange={(e) => setInputEndRow(e.target.value)}
                           className="w-16"
                           placeholder="Row"
                           disabled={isMeasuring}
                       />
                        <Input
                           type="number"
                           value={inputEndCol}
                           onChange={(e) => setInputEndCol(e.target.value)}
                           className="w-16"
                           placeholder="Col"
                           disabled={isMeasuring}
                       />
                    </div>
                 </div>
                 <Button onClick={findPath} disabled={mazeData.length === 0 || isMeasuring} className="w-full max-w-xs">Find Path</Button>
            </div>
        </div>

        {/* Right Block: Performance Measurement */}
        <div className="flex flex-col items-center space-y-6 p-6 border rounded-lg shadow-sm w-full md:w-1/2">
            <h2 className="text-xl font-semibold">Performance Analysis</h2>

            {/* Performance Measurement Controls */}
            <div className="flex flex-col items-center space-y-4 w-full">
                <div className="flex items-center space-x-2 w-full max-w-xs">
                   <Label htmlFor="num-runs" className="min-w-[120px]">Runs per Test:</Label>
                   <Input
                       id="num-runs"
                       type="number"
                       value={inputNumRuns}
                       onChange={handleNumRunsChange}
                       className="w-20"
                       min="1"
                       max={MAX_PERF_RUNS}
                       disabled={isMeasuring}
                   />
                </div>
                <Button onClick={runPerformanceTest} disabled={isMeasuring} className="w-full max-w-xs">
                   {isMeasuring ? 'Measuring Gen...' : 'Measure Maze Gen (Current Size)'}
                </Button>
                 <Button onClick={runComparativePerformanceTest} disabled={isMeasuring} className="w-full max-w-xs">
                   {isMeasuring ? 'Comparing Gen Sizes...' : 'Compare Maze Gen (Sizes)'}
                </Button>
                 <Button onClick={runPathfindingComparison} disabled={mazeData.length === 0 || isMeasuring} className="w-full max-w-xs">
                   {isMeasuring ? 'Comparing Pathfinding...' : 'Compare Pathfinding (Current Maze)'}
                </Button>
            </div>
        </div>

      </div>


      {/* Performance Results Overlay (Single Size Maze Generation) */}
      <PerformanceOverlay
          isOpen={isOverlayOpen}
          onClose={closeMazeOverlay}
          results={performanceResults}
          runs={numRuns}
          dimensions={`${width}x${height}`}
      />

      {/* Performance Results Overlay (Comparative Sizes Maze Generation) */}
      <ComparativePerformanceOverlay
          isOpen={isComparativeOverlayOpen}
          onClose={closeComparativeMazeOverlay}
          results={comparativePerformanceResults}
          runsPerSize={parseInt(inputNumRuns, 10) || DEFAULT_PERF_RUNS}
      />

       {/* Performance Results Overlay (Pathfinding Comparison) */}
       <PerformanceOverlay
          isOpen={isPathfindingOverlayOpen}
          onClose={closePathfindingOverlay}
          results={pathfindingComparisonResults}
          runs={PATHFINDING_COMPARISON_RUNS}
          dimensions={`${width}x${height}`}
      />
    </div>
  );
};

export default MazeGenerator;