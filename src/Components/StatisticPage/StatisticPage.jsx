import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';

const CountryComparison = () => {
    const navigate = useNavigate();
    const handleHomePage = () => {
        navigate('/');
    };
    useEffect(() => {
        // Charger le fichier JSON
        d3.json('src/data/countries-readable.json').then(data => {
            // Extraire les informations nécessaires
            const countries = data.slice(0, 50); // Limitez le nombre de pays pour une visualisation claire
            const populations = countries.map(d => +d.population);
            const areas = countries.map(d => +d.area);
            const currencies = countries.map(d => d.currency_name);
            const languages = countries.map(d => d.languages);

            drawBarChart('#population-chart', populations, countries.map(d => d.name), 'Population');
            drawBarChart('#area-chart', areas, countries.map(d => d.name), 'Superficie (km²)');
            drawPieChart('#currency-chart', currencies, 'Monnaies utilisées');
            drawPieChart('#language-chart', languages, 'Langues parlées');
        });
    }, []);

    // Fonction pour dessiner un bar chart
    const drawBarChart = (id, data, labels, title) => {
        const width = 400, height = 300, margin = { top: 20, right: 20, bottom: 50, left: 60 };
        const svg = d3.select(id)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand().domain(labels).range([0, width]).padding(0.2);
        const y = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height, 0]);

        svg.append('g').selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => x(labels[i]))
            .attr('y', d => y(d))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d))
            .attr('fill', '#69b3a2');

        svg.append('g').call(d3.axisLeft(y));
        svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
            .selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end');

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom - 5)
            .style('text-anchor', 'middle')
            .text(title);
    };

    // Fonction pour dessiner un pie chart
    const drawPieChart = (id, data, title) => {
        const width = 300, height = 300, radius = Math.min(width, height) / 2;
        const svg = d3.select(id)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const pie = d3.pie().value(d => d.length)(data);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        svg.selectAll('path')
            .data(pie)
            .enter().append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => d3.schemeSet3[i % d3.schemeSet3.length]);

        svg.append('text')
            .attr('x', 0)
            .attr('y', -radius - 10)
            .style('text-anchor', 'middle')
            .text(title);
    };

    return (
        <div>
            <h1>Comparaison des Pays</h1>
            <svg id="population-chart"></svg>
            <svg id="area-chart"></svg>
            <svg id="currency-chart"></svg>
            <svg id="language-chart"></svg>
            <div className="row mt-3">
                    <div className="col text-center">
                        <button className="btn btn-primary" onClick={handleHomePage}>Back to Home</button>
                    </div>
                </div>
        </div>
    );
};

export default CountryComparison;
