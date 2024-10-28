import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import backgroundImage from '../../images/earth-11048_1920.jpg';

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
    <div className="app-container-statistics" style={{ 
      backgroundImage: `url(${backgroundImage})`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
  }}>
      <div className="container">
          <h1 className="text-center mb-4">Statistics</h1>
          <div className="container border border-primary rounded-4" style={{ 
              maxWidth: '500px',  // Limite la largeur du conteneur
              margin: '0 auto'    // Centre horizontalement
          }}>
              <div className="row">
                  <div className="col text-center py-4">  {/* Ajout de padding vertical */}
                      <p>Countries found: {countriesFound}</p>
                      <p>Incorrect Attempts: {incorrectAttempts}</p>
                      <p>Accuracy: {accuracy}%</p>
                      <p>Time taken: {timeTaken.toFixed(2)} seconds</p>
                      <button type="button" className="btn btn-primary rounded-5 my-2" onClick={handleRestartGame}>
                          Restart Game
                      </button>
                  </div>
              </div>
          </div>
      </div>
  </div>
  );
};

export default Statistics;
