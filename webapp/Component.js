sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/infocus/fixedCostReportDept/model/models",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models, JSONModel) {
    "use strict";

    return UIComponent.extend("com.infocus.fixedCostReportDept.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Load external libraries
            /*this._loadExternalLibraries().then(function() {
                console.log("External libraries loaded successfully");
            }).catch(function(error) {
                console.error("Failed to load external libraries: ", error);
            });*/

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // create the views based on url/hash
            this.getRouter().initialize();
        },

        /**
         * Load external libraries
         * @private
         */
        _loadExternalLibraries: function() {
            return Promise.all([
            	this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js")
                /*this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.3.1/jspdf.umd.min.js"),
                this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.21/jspdf.plugin.autotable.min.js")*/
            ]);
        },

        /**
         * Helper function to load a script
         * @private
         * @param {string} url The URL of the script to load
         * @returns {Promise} A promise that resolves when the script is loaded
         */
        _loadScript: function(url) {
            return new Promise(function(resolve, reject) {
                var script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    });
});

//# sourceURL=https://devdbapp.titagarh.in:44301/sap/bc/ui2/undefined/com/infocus/dataListApplication/Component.js?eval