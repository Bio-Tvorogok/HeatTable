require.config({
    paths: {
        jquery: 'libs/jquery-2.1.1.min',
        d3: 'https://d3js.org/d3.v4',
        md5: 'md5/md5.min'
    }
});

requirejs(['jquery', 'heatMap'],
function   ($, HeatMap) {
    $.getJSON('data/settings.json', function(settings){
        $.getJSON('data/settings2.json', function(settings2){
            $.getJSON('data/settings3.json', function(settings3){
                let arrData = [settings, settings2, settings3];
                loop(HeatMap, $, arrData);
            });
        });
        //loop(map, $, settings);
    });
});

const jsonData = ["data/update-data.json", "data/update-data2.json", "data/update-data3.json", "data/update-data4.json", "data/update-data5.json", "data/update-data-test.json", "data/update-data-test2.json"];

async function loop(HeatMap, $, settings) {
    let i = 0;
    console.log("init");
    let map = new HeatMap();
    // map.HeatMap();
    map.initCtrl("dataviz", undefined, undefined);
    map.setStyles(settings[0]);
    //updateMap(jsonData[4], map, $);

    // updateMap(jsonData[5], map, $);
    // await sleep(2000);
    // updateMap(jsonData[5], map, $);
    // await sleep(2000);
    // updateMap(jsonData[6], map, $);
    // await sleep(2000)
    // updateMap(jsonData[6], map, $);

    for (let j = 0; j < 4; j++) {
        await sleep(2000)
        console.log("update with - " + i);
        updateMap(jsonData[i], map, $);
        i = (i + 1) % 5;
    }
    map.setStyles(settings[1]);
    for (let j = 0; j < 4; j++) {
        await sleep(2000)
        console.log("update with - " + i);
        updateMap(jsonData[i], map, $);
        i = (i + 1) % 5;
    }
    map.setStyles(settings[2]);
    //map.unInitCtrl(undefined);
    while(true) {
      await sleep(2000)
      console.log("update with - " + i);
      updateMap(jsonData[i], map, $);
      i = (i + 1) % 5;
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

