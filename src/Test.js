require.config({
    paths: {
        jquery: 'libs/jquery-2.1.1.min',
        d3: 'https://d3js.org/d3.v4'
    }
});

requirejs(['jquery', 'heatMap'],
function   ($, sub) {

    sub.HeatMap();


    $.getJSON('update-data.json', function(json){
        console.log("json - " + json);
        
        sub.initCtrl("#dataviz", undefined, undefined);
        sub.setParams(undefined, json, undefined);
        sub.update(undefined, undefined);
    });
});