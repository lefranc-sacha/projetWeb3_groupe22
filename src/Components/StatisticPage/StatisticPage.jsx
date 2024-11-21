import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router-dom";
import countries from "../../data/countries-readable.json";
import continentsData from "../../data/countries_tree.json";
import "./StatisticPage.css";

const CirclePackingAndTree = () => {
  const svgRef = useRef();
  const navigate = useNavigate();
  const [view, setView] = useState("circlePacking"); // State pour la vue active

  const handleHomePage = () => {
    navigate("/");
  };

  const prepareCirclePackingData = (countries) => {
    const groups = [
      { name: "<1M", min: 0, max: 1000000 },
      { name: "1M-10M", min: 1000000, max: 10000000 },
      { name: "10M-50M", min: 10000000, max: 50000000 },
      { name: "50M-100M", min: 50000000, max: 100000000 },
      { name: "100M-500M", min: 100000000, max: 500000000 },
      { name: "500M-1B", min: 500000000, max: 1000000000 },
      { name: "1B+", min: 1000000000, max: Infinity },
    ];

    const groupedCountries = groups.map((group) => ({
      name: group.name,
      children: countries
        .filter(
          (country) =>
            country.population >= group.min && country.population < group.max
        )
        .map((country) => ({
          name: country.name,
          value: Math.log10(country.population),
        })),
    }));

    const hierarchy = {
      name: "World",
      children: groupedCountries.filter((group) => group.children.length > 0),
    };

    return hierarchy;
  };

  const renderCirclePacking = () => {
    const data = prepareCirclePackingData(countries);

    const width = 800;
    const height = 800;
    const color = d3.scaleSequential([1, 10], d3.interpolateViridis);

    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const pack = d3.pack().size([width, height]).padding(3);
    pack(root);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Effacer le contenu précédent

    svg
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`) // Centre le graphique
    .style("font", "10px sans-serif")
   // Facultatif : Ajout d'un fond pour mieux visualiser
  

    const g = svg.append("g").attr("transform", `translate(0,0)`);

    let focus = root;
    let view;

    const circle = g
      .selectAll("circle")
      .data(root.descendants())
      .join("circle")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => (d.children ? color(d.depth) : "#69b3a2"))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .style("cursor", (d) => (d.children ? "pointer" : "default"))
      .on("click", (event, d) => {
        if (focus !== d) {
          zoom(event, d);
          event.stopPropagation();
        }
      });

    const text = g
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("text-anchor", "middle")
      .style("font-size", (d) => `${Math.min(d.r / 3, 14)}px`)
      .style("fill", "white")
      .style("pointer-events", "none")
      .text((d) => d.data.name);

    const zoomTo = (v) => {
      const k = Math.min(width, height) / v[2];

      view = v;

      circle
        .attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`)
        .attr("r", (d) => d.r * k);

      text.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    };

    const zoom = (event, d) => {
      focus = d;

      const transition = svg
        .transition()
        .duration(750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t) => zoomTo(i(t));
        });

      text
        .transition(transition)
        .style("opacity", (d) => (d.parent === focus ? 1 : 0));
    };

    zoomTo([root.x, root.y, root.r * 2]);
  };

  const renderTree = () => {
    const data = continentsData;
  
    // Dimensions et marges
    const width = window.innerWidth * 0.9; // Largeur dynamique
    const height = window.innerHeight * 0.9; // Hauteur dynamique
    const radius = Math.min(width, height) / 2 - 100; // Rayon du cercle
  
    // Hiérarchie et structure de l'arbre
    const root = d3.hierarchy(data);
    const tree = d3.tree().size([2 * Math.PI, radius]); // Organisation en cercle
    tree(root);
  
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Efface tout contenu précédent
  
    // Configurer le conteneur SVG
    svg
      .attr("viewBox", [-width / 2, -height / 2, width, height].join(" "))
      .style("font", "10px sans-serif");
  
    // Dessiner les liens
    const link = svg
      .append("g")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .linkRadial()
          .angle((d) => d.x) // Angle en fonction de la position radiale
          .radius((d) => d.y) // Rayon du lien
      );
  
    // Dessiner les nœuds
    const node = svg
      .append("g")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr(
        "transform",
        (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)` // Placement radial
      )
      .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
      .attr("transform", (d) =>
        d.x < Math.PI
          ? `rotate(${(d.x * 180) / Math.PI-90}) translate(${d.y},0)`
          : `rotate(${(d.x * 180) / Math.PI + 90}) translate(${d.y},0) rotate(180)`
      );
  
    // Ajouter des cercles pour chaque nœud
    node.append("circle")
      .attr("r", 4) // Rayon du cercle
      .attr("fill", (d) => (d.children ? "#555" : "#999"));
  
    // Ajouter des étiquettes
    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.x < Math.PI ? 6 : -6)) // Position du texte
      .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end")) // Alignement
      .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null)) // Retourne le texte si nécessaire
      .text((d) => d.data.name) // Texte du nœud
      .style("font-size", "10px") // Taille du texte
      .style("fill", "black");
  };
  
  
  

  useEffect(() => {
    if (view === "circlePacking") {
      renderCirclePacking();
    } else if (view === "tree") {
      renderTree();
    }
  }, [view]);

  return (
    <div className="chart-container">

      <div className="d-flex justify-content-center mb-3">
        <button
          className="btn btn-secondary mx-2"
          onClick={() => setView("circlePacking")}
        >
          Circle Packing
        </button>
        <button
          className="btn btn-secondary mx-2"
          onClick={() => setView("tree")}
        >
          Tree View
        </button>
      </div>
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-primary" onClick={handleHomePage}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CirclePackingAndTree;
