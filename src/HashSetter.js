define([
    'jquery',
    'md5'
], function($, md5) {
    
    const HashSetter = {

        Set: function(data) {
            return md5(data);
        }
    }


})