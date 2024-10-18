import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Statistics = () => {
  const location = useLocation();
  const { attempts, timeTaken } = location.state || { attempts: 0, timeTaken: 0 };

  return (
    <div>
      <h2>Statistics</h2>
      <p>Number of attempts: {attempts}</p>
      <p>Time taken: {timeTaken} seconds</p>
      <Link to="/">Play Again</Link>
    </div>
  );
};

export default Statistics;