// data transformation
let data;
let sumstat;

// svg reference
let svg;
let path;
let dot;
let tooltip;

// for finding svg position
let points;
let countryPoints;

let tooltipPosX;
let tooltipPosY;

let prevk;
let idx;

let lock = false;

// const GDP_THRESHOLD = 1000; 

// function to load data
async function load() {
    const data = await d3.csv("asset/electricity_data.csv");
    return data
}

// Function to draw the graph 
function draw(data) {

    // Group data by country
    sumstat = d3.group(data, d => d.country);

    const margin = {top: 20, right: 20, bottom: 30, left: 32},
        width = 1400 - margin.left - margin.right, 
        height = 700 - margin.top - margin.bottom; 

    // Append the svg object to the body of the page
    svg = d3.select("#dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.html("<p>Title</p>");
    
    xScale = d3.scaleTime()
                .domain(d3.extent(data, d => d.year))
                .range([0, width])


    // add x-axis tick
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(xScale));

    yScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.gdp)])
                .range([height, 0]);

    // log scale 
    // const y = d3.scaleLog()
    //         .domain([1, d3.max(data, d => d.gdp)])
    //         .range([height, 0])
            
    // add gridline and y-axis tick
    svg.append("g")
    .attr("transform", `translate(${margin.left-23},0)`)
    .call(d3.axisLeft(yScale)
            .ticks(height / 60)
            .tickFormat((d) => d > 1 ? `+${(d-1)*100}%` : `${(d-1)*100}%`))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - margin.left - margin.right)
        .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", -8)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text("↑ GDP Growth Rate"));

    // Color palette
    const color = d3.scaleOrdinal()
                    .domain(Array.from(sumstat.keys()))
                    .range(d3.schemeTableau10);

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
                   .x(function(d) { return xScale(d.year); })
                   .y(function(d) { return yScale(d.gdp); })
                );

    points = data.map((d) => [xScale(d.year), yScale(d.gdp), d.country, d.year]);

    initTooltip()

    // Add an invisible layer for the interactive tip.
    dot = svg.append("g")
    .attr("display", "none");

    dot.append("circle")
    .attr("r", 2);

    dot.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -8);

}

// "lock" a specific line (country)  
function lockLine(event) {
    if (!lock) {
        const [xm, ym] = d3.pointer(event);
        const i = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
        const [_x, _y, k, _year] = points[i];

        countryPoints = points.filter(d => d[2] === k);
    }
    // lock if unlocked, unlock if locked
    lock = !lock
}

// When the pointer moves, find the closest point, update the interactive tip, and highlight
// the corresponding line.
function pointermoved(event) {
    let x, y, k, year;

    const [xm, ym] = d3.pointer(event);
    if (!lock) {
        idx = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym));
        [x, y, k, year] = points[idx];

        // ensure that tooltip box will be within the plot
        tooltipPosX = event.pageX > 1150 ? event.pageX - 200 : event.pageX + 30;
        tooltipPosY = event.pageY > 400 ? event.pageY - 380 : event.pageY + 30;
    } else {
        idx = d3.leastIndex(countryPoints, ([x, y]) => Math.hypot(x - xm, y - ym));
        [x, y, k, year] = countryPoints[idx];
    }


    // ensure line color won't change if we move around the same line
    if (k !== prevk) {
        path.style("stroke", (z) => z[0].country === k ? null : "#ddd");
        path.style("opacity", (z) => z[0].country === k ? 1 : 0.5);
        path.attr("stroke-width", (z) => z[0].country === k ? 2 : 1.5);
    }

    tooltip.selectAll('svg').remove()

    // Update tooltip content based on the hovered country
    tooltip.style("opacity", 1)

    // tooltip position relative to the mouse
    tooltip
    .style("left", (tooltipPosX) + "px")
    .style("top", (tooltipPosY) + "px")
    
    const countryData = data.filter(d => d.country === k);

    // tooltip box width and height
    const width = 260, height = 310;

    // tooltip SVG container
    const tooltipSVG = tooltip
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    //.style('position', 'absolute')
    .attr("transform", `translate(${10}, ${10})`);

    const ele_gen_types = ["coal", "fossil", "gas", "nuclear", "solar", "wind"];

    // Append text to tooltipSVG
    tooltipSVG
    .append("text")
        .attr("x", -5)
        .attr("y", 8)
        .text(k)
        .style("font-size", "17px")
        .style("font-weight", "bold");
    tooltipSVG
    .append("text")
        .attr("x", 175)
        .attr("y", 8)
        .text(`Year: ${year.getFullYear()}`)
        .style("font-size", "16px");
    tooltipSVG
    .append("text")
        .attr("x", 15)
        .attr("y", 30)
        .text("Electricity Generation Energy Source:")
        .style("font-size", "14px");
    tooltipSVG
    .append("text")
        .attr("x", 0)
        .attr("y", 297)
        .text("Unit: Terawatt hours (TWh)")
        .style("font-size", "9px");

    let row = 1, col = 1;

    // 6 area plot in tooltip
    ele_gen_types.forEach((ele_type) => {

        let x_range, y_range;

        // set y range
        y_range = [33+80*row, 33+80*(row-1)+30];

        // set x range
        if (col === 1) {
            x_range = [20, 110];
            col++;
        } else if (col === 2) {
            x_range = [150, 240];
            col = 1;
            row++;
        }

        const xDomain = d3.extent(countryData, d => d.year);
        const yDomain = [0, d3.max(countryData, d => d[ele_type])];

        const xTip = d3.scaleTime()
        .domain(xDomain)
        .range(x_range);
        const yTip = d3.scaleLinear()
        .domain(yDomain)
        .range(y_range);

        // add x-axis
        tooltipSVG.append("g")
        .attr("transform", `translate(0,${y_range[0]})`)
        .call(d3.axisBottom(xTip).tickSize(5).tickValues(xDomain))
        .call(g => g.selectAll("text").style("font-size", "8px"))
        .style("opacity", 0.6)
        .style("fill", "#dddddd")
        .call(g => g.select(".domain").remove());

        // add y-axis
        tooltipSVG.append("g")
        .attr("transform", `translate(${x_range[0]},0)`)
        .call(d3.axisLeft(yTip).tickSize(5).tickValues(yDomain))
        .call(g => g.selectAll("text").style("font-size", "8px"))
        .style("opacity", 0.7)
        .style("fill", "#dddddd")
        .call(g => g.select(".domain").remove());

        // Add title
        tooltipSVG.append("text")
        .attr("x", (x_range[0] + x_range[1]) / 2)
        .attr("y", y_range[0]-58)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-weight", "bold")
        .text(`${ele_type.charAt(0).toUpperCase() + ele_type.slice(1)}`);

        // add area plot
        tooltipSVG
        .append("path")
        .datum(countryData)
        .attr("fill", "#cce5df")
        .attr("stroke", 'green')
        .attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .attr("d", d3.area()
                .x(function(d) { return xTip(d.year); })
                .y1(yTip(0))
                .y0(function(d) { return yTip(d[ele_type]); })
            );

        // add dots
        tooltipSVG
        .append("circle")
        .datum(countryData)
        .attr("class", "dot")
        .attr("cx", xTip(year))
        .attr("cy", yTip(countryData.filter(d => d.year === year)[0][ele_type]))
        .attr("r", 3)
        .style("opacity", 0.8)
        .style("fill", "green");

    });

    prevk = k;

    // line dot 
    dot.attr("display", null);
    dot.attr("transform", `translate(${x},${y})`);
    dot.select("text").text(k);
    svg.property("value", sumstat[idx]).dispatch("input", {bubbles: true});

}


// remove dot and set the line color back if mouse move out of the plot
function pointerleft() {
    path.style("mix-blend-mode", "multiply").style("stroke", null);
    path.style("opacity", 1);
    dot.attr("display", "none");
    svg.node().value = null;
    svg.dispatch("input", {bubbles: true});
    tooltip.style("opacity", 0);
    lock=false;
    prevk=null;
    //tooltip.selectAll('svg').remove();
}

// initialize tooltip html
function initTooltip() {
    tooltip = d3.select("#dataviz")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
}


// Load and parse the data
load().then(d => {
    data = d.map(row => ({
        gdp: +row.gdp,
        year: d3.timeParse("%Y")(row.year),
        elec: +row.electricity_generation,
        coal: +row.coal_electricity,
        fossil: +row.fossil_electricity,
        gas: +row.gas_electricity,
        nuclear: +row.nuclear_electricity,
        solar: +row.renewables_electricity,
        wind: +row.wind_electricity,
        country: row.country
    }))
    //.filter(row => row.year >= new Date("2000-01-01"))
    //.filter(row => row.gdp >= GDP_THRESHOLD);

    draw(data);

    // highlight line plot when mouse is hovering over
    d3.select('svg')
    .on('mousemove', pointermoved)
    .on("pointerleave", pointerleft)
    .on("click", lockLine)
    .on("touchstart", event => event.preventDefault());
    
});
