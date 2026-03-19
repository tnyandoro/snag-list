import React from 'react';
import { Link } from 'react-router-dom';
const NotFound: React.FC = () => (
  <div className="p-8 text-center">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="mt-2">Page not found</p>
    <Link to="/" className="text-blue-500 mt-4 inline-block">Go Home</Link>
  </div>
);
export default NotFound;
