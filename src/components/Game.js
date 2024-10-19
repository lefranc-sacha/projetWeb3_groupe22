import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';

const Game = () => {
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [randomCountry, setRandomCountry] = useState(null);
  const [countriesFound, setCountriesFound] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let countries;
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

    const selectRandomCountry = () => {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      setRandomCountry(randomCountry);
      return randomCountry;
    };

    const resetCountriesColor = () => {
      svg.selectAll('path.country')
        .style('fill', '#69b3a2');
    };

    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(world => {
      countries = world.features;
      
      const randomCountry = selectRandomCountry();

      svg.append('g')
        .selectAll('path')
        .data(countries)
        .enter().append('path')
        .attr('class', 'country')
        .attr('fill', '#69b3a2')
        .attr('d', path)
        .style('stroke', 'white')
        .style('stroke-width', 0.5)
        .on('mouseover', function (event, d) {
          d3.select(this).style('fill', 'orange');
        })
        .on('mouseout', function (event, d) {
          if (d.properties.name !== randomCountry.properties.name) {
            d3.select(this).style('fill', '#69b3a2');
          }
        })
        .on('click', function (event, d) {
          setAttempts(prev => prev + 1);
          if (d.properties.name === randomCountry.properties.name) {
            d3.select(this).style('fill', 'green');
            setCountriesFound(prev => {
              const newCount = prev + 1;
              if (newCount === 3) {
                endGame();
              } else {
                setTimeout(() => {
                  resetCountriesColor();
                  selectRandomCountry();
                }, 1000);
              }
              return newCount;
            });
          } else {
            d3.select(this).style('fill', 'red');
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
    });
  }, []);

  const endGame = () => {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    navigate('/statistics', { state: { attempts, timeTaken, countriesFound: 3 } });
  };

  return (
    <div>
      <h2>Game</h2>
      {randomCountry && <p>Replace the country: {randomCountry.properties.name}</p>}
      <p>Countries found: {countriesFound} / 3</p>
      <svg></svg>
      <button onClick={endGame}>End Game</button>
    </div>
  );
};

export default Game;