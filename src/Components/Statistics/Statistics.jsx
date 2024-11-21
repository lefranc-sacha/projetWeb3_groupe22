// eslint-disable-next-line no-unused-vars
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
    
        // Sélection du SVG et initialisation
        const svg = d3
            .select('#pie-chart')
            .attr('viewBox', `0 0 ${width} ${height}`) // ViewBox pour gérer la responsivité
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
        const color = d3.scaleOrdinal().domain(data.map(d => d.label)).range(['#69b3a2', '#ff6f61']);
    
        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
    
        // Création des segments
        svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.label))
            .style('opacity', 0.9)
            .on('mouseover', function (event, d) {
                d3.select(this).style('opacity', 1); // Accentuation simple
                svg.append('text')
                    .attr('id', 'tooltip')
                    .attr('x', arc.centroid(d)[0])
                    .attr('y', arc.centroid(d)[1])
                    .attr('text-anchor', 'middle')
                    .attr('dy', '-10px')
                    .style('font-size', '12px')
                    .style('font-weight', 'bold')
                    .style('fill', '#333')
                    .text(d.data.label === 'Correct' ? `Good: ${d.data.value}` : `Bad: ${d.data.value}`);
            })
            .on('mouseout', function () {
                d3.select(this).style('opacity', 0.9); // Retour à l'état initial
                d3.select('#tooltip').remove(); // Supprimer le texte au survol
            });
    };

    const drawHistogram = (stats) => {
        const margin = { top: 30, right: 0, bottom: 150, left: 80 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
    
        const svg = d3
            .select('#histogram')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
        const x = d3.scaleBand().range([0, width]).padding(0.1).domain(stats.map(d => d.country));
        const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(stats, d => d.attempts)]);
    
        // Création des barres du graphique
        svg.selectAll('rect')
            .data(stats)
            .enter()
            .append('rect')
            .attr('x', d => x(d.country))
            .attr('y', height)
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .attr('fill', '#69b3a2')
            .on('mouseover', function (event, d) {
                // Afficher la valeur au survol
                svg.append('text')
                    .attr('id', 'tooltip')
                    .attr('x', x(d.country) + x.bandwidth() / 2)
                    .attr('y', y(d.attempts) - 10)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '14px') // Taille du texte des tooltips
                    .text(d.attempts);
            })
            .on('mouseout', function () {
                // Retirer la valeur au sortir de la barre
                d3.select('#tooltip').remove();
            })
            .transition()
            .duration(800)
            .attr('y', d => y(d.attempts))
            .attr('height', d => height - y(d.attempts));
    
        // Création de l'axe X
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '14px') // Agrandir la taille du texte de l'axe X
            .style('text-anchor', 'end')
            .attr('dx', '-0.8em')
            .attr('dy', '0.15em')
            .attr('transform', 'rotate(-40)');
    
        // Création de l'axe Y
        svg.append('g')
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('font-size', '14px'); // Agrandir la taille du texte de l'axe Y
    };
    

    const drawBarChart = (stats, avgTime) => {
        const margin = { top: 10, right: 10, bottom: 150, left: 40 };
        const width = 750 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
    
        const svg = d3
            .select('#bar-chart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
        // Inverser X et Y
        const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(stats, d => d.timeTaken)]);
        const x = d3.scaleBand().range([0, width]).padding(0.1).domain(stats.map(d => d.country));
    
        // Ajout des barres
        svg.selectAll('rect')
            .data(stats)
            .enter()
            .append('rect')
            .attr('x', d => x(d.country))
            .attr('width', x.bandwidth())
            .attr('fill', d => (d.timeTaken > avgTime ? '#ff6f61' : '#69b3a2'))
            .transition()
            .duration(800)
            .attr('y', d => y(d.timeTaken))
            .attr('height', d => height - y(d.timeTaken));
    
        // Ajout des axes
        svg.append('g')
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('font-size', '14px'); // Agrandir le texte vertical
    
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-size', '14px') // Agrandir le texte horizontal
            .attr('transform', 'rotate(-45)') // Inclinaison pour meilleure lisibilité si nécessaire
            .style('text-anchor', 'end');
    };
    

    return (
        <div className="container-fluid vh-100 d-flex flex-column"
        style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflowY: 'auto',
        }}
        >

            <h1 className="text-center text-white">Statistics</h1>

            <div className="container p-1">

                <div className="row border-4">

                    <div className="col align-self-end">
                        <div className="container border border-primary rounded-4 p-3 overflow-auto">
                            <div className="row">
                                <div className="col">
                                <h3 className="text-center">Attempts Distribution</h3>
                                </div>
                            </div>
                            
                            <div className="row">
                                <div className="col">
                                <svg id="pie-chart"></svg>
                                </div>
                            </div>
                            
                            <div className="row">
                                <div className="col">
                                    <ul>
                                        <li>Total Attempts: {totalAttempts}</li>
                                        <li>Correct: {countriesFound}</li>
                                        <li>Incorrect: {incorrectAttempts}</li>
                                        <li>Success Rate: {successRate}%</li>
                                    </ul>
                                </div>
                            </div>
                        
                        </div>
                    </div>

                    <div className="col align-self-center">
                        <div className="container-fluid border border-primary rounded-4 p-3 overflow-auto bg-body">
                            <div className="row">
                                <div className="col">
                                <h3>Attempts by Country</h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <svg id="histogram"></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


                <div className="row py-3">
                    <div className="container border border-primary rounded-4 p-3">
                        <div className="row">
                            <div className="col">
                                <h3 className="text-center">Time Taken by Country</h3>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <svg id="bar-chart"></svg>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <p>You have taken a total of {timeTaken.toFixed(2)} seconds to finish or stop the game.</p>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <p>Your average time per country is {averageTimePerCountry} seconds</p>
                            </div>
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
