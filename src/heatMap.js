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
            textPosition: "r-c",
            sorting: "state",
            sortingType: "front",
            orientation: "top-left-h",
            mouseOverOpacity: 1,
            rx: 15,
            ry: 15,
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
                    [6, "burlywood"],
                    [7, "white"],
                    [8, "black"]
                ])
        },

        // Init current options like default
        this.currentOptions = this.defaultOptions;

        this.createPositionArray = function(data, length, squareSize,
            scaleSquareX, scaleSquareY) {
                let dataArr = new Array(length);
                for (let i = 0; i < length; i++){
                    let y;
                    let x;

                    switch(this.currentOptions.orientation){
                        case "bottom-left-v":
                            x = Math.floor(i / squareSize);
                            y = i % squareSize;
                            break;
                        case "bottom-left-h":
                            x = i % squareSize;
                            y = Math.floor(i / squareSize);
                            break;
                        case "top-left-h":
                            y = Math.floor(i / squareSize);
                            y = squareSize - y - 1;
                            x = i % squareSize;
                            break;
                        case "bottom-right-h":
                            x = i % squareSize;
                            x = squareSize - x - 1;
                            y = Math.floor(i / squareSize);
                            break;

                    }
                    dataArr[i] = {
                        x: x,
                        y: y,
                        id : +data[i]["id"],
                        value : +data[i]["value"],
                        state : +data[i]["state"],
                        link : data[i]["linkto"],
                        target : data[i]["target-path"]
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

        this.targetParse = function(targets) {

            let splitedTargets = new Array();
            for (let i = 0; i < targets.length; i++) {
                let tmp = targets[i].split('/');
                tmp.splice(0, 1);
                splitedTargets.push(tmp);
            };
            
            let depthMultiplier = 1;
            let maxDepth = Math.max.apply(Math, $.map(splitedTargets, function (el) { return el.length }));

            let resultSort = new Array(splitedTargets.length).fill(0);
            for (let i = 0; i < maxDepth; i++) {
                let targetsWeight = new Map();
                let currentWeight = 0;
                for (let j = 0; j < splitedTargets.length; j++){
                    if (splitedTargets[i].length > i) {
                        if (targetsWeight.has(splitedTargets[j][i])) {
                            resultSort[j] += targetsWeight.get(splitedTargets[j][i]) * depthMultiplier;
                        } else {
                            targetsWeight.set(splitedTargets[j][i], currentWeight);
                            resultSort[j] += currentWeight * depthMultiplier;
                            currentWeight++;
                        }
                    }
                }
                depthMultiplier *= 0.1;
            }
            return resultSort;
        }

        this.simpleSort = function(a, b, isBack) {
            if (isBack){
                if (a < b) return 1;
                if (b < a) return -1;
            } else {
                if (a > b) return 1;
                if (b > a) return -1;
            } 
            return 0;
        };

        this.sortingMap = function (data) {
            let type = this.currentOptions.sortingType;
            let simpleSort = this.simpleSort;
            let targetParse = this.targetParse;
            switch (this.currentOptions.sorting) {
                case "none":
                    return data;
                    break;
                case "state":
                    data.sort(function (a, b) { 
                        if (a.state == 5) a.state = -1;
                        if (b.state == 5) b.state = -1;
                        let res;

                        if (type == "back")
                            res = simpleSort(a.state, b.state, true);
                        else
                            res = simpleSort(a.state, b.state, false);

                        if (a.state == -1) a.state = 5;
                        if (b.state == -1) b.state = 5;
                        return res;
                    });
                    return data;
                    break;
                case "value":
                    data.sort(function (a, b) { 
                        let res;
                        if (type == "back")
                            res = simpleSort(a.value, b.value, true);
                        else 
                            res = simpleSort(a.value, b.value, false);
                        return res;
                    });
                    return data;
                    break;
                case "target":
                    let targets = data.map(a => a["target-path"]);
                    let sortWeight = targetParse(targets);
                    for (let i = 0; i < data.length; i++){
                        data[i].weight = sortWeight[i];
                    }
                    data.sort(function (a, b) {
                        let res;
                        if (type == "back")
                            res = simpleSort(a.weight, b.weight, true);
                        else
                            res = simpleSort(a.weight, b.weight, false);
                        return res;
                    })
                    console.log(data);
                    return data;
                    break;
                default:
                    return data;
                    break;
            }

        }

        this.calculateTextPos = function(xRect, yRect, textLength, textSize) {
            let x, y;
            
            console.log("length - " + textLength);
            console.log("size - " + textSize);
            // let currentRelativeRatio = textLength / textSize;
            // let sizeFactor = 0;
            // // textLength = textLength * sizeFactor;
            // if (currentRelativeRatio !== this.relativeRatio){
            //     //sizeFactor = te
            //     console.log("baad - ", currentRelativeRatio + " - " + this.relativeRatio);
            // }
            switch (this.currentOptions.textPosition) {
                case "r-c":
                    x = xRect - textLength / 2;
                    y = yRect / 2;
                    break;
                default:
                    x = xRect / 2;
                    y = yRect / 2;
                    break;
            };
            return {x, y};
        }.bind(this);

        // this.setRelativeRatio = function(ratio){
        //     this.relativeRatio = ratio;
        // }.bind(this);
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
                tooltipCurrent.html("The exact value of<br>this cell is: " + d.value)
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
            data = this.sortingMap(data);
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
            let newSize = 1 / squareSize * 100;
            let width = this.width;
            let padding = this.currentOptions.padding;
            //let setRatio = this.setRelativeRatio;
            let wrap = function () {
                var self = d3.select(this),
                textLength = self.node().getComputedTextLength(),
                text = self.text();
                while (textLength > ((width - 1000 * padding) / squareSize) && text.length > 0) {

                    text = text.slice(0, -1);
                    self.text(text + '...');
                    textLength = self.node().getComputedTextLength();
                }
                //setRatio(textLength / newSize);
                //console.log("relative - " + relativeRatio);
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

            //let data = this.sortingMap(this.currentData);
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
                .attr("rx", this.currentOptions.rx)
                .attr("ry", this.currentOptions.ry)
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


            
            //let newPos = this.calculateTextPos(x.bandwidth(), y.bandwidth());
            lincksRect
                .append("text")
                .attr("class", this.textStyles)
                .attr("dy", ".30em")
                .attr("id", "textData")
                .attr("opacity", 0)
                .style("font-size", function(d) { return newSize + "px" })
                    .append('tspan').text(function(d) { return d.id; }).each(wrap);

            let textClalculate = this.calculateTextPos;

            lincksRect
                .select("#textData")
                .attr("x", function(d) { return x(d.x) + textClalculate(x.bandwidth(), y.bandwidth(),
                    d3.select(this).node().getComputedTextLength(), newSize).x; })
                .attr("y", function(d) { return y(d.y) + textClalculate(x.bandwidth(), y.bandwidth(),
                    d3.select(this).node().getComputedTextLength(), newSize).y; })

            rects
                .exit()
                .remove();

            let dataTmp = new Array();
            d3.select('#dataviz').selectAll('#rectGroup').select('rect')
                .transition()
                .duration(600)
                .attr("width",  x.bandwidth() )
                .attr("height", y.bandwidth() )
                .style("fill", function(d) { dataTmp.push({x: d.x, y: d.y}); return color(d.state)} )
                .attr("x", function(d) { return x(d.x) })
                .attr("y", function(d) { return y(d.y) });


            let lables = d3.select('#dataviz').selectAll('#textData')
                .data(dataTmp);

            lables
            .style("font-size", function(d) { return newSize + "px" });

            lables
                .transition()
                .duration(600)
                .attr("x", function(d) { return x(d.x) + textClalculate(x.bandwidth(), y.bandwidth(),
                    d3.select(this).node().getComputedTextLength(), newSize).x; })
                .attr("y", function(d) { return y(d.y) + textClalculate(x.bandwidth(), y.bandwidth(),
                    d3.select(this).node().getComputedTextLength(), newSize).y; })
                .attr("opacity", 1)
                //.style("font-size", function(d) { return newSize + "px" });

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