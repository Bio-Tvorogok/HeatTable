require.config({
    paths: {
        jquery: 'libs/jquery-2.1.1.min',
        d3: 'https://d3js.org/d3.v4',
        md5: 'md5/md5.min'
    }
});

requirejs(['jquery', 'heatMap'],
function   ($, map) {
    $.getJSON('data/settings.json', function(settings){
        loop(map, $, settings);
    });
});

const jsonData = ["data/update-data.json", "data/update-data2.json", "data/update-data3.json"];

async function loop(map, $, settings) {
    let i = 0;
    console.log("init");
    map.HeatMap();
    map.initCtrl("#dataviz", undefined, undefined);
    map.setStyles(settings);
    while(true) {
      await sleep(2000)
      console.log("update with - " + i);
      updateMap(jsonData[i], map, $);
      i = (i + 1) % 3;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateMap(jsonName, map, $){
    $.getJSON(jsonName, function(json){
        map.setParams(undefined, json, undefined);
        map.update(undefined, undefined);
    });
}

