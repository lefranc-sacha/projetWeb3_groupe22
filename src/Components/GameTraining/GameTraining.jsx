import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom'; // Importation de Link pour la navigation


const GameTraining = () => {
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


    const handleHomePage = () => {
        navigate("/");
    };

    return (
        <div>
            <h1 className='text-center'>Training Mode</h1>
            <div className="container border border-primary rounded-4">
                <div className="row">
                    <div className="col">
                        <p>Train yourself, let's guess !</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <svg></svg>
                    </div>
                </div>
            </div>


            <div className="row">
                <div className="col text-center">
                    <button type="button" className="btn btn-primary rounded-5 my-2" onClick={handleHomePage}>
                    HomePage
                    </button>
                </div>
            </div>

        
        </div>
    );
};

export default GameTraining;
