import { Link } from 'react-router-dom'; // Import Link

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-xl text-gray-600 mb-6">
          Explore the features below.
        </p>
        {/* Add a link to the new Maze Generator page */}
        <Link
          to="/maze"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors"
        >
          Go to Maze Generator
        </Link>
      </div>
    </div>
  );
};

export default Index;