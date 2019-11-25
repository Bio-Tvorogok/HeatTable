"use strict"

const colorBySignal = new Map([
  [0, "blue"],
  [1, "green"],
  [2, "yellow"],
  [3, "red"],
  [4, "crimson"],
  [5, "gray"],
  [7, "white"],
  [8, "black"]
]);

const jsonData = ["update-data.json", "update-data2.json", "update-data3.json"];

let prevPositionsByID = new Map();

let margin = getMargin();
let width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

let svg = d3.select("#dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let tooltip = d3.select("#dataviz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("position", "absolute");

let mouseoverText = function(d) {
  d3.select(this)
    .style("font-weight", 1000);
}

let mouseleaveText = function(d){
  d3.select(this)
    .style("font-weight", 100);
}

let mouseover = function(d) {
  tooltip.style("opacity", 1);
  d3.select(this)
  .style("stroke", "black")
  .style("opacity", 1);
}

let mousemove = function(d){
  tooltip.html("The exact value of<br>this cell is: " + d.state)
  .style("left", (d3.mouse(this)[0]+70) + "px")
  .style("top", (d3.mouse(this)[1]) + "px")
}

let mouseleave = function(d){
  tooltip.style("opacity", 0);
  d3.select(this)
  .style("stroke", "none")
  .style("opacity", 0.8);
}

//loop();

async function loop() {
  let i = 0;
  console.log("init");
  while(true) {
    await sleep(2000)
    console.log("update with - " + jsonData[i]);
    updateMap(jsonData[i]);
    i = (i + 1) % 3;
  }
}

function updateMap(jsonName){
  $.getJSON(jsonName, function(json){
      createMap(json);
  });
}

function createMap(data){


  let cellsCount = Object.keys(data).length;

  let squareSize = Math.ceil(Math.sqrt(cellsCount));
  let groups = Array.from(Array(squareSize).keys());
  let vars = Array.from(Array(squareSize).keys());

  let x = d3.scaleBand()
            .range([0, width])
            .domain(groups)
            .padding(0.1);
  svg.append("g")
    .style("font-size", 0)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove();

  let y = d3.scaleBand()
            .range([height, 0])
            .domain(vars)
            .padding(0.1);
  svg.append("g")
      .style("font-size", 0)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain").remove()

  let color = function(signalValue){
    let col = colorBySignal.get(parseInt(signalValue));
    return col;
  }


  let d3Data = createPositionArray(data, cellsCount, squareSize, x.bandwidth(), y.bandwidth());
  let rects = svg.selectAll("#rectGroup").data(d3Data, function(d) { return d.id; });

  let cells = rects.enter()
       .append('g')
       .attr('id', 'rectGroup');

  cells
      .append('rect')
      .attr("rx", 15)
      .attr("ry", 15)
      .attr("id", function(d) {return d.id})
      .attr("width", 0 )
      .attr("height", 0 )
      .attr("x", function(d) { return x(d.x) })
      .attr("y", function(d) { return y(d.y) })
      .style("fill", function(d) { return color(d.state)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
          .transition()
          .duration(600)
          .attr("x", function(d) { return x(d.x) })
          .attr("y", function(d) { return y(d.y) })

  cells
      .append('a')
      .attr('id', 'idLink')
      .attr("xlink:href", function(d) { return d.link })
      .append("text")
      .attr('text-anchor', 'middle')
      .style('font-size', '35px')
      .style('font-family', '"Open Sans", sans-serif')
      .style('font-weight', '500')
      .attr("x", function(d) { return x(d.x) + x.bandwidth() / 2 })
      .attr("y", function(d) { return y(d.y) + y.bandwidth() / 2 })
      .attr("opacity", 0)
      // .attr("typeface", )
      // .attr("text-anchor", "left")
      // .attr("x", function(d) { return x(d.x) + x.bandwidth() / 2 })
      // .attr("y", function(d) { return y(d.y) + y.bandwidth() / 2 })
      // .attr("opacity", 0)
      .style("text-anchor", "middle")
      //.style("font-size", "35px")
      .style("position", "relative")
      .text(function(d) { return d.id })
      .on("mouseover", mouseoverText)
      .on("mouseleave", mouseleaveText);

  rects
    .exit()
    .remove();

  d3.select('#dataviz').selectAll('#rectGroup').select('rect')
       .transition()
       .duration(600)
       .attr("width",  x.bandwidth() )
       .attr("height", y.bandwidth() )
       .style("fill", function(d) { return color(d.state)} )
       .on('start', function() {
        let lables = d3.select('#dataviz').selectAll('#idLink').select('text')
        .data(d3Data);
        
        lables.transition()
        .duration(600)
        .attr("x", function(d) { return x(d.x) + x.bandwidth() / 2; })
        .attr("y", function(d) { return y(d.y) + y.bandwidth() / 2; })
        .attr("opacity", 1)
       })
       .attr("x", function(d) { return x(d.x) })
       .attr("y", function(d) { return y(d.y) });


  setPositionsMap(d3Data, squareSize);
  console.log(prevPositionsByID);
  //setLables(d3Data, x, y)

}

function getMargin() {
  let margin = {top: 1, right: 1, bottom: 1, left: 1};
  return margin
}

function createPositionArray(data, length, squareSize, scaleSquareX, scaleSquareY){
  prevPositionsByID = filterPrevArray(prevPositionsByID, data);
  let tmpPositions = [...prevPositionsByID.values()];
  let dataArr = new Array(length);
  for (let i = 0; i < length; i++) {

    let prevItem = prevPositionsByID.get(+data[i]["id"]);
    if (prevItem !== undefined) {
          dataArr[i] = {
              y : (prevItem * i) % squareSize,
              x : (prevItem * i) % squareSize,
              id : +data[i]["id"],
              state : +data[i]["state"],
              link : data[i]["linkto"],
              scaleX : scaleSquareX,
              scaleY : scaleSquareY
        }
    } else {
        let x = 0;
        let y = 0;
        for (let posIter = 0; posIter < squareSize * squareSize; posIter++){
            x = Math.floor(posIter / squareSize);
            y = posIter % squareSize;
            let pos = x * squareSize + y;
            if (tmpPositions.find(item => item == pos) === undefined) {
                dataArr[i] = {
                    y : y,
                    x : x,
                    id : +data[i]["id"],
                    state : +data[i]["state"],
                    link : data[i]["linkto"],
                    scaleX : scaleSquareX,
                    scaleY : scaleSquareY
                }
                  tmpPositions.push(pos);
                  break;
            }
        }

    }
  }
  return dataArr;
}

function filterPrevArray(posArray, data){
  let dataArr = Array.from(data, e => e.id);
  let keys = [...prevPositionsByID.keys()];
  keys.forEach(element => {
    let findElement = dataArr.find(function(d) { return d.id == element });
    if (findElement === undefined) {
      console.log("deleted");
      posArray.delete(element);
    }
  });

  return posArray;
}

function setPositionsMap(data, squareSize) {
  prevPositionsByID.clear();
  for (let i = 0; i < data.length; i++){
    prevPositionsByID.set(data[i].id,  data[i].x * squareSize + data[i].y);
  }

}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}