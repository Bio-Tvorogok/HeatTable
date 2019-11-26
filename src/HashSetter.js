define([
    'jquery',
    'md5'
], function($, md5) {
    let instance = null;

    function HashSetter() {
        if (instance !== null){
            throw new Error("Cannot instantiate more than one HashSetter, use HashSetter.getInstance()")
        }

        this.initialize();
    }

    HashSetter.prototype = {
        initialize: function() {

            //TODO append
            this.setStyleSheet = function(id, styles) {
                let sheet = document.createElement('style');
                sheet.innerHTML = id + ` { ${styles} }`;
                document.body.appendChild(sheet);
            }

            this.parseStyles = function(data) {
                data = data.replace(/\s+/g,' ').trim();
                return data;
            }

        },

        Set: function(data) {

            let key = md5(data);
            let id = ".p" + key;

            this.parseStyles(data);
            this.setStyleSheet(id, data);

            return "p" + key;
        }
    }

    HashSetter.getInstance = function() {
        if (instance === null){
            instance = new HashSetter();
        }

        return instance;
    }

    return HashSetter.getInstance();
})