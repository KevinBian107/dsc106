let svg;
let data;
let hoveredId;
let points;
let sumstat;

let path;
let dot;

let prevk;

async function load() {
    const data = await d3.csv("cleaned_data.csv");
    return data;
}

// Function to draw x-axis and y-axis
function draw(data) {

    // Group data by country
    sumstat = d3.group(data, d => d.country);

    const margin = {top: 20, right: 20, bottom: 30, left: 30},
        width = 1400 - margin.left - margin.right, 
        height = 800 - margin.top - margin.bottom; 

    // Append the svg object to the body of the page
    svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.year))
                .range([0, width]);

    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.gdp)])
                .range([height, 0]);

    svg.append("g")
       .call(d3.axisLeft(y));

    points = data.map((d) => [x(d.year), y(d.gdp), d.country]);

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
                   .y(function(d) { return y(d.gdp); })
                );

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

    prevk = k

    dot.attr("display", null);
    dot.attr("transform", `translate(${x},${y})`);
    dot.select("text").text(k);
    svg.property("value", sumstat[i]).dispatch("input", {bubbles: true});

    console.log(i)
}


function pointerleft() {
    path.style("mix-blend-mode", "multiply").style("stroke", null);
    dot.attr("display", "none");
    svg.node().value = null;
    svg.dispatch("input", {bubbles: true});
}

// Load and parse the data
load().then(d => {
    data = d;
    // Parse the data
    data.forEach(function(d) {
        d.year = d3.timeParse("%Y")(d.year);
        d.gdp = d.gdp;
    });

    draw(data);

    // d3.selectAll('path').on("mouseover",function(){
    //     d3.selectAll('path').style("stroke", "#ddd")
    //     d3.select(this)
    //     .style("mix-blend-mode", "multiply")
    //     .style("stroke", null);

    // })
    // d3.selectAll('path').on("mouseout",function(){
    //     d3.selectAll("path")
    //     .style("mix-blend-mode", "multiply")
    //     .style("stroke", null)
    // })

    d3.select('svg')
    .on('mousemove', pointermoved)
    .on("pointerleave", pointerleft)
    .on("touchstart", event => event.preventDefault());

});
