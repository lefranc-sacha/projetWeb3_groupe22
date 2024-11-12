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
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);

    // Colors using d3-color
    const baseColor = d3.color('#69b3a2');
    const hoverColor = d3.color('orange');
    const correctColor = d3.color('green');
    const incorrectColor = d3.color('red');
    
    // Create lighter/darker variants using d3-color methods
    const lighterBase = baseColor.brighter(0.5);
    const darkerBase = baseColor.darker(0.5);

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

        const projection = d3.geoOrthographic()
            .scale(250)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        const graticule = d3.geoGraticule();

        svg.append('path')
            .datum(graticule)
            .attr('class', 'graticule')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', d3.color('lightgray').toString());

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
            .style('fill', baseColor.toString());
    };

    const drawMap = (countriesList, randomCountry, svg, path, projection) => {
        svg.selectAll('g').remove();

        // Dessiner le globe en bleu pour les océans
        svg.append('path')
            .datum({ type: 'Sphere' })  // Créer une sphère qui représente l'ensemble du globe
            .attr('d', path)
            .attr('fill', '#a0c4ff');  // Couleur bleu océan

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
                    d3.select(this).style('fill', hoverColor.toString());
                }
            })
            .on('mouseout', function(event, d) {
                if (d3.select(this).style('fill') !== correctColor.toString()) {
                    d3.select(this).style('fill', baseColor.toString());
                }
            })
            .on('click', function(event, d) {
                setTotalAttempts(prev => prev + 1);

                if (d.properties.name === randomCountry.properties.name) {
                    d3.select(this).style('fill', correctColor.toString());
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
                    d3.select(this).style('fill', incorrectColor.toString());
                    setIncorrectAttempts(prev => prev + 1);
                }
            });

        const drag = d3.drag().on('drag', (event) => {
            const rotate = projection.rotate();
            const k = 0.5;
            projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
            svg.selectAll('path').attr('d', path);
        });

        svg.call(drag);

        // Configure le zoom avec les limites
        const zoom = d3.zoom()
        .scaleExtent([1, 5]) // Limites du zoom
        .on('zoom', (event) => {
            const { k } = event.transform;
            projection.scale(250 * k);
            svg.selectAll('path').attr('d', path);
        });

        // Applique le comportement de zoom au SVG
        svg.call(zoom);

        // Désactive le comportement par défaut de défilement de la page quand on est sur l'élément SVG
        svg.on("wheel", (event) => {
        event.preventDefault();  // Empêche le zoom de la page
        });
    };

    const endGame = () => {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;
        navigate('/statistics', { 
            state: { 
                totalAttempts, 
                incorrectAttempts, 
                timeTaken, 
                countriesFound 
            } 
        });
    };

    useEffect(() => {
        if (gameEnded) {
            const endTime = Date.now();
            const timeTaken = (endTime - startTime) / 1000;
            navigate('/statistics', { 
                state: { 
                    totalAttempts, 
                    incorrectAttempts, 
                    timeTaken, 
                    countriesFound
                } 
            });
        }
    }, [gameEnded, totalAttempts, incorrectAttempts, startTime, navigate]);

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
