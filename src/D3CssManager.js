/*
* Initialize dashboard, get updates by http protocol.
*
* @project D3CssManager script
*
* @copyright RTEC Software 2010.
* @author Igor Kirdyashkin
*/

/**
 * Style Manager for widgets.
 * There is a singleton.
 * Used md5 hashing.
 */
define([
    'jquery',
    'md5'
], function($, md5) {
    let instance = null;

    function D3CssManager() {
        if (instance !== null){
            console.error("Cannot instantiate more than one HashSetter, use HashSetter.getInstance()");
        }

        this.initialize();
    }

    /**
     * Init instance of manager
     */
    D3CssManager.prototype.initialize = function() {

        this.checkElementByID = function(widgetKey, id) {
            let div = this.widgetsMap.get(widgetKey);
            for(let i = 0; i < div.childNodes.length; i++)
            {
                if (div.childNodes[i].getAttribute('id') == id) {
                    return true;
                }
            }
            return false;
        }

        this.findByClass = function(widgetKey, styleClass) {
            let div = this.widgetsMap.get(widgetKey);
            for(let i = 0; i < div.childNodes.length; i++)
            {
                if (div.childNodes[i].getAttribute('class') == styleClass) {
                    return div.childNodes[i];
                }
            }
            return undefined;
        }

        this.setStyleSheet = function(id, styleClass, styles, widgetKey) {



            if (this.widgetsMap.has(widgetKey)) {
                let div = this.widgetsMap.get(widgetKey);
                if (!this.checkElementByID(widgetKey, id)) {
                    let oldStyles = this.findByClass(widgetKey, styleClass);
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
    };

    /**
     * Setting new css styles for widjet
     *
     * @param {String} data new styles
     * @param {String} styleClass The element is associated with the styles
     * @param {String} widgetKey The key issued by the manager for connecting with styles
     *
     * @returns {String} New StyleSheet key for widjet class
     */
    D3CssManager.prototype.set = function(data, styleClass, widgetKey) {

        data = this.parseStyles(data);
        let key = md5(data);
        this.setStyleSheet(key, styleClass, data, widgetKey);

        return "p" + key;
    };

    /**
     * Registration of a widget with the issuance of a mutual key
     * Creating a child element to store styles
     * 
     * @param {String} widgetParentId main parent of widget id
     * @returns {String} issuance key
     */
    D3CssManager.prototype.registerWidget = function(widgetParentId) {
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
    };

    /**
     * Unsubscribing a widget from a manager
     *
     * @param {String} widgetKey issuance key
     */
    D3CssManager.prototype.unRegisterWidget = function (widgetKey) {
        this.widgetsMap.get(widgetKey).remove();
        this.widgetsMap.delete(widgetKey);
    };

    /**
     * Get instance of manager singleton
     *
     * @returns {Object} instance of manager
     */
    D3CssManager.getInstance = function() {
        if (instance === null){
            instance = new D3CssManager();
        }

        return instance;
    };

    return D3CssManager;
})