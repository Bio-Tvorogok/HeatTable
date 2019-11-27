/*
* Initialize dashboard, get updates by http protocol.
*
* @project HeatMap widget
*
* @copyright RTEC Software 2010.
* @author Igor Kirdyashkin
*/

/**
 * --- HeatMap widget ---
 * - Used library: d3, jquery
 * - Only requirejs valid
 * 
 * - requirejs config example : 
 * ------| require.config({
 *       |   paths: {
 *       |       jquery: 'libs/jquery-2.1.1.min',
 *       |       d3: 'https://d3js.org/d3.v4'
 *       |   }
 * ------| });
 */

//TODO Check for copy
//TODO Set Options
define([
    'jquery',
    'd3',
    'HashSetter'
], function($, d3, hash) {
    'use strict';

    function HeatMap() {

        this.defaultOptions = {
            padding: 0.1,
            margin: {
                left: 1,
                right: 1,
                top: 1,
                bottom: 1
            },
        };

        this.currentOptions = undefined,

        this.defaultColorScheme = {
            scheme: new Map ([
                    [0, "blue"],
                    [1, "green"],
                    [2, "yellow"],
                    [3, "red"],
                    [4, "crimson"],
                    [5, "gray"],
                    [7, "white"],
                    [8, "black"]
                ])
        },

        // Init current options like default
        this.currentOptions = this.defaultOptions;
        // Init prev rect positions
        this.prevPositionsByID = new Map();

        this.createPositionArray = function(data, length, squareSize,
            scaleSquareX, scaleSquareY) {
                this.prevPositionsByID = this.filterPrevArray(this.prevPositionsByID, data);
                let tmpPositions = [...this.prevPositionsByID.values()];
                let dataArr = new Array(length);
                for (let i = 0; i < length; i++) {

                    let prevItem = this.prevPositionsByID.get(+data[i]["id"]);
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

        this.updateStyles = function() {
            let rects = this.svg.selectAll("#rectGroup");

            rects
                .select('a')
                .select('rect')
                .attr('class', this.rectStyles);

            rects
                .select('a')
                .select('text')
                .attr('class', this.textStyles);
        }

        this.filterPrevArray = function (posArray, data){
            let dataArr = Array.from(data, e => e.id);
            let keys = [...this.prevPositionsByID.keys()];
            keys.forEach(element => {
                let findElement = dataArr.find(function(d) { return d.id == element });
                if (findElement === undefined) {
                    console.log("deleted");
                    posArray.delete(element);
                }
            });
            return posArray;
        }

        this.setPositionsMap = function(data, squareSize) {
            this.prevPositionsByID.clear();
            for (let i = 0; i < data.length; i++){
                this.prevPositionsByID.set(data[i].id,  data[i].x * squareSize + data[i].y);
            }
        }.bind(this);
    }


    HeatMap.prototype = {
        initCtrl: function(contId, options, specopt) {
            this.widgetKey = hash.RegisterWidget(contId);
            // if (options !== undefined)
            //     this.currentOptions = options;
            this.width = 450 - this.currentOptions.margin.left - this.currentOptions.margin.right,
            this.height = 450 - this.currentOptions.margin.top - this.currentOptions.margin.bottom;

            //TODO Set Options
            contId = "#" + contId;
            this.tooltip = d3.select(contId)
            .append("div")
            .attr("id", "tooltipInfo")
            .attr("class", "tooltip")

            this.svg = d3.select(contId)
            .append("svg")
            .attr("width", this.width + this.currentOptions.margin.left + this.currentOptions.margin.right)
            .attr("height", this.height +this.currentOptions.margin.top + this.currentOptions.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + this.currentOptions.margin.left + "," + this.currentOptions.margin.top + ")");

            let fontWeightOnSelectCurrent = this.currentOptions.fontWeightOnSelect
            let fontWeightOnUnSelectCurrent = this.currentOptions.fontWeightOnUnSelect

            this.mouseoverText = function(d) {
                d3.select(this)
                    .style("font-weight", fontWeightOnSelectCurrent);
                }

            this.mouseleaveText = function(d){
                d3.select(this)
                    .style("font-weight", fontWeightOnUnSelectCurrent);
            }


            let mouseLeaveOpacityCurrent = this.currentOptions.mouseLeaveOpacity
            let mouseOverOpacityCurrent = this.currentOptions.mouseOverOpacity
            let tooltipCurrent = this.tooltip;

            this.mouseover = function(d) {
                tooltipCurrent.style("opacity", mouseOverOpacityCurrent);
                d3.select(this)
                .style("stroke", "black")
                // .style("opacity", mouseOverOpacityCurrent);
            };

            this.mousemove = function(d){
                tooltipCurrent.html("The exact value of<br>this cell is: " + d.state)
                .style("left", (d3.mouse(this)[0]+70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
                //.style("font-size", "20px")
            };

            this.mouseleave = function(d){
                tooltipCurrent.style("opacity", 0);
                d3.select(this)
                .style("stroke", "none")
                // .style("opacity", mouseLeaveOpacityCurrent);
            };

            this.colorBySignal = function(signal) {
                return this.defaultColorScheme.scheme.get(signal);
            }.bind(this);
        },

        unInitCtrl: function(contId) {
            hash.UnRegisterWidget(this.widgetKey);
        },

        setStyles: function(settings){
            let textData = settings["text"]["cls"];
            let rectData = settings["rect"]["cls"];
            if (textData !== undefined)
                this.textStyles = hash.Set(textData, "text", this.widgetKey);
            if (rectData !== undefined)
                this.rectStyles = hash.Set(rectData, "rect", this.widgetKey);

            this.updateStyles();
        },

        // Json parse
        setParams: function(uid, data, scaleN) {
            console.warn("Warning uid not used");
            console.warn("Warning scaleN not used");

            //console.log(data);
            let cellsCount = Object.keys(data).length;
            let squareSize = Math.ceil(Math.sqrt(cellsCount));
            this.currentData = this.createPositionArray(data, cellsCount, squareSize);
            //console.log(this.currentData);
        },

        getParams: function(uid, index) {

        },

        showParams: function(gaugeId, options, callbackInfo) {

        },

        run: function(contId) {

        },

        stop: function(contId) {

        },

        update: function(contId, contObj) {
            let cellsCount = Object.keys(this.currentData).length;

            let squareSize = Math.ceil(Math.sqrt(cellsCount));
            let groups = Array.from(Array(squareSize).keys());
            let vars = Array.from(Array(squareSize).keys());

            //TODO change function declaration
            let width = this.width;
            let padding = this.currentOptions.padding;
            let wrap = function () {
                var self = d3.select(this),
                textLength = self.node().getComputedTextLength(),
                text = self.text();
                while (textLength > ((width - 1000 * padding) / squareSize) && text.length > 0) {

                    text = text.slice(0, -1);
                    self.text(text + '...');
                    textLength = self.node().getComputedTextLength();
                }
            }

            let x = d3.scaleBand()
                .range([0, this.width])
                .domain(groups)
                .padding(padding);

            this.svg.enter().append("g")
                .style("font-size", 0)
                .attr("transform", "translate(0," + this.height + ")")
                .call(d3.axisBottom(x).tickSize(0))
                .select(".domain").remove();

            let y = d3.scaleBand()
                .range([this.height, 0])
                .domain(vars)
                .padding(padding);

            this.svg.enter().append("g")
                .style("font-size", 0)
                .call(d3.axisLeft(y).tickSize(0))
                .select(".domain").remove()

            let rects = this.svg.selectAll("#rectGroup").data(this.currentData, function(d) { return d.id; });

            let cells = rects.enter()
                .append('g')
                .attr('id', 'rectGroup');

            let color = this.colorBySignal

            let lincksRect = cells
                .append("a")
                .attr("xlink:href", function(d) { return d.link })
                .attr("target", "_blank");


            lincksRect
                .append('rect')
                .attr("class", this.rectStyles)
                .attr("rx", 15)
                .attr("ry", 15)
                .attr("id", function(d) {return d.id})
                .attr("width", 0 )
                .attr("height", 0 )
                .attr("x", function(d) { return x(d.x) })
                .attr("y", function(d) { return y(d.y) })
                    .style("fill", function(d) { return color(d.state)} )
                        .on("mouseover", this.mouseover)
                        .on("mousemove", this.mousemove)
                        .on("mouseleave", this.mouseleave)
                            .transition()
                            .duration(600)
                            .attr("x", function(d) { return x(d.x) })
                            .attr("y", function(d) { return y(d.y) });


            lincksRect
                .append("text")
                .attr("class", this.textStyles)
                .attr("dy", ".30em")
                .attr("id", "textData")
                .attr("x", function(d) { return x(d.x) + x.bandwidth() / 2 })
                .attr("y", function(d) { return y(d.y) + y.bandwidth() / 2 })
                .attr("opacity", 0)
                    .append('tspan').text(function(d) { return d.id; }).each(wrap);



            rects
                .exit()
                .remove();

            let dataTmp = this.currentData;
            d3.select('#dataviz').selectAll('#rectGroup').select('rect')
                .transition()
                .duration(600)
                .attr("width",  x.bandwidth() )
                .attr("height", y.bandwidth() )
                .style("fill", function(d) { return color(d.state)} )
                .on('start', function() {
                    let lables = d3.select('#dataviz').selectAll('#textData')
                        .data(dataTmp);

                        lables
                        .transition()
                        .duration(600)
                        .attr("x", function(d) { return x(d.x) + x.bandwidth() / 2; })
                        .attr("y", function(d) { return y(d.y) + y.bandwidth() / 2; })
                        .attr("opacity", 1)
                        .style("font-size", function(d) { return 1 / squareSize * 100 + "px" });
                })
                .attr("x", function(d) { return x(d.x) })
                .attr("y", function(d) { return y(d.y) });

            this.setPositionsMap(this.currentData, squareSize);
        },

        getDataFormat: function(contId) {

        },

        resize: function(contId, w, h) {

        },

        move: function(contId, x, y) {

        }
    }

    return HeatMap;
});