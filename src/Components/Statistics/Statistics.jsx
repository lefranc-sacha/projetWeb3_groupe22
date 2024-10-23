import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Statistics = () => {
  const navigate = useNavigate();
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

  const handleRestartGame = () => {
    navigate("/");
  };

  return (
    <div>
    <h1 className="text-center">Statistics</h1>

    <div className="container border border-primary rounded-4">
        <div className="row">
            <div className="col text-center">
                <p>Countries found: {countriesFound}</p>
                <p>Incorrect Attempts: {incorrectAttempts}</p>
                <p>Accuracy:{accuracy}%</p>
                <p>Time taken: {timeTaken.toFixed(2)} seconds</p>
                <button type="button" className="btn btn-primary rounded-5 my-2" onClick={handleRestartGame}>
                    Restart Game
                </button>
            </div>
        </div>
    </div>
    </div>
  );
};

export default Statistics;
