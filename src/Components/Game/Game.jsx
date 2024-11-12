import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../../images/earth-11048_1920.jpg';

const Game = () => {
    const location = useLocation();
    const { gameMode, numberOfQuestions } = location.state;

    const [totalAttempts, setTotalAttempts] = useState(0);
    const [incorrectAttempts, setIncorrectAttempts] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [randomCountry, setRandomCountry] = useState(null);
    const [countriesFound, setCountriesFound] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timer, setTimer] = useState(null);
    const [autoRotate, setAutoRotate] = useState(true); // Nouvelle state pour la rotation automatique
    const [streak, setStreak] = useState(0); // Nouvelle state pour les séries de bonnes réponses
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);

    // Couleurs améliorées avec des transitions
    const baseColor = d3.color('#69b3a2');
    const hoverColor = d3.color('orange');
    const correctColor = d3.color('#28a745');
    const incorrectColor = d3.color('#dc3545');
    const oceanColor = d3.color('#A8E1FF');

    useEffect(() => {
        const t = d3.timer((elapsed) => {
            setElapsedTime(elapsed);
        });
        setTimer(t);
        return () => t.stop();
    }, []);

    useEffect(() => {
        if (gameEnded && timer) {
            timer.stop();
        }
    }, [gameEnded, timer]);

    useEffect(() => {
        const width = 600;
        const height = 600;
        const svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height)
            .style('display', 'block')
            .style('margin', '0 auto');

        // Ajout de l'océan
        svg.append('circle')
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', 250)
            .attr('fill', oceanColor.toString())
            .attr('class', 'ocean');

        const projection = d3.geoOrthographic()
            .scale(250)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // Graticules améliorés
        const graticule = d3.geoGraticule()
            .step([10, 10]);

        svg.append('path')
            .datum(graticule)
            .attr('class', 'graticule')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', '#DDD')
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0.5);

            d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(world => {
              const loadedCountries = world.features;
              setCountries(loadedCountries);
              const initialRandomCountry = selectRandomCountry(loadedCountries);
              setRandomCountry(initialRandomCountry);
              drawMap(loadedCountries, initialRandomCountry, svg, path, projection);
          });
      }, []);

    const selectRandomCountry = (countriesList) => {
        const randomCountry = countriesList[Math.floor(Math.random() * countriesList.length)];
        setRandomCountry(randomCountry);
        return randomCountry;
    };

    const resetCountriesColor = (svg) => {
        svg.selectAll('path.country')
            .transition()
            .duration(500)
            .style('fill', baseColor.toString());
    };

    const drawMap = (countriesList, randomCountry, svg, path, projection) => {
        svg.selectAll('g').remove();

        const countryPaths = svg.append('g')
            .selectAll('path')
            .data(countriesList)
            .enter().append('path')
            .attr('class', 'country')
            .attr('fill', baseColor.toString())
            .attr('d', path)
            .style('stroke', 'white')
            .style('stroke-width', 0.5)
            .on('mouseover', function(event, d) {
                if (d.properties.name !== randomCountry.properties.name || 
                    d3.select(this).style('fill') !== correctColor.toString()) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style('fill', hoverColor.toString());
                }
            })
            .on('mouseout', function(event, d) {
                if (d3.select(this).style('fill') !== correctColor.toString()) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style('fill', baseColor.toString());
                }
            })
            .on('click', function(event, d) {
                setTotalAttempts(prev => prev + 1);

                if (d.properties.name === randomCountry.properties.name) {
                    // Animation de réussite
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .style('fill', correctColor.toString())
                        .style('transform', 'scale(1.05)')
                        .transition()
                        .duration(500)
                        .style('transform', 'scale(1)');

                    // Mise à jour du streak
                    setStreak(prev => prev + 1);
                    
                    setCountriesFound(prev => {
                        const newCount = prev + 1;
                        if (newCount === numberOfQuestions) {
                            setGameEnded(true);
                        } else {
                            setTimeout(() => {
                                resetCountriesColor(svg);
                                const newRandomCountry = selectRandomCountry(countriesList);
                                drawMap(countriesList, newRandomCountry, svg, path, projection);
                            }, 1000);
                        }
                        return newCount;
                    });
                } else {
                    // Animation d'erreur
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .style('fill', incorrectColor.toString())
                        .transition()
                        .duration(300)
                        .style('fill', baseColor.toString());

                    // Réinitialisation du streak
                    setStreak(0);
                    setIncorrectAttempts(prev => prev + 1);
                }
            });

        // Gestion améliorée du drag avec inertie
        const drag = d3.drag()
            .on('start', () => {
                if (autoRotate) setAutoRotate(false);
            })
            .on('drag', (event) => {
                const rotate = projection.rotate();
                const k = 0.5;
                projection.rotate([
                    rotate[0] + event.dx * k,
                    rotate[1] - event.dy * k
                ]);
                svg.selectAll('path').attr('d', path);
            });

        svg.call(drag);

        // Zoom amélioré avec limites et transitions fluides
        const zoom = d3.zoom()
            .scaleExtent([0.8, 5])
            .on('zoom', (event) => {
                const { transform } = event;
                projection.scale(250 * transform.k);
                svg.selectAll('path')
                    .transition()
                    .duration(50)
                    .attr('d', path);
                svg.select('.ocean')
                    .transition()
                    .duration(50)
                    .attr('r', projection.scale());
            });

        svg.call(zoom);
    };

    const endGame = () => {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;
        navigate('/statistics', { 
            state: { 
                totalAttempts, 
                incorrectAttempts, 
                timeTaken, 
                countriesFound,
                streak 
            } 
        });
    };

    const toggleRotation = () => {
        setAutoRotate(!autoRotate);
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
                            <p>Current streak: {streak}</p>
                            <svg></svg>
                        </div>
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
    );
};

export default Game;