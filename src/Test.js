require.config({
    paths: {
        jquery: 'libs/jquery-2.1.1.min'
    }
});

requirejs(['jquery', 'heatMap'],
function   ($, sub) {
    //jQuery, canvas and the app/sub module are all
    //loaded and can be used here now.
    //sub.HeatTable();
    sub.HeatTable();
});