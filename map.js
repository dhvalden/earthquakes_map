
// The svg
let svg = d3.select("body")
    .append("div")
    .classed("svg-container", true)
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 1000")
    //class to make it responsive
    .classed("svg-content-responsive", true);

//Helper functions
function filter(data, set, i){
    let newdata = data.filter(obj => {
        return obj.time === set[i];
    });
    return newdata;
}

function mapVal(x, input_min, input_max, output_min, output_max) {
    return (x - input_min) * (output_max - output_min) / (input_max - input_min) + output_min;
}

// Map and projection
let path = d3.geoPath();
let projection = d3.geoNaturalEarth();
path = d3.geoPath().projection(projection);

// Load external data and boot
d3.queue()
    .defer(d3.json, "https://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.csv, "earthquakes.csv")
    .await(ready);

function ready(error, topo, data) {
    if (error) throw error;
    
    // Draw the map
    let map = svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
        .attr("d", path);


    let maydata = [];
    mydata = data;
    mydata.forEach(function(d){ d["latitude"] = +d["latitude"];
                              d["longitude"] = +d["longitude"];
                              d["time"] = d["time"].split("T")[0]
                              d["mag"] = Math.sqrt(Math.pow(10, +d["mag"]));});
    console.log(mydata);

    let days = [];
    for (i = 0; i < mydata.length; i++) {
        days[i] = mydata[i].time;
    }
    days = [...new Set(days)];

    // Counter
    let counter = 0;

    console.log(Math.pow(10, 4));

    console.log(mapVal(5, 1, 10, 10, 100));
 
    d3.interval(function() {

        let t = d3.transition()
            .duration(1000);

        let tempdata = filter(mydata, days, counter);
        
        let dots = svg.append("g")
            .selectAll("circle")
            .data(tempdata)
            .enter().append("circle")
            .attr("cx", function (d) { return projection([d.longitude,
                    d.latitude])[0];})
            .attr("cy", function (d) { return projection([d.longitude, 
                    d.latitude])[1];})
            .style("fill", "red")
            .style("fill-opacity", .2)
            .style("stroke", "red")
            .style("stroke-opacity", .5)
            .attr("r", 1e-6)
          .transition(t)
            .attr("r", d => mapVal(d.mag, 0, Math.sqrt(Math.pow(10, 10)), .5, 1000))
          .transition(t)
            .attr("r", .5);

 counter++;
    }, 200);

};
