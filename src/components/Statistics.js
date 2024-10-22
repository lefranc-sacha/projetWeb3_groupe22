import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Statistics = () => {
  const location = useLocation();
  const { totalAttempts, incorrectAttempts, timeTaken, countriesFound } = location.state || {
    totalAttempts: 0,
    incorrectAttempts: 0,
    timeTaken: 0,
    countriesFound: 0
  };

  const accuracy = totalAttempts ? 
    ((totalAttempts - incorrectAttempts) / totalAttempts * 100).toFixed(1) : 
    0;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Statistics</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-500">Countries Found</h3>
          <p className="text-2xl font-bold">{countriesFound}</p>
        </div>

        <div className="bg-slate-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-500">Incorrect Attempts</h3>
          <p className="text-2xl font-bold">{incorrectAttempts}</p>
        </div>

        <div className="bg-slate-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-500">Accuracy</h3>
          <p className="text-2xl font-bold">{accuracy}%</p>
        </div>
      </div>

      <div className="bg-slate-100 p-4 rounded-lg text-center mb-4">
        <h3 className="text-sm font-medium text-slate-500">Time Taken</h3>
        <p className="text-2xl font-bold">{timeTaken.toFixed(2)} seconds</p>
      </div>

      <Link 
        to="/game" 
        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Play Again
      </Link>
    </div>
  );
};

export default Statistics;
