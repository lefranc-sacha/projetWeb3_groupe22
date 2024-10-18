import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';

const Game = () => {
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [randomCountry, setRandomCountry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialiser la carte D3
    const width = 600;
    const height = 600;
    const svg = d3.select('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block')
      .style('margin', '0 auto');

    // Modifier la projection, retirer clipAngle pour éviter les trous blancs
    const projection = d3.geoOrthographic()
      .scale(250)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const graticule = d3.geoGraticule();

    // Ajouter la grille de latitudes et longitudes
    svg.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', 'lightgray'); // Mettre des lignes grises pour la grille

    // Charger les données GeoJSON
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(world => {
      const countries = world.features;
      console.log('Countries loaded:', countries); 
      
      // Sélectionner un pays aléatoire
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      console.log('Random country selected:', randomCountry); 
      setRandomCountry(randomCountry);

      svg.append('g')
        .selectAll('path')
        .data(countries)
        .enter().append('path')
        .attr('fill', '#69b3a2')
        .attr('d', path)
        .style('stroke', 'white')
        .style('stroke-width', 0.5)
        .on('mouseover', function (event, d) {
          d3.select(this).style('fill', 'orange');
        })
        .on('mouseout', function (event, d) {
          d3.select(this).style('fill', '#69b3a2');
        })
        // Ajout du gestionnaire de clic
        .on('click', function (event, d) {
          // Vérifier si le pays cliqué correspond au pays aléatoire
          if (d.properties.name === randomCountry.properties.name) {
            d3.select(this).style('fill', 'green'); // Remplir en vert si c'est correct
          } else {
            d3.select(this).style('fill', 'red'); // Remplir en rouge si c'est incorrect
          }
        });

      // Ajouter des fonctionnalités de rotation
      const drag = d3.drag().on('drag', (event) => {
        const rotate = projection.rotate();
        const k = 0.5;
        projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
        svg.selectAll('path').attr('d', path); // Mettre à jour les chemins avec la nouvelle projection
      });

      svg.call(drag);

      // Ajouter des fonctionnalités de zoom qui affectent l'échelle de la projection
      svg.call(d3.zoom().on('zoom', (event) => {
        const { k } = event.transform;
        projection.scale(250 * k);
        svg.selectAll('path').attr('d', path); // Recalculer les chemins après zoom
      }));
    });

    // Exemple : Incrémenter les tentatives lors du drop
    svg.on('drop', () => setAttempts(attempts + 1));
  }, [attempts]);

  const endGame = () => {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    navigate('/statistics', { state: { attempts, timeTaken } });
  };

  return (
    <div>
      <h2>Game</h2>
      {randomCountry && <p>Replace the country: {randomCountry.properties.name}</p>}
      <svg></svg>
      <button onClick={endGame}>End Game</button>
    </div>
  );
};

export default Game;
