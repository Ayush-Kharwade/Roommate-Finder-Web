import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center py-20 px-4">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-gray-500 mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-8 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;
