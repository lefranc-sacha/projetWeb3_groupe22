import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Statistics = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Récupérer les données transmises depuis Game.jsx
    const {
        totalAttempts,
        timeTaken,
        countriesFound,
        detailedStats
    } = location.state || {};

    // Calculs supplémentaires
    const successRate = ((countriesFound / totalAttempts) * 100); // Taux de réussite
    const averageTimePerCountry = (timeTaken / countriesFound); // Temps moyen par pays
    const incorrectAttempts = totalAttempts - countriesFound; // Tentatives incorrectes
    return (
        <div className="container my-4">
            <h1 className="text-center">Game Statistics</h1>
            <div className="row">
                {/* Statistiques globales */}
                <div className="col-md-6 mx-auto">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title">Global Statistics</h3>
                            <p>Total Attempts: {totalAttempts}</p>
                            <p>Incorrect Attempts: {incorrectAttempts}</p>
                            <p>Countries Found: {countriesFound}</p>
                            <p>Total Time Taken: {timeTaken.toFixed(2)} seconds</p>
                            <p>Average Time Per Country: {averageTimePerCountry} seconds</p>
                            <p>Success Rate: {successRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Détails par pays */}
            <div className="row mt-4">
                <div className="col">
                    <h3 className="text-center">Details by Country</h3>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Country</th>
                                <th>Attempts</th>
                                <th>Time Taken (seconds)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedStats && detailedStats.length > 0 ? (
                                detailedStats.map((stat, index) => (
                                    <tr key={index}>
                                        <td>{stat.country}</td>
                                        <td>{stat.attempts}</td>
                                        <td>{stat.timeTaken}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bouton de retour */}
            <div className="text-center mt-4">
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default Statistics;
