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

                if (this.widgetsMap.has(widgetKey)) {
                    let div = this.widgetsMap.get(widgetKey);
                    let sheet = document.createElement('style');
                    sheet.innerHTML = id + ` { ${styles} }`;
                    div.appendChild(sheet);
                }
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

        RegisterWidget: function(widgetParentId) {
            let key = md5(this.widgetsMap.size);
            let div = document.createElement('div');
            div.setAttribute("id", key);

            if (widgetParentId !== null && widgetParentId !== undefined) {
                let parent = document.getElementById(widgetParentId);
                if (parent !== null && parent !== undefined)
                    parent.appendChild(div);
                else
                    document.body.appendChild(div);
            } else {
                document.body.appendChild(div);
            }
            this.widgetsMap.set(key, div);
            return key;
        },

        UnRegisterWidget: function (widgetKey) {
            this.widgetsMap.get(widgetKey).remove();
            this.widgetsMap.delete(widgetKey);
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