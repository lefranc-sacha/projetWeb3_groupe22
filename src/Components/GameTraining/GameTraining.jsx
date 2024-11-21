/* eslint-disable */
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../images/earth-11048_1920.jpg';
import countriesData from '../../data/countries-readable.json'; // Importation des données réelles

const GameTraining = () => {
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const handleHomePage = () => {
        navigate('/');
    };

    useEffect(() => {
        const width = 600;
        const height = 600;

        const svg = d3.select('svg.world-map')
            .attr('width', width)
            .attr('height', height)
            .style('display', 'block')
            .style('margin', ' auto');

        const projection = d3.geoOrthographic()
            .scale(250)
            .translate([width / 2 + 40, height / 2]);

        const path = d3.geoPath().projection(projection);

        d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then((world) => {
            const enrichedCountries = world.features.map((feature) => {
                const countryName = feature.properties.name;
                const countryInfo = countriesData.find((data) => data.name === countryName);

                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        population: countryInfo ? parseInt(countryInfo.population, 10) : 0,
                        area: countryInfo ? parseInt(countryInfo.area, 10) : 0,
                        capital: countryInfo?.capital || 'Unknown',
                        flag: countryInfo ? `https://flagsapi.com/${countryInfo.alpha_2}/flat/64.png` : '',
                    },
                };
            });

            setCountries(enrichedCountries);

            const populationScale = d3.scaleSequential(d3.interpolateYlOrRd)
                .domain([0, d3.max(enrichedCountries, (d) => d.properties.population * 0.2)]); // Échelle ajustée pour visibilité accrue

            drawMap(enrichedCountries, svg, path, projection, populationScale);
            drawVerticalLegend(svg, populationScale, width, height);
        });
    }, []);

    const drawMap = (countriesList, svg, path, projection, populationScale) => {
        svg.selectAll('g').remove();

        // Draw the sphere (background)
        svg.append('path')
            .datum({ type: 'Sphere' })
            .attr('d', path)
            .attr('fill', '#a0c4ff');

        // Draw countries
        svg.append('g')
            .selectAll('path')
            .data(countriesList)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('fill', (d) => populationScale(d.properties.population))
            .attr('d', path)
            .style('stroke', 'white')
            .style('stroke-width', 0.5)
            .on('click', (event, d) => {
                const countryInfo = {
                    name: d.properties.name,
                    capital: d.properties.capital,
                    flag: d.properties.flag,
                    population: d.properties.population,
                    area: d.properties.area,
                };
                setSelectedCountry(countryInfo);
            })
            .on('mouseover', function () {
                d3.select(this).style('fill', '#FF5733'); // Highlight color on hover
            })
            .on('mouseout', function (event, d) {
                d3.select(this).style('fill', populationScale(d.properties.population));
            });

        // Add drag functionality
        const drag = d3.drag().on('drag', (event) => {
            const rotate = projection.rotate();
            const sensitivity = 0.5; // Adjust sensitivity as needed
            projection.rotate([
                rotate[0] + event.dx * sensitivity,
                rotate[1] - event.dy * sensitivity,
            ]);
            svg.selectAll('path').attr('d', path);
        });
        svg.call(drag);

        // Add zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([1, 5]) // Min and max zoom levels
            .on('zoom', (event) => {
                const { transform } = event;
                projection.scale(250 * transform.k); // Adjust scale based on zoom
                svg.selectAll('path').attr('d', path);
            });

        svg.call(zoom);
    };

    const drawVerticalLegend = (svg, populationScale, width, height) => {
        const legendWidth = 10; // Réduction de la largeur
        const legendHeight = 200; // Réduction de la hauteur
    
        const legend = svg.append('g')
            .attr('transform', `translate(+50, ${height / 2  - legendHeight / 2})`); // Plus proche de la carte
    
        // Create a gradient for the legend
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'legendGradientVertical')
            .attr('x1', '0%')
            .attr('x2', '0%')
            .attr('y1', '100%')
            .attr('y2', '0%'); // Vertical gradient
    
        // Add stops to the gradient
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', d3.interpolateYlOrRd(0)); // Light color
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', d3.interpolateYlOrRd(1)); // Dark color
    
        // Draw the rectangle for the legend
        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legendGradientVertical)');
    
        // Add ticks to the legend
        const legendScale = d3.scaleLinear()
            .domain(populationScale.domain())
            .range([legendHeight, 0]);
    
        const legendAxis = d3.axisLeft(legendScale)
            .ticks(5)
            .tickFormat(d3.format('~s'));
    
        legend.append('g')
            .attr('transform', `translate(-5, 0)`) // Décale les ticks à gauche
            .call(legendAxis);
    
        // Add a title to the legend
        legend.append('text')
            .attr('x', legendWidth + 10) // Décale le texte à droite de la barre
            .attr('y', legendHeight / 2) // Centre verticalement
            .attr('text-anchor', 'middle') // Ancre le texte à gauche (pour alignement à droite de la barre)
            .attr('transform', `rotate(90, ${legendWidth + 10}, ${legendHeight / 2})`) // Rotation pour une lecture verticale
            .style('font-size', '10px')
            .text('Population Scale');

    };
    

    return (
        <div className="app-container-training" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <h1 className="text-center">Training Mode</h1>
            <div className="container border border-primary rounded-4 p-3">
                <div className="row">
                    <div className="col text-center">
                        <h5>Explore countries and their data!</h5>
                    </div>
                </div>
                <div className="row">
                    <div className="container-fluid">
                        <div className="row align-items-center justify-content-center">
                            <div className="col">
                                <svg className="world-map border rounded-4 border-primary"></svg>
                            </div>

                            <div className="col-3 border rounded-4 border-primary">
                                {selectedCountry && (
                                <div className="text-center">
                                    <h3>{selectedCountry.name}</h3>
                                    <img src={selectedCountry.flag} alt={`${selectedCountry.name} Flag`} style={{ width: '100px' }} />
                                    <p><strong>Capital:</strong> {selectedCountry.capital}</p>
                                    <p><strong>Population:</strong> {selectedCountry.population.toLocaleString()}</p>
                                    <p><strong>Area:</strong> {selectedCountry.area.toLocaleString()} km²</p>
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                </div>

                <div className="row mt-3">
                    <div className="col text-center">
                        <button className="btn btn-primary rounded-5" onClick={handleHomePage}>Back to Home</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameTraining;
