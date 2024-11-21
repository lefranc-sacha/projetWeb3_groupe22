import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../../images/earth-11048_1920.jpg';

const Game = () => {
    const location = useLocation();
    const { gameMode, numberOfQuestions } = location.state;

    const [countriesFound, setCountriesFound] = useState(0);
    const [randomCountry, setRandomCountry] = useState(null);
    const [detailedStats, setDetailedStats] = useState([]);
    const [gameEnded, setGameEnded] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0); // Chrono global affiché
    const [startTime, setStartTime] = useState(Date.now()); // Point de départ global
    const [countries, setCountries] = useState([]);
    const [totalTimeTaken, setTotalTimeTaken] = useState(0);
    const [totalAttemptsCount, setTotalAttemptsCount] = useState(0);

    const navigate = useNavigate();

    let tampon = 0; // Tampon pour les tentatives précédentes
    let countryStartTime = Date.now(); // Temps de départ pour le pays actuel

    // Colors using d3-color
    const baseColor = d3.color('#69b3a2');
    const hoverColor = d3.color('orange');
    const correctColor = d3.color('green');
    const incorrectColor = d3.color('red');

    // Fetch and draw the map
    useEffect(() => {
        const width = 600;
        const height = 600;

        const svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height)
            .style('display', 'block')
            .style('margin', '0 auto');

        const projection = d3.geoOrthographic()
            .scale(250)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
            .then(world => {
                const loadedCountries = world.features;
                setCountries(loadedCountries);
                const initialRandomCountry = selectRandomCountry(loadedCountries);
                setRandomCountry(initialRandomCountry);
                drawMap(loadedCountries, initialRandomCountry, svg, path, projection);
            });
    }, []);

    // Chrono global affiché (en hh:mm:ss)
    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000; // Temps global en secondes avec centièmes
            setElapsedTime(Math.floor(elapsed)); // Pour l'affichage en hh:mm:ss
            setTotalTimeTaken(elapsed); // Chrono avec centièmes pour les statistiques
        }, 100);

        return () => clearInterval(interval); // Nettoyage
    }, [startTime]);

    // Format Timer pour l'affichage
    const formatTime = (seconds) => {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    // Naviguer vers les statistiques une fois le jeu terminé
    useEffect(() => {
        if (gameEnded) {
            navigate('/statistics', {
                state: {
                    detailedStats,
                    totalAttempts: totalAttemptsCount,
                    timeTaken: totalTimeTaken,
                    averageTimePerCountry: totalTimeTaken / countriesFound,
                    successRate: totalAttemptsCount > 0 ? (countriesFound / totalAttemptsCount) * 100 : 0,
                    countriesFound,
                }
            });
        }
    }, [gameEnded, navigate, detailedStats, countriesFound, totalTimeTaken, totalAttemptsCount]);

    const selectRandomCountry = (countriesList) => {
        const randomCountry = countriesList[Math.floor(Math.random() * countriesList.length)];
        setRandomCountry(randomCountry);
        countryStartTime = Date.now(); // Réinitialiser le chrono pour le pays actuel
        return randomCountry;
    };

    const resetCountriesColor = (svg) => {
        svg.selectAll('path.country').style('fill', baseColor.toString());
    };

    const drawMap = (countriesList, randomCountry, svg, path, projection) => {
        svg.selectAll('g').remove();

        // Dessiner le globe
        svg.append('path')
            .datum({ type: 'Sphere' })
            .attr('d', path)
            .attr('fill', '#a0c4ff');

        const countryGroups = svg.append('g')
            .selectAll('g')
            .data(countriesList)
            .enter()
            .append('g')
            .attr('class', 'country-group');

        // Dessiner les chemins des pays
        countryGroups.append('path')
            .attr('class', 'country')
            .attr('fill', baseColor.toString())
            .attr('d', path)
            .style('stroke', 'white')
            .style('stroke-width', 0.5)
            .on('mouseover', function () {
                d3.select(this).style('fill', hoverColor.toString());
            })
            .on('mouseout', function () {
                d3.select(this).style('fill', baseColor.toString());
            })
            .on('click', function (event, d) {
                setTotalAttemptsCount(prev => {
                    const newTotalAttempts = prev + 1;

                    if (d.properties.name === randomCountry.properties.name) {
                        const currentAttempts = newTotalAttempts - tampon;
                        const timeTaken = parseFloat(((Date.now() - countryStartTime) / 1000).toFixed(2));
                        tampon += currentAttempts;

                        setDetailedStats(prev => [
                            ...prev,
                            {
                                country: d.properties.name,
                                attempts: currentAttempts,
                                timeTaken,
                            }
                        ]);

                        countryStartTime = Date.now(); // Réinitialiser le chrono pour le prochain pays

                        const selectedGroup = d3.select(this.parentNode);
                        const bbox = this.getBBox();
                        const centerX = bbox.x + bbox.width / 2;
                        const centerY = bbox.y + bbox.height / 2;

                        selectedGroup
                            .raise()
                            .transition()
                            .duration(500)
                            .attr(
                                'transform',
                                `translate(${centerX}, ${centerY}) scale(1.5) translate(${-centerX}, ${-centerY})`
                            )
                            .transition()
                            .duration(500)
                            .attr('transform', 'translate(0,0) scale(1)');

                        d3.select(this)
                            .style('fill', correctColor.toString())
                            .style('stroke', 'yellow')
                            .style('stroke-width', 3);

                        setCountriesFound(prev => {
                            const newCount = prev + 1;

                            if (newCount === numberOfQuestions) {
                                setGameEnded(true);
                            } else {
                                setTimeout(() => {
                                    resetCountriesColor(svg);
                                    const newRandomCountry = selectRandomCountry(countriesList);
                                    setRandomCountry(newRandomCountry);
                                    drawMap(countriesList, newRandomCountry, svg, path, projection);
                                }, 1000);
                            }

                            return newCount;
                        });
                    } else {
                        d3.select(this).style('fill', incorrectColor.toString());
                    }

                    return newTotalAttempts;
                });
            });

        const drag = d3.drag().on('drag', (event) => {
            const rotate = projection.rotate();
            const sensitivity = 0.5;
            projection.rotate([rotate[0] + event.dx * sensitivity, rotate[1] - event.dy * sensitivity]);
            svg.selectAll('path').attr('d', path);
        });

        svg.call(drag);

        const zoom = d3.zoom()
            .scaleExtent([1, 5])
            .on('zoom', (event) => {
                const { k } = event.transform;
                projection.scale(250 * k);
                svg.selectAll('path').attr('d', path);
            });

        svg.call(zoom);
    };

    const endGame = () => {
        setGameEnded(true);
    };

    return (
        <div className="app-container-game" style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div>
                <h2 className="text-center">Game</h2>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col border border-primary rounded rounded-4 bg-overlay">
                            <p>Game mode: {gameMode}</p>
                            <p>Number of questions: {numberOfQuestions}</p>
                            {randomCountry && <p>Find this country: {randomCountry.properties.name}</p>}
                            <p>Countries found: {countriesFound} / {numberOfQuestions}</p>
                            <div className="text-center my-3">
                                <h3>Timer: {formatTime(elapsedTime)}</h3>
                            </div>
                            <svg className="border rounded-4 border-primary"></svg>
                        </div>
                    </div>
                    <div className="row py-3">
                        <div className="col text-center">
                            <button onClick={endGame} className="btn btn-primary rounded-5">
                                End Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
