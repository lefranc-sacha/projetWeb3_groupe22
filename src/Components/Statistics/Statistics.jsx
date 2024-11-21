import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../../images/earth-11048_1920.jpg';

const Statistics = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        totalAttempts = 0,
        timeTaken = 0,
        countriesFound = 0,
        detailedStats = [],
    } = location.state || {};

    const incorrectAttempts = totalAttempts - countriesFound;
    const successRate = totalAttempts > 0 ? ((countriesFound / totalAttempts) * 100).toFixed(2) : 0;
    const averageTimePerCountry = countriesFound > 0 ? (timeTaken / countriesFound).toFixed(2) : 0;

    useEffect(() => {
        clearAndDraw('#pie-chart', () => drawPieChart(countriesFound, incorrectAttempts));
        clearAndDraw('#histogram', () => drawHistogram(detailedStats));
        clearAndDraw('#bar-chart', () => drawBarChart(detailedStats, averageTimePerCountry));
    }, [countriesFound, incorrectAttempts, detailedStats, averageTimePerCountry]);

    const clearAndDraw = (selector, drawFunction) => {
        d3.select(selector).selectAll('*').remove(); // Supprimer les éléments précédents
        drawFunction(); // Dessiner le graphique
    };

    const drawPieChart = (goodAttempts, badAttempts) => {
        const data = [
            { label: 'Correct', value: goodAttempts },
            { label: 'Incorrect', value: badAttempts },
        ];

        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;

        const svg = d3
            .select('#pie-chart')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal().domain(data).range(['#69b3a2', '#ff6f61']);

        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const arcHover = d3.arc().innerRadius(0).outerRadius(radius + 10);

        svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.label))
            .style('opacity', 0.7)
            .on('mouseover', function (event, d) {
                d3.select(this).transition().duration(200).attr('d', arcHover);
            })
            .on('mouseout', function () {
                d3.select(this).transition().duration(200).attr('d', arc);
            });

        // Ajouter les statistiques dans le camembert
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', radius + 30)
            .text(`Success Rate: ${successRate}%`)
            .style('font-size', '14px')
            .style('font-weight', 'bold');
    };

    const drawHistogram = (stats) => {
        const margin = { top: 20, right: 20, bottom: 40, left: 50 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3
            .select('#histogram')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand().range([0, width]).padding(0.1).domain(stats.map(d => d.country));
        const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(stats, d => d.attempts)]);

        svg.selectAll('rect')
            .data(stats)
            .enter()
            .append('rect')
            .attr('x', d => x(d.country))
            .attr('y', height)
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .attr('fill', '#69b3a2')
            .transition()
            .duration(800)
            .attr('y', d => y(d.attempts))
            .attr('height', d => height - y(d.attempts));

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-0.8em')
            .attr('dy', '0.15em')
            .attr('transform', 'rotate(-40)');

        svg.append('g').call(d3.axisLeft(y));
    };

    const drawBarChart = (stats, avgTime) => {
        const margin = { top: 20, right: 20, bottom: 40, left: 100 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3
            .select('#bar-chart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleLinear().range([0, width]).domain([0, d3.max(stats, d => d.timeTaken)]);
        const y = d3.scaleBand().range([0, height]).padding(0.1).domain(stats.map(d => d.country));

        svg.selectAll('rect')
            .data(stats)
            .enter()
            .append('rect')
            .attr('y', d => y(d.country))
            .attr('width', 0)
            .attr('height', y.bandwidth())
            .attr('fill', d => (d.timeTaken > avgTime ? '#ff6f61' : '#69b3a2'))
            .transition()
            .duration(800)
            .attr('width', d => x(d.timeTaken));

        svg.append('g').call(d3.axisLeft(y));
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));
    };

    return (
        <div
    className="container-fluid vh-100 d-flex flex-column"
    style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflowY: 'auto',
    }}
>

            <h1 className="text-center text-white">Statistics</h1>

            <div className="container p-1">
                <div className="row">
                    <div className="col-6">
                        <div className="container border border-primary rounded-4 p-3 overflow-auto">
                            <h3 className="text-center">Attempts Distribution</h3>
                            <svg id="pie-chart" className="d-block w-100" style={{ height: '300px' }}></svg>
                            <ul>
                                <li>Total Attempts: {totalAttempts}</li>
                                <li>Correct: {countriesFound}</li>
                                <li>Incorrect: {incorrectAttempts}</li>
                                <li>Success Rate: {successRate}%</li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="container border border-primary rounded-4 p-3 overflow-auto">
                            <h3 className="text-center">Attempts by Country</h3>
                            <svg id="histogram" className="d-block w-100" style={{ height: '300px' }}></svg>
                        </div>
                        
                    </div>
                </div>


                <div className="row py-3">
                    <div className="container border border-primary rounded-4 p-3 overflow-auto">
                        <div className="col">
                            <h3 className="text-center">Time Taken by Country</h3>
                            <svg id="bar-chart" className="d-block w-100" style={{ height: '300px' }}></svg>
                            <p>Total Time Taken: {timeTaken.toFixed(2)} seconds</p>
                            <p>Average Time Per Country: {averageTimePerCountry} seconds</p>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="text-center">
                        <button className="btn btn-primary rounded-5" onClick={() => navigate('/')}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
