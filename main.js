async function load() {
    data = await d3.csv("/data/data.csv");
    return data
}

function drawGraph(data) {

    const svg = d3.select(vis);

    d3.select(vis).html(null); 

    // group the data
    const gdp = d3.group(data, d => d.country);

    svg.selectAll(".line")
    .data(gdp)
    .join("path")
        .attr("fill", "none")
        //.attr("stroke", function(d){ return color(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
        return d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(+d.n); })
            (d[1])
        })
}


drawGraph()

