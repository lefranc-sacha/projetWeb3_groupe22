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
    const [countryData, setCountryData] = useState(null);

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
            .style('margin', '0 auto');

        const projection = d3.geoOrthographic()
            .scale(250)
            .translate([width / 2, height / 2]);

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

            const populationScale = d3.scaleSequential(d3.interpolateBlues)
                .domain([0, d3.max(enrichedCountries, (d) => d.properties.population)]);

            drawMap(enrichedCountries, svg, path, projection, populationScale);
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
                setCountryData(countryInfo);
            })
            .on('mouseover', function () {
                d3.select(this).style('fill', 'orange');
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

    useEffect(() => {
        if (countryData) {
            drawBarChart();
        }
    }, [countryData]);

    const drawBarChart = () => {
        d3.select('#bar-chart').selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 60, left: 80 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3.select('#bar-chart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const data = [
            { name: 'Population', value: countryData.population, unit: 'people' },
            { name: 'Area', value: countryData.area, unit: 'km²' },
        ];

        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map((d) => d.name))
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, (d) => d.value)])
            .range([height, 0]);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        svg.append('g').call(d3.axisLeft(y));

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', (d) => x(d.name))
            .attr('y', (d) => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', (d) => height - y(d.value))
            .attr('fill', '#69b3a2');
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

                <div className="row align-items-center">
                    <div className="col">
                        <svg className='world-map border rounded-4 border-primary'></svg>
                    </div>

                    <div className="col-3 border rounded-4 border-primary">
                        <div className="container  ">
                            <div className="row ">
                                <div className="col ">
                                {selectedCountry && (
                                    <div>
                                        <h3 className='text-center'>{selectedCountry.name}</h3>
                                    </div>
                                )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col text-center">
                                    {selectedCountry && (
                                        <img src={selectedCountry.flag} alt={`Drapeau de ${selectedCountry.name}`} style={{ width: '100px', height: 'auto' }} />
                                    )}
                                    
                                </div>
                            </div>

                            <div className="row">
                                <div className="col text-center">
                                    {selectedCountry && (
                                        <p><strong>Capitale :</strong> {selectedCountry.capital}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                


                <div className="row border rounded-4 border-primary m-3">
                    <div className="col text-center">
                        <h5>Statistics:</h5>

                        <div>
                            <svg id="bar-chart"></svg>
                        </div>
                    </div>
                </div>


            </div>
            <div className="row mt-3">
                <div className="col text-center">
                    <button type="button" className="btn btn-primary rounded-5 my-2" onClick={handleHomePage}>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameTraining;
