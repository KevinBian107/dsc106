async function load() {
    const data = await d3.csv("cleaned_data.csv");
    return data;
}

// Function to draw the graph
function draw(data) {
    
    // Parse the data
    data.forEach(function(d) {
        d.year = d3.timeParse("%Y")(d.year);
        d.gdp = d.gdp;
    });

    // Group data by Country
    const sumstat = d3.group(data, d => d.country);

    // Set dimensions and margins for the graph
    const margin = {top: 20, right: 80, bottom: 30, left: 50},
          width = 960 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    // Clear previous SVG elements before redrawing
    d3.select("svg").selectAll("*").remove();

    // Append the svg object to the body of the page
    const svg = d3.select("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.year))
                .range([0, width]);
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.gdp)])
                .range([height, 0]);
    svg.append("g")
       .call(d3.axisLeft(y));

    // Color palette
    const color = d3.scaleOrdinal()
                    .domain(Array.from(sumstat.keys()))
                    .range(d3.schemeCategory10);

    // Draw the line for each country
    svg.selectAll(".line")
       .data(sumstat.values())
       .enter()
       .append("path")
         .attr("fill", "none")
         .attr("stroke", function(d) { return color(d[0]); })
         .attr("stroke-width", 1.5)
         .attr("d", d3.line()
                      .x(function(d) { return x(d.year); })
                      .y(function(d) { return y(d.gdp); }));
}


// Load data and then draw the graph
load().then(data => {
    if (data) {
        draw(data);
    }
});