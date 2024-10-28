import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../../images/earth-11048_1920.jpg';


const Game = () => {
    const location = useLocation(); // Récupère l'objet location
    const { gameMode, numberOfQuestions } = location.state; // Accède aux données passées via navigate

    const [totalAttempts, setTotalAttempts] = useState(0); 
    const [incorrectAttempts, setIncorrectAttempts] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [randomCountry, setRandomCountry] = useState(null);
    const [countriesFound, setCountriesFound] = useState(0);
    const [gameEnded, setGameEnded] = useState(false); // New state to track if the game has ended
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
  
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
        .attr('stroke', 'lightgray');
  
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
        .style('fill', '#69b3a2');
    };
  
    const drawMap = (countriesList, randomCountry, svg, path, projection) => {
      svg.selectAll('g').remove();
  
      const countryPaths = svg.append('g')
        .selectAll('path')
        .data(countriesList)
        .enter().append('path')
        .attr('class', 'country')
        .attr('fill', '#69b3a2')
        .attr('d', path)
        .style('stroke', 'white')
        .style('stroke-width', 0.5)
        .on('mouseover', function (event, d) {
          if (d.properties.name !== randomCountry.properties.name || d3.select(this).style('fill') !== 'green') {
            d3.select(this).style('fill', 'orange');
          }
        })
        .on('mouseout', function (event, d) {
          if (d3.select(this).style('fill') !== 'green') {
            d3.select(this).style('fill', '#69b3a2');
          }
        })
        .on('click', function (event, d) {
          console.log("Clicked country:", d.properties.name);
          setTotalAttempts(prev => {
              console.log("Previous total attempts:", prev);
              return prev + 1;
          }); 
  
          if (d.properties.name === randomCountry.properties.name) {
            d3.select(this).style('fill', 'green');
            setCountriesFound(prev => {
              const newCount = prev + 1;
              if (newCount === numberOfQuestions) {
                setGameEnded(true);  // Set gameEnded to true instead of navigating immediately
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
            d3.select(this).style('fill', 'red');
            setIncorrectAttempts(prev => {
              console.log("Incorrect attempt made, previous incorrect attempts:", prev);
              return prev + 1;
            }); 
          }
        });
  
      const drag = d3.drag().on('drag', (event) => {
        const rotate = projection.rotate();
        const k = 0.5;
        projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
        svg.selectAll('path').attr('d', path);
      });
  
      svg.call(drag);
  
      svg.call(d3.zoom().on('zoom', (event) => {
        const { k } = event.transform;
        projection.scale(250 * k);
        svg.selectAll('path').attr('d', path);
      }));
    };
  
    const endGame = () => {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
  
      // Navigate to the statistics page with game data
      navigate('/statistics', { state: { totalAttempts, incorrectAttempts, timeTaken, countriesFound } });
    };
  
    // Monitor the gameEnded state and navigate when it changes
    useEffect(() => {
      if (gameEnded) {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;
        navigate('/statistics', { state: { totalAttempts, incorrectAttempts, timeTaken, countriesFound} });
      }
    }, [gameEnded, totalAttempts, incorrectAttempts, startTime, navigate]);
  

  return (
    <div className="app-container-game" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
    <div>
      <h2 className="text-center">Game</h2>
      <div className="container">
        <div className="row align-items-center">
          <div className="col border border-primary rounded rounded-4 bg-overlay">
            <p>Game mode: {gameMode}</p>
            <p>Number of questions: {numberOfQuestions}</p>
            {randomCountry && <p>Replace the country: {randomCountry.properties.name}</p>}
            <p>Countries found: {countriesFound} / {numberOfQuestions}</p>
            <svg></svg>
          </div>
        </div>
      </div>
  
      <div className="row py-3">
        <div className="col text-center">
          <button onClick={endGame} className="btn btn-primary rounded-5">End Game</button>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default Game;
