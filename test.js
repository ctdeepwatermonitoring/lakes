// set the dimensions and margins of the plot
var margin = {top: 20, right: 30, bottom: 40, left: 150};
var width = 400 - margin.left - margin.right;
var height = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#plt")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("data/lake_shoreline_lc_statewide.csv", function(data) {

  // add x axis
  var x = d3.scaleLinear()
            .domain([0, 100])
            .range([ 0, width]);

  svg.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x))
     .selectAll("text")
     .attr("transform", "translate(-10,0)rotate(-45)")
     .style("text-anchor", "end");

  // add y axis
  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.lc; }))
    .padding(.1);
  
  svg.append("g")
     .call(d3.axisLeft(y));

  // add tooltip
  var tooltip = d3.select("#plt")
                  .append("div")
                  .style("opacity", 0)
                  .attr("class", "tooltip")
                  .style("border-width", "2px")
                  .style("border-radius", "5px");
  
    // mouse functions that change the tooltip on hover over / move / hover out
    var mouseover = function(d) {
            tooltip.style("opacity", 1)
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }

    var mousemove = function(d) {
            tooltip.html(d.lc+ ": " + d3.format(".1f")(d.pct) + "%")
                .style("right", d3.select(this).attr("x") + "px")
                .style("top", d3.select(this).attr("y") + "px")
    }

    var mouseout = function(d) {
            tooltip.style("opacity", 0)
            d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    //add bars to plot with tooltip
    svg.selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d.lc); })
        .attr("width", function(d) { return x(d.pct); })
        .attr("height", y.bandwidth() )
        .attr("fill", "#69b3a2")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
})

