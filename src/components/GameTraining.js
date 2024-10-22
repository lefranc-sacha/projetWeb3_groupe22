import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Link } from 'react-router-dom'; // Importation de Link pour la navigation

const GameTraining = () => {
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
      drawMap(loadedCountries, svg, path, projection);
    });
  }, []);

  const drawMap = (countriesList, svg, path, projection) => {
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
        d3.select(this).style('fill', 'orange');

        d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', '#fff')
          .style('padding', '5px 10px')
          .style('border-radius', '4px')
          .style('pointer-events', 'none')
          .html(d.properties.name);
      })
      .on('mouseout', function () {
        d3.select(this).style('fill', '#69b3a2');
        d3.select('.tooltip').remove();
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

  return (
    <div>
      <h2>Mode d'entraînement</h2>
      <p>Survolez un pays pour voir son nom.</p>
      <svg></svg>

      {/* Ajout d'un bouton pour revenir à la page d'accueil */}
      <Link to="/" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none', color: 'blue', fontWeight: 'bold' }}>
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default GameTraining;
