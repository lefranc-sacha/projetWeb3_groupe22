import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router-dom";
import countries from "../../data/countries-readable.json";
import "./StatisticPage.css";

const CirclePacking = () => {
  const svgRef = useRef();
  const navigate = useNavigate();

  const handleHomePage = () => {
    navigate("/");
  };

  const prepareData = (countries) => {
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

  useEffect(() => {
    const data = prepareData(countries);

    const width = 800;
    const height = 800;
    const color = d3.scaleSequential([1, 10], d3.interpolateViridis);

    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const pack = d3.pack().size([width, height]).padding(3);
    pack(root);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("font", "10px sans-serif");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    let focus = root;
    let view;

    const circle = g
      .selectAll("circle")
      .data(root.descendants())
      .join("circle")
      .attr("transform", (d) => `translate(${d.x - root.x},${d.y - root.y})`)
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

    const wrapText = (textSelection) => {
      textSelection.each(function (d) {
        const text = d3.select(this);
        const words = d.data.name.split(/\s+/).reverse();
        const lineHeight = 0.9; // Line height in em
        const radius = d.r; // Radius of the bubble
        const maxWidth = radius * 3; // Maximum width based on bubble size
        let line = [];
        let lineNumber = 0;
        let tspan = text
          .text(null)
          .append("tspan")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", "0em");

        let word;
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > maxWidth) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("y", 0)
              .attr("dy", `${++lineNumber * lineHeight}em`)
              .text(word);
          }
        }
      });
    };

    const text = g
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .attr("transform", (d) => `translate(${d.x - root.x},${d.y - root.y})`)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", (d) => {
        const maxFontSize = d.r / 1.5; // Increase font size proportionally
        return `${Math.min(maxFontSize, 28)}px`; // Max font size increased
      })
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("pointer-events", "none")
      .call(wrapText);

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
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 1.9]);
          return (t) => zoomTo(i(t));
        });

      text
        .transition(transition)
        .style("opacity", (d) => (d.parent === focus ? 1 : 0));
    };

    // New click handling
    svg.on("click", (event) => {
      const [x, y] = d3.pointer(event); // Get click coordinates
      const clickedNode = root.descendants().find((d) => {
        const dx = x - d.x;
        const dy = y - d.y;
        return Math.sqrt(dx * dx + dy * dy) < d.r; // Check if click is inside a circle
      });

      if (clickedNode) {
        zoom(event, clickedNode); // Zoom to the clicked node
      } else {
        zoom(event, root); // Zoom back to root if clicked outside
      }
    });

    zoomTo([root.x, root.y, root.r * 2]);
  }, []);

  return (
    <div className="chart-container">
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-primary" onClick={handleHomePage}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CirclePacking;
