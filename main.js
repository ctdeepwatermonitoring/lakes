// initialize the map
var lat= 41.55;
var lng= -72.65;
var zoom= 9;

//Load a tile layer base map from USGS ESRI tile server https://viewer.nationalmap.gov/help/HowTo.htm
var hydro = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer/tile/{z}/{y}/{x}',{
    attribution: 'USGS The National Map: National Hydrography Dataset',
    maxZoom:16});
var topo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',{
    attribution: 'USGS The National Map: National Boundaries Dataset',
    maxZoom:16});
var Thunderforest_Landscape = L.tileLayer('https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=e4e0f2bcb8a749f4a9b355b5fca1d913', {
	  attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	  apikey: '<your apikey>',
	  maxZoom: 22});

var baseMaps = {"Hydro": hydro, "Topo": topo, "Landscape": Thunderforest_Landscape};

var map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    layers:[hydro]
});

map.setView([lat, lng], zoom);
map.createPane('top');
map.getPane('top').style.zIndex=650;

L.control.attribution({position: 'bottomleft'}).addTo(map);

L.control.zoom({ position:'topleft'}).addTo(map);

// load GeoJSON from an external file and display circle markers
d3.json("data/ct_state_boundary.geojson", function(bdata){
  d3.json("data/lakes_centroid.geojson", function(data){
    d3.csv("data/lake_shoreline_lc.csv", function(lcdata){
      console.log(lcdata);
      console.log(lcdata[0].lc);
      console.log(data);

    var devPct = [];

    for(var i=0; i<lcdata.length; i++){
      if(lcdata[i].lc == "Developed Land"){
        devPct.push(parseFloat(lcdata[i].pct))
      }
    }

    devL = d3.quantile(devPct.sort(d3.ascending), 0.25)
    devH = d3.quantile(devPct.sort(d3.ascending), 0.75)
    console.log(devL);
    console.log(devH);

    var marker = L.geoJson(data, {
      pointToLayer: function(feature,latlng){
        var markerStyle = {
          fillColor:'#FDB515',
          radius: 9,
          color: "#0D2D6C",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.7,
          pane: 'top'
        };
        return L.circleMarker(latlng, markerStyle);
      }
      ,
      onEachFeature: function (feature,marker) {
        var site = feature.properties.ComID
        var name = feature.properties.GNIS_Name
        var gnis = feature.properties.GNISID
        marker.bindPopup('<b>Lake: </b>'+ name+'</br>' + "<b>SID: </b>"+site + '</br>');
        marker.on('click', function(){
          d3.select('#plt').html('');
          d3.select('#plt-tooltip').html('');
          addDataPlt(lcdata, site, name, '#plt', devL, devH)
        })
      }

      }).addTo(map);

    
    L.geoJson(bdata,{style:{"color": "black", "weight": 2}}).addTo(map);

      
    });
    });
});



function addDataPlt(data, site, name, plt, devL, devH){
  if(name == null){d3.select("#lake-name").html("Unnamed Lake")}
  else{d3.select("#lake-name").html(name)}
  
  siteData = [];

  for(var i=0; i<data.length; i++){
    if(data[i].ComID == site){
      siteData.push(data[i])
    }
  }

  console.log(siteData)

  d3.select("#devLvl").html("This Lake has a <b>" + getDevLvl(siteData[0].pct, devL, devH) + "</b> level of shoreline development compared to other lakes in Connecticut.")

  // set the dimensions and margins of the plot
  var margin = {top: 20, right: 30, bottom: 40, left: 150};
  var width = 400 - margin.left - margin.right;
  var height = 200 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select(plt)
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
    .domain(siteData.map(function(d) { return d.lc; }))
    .padding(.1);
  
  svg.append("g")
     .call(d3.axisLeft(y));

  // add tooltip
  var tooltip = d3.select(plt)
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
        .data(siteData)
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
}

function getDevLvl(val, low, high){
  if(val <= low){return "low "}
  if(val >= high){return "high "}
  if(val > low && val < high){return "moderate "}
  else{return "unknown "}
}


      



