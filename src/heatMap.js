/*
* Initialize dashboard, get updates by http protocol.
*
* @project HeatMap widget
*
* @copyright RTEC Software 2010.
* @author Igor Kirdyashkin
*/

// (function () {

//     const HeatTables = {

//         defaultOptions: {
//             padding: 0.1
//         },

//         defaultColorScheme: {
//             scheme: [
//                     [0, "blue"],
//                     [1, "green"],
//                     [2, "yellow"],
//                     [3, "red"],
//                     [4, "crimson"],
//                     [5, "gray"],
//                     [7, "white"],
//                     [8, "black"]
//                 ]
//         },


//         HeatTable: function() {
//             console.log("keeeek");
//         }
//     }
// })

define([
    'jquery'
], function($) {
    'use strict';

    const HeatTables = {

        defaultOptions: {
            padding: 0.1
        },

        defaultColorScheme: {
            scheme: [
                    [0, "blue"],
                    [1, "green"],
                    [2, "yellow"],
                    [3, "red"],
                    [4, "crimson"],
                    [5, "gray"],
                    [7, "white"],
                    [8, "black"]
                ]
        },


        HeatTable: function() {
            console.log("keeeek");
        }
    }

    return HeatTables;
});