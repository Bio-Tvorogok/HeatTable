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
            this.setStyleSheet = function(id, styles, widgetKey) {
                let div = this.widgetsMap.get(widgetKey);
                if (div !== undefined) {
                    let sheet = document.createElement('style');
                    sheet.innerHTML = id + ` { ${styles} }`;
                    div.appendChild(sheet);
                }
                // let sheet = document.createElement('style');
                // sheet.innerHTML = id + ` { ${styles} }`;
                // document.body.appendChild(sheet);
            }

            this.parseStyles = function(data) {
                data = data.replace(/\s+/g,' ').trim();
                return data;
            }

            this.widgetsMap = new Map();
        },

        Set: function(data, widgetKey) {

            let key = md5(data);
            let id = ".p" + key;

            this.parseStyles(data);
            this.setStyleSheet(id, data, widgetKey);

            return "p" + key;
        },

        RegisterWidget: function() {
            let key = md5(this.widgetsMap.size);
            let div = document.createElement('div');
            div.setAttribute("id", key);
            document.body.appendChild(div);
            this.widgetsMap.set(key, div);
            return key;
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