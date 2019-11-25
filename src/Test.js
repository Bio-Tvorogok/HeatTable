require.config({
    paths: {
        jquery: 'libs/jquery-2.1.1.min',
        d3: 'https://d3js.org/d3.v4'
    }
});

requirejs(['jquery', 'heatMap'],
function   ($, sub) {

     sub.HeatMap();
     loop(sub, $);
    // let jsonArr = new Array();

    // $.getJSON('update-data.json', function(json){
    //     jsonArr.push(json);
    //     console.log(1);
    // });
    // $.getJSON('update-data2.json', function(json){
    //     jsonArr.push(json);
    //     console.log(2);

    // });
    // $.getJSON('update-data3.json', function(json){
    //     jsonArr.push(json);
    //     console.log(3);

    // });
    // sub.initCtrl("#dataviz", undefined, undefined);
    // sub.setParams(undefined, jsonArr[0], undefined);
    // sub.update(undefined, undefined);
    //loop(jsonArr, sub);
    //console.log(jsonArr);
    // console.log("json - " + json);
        
    // sub.initCtrl("#dataviz", undefined, undefined);

    // let i = 0;
    // while(true){
    //     sub.setParams(undefined, jsonArr[i], undefined);
    //     sub.update(undefined, undefined);
    //     i = (i + 1) % 3;
    // }

    // sub.setParams(undefined, json, undefined);
    // sub.update(undefined, undefined);
});

const jsonData = ["data/update-data.json", "data/update-data2.json", "data/update-data3.json"];

async function loop(sub, $) {
    let i = 0;
    console.log("init");
    sub.initCtrl("#dataviz", undefined, undefined);
    while(true) {
      await sleep(2000)
      console.log("update with - " + i);
      updateMap(jsonData[i], sub, $);
      i = (i + 1) % 3;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateMap(jsonName, sub, $){
    $.getJSON(jsonName, function(json){
        sub.setParams(undefined, json, undefined);
        sub.update(undefined, undefined);
    });
}

