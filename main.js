let svg;
let data;
let sumstat;

let points;
let path;
let dot;

let prevk;
let tooltip;

// function to load data
async function load() {
    const data = await d3.csv("electricity_data.csv");
    return data;
}

// Function to draw the graph 
function draw(data) {

    // Group data by country
    sumstat = d3.group(data, d => d.country);

    const margin = {top: 20, right: 20, bottom: 30, left: 30},
        width = 1400 - margin.left - margin.right, 
        height = 700 - margin.top - margin.bottom; 

    // Append the svg object to the body of the page
    svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.year))
                .range([0, width]);

    // add x-axis tick
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.elec)])
                .range([height, 0]);

            
    // add gridline and y-axis tick
    svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(height / 30))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - margin.left - margin.right)
        .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 0)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Electricity Generation (TWh)"));

    // Color palette
    const color = d3.scaleOrdinal()
                    .domain(Array.from(sumstat.keys()))
                    .range(d3.schemeCategory10);

    // Draw the line for each country
    path = svg.selectAll("path")
    .data(sumstat.values())
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("stroke", function(d) { return color(d[0]); })
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .style("mix-blend-mode", "multiply")
    .attr("d", d3.line()
                   .x(function(d) { return x(d.year); })
                   .y(function(d) { return y(d.elec); })
                );

    points = data.map((d) => [x(d.year), y(d.elec), d.country]);

    tooltip = svg.append("g")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    console.log(tooltip)

    // Add an invisible layer for the interactive tip.
    dot = svg.append("g")
    .attr("display", "none");

    dot.append("circle")
    .attr("r", 2);

    dot.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -8);

}

// When the pointer moves, find the closest point, update the interactive tip, and highlight
// the corresponding line.
function pointermoved(event) {
    const [xm, ym] = d3.pointer(event);
    const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
    const [x, y, k] = points[i];

    // ensure line color won't change if we move around the same line
    if (k !== prevk) {
        path.style("stroke", (z) => z[0].country === k ? null : "#ddd");
    }

    // Update tooltip content based on the hovered country
    tooltip.transition()
        .duration(200)
        .style("opacity", 1);

    tooltip.selectAll("svg").remove();
    
    const countryData = data.filter(d => d.country === k);

    // const tooltipHTML = `
    //     <strong>${k}</strong><br>
    //     <svg width="100" height="100"></svg>
    // `;

    //tooltip.html(tooltipHTML);

    tooltip.selectAll("path")
    .data([,])
    .join("path")
    .attr("fill", "white")
    .attr("stroke", "black");

    const tooltipSvg = tooltip.append("svg")
    .attr("width", 100)
    .attr("height", 100)
        //.attr("transform", "translate(10,10)");

    const ele_gen_types = ["coal", "fossil", "gas", "nuclear", "solar", "wind"];
    
    ele_gen_types.forEach((ele_type) => {
        const xTip = d3.scaleTime()
        .domain(d3.extent(countryData, d => d.year))
        .range([x-50, x+50]);

        const yTip = d3.scaleLinear()
        .domain([0, d3.max(countryData, d => d[ele_type])])
        .range([y-50, y+50]);

        tooltipSvg.select("tooltip")
        .datum(countryData)
        .attr("fill", "none")
        .attr("stroke", 'green')
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
                .x(function(d) { return xTip(d.year); })
                .y(function(d) { return yTip(d[ele_type]); })
            );
    });

    // Position the tooltip
    tooltip.style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");

    prevk = k;

    dot.attr("display", null);
    dot.attr("transform", `translate(${x},${y})`);
    dot.select("text").text(k);
    svg.property("value", sumstat[i]).dispatch("input", {bubbles: true});

}

// remove dot and set the line color back if mouse move out of the plot
function pointerleft() {
    path.style("mix-blend-mode", "multiply").style("stroke", null);
    dot.attr("display", "none");
    svg.node().value = null;
    svg.dispatch("input", {bubbles: true});
}


// adding tooltip functionality (not finished) 
function initTooltip() {
    tooltip = d3.select("svg").append("div").attribute("class", "tooltip");
    // .attr("class", "tooltip")
    // .style("background-color", "white")
    // .style("border", "solid")
    // .style("border-width", "2px")
    // .style("border-radius", "5px")
    // .style("padding", "5px")
}

function line_tooltip(country, x, y) {

    country_data = data.filter((d) => d.country === country)

    initTooltip()

    const xTip = d3.scaleTime()
    .domain(d3.extent(country_data, d => d.year))
    .range([x-100, x+100]);

    const yTip = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.coal)])
    .range([y-100, y+100]);

    tool_tip.show();

    var tipSVG = d3.select("#tipDiv")
      .append("svg")
      .attr("width", 200)
      .attr("height", 50);

    tipSVG.selectAll(".line")
    .data(country_data)
    .enter()
    .append("path")
    .transition()
    .duration(1000)
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
                .x(function(d) { return xTip(d.year); })
                .y(function(d) { return yTip(d.coal); })
            )

    tipSVG.append("text")
      .text(country)
      .attr("x", 10)
      .attr("y", 30)
      .transition()
      .duration(1000)
      .attr("x", 6 + d * 6)

    // // add x-axis tick
    // tooltip.append("g")
    // .attr("transform", `translate(0,${300})`)
    // .call(d3.axisBottom(xTip));

    // // add gridline and y-axis tick
    // tooltip.append("g")
    // .attr("transform", `translate(0,${300})`)
    // .call(d3.axisLeft(yTip));

    // tooltip
    // .selectAll(".line")
    // .data(country_data)
    // .enter()
    // .append("path")
    // .attr("fill", "none")
    // .attr("stroke-width", 1.5)
    // .attr("d", d3.line()
    //             .x(function(d) { return xTip(d.year); })
    //             .y(function(d) { return yTip(d.coal); })
    //         )
    // .attr("display", null);

}


// Load and parse the data
load().then(d => {
    data = d;
    // Parse the data
    data.forEach(function(d) {
        d.year = d3.timeParse("%Y")(d.year);
        d.elec = +d.electricity_generation;

        d.coal = +d.coal_electricity;
    
        d.fossil = +d.fossil_electricity;
    
        d.gas = +d.gas_electricity;
    
        d.nuclear = +d.nuclear_electricity;
    
        d.solar = +d.renewables_electricity;

        d.wind = +d.wind_electricity;
    });

    draw(data);

    // sumstat.keys().forEach((country) => {
    //     let country_data = data.filter((d) => d.country === country)
    //     create_tooltip(country_data)
    // })

    // highlight line plot when mouse is hovering over
    d3.select('svg')
    .on('mousemove', pointermoved)
    .on("pointerleave", pointerleft)
    .on("touchstart", event => event.preventDefault());

});
