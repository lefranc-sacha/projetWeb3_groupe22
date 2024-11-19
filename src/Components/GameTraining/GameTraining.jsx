/* eslint-disable */
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../images/earth-11048_1920.jpg';

// Simulation de données pour les pays
const generateCountryData = (countries) => {
    return countries.map((country) => ({
        ...country,
        properties: {
            ...country.properties,
            population: Math.floor(Math.random() * 1000000000), // Population entre 0 et 1 milliard
            gdp: Math.floor(Math.random() * 20000) * 1000000000, // PIB entre 0 et 20 billions
            area: Math.floor(Math.random() * 10000000), // Superficie entre 0 et 10 millions km²
        },
    }));
};

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
            const loadedCountries = generateCountryData(world.features);
            setCountries(loadedCountries);

            const populationScale = d3.scaleSequential(d3.interpolateBlues)
                .domain([0, d3.max(loadedCountries, (d) => d.properties.population)]);

            drawMap(loadedCountries, svg, path, projection, populationScale);
        });
    }, []);

    const drawMap = (countriesList, svg, path, projection, populationScale) => {
        svg.selectAll('g').remove();

        svg.append('path')
            .datum({ type: 'Sphere' })
            .attr('d', path)
            .attr('fill', '#a0c4ff');

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
            .on('click', async function (event, d) {
                try {
                    const countryCode = await getCountryCode(d.properties.name);
                    const countryInfo = {
                        name: d.properties.name,
                        flag: `https://flagsapi.com/${countryCode}/flat/64.png`,
                        population: d.properties.population,
                        gdp: d.properties.gdp,
                        area: d.properties.area,
                    };
                    setSelectedCountry(countryInfo);
                    setCountryData(countryInfo);

                    svg.selectAll('path')
                        .style('stroke-width', (p) => (p === d ? 2 : 0.5))
                        .style('stroke', (p) => (p === d ? '#FFA500' : 'white'));
                } catch (error) {
                    console.error('Error fetching country data:', error);
                }
            })
            .on('mouseover', function () {
                d3.select(this).style('fill', 'orange');
            })
            .on('mouseout', function (event, d) {
                d3.select(this).style('fill', populationScale(d.properties.population));
            });

        const drag = d3.drag().on('drag', (event) => {
            const rotate = projection.rotate();
            const k = 0.5;
            projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
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

    async function getCountryCode(countryName) {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        const data = await response.json();
        if (response.ok) {
            return data[0].cca2;
        } else {
            throw new Error('Country not found');
        }
    }

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
            { name: 'Population', value: countryData.population, unit: 'millions', divider: 1000000 },
            { name: 'GDP', value: countryData.gdp, unit: 'billions $', divider: 1000000000 },
            { name: 'Area', value: countryData.area, unit: 'km²', divider: 1 },
        ];

        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map((d) => d.name))
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, (d) => d.value / d.divider)])
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
            .attr('y', (d) => y(d.value / d.divider))
            .attr('width', x.bandwidth())
            .attr('height', (d) => height - y(d.value / d.divider))
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
                        <svg className="world-map border rounded-4 border-primary"></svg>
                    </div>
                    {selectedCountry && (
                        <div className="col-4 border rounded-4 border-primary p-3">
                            <h3 className="text-center mb-3">{selectedCountry.name}</h3>
                            <img
                                src={selectedCountry.flag}
                                alt={`Flag of ${selectedCountry.name}`}
                                style={{ display: 'block', margin: '10px auto', width: '64px', height: 'auto' }}
                            />
                            <svg id="bar-chart"></svg>
                        </div>
                    )}
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
