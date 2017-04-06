function getRadius(mass, zoomLevel) { 
    if (mass < 100) {
        return 1/zoomLevel;
    } else if (mass < 1000) {
        return 1.5/zoomLevel;
    } else if (mass < 5000) {
        return 2/zoomLevel;
    } else if (mass < 10000) {
        return 2.5/zoomLevel;
    } else if (mass < 50000) {
        return 3/zoomLevel;
    } else if (mass < 100000) {
        return 4/zoomLevel;
    } else if (mass < 1000000) {
        return 5/zoomLevel;
    } else if (mass < 10000000) {
        return 6/zoomLevel;
    } else { //mass > 10million
        return 10/zoomLevel;
    }
} //end getRadius()

//meteorite mass is in grams ranging from just over 0 to 10's of millions
var width = window.innerWidth-10, height = window.innerHeight-10;

//__project the specified point from the sphere to the plane__// - map of land
var projection = d3.geoMercator()
    .scale(200)
    .translate([width / 2, height / 2])

//__create a new geographic path generator__// - creates borders
var path = d3.geoPath()
    .projection(projection);

//__create SVG__//
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var zoom = d3.zoom()
    .scaleExtent([.5, 20])
    .on("zoom", zoomed);

var g = svg.append('g');

//create details window (little window that comes up on hover)
var details = d3.select('body').append('div')
    .style('background-color', 'orange')
    .style('position', 'absolute')
    .style('box-shadow', '1px 1px 2px 1px #111')
    .style('padding', '3px 6px')
    .style('visibility', 'hidden')
    .style('font-size', '12px')
    .style('border-radius', '5px');

svg.call(zoom)
var land, borders, circle;

//__this draws the land and country borders__//
d3.json("world-50m.v1.json", function(error, world) {
    if (error) throw error;

    land = g.insert("path")
        .datum(topojson.feature(world, world.objects.land))
        .attr("fill", "#999")
        .attr("d", path);

    borders = g.insert("path")
        .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", "0.5")
        .attr("d", path);
}); //end world-50m.v1.json

d3.json('meteorites.json', function(data) {
    circle = g.selectAll('circle')
        .data(data.features)
        .enter().append('circle')
        .attr('stroke', 'black')
        .attr('stroke-width', '0.5')
        .attr('cx', (d) =>  projection([d.properties.reclong,d.properties.reclat])[0] )
        .attr('cy', (d) => projection([d.properties.reclong,d.properties.reclat])[1] )
        .attr('r', (d) => (getRadius(d.properties.mass,1)))
        .style('fill', 'orange')
        .style('opacity', 0.6)
        .on('mouseover', function (d) {
            d3.select(this).style("opacity", 1);
            var date = d.properties.year.split('T'),
                year = date[0].split('-');

            details.html('Meteorite: '+d.properties.name+'<br>Year: '+year[0]+'<br>Latitude: '+d.geometry.coordinates[1]+'<br>Longitude: '+d.geometry.coordinates[0]+'<br>Mass: '+d.properties.mass+'g<br>Class: '+d.properties.recclass)
                .style('visibility', 'visible')
                .style('left', (d3.event.pageX + 10)+'px')
                .style('top', (d3.event.pageY - 30)+'px')
        }) //end .on(mouseover)
        .on('mouseout', function (d) {
            d3.select(this).style('opacity', 0.6);
            details.style('visibility', 'hidden');
        }); //end .on('mouseout)
    ; //end var circle
}); //end meteorites.json

function zoomed() {
    console.log('k='+d3.event.transform.k+' x='+d3.event.transform.x+' y='+d3.event.transform.y);
    if (d3.event.transform.k > 6) {
        circle.attr('r', (d) => (getRadius(d.properties.mass, 4)))
        circle.attr('stroke-width', '0.1')
        borders.attr('stroke-width', '0.1') }
    else if (d3.event.transform.k > 4) {
        circle.attr('r', (d) => (getRadius(d.properties.mass, 3)))
        circle.attr('stroke-width', '0.2')
        borders.attr('stroke-width', '0.2') }    
    else if(d3.event.transform.k > 2) {
        circle.attr('r', (d) => (getRadius(d.properties.mass, 1.5)))
        circle.attr('stroke-width', '0.3')
        borders.attr('stroke-width', '0.3') }
    else {
        circle.attr('r', (d) => (getRadius(d.properties.mass, 1)))
        circle.attr('stroke-width', '0.5')
        borders.attr('stroke-width', '0.5') }
    g.attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ") scale(" + d3.event.transform.k + ")");
} //end zoomed