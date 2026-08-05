import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-8xl font-extrabold text-red-500">404</h1>

        <h2 className="mt-4 text-3xl font-bold">
          Page Not Found
        </h2>

        <p className="mt-4 text-gray-400">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
        >
           Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;