async function load() {
    try {
        const data = await d3.csv("cleaned_data.csv");
        console.log("Data Loaded", data);  // Log the loaded data for verification
        return data;
    } catch (error) {
        console.error('Error loading CSV:', error);
    }
}

function draw(data) {
    // Parse the data
    data.forEach(function(d) {
        d.year = d3.timeParse("%Y")(d.year);
        d.gdp = +d.gdp;
        console.log("Parsed Year:", d.year);  // Log each parsed Year to check correctness
    });

    console.log("Data to be used for drawing", data);  // Verify data before drawing

    // Group data by Country
    const sumstat = d3.group(data, d => d.country);

    const margin = {top: 20, right: 80, bottom: 30, left: 50},
          width = 960 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    d3.select("svg").selectAll("*").remove();  // Clear previous SVG elements

    const svg = d3.select("svg")
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

    const color = d3.scaleOrdinal()
                    .domain(Array.from(sumstat.keys()))
                    .range(d3.schemeCategory10);

    // Ensure the accessor functions are correctly using the parsed data
    svg.selectAll(".line")
       .data(sumstat)
       .enter()
       .append("path")
         .attr("fill", "none")
         .attr("stroke", function(d) { return color(d[0]); })
         .attr("stroke-width", 1.5)
         .attr("d", d3.line()
                      .x(d => x(d.year))
                      .y(d => y(d.gdp)));

    console.log("SVG should be rendered now.");  // Confirm that everything should be rendered
}

load().then(data => {
    if (data) {
        draw(data);
    }
});