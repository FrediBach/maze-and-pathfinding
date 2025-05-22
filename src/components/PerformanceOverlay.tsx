import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PerformanceResult {
  Algorithm: string;
  Min_ms: string;
  Avg_ms: string;
  Max_ms: string;
  Runs: number;
  Dimensions: string;
  Avg_ms_Number: number; // Numeric value for charting
  Avg_Path_Length: number; // Add average path length
  Avg_Visited_Cells: number; // Add average visited cells
}

interface PerformanceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  results: PerformanceResult[];
  runs: number;
  dimensions: string;
}

const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({ isOpen, onClose, results, runs, dimensions }) => {
  // Data formatted for Recharts (using Avg_ms_Number)
  const timeChartData = results.map(result => ({
    name: result.Algorithm,
    AverageTime: result.Avg_ms_Number,
  }));

  // Data formatted for Recharts (using Avg_Path_Length)
   const pathChartData = results.map(result => ({
    name: result.Algorithm,
    AveragePathLength: result.Avg_Path_Length,
  }));

  // Data formatted for Recharts (using Avg_Visited_Cells)
  const visitedChartData = results.map(result => ({
    name: result.Algorithm,
    AverageVisitedCells: result.Avg_Visited_Cells,
  }));


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Performance Results</DialogTitle>
          <DialogDescription>
            Comparison of maze generation algorithms ({dimensions}, {runs} runs each).
          </DialogDescription>
        </DialogHeader>

        {/* Average Generation Time Chart */}
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Average Generation Time (ms)</h3>
           <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AverageTime" fill="#8884d8" name="Average Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Average Path Length Chart */}
         <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Average Path Length</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pathChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Path Length', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AveragePathLength" fill="#82ca9d" name="Average Path Length" />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Average Visited Cells Chart */}
         <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Average Visited Cells (Pathfinding)</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visitedChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Number of Cells', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AverageVisitedCells" fill="#ffc658" name="Average Visited Cells" />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>


        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Detailed Results</h3>
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
              {results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{result.Algorithm}</TableCell>
                  <TableCell>{result.Min_ms}</TableCell>
                  <TableCell>{result.Avg_ms}</TableCell>
                  <TableCell>{result.Max_ms}</TableCell>
                  <TableCell>{result.Avg_Path_Length.toFixed(2)}</TableCell> {/* Display average path length */}
                  <TableCell>{result.Avg_Visited_Cells.toFixed(2)}</TableCell> {/* Display average visited cells */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default PerformanceOverlay;