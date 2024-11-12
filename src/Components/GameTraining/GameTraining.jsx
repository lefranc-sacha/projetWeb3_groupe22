import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../images/earth-11048_1920.jpg';

const GameTraining = () => {
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

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

        // Dessiner le globe en bleu pour les océans
        svg.append('path')
            .datum({ type: 'Sphere' })  // Créer une sphère qui représente l'ensemble du globe
            .attr('d', path)
            .attr('fill', '#a0c4ff');  // Couleur bleu océan

        d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(world => {
            const loadedCountries = world.features;
            setCountries(loadedCountries);
            drawMap(loadedCountries, svg, path, projection);
        });
    }, []);

    const drawMap = (countriesList, svg, path, projection) => {
        svg.selectAll('g').remove();

        svg.append('g')
            .selectAll('path')
            .data(countriesList)
            .enter().append('path')
            .attr('class', 'country')
            .attr('fill', '#69b3a2')
            .attr('d', path)
            .style('stroke', 'white')
            .style('stroke-width', 0.5)
            .on('click', async function (event, d) {
                try {
                    const countryCode = await getCountryCode(d.properties.name);
                    const countryCapital = await getCountryCapital(d.properties.name);
                    const countryInfo = {
                        name: d.properties.name,
                        flag: `https://flagsapi.com/${countryCode}/flat/64.png`,
                        capital: countryCapital
                    };
                    setSelectedCountry(countryInfo);
                } catch (error) {
                    console.error('Error fetching country data:', error);
                }
            })
            .on('mouseover', function () {
                d3.select(this).style('fill', 'orange');
            })
            .on('mouseout', function () {
                d3.select(this).style('fill', '#69b3a2');
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
    
    async function getCountryCode(countryName) {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        const data = await response.json();
        if (response.ok) {
            return data[0].cca2;
        } else {
            throw new Error('Country not found');
        }
    }

    async function getCountryCapital(countryName) {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        const data = await response.json();
        if (response.ok) {
            return data[0].capital ? data[0].capital[0] : 'Capital not found';
        } else {
            throw new Error('Country not found');
        }
    }

    const handleHomePage = () => {
        navigate("/");
    };

    return (
        <div className="app-container-training" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <h1 className='text-center'>Training Mode</h1>
            <div className="container border border-primary rounded-4 p-3">
                <div className="row">
                    <div className="col text-center">
                        <h5>Train yourself, let's guess!</h5>
                    </div>
                </div>

                <div className="row align-items-center">
                    <div className="col">
                        <svg className='border rounded-4 border-primary'></svg>
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
