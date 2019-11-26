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
            this.setStyleSheet = function(id, styleClass, styles, widgetKey) {

                this.checkElementByID = function() {
                    let div = this.widgetsMap.get(widgetKey);
                    for(var i = 0; i < div.childNodes.length; i++)
                    {
                        if (div.childNodes[i].getAttribute('id') == id) {
                            return true;
                        }
                    }
                    return false;
                }

                this.findByClass = function() {
                    let div = this.widgetsMap.get(widgetKey);
                    for(var i = 0; i < div.childNodes.length; i++)
                    {
                        if (div.childNodes[i].getAttribute('class') == styleClass) {
                            return div.childNodes[i];
                        }
                    }
                    return undefined;
                }

                if (this.widgetsMap.has(widgetKey)) {
                    let div = this.widgetsMap.get(widgetKey);
                    if (!this.checkElementByID()) {
                        let oldStyles = this.findByClass();
                        if (oldStyles !== undefined) {
                            oldStyles.remove();
                            console.log("removed");
                        }

                        let sheet = document.createElement('style');
                        sheet.setAttribute("id", id);
                        sheet.setAttribute("class", styleClass);
                        sheet.innerHTML = ".p" + id + ` { ${styles} }`;
                        div.appendChild(sheet);
                    }
                }
            }

            this.parseStyles = function(data) {
                data = data.replace(/\s+/g,' ').trim();
                return data;
            }

            this.widgetsMap = new Map();
        },

        Set: function(data, styleClass, widgetKey) {

            let key = md5(data);

            this.parseStyles(data);
            this.setStyleSheet(key, styleClass, data, widgetKey);

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