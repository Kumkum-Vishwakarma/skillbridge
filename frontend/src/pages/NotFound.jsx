import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="mt-2 text-lg font-medium text-gray-900">
        Page not found
      </p>
      <p className="mt-1 text-sm text-gray-500">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;