import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// We won't add charts to this comparative view initially to keep it simple,
// but Recharts imports are kept in case we add them later.
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Re-using the PerformanceResult interface from MazeGenerator
interface PerformanceResult {
  Algorithm: string;
  Min_ms: string;
  Avg_ms: string;
  Max_ms: string;
  Runs: number;
  Dimensions: string;
  Avg_ms_Number: number;
  Avg_Path_Length: number;
  Avg_Visited_Cells: number; // Add average visited cells
}

// Interface for the data structure holding results for multiple dimensions
interface ComparativePerformanceResults {
    [dimension: string]: PerformanceResult[];
}

interface ComparativePerformanceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  results: ComparativePerformanceResults; // Data structure is an object keyed by dimension
  runsPerSize: number; // Number of runs used for each size test
}

const ComparativePerformanceOverlay: React.FC<ComparativePerformanceOverlayProps> = ({ isOpen, onClose, results, runsPerSize }) => {
  const dimensions = Object.keys(results).sort(); // Get dimensions and sort them

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparative Performance Results</DialogTitle>
          <DialogDescription>
            Comparison of maze generation algorithms across different sizes ({runsPerSize} runs per size).
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {dimensions.map(dimension => (
            <div key={dimension}>
              <h3 className="text-lg font-semibold mb-2">Dimensions: {dimension}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Min Gen (ms)</TableHead>
                    <TableHead>Avg Gen (ms)</TableHead>
                    <TableHead>Max Gen (ms)</TableHead>
                    <TableHead>Avg Path Length</TableHead>
                    <TableHead>Avg Visited Cells</TableHead> {/* Add new column header */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Ensure results for this dimension exist and map them */}
                  {results[dimension]?.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.Algorithm}</TableCell>
                      <TableCell>{result.Min_ms}</TableCell>
                      <TableCell>{result.Avg_ms}</TableCell>
                      <TableCell>{result.Max_ms}</TableCell>
                      <TableCell>{result.Avg_Path_Length.toFixed(2)}</TableCell>
                      <TableCell>{result.Avg_Visited_Cells.toFixed(2)}</TableCell> {/* Display average visited cells */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>

        {/* Charts could be added here later if needed, comparing metrics across dimensions */}
        {/* For example, a line chart showing Avg Gen Time vs. Dimension Size for each algorithm */}

      </DialogContent>
    </Dialog>
  );
};

export default ComparativePerformanceOverlay;