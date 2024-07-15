sap.ui.define([
	"com/infocus/dataListApplication/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"sap/viz/ui5/api/env/Format",
	"sap/ui/core/ValueState",
	"com/infocus/dataListApplication/libs/html2pdf.bundle"

], function(BaseController, Filter, FilterOperator, JSONModel, MessageBox, Format, ValueState, html2pdf_bundle) {
	"use strict";

	return BaseController.extend("com.infocus.dataListApplication.controller.Home", {

		/*************** Application on load  *****************/
		onInit: function() {

			this.oRouter = this.getOwnerComponent().getRouter();

			// call the input parameters data
			this.getLedgerParametersData();
			this.getcompanyCodeParametersData();
			/*this.getYearParametersData();*/
			/*this.getPeriodParametersData();*/
			this.getGLParametersData();
			this.getDeptParametersData();

			// Update the global data model
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/reportS", "PRS");
				oGlobalDataModel.setProperty("/listS", "X");
				oGlobalDataModel.setProperty("/togglePanelVisibility", "X");
				oGlobalDataModel.setProperty("/pdfTableName", "Detailed List");
			}

			/*this._validateInputFields();*/
			this._columnVisible();

		},
		_validateInputFields: function() {
			var inputLedger = this.byId("inputLedger");
			var inputCompanyCode = this.byId("inputCompanyCode");
			/*var inputFiscalYear = this.byId("inputFiscalYear");*/
			var datePickerFrom = this.byId("fromDate");
			var datePickerTo = this.byId("toDate");
			var inputGL = this.byId("inputGL");
			var inputDept = this.byId("inputDept");

			var isValid = true;
			var message = '';

			if (!inputLedger.getValue()) {
				inputLedger.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Ledger, ';
			} else {
				inputLedger.setValueState(sap.ui.core.ValueState.None);
			}

			if (!inputCompanyCode.getValue()) {
				inputCompanyCode.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Company Code, ';
			} else {
				inputCompanyCode.setValueState(sap.ui.core.ValueState.None);
			}

			/*if (!inputFiscalYear.getValue()) {
				inputFiscalYear.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Fiscal Year, ';
			} else {
				inputFiscalYear.setValueState(sap.ui.core.ValueState.None);
			}*/

			// Validate from date
			if (!datePickerFrom.getValue()) {
				datePickerFrom.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'From Date, ';
			} else {
				datePickerFrom.setValueState(sap.ui.core.ValueState.None);
			}

			// Validate to date
			if (!datePickerTo.getValue()) {
				datePickerTo.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'To Date, ';
			} else {
				datePickerTo.setValueState(sap.ui.core.ValueState.None);
			}

			if (!inputGL.getValue()) {
				inputGL.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'GL, ';
			} else {
				inputGL.setValueState(sap.ui.core.ValueState.None);
			}

			if (!inputDept.getValue()) {
				inputDept.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Dept, ';
			} else {
				inputDept.setValueState(sap.ui.core.ValueState.None);
			}

			if (!isValid) {
				// Remove the last comma and space from the message
				message = message.slice(0, -2);
				sap.m.MessageBox.show("Please fill up the following fields: " + message);
				return false;
			}

			// Log date values for debugging
			console.log("From Date Value:", datePickerFrom.getValue());
			console.log("To Date Value:", datePickerTo.getValue());

			// Format dates
			var fromDate = this.formatDate(datePickerFrom.getValue());
			var toDate = this.formatDate(datePickerTo.getValue());

			// Show error message if dates are invalid
			if (!fromDate || !toDate) {
				sap.m.MessageBox.show("Invalid date format. Please enter valid dates.");
				return false;
			}

			// Set global data properties
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/ledgrNo", inputLedger.getValue());
				oGlobalDataModel.setProperty("/cmpnyCode", inputCompanyCode.getValue());
				/*oGlobalDataModel.setProperty("/fiscalY", inputFiscalYear.getValue());*/
				oGlobalDataModel.setProperty("/fromDate", fromDate);
				oGlobalDataModel.setProperty("/toDate", toDate);
				oGlobalDataModel.setProperty("/GL", inputGL.getValue());
				oGlobalDataModel.setProperty("/Dept", inputDept.getValue());
			}

			return true;
		},
		formatDate: function(dateString) {
			if (!dateString) {
				console.error("Invalid Date String:", dateString);
				return null;
			}

			var parts = dateString.split(/[-/.]/); // Handle different delimiters
			if (parts.length === 3 && parts[2].length === 2) {
				var year = parts[2];
				var month = parts[0];
				var day = parts[1];

				// Convert two-digit year to four-digit
				if (year.length === 2) {
					var currentYear = new Date().getFullYear();
					var currentCentury = Math.floor(currentYear / 100) * 100;
					year = (currentCentury + parseInt(year)).toString();
				}

				// Format as "YYYYMMDD"
				var formattedDate = year + month.padStart(2, '0') + day.padStart(2, '0');
				return formattedDate;
			} else if (parts.length === 3 && parts[2].length > 2) {
				var year = parts[2];
				var month = parts[1];
				var day = parts[0];

				// Convert two-digit year to four-digit
				/*if (year.length === 2) {
					var currentYear = new Date().getFullYear();
					var currentCentury = Math.floor(currentYear / 100) * 100;
					year = (currentCentury + parseInt(year)).toString();
				}*/

				// Format as "YYYYMMDD"
				var formattedDate = year + month + day;
				return formattedDate;
			} else {
				console.error("Invalid Date String:", dateString);
				return null;
			}
		},
		onLiveChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sInputId = oInput.getId();
			var sInputValue = oInput.getValue();
			var sProperty;

			// update based on the input field ID
			if (sInputId.endsWith("--inputLedger")) {
				sProperty = "/ledgrNo";
			} else if (sInputId.endsWith("--inputCompanyCode")) {
				sProperty = "/cmpnyCode";
			}
			/*else if (sInputId.endsWith("--inputFiscalYear")) {
				sProperty = "/fiscalY";
			}*/
			else if (sInputId.endsWith("--fromDate")) {
				sProperty = "/fromDate";
			} else if (sInputId.endsWith("--toDate")) {
				sProperty = "/toDate";
			} else if (sInputId.endsWith("--inputGL")) {
				sProperty = "/GL";
			} else if (sInputId.endsWith("--inputDept")) {
				sProperty = "/Dept";
			}

			// Update the global data model property
			if (sProperty) {
				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty(sProperty, sInputValue);
				}
			}

			// Apply ValueState based on input value
			if (sInputValue.trim() === "") {
				oInput.setValueState(ValueState.Error);
				oInput.setValueStateText("This field cannot be empty");
			} else {
				oInput.setValueState(ValueState.None);
				oInput.setValueStateText("");
			}
		},
		_columnVisible: function() {
			var oColumnVisible = this.getOwnerComponent().getModel("columnVisible");

			var data = {};
			data.glAcct = true;
			data.glAcctLongText = true;
			data.graphColumnVisible = false;
			for (var i = 1; i <= 16; i++) {
				var key = "l" + (i < 10 ? '0' + i : i) + "VFlag";
				data[key] = false;
			}

			oColumnVisible.setData(data);
		},

		/*************** get parameters data *****************/

		getLedgerParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZLEDGERSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oledgerDataModel = that.getOwnerComponent().getModel("ledgerData");
					oledgerDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);

				}
			});

		},
		getcompanyCodeParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZCOMPANYSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var ocompanyCodeDataModel = that.getOwnerComponent().getModel("companyCodeData");
					ocompanyCodeDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},
		/*getYearParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZYEARSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oYearDataModel = that.getOwnerComponent().getModel("yearData");
					oYearDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},*/
		/*getPeriodParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZPERIODSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oPeriodDataModel = that.getOwnerComponent().getModel("periodData");
					oPeriodDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},*/
		getGLParametersData: function() {
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			var pUrl = "/F4_GLSet";

			sap.ui.core.BusyIndicator.show();
			oModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oGLCodeDataModel = that.getOwnerComponent().getModel("glData");
					oGLCodeDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});
		},
		getDeptParametersData: function() {
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			var pUrl = "/F4_DEPTSet";

			sap.ui.core.BusyIndicator.show();
			oModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oDeptCodeDataModel = that.getOwnerComponent().getModel("deptData");
					oDeptCodeDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});
		},

		/*************** set the inputId & create the fragment *****************/

		/*handleValueLedger: function(oEvent) {
			this._ledgerInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogLedger) {
				this.oOpenDialogLedger = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogLedger", this);
				this.getView().addDependent(this.oOpenDialogLedger);
			}
			this.oOpenDialogLedger.open();
		},*/
		handleValueCompanyCode: function(oEvent) {
			this._companyCodeInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogComapanyCode) {
				this.oOpenDialogComapanyCode = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogComapanyCode", this);
				this.getView().addDependent(this.oOpenDialogComapanyCode);
			}
			this.oOpenDialogComapanyCode.open();
		},
		/*handleValueDialogFiscalYear: function(oEvent) {
			this._fiscalYearInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogFiscalYear) {
				this.oOpenDialogFiscalYear = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogFiscalYear", this);
				this.getView().addDependent(this.oOpenDialogFiscalYear);
			}
			this.oOpenDialogFiscalYear.open();
		},*/
		/*handleValueDialogFromPeriod: function(oEvent) {
			this._fromYearInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogFromPeriod) {
				this.oOpenDialogFromPeriod = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogFromPeriod", this);
				this.getView().addDependent(this.oOpenDialogFromPeriod);
			}
			this.oOpenDialogFromPeriod.open();
		},
		handleValueDialogToPeriod: function(oEvent) {
			this._toYearInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogToPeriod) {
				this.oOpenDialogToPeriod = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogToPeriod", this);
				this.getView().addDependent(this.oOpenDialogToPeriod);
			}
			this.oOpenDialogToPeriod.open();
		},*/
		handleValueGL: function(oEvent) {
			this._glInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogGL) {
				this.oOpenDialogGL = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogGL", this);
				this.getView().addDependent(this.oOpenDialogGL);
			}
			this.oOpenDialogGL.open();
		},
		handleValueDept: function(oEvent) {
			this._deptInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogDept) {
				this.oOpenDialogDept = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogDept", this);
				this.getView().addDependent(this.oOpenDialogDept);
			}
			this.oOpenDialogDept.open();
		},

		/*************** search value within fragment *****************/

		_handleValueLedgerSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Rldnr",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueCompanyCodeSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Companycode",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		/*_handleValueFiscalYearSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Gjahr",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},*/
		/*_handleValueFromPeriodSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Monat",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueToPeriodSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Monat",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},*/
		_handleValueGLSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Key",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueDeptSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Key",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		/*************** set the each property to globalData & reflect data in input field  *****************/

		_handleValueLedgerClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._ledgerInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputLedger = this.byId("inputLedger");
				if (newValue && newValue.trim()) {
					inputLedger.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputLedger.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/ledgrNo", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueCompanyCodeClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._companyCodeInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputCompanyCode = this.byId("inputCompanyCode");
				if (newValue && newValue.trim()) {
					inputCompanyCode.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputCompanyCode.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/cmpnyCode", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		/*_handleValueDialogFiscalYearClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._fiscalYearInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputFiscalYear = this.byId("inputFiscalYear");
				if (newValue && newValue.trim()) {
					inputFiscalYear.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputFiscalYear.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/fiscalY", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},*/
		/*_handleValueDialogFromPeriodClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._fromYearInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputFromPeriod = this.byId("inputFromPeriod");
				if (newValue && newValue.trim()) {
					inputFromPeriod.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputFromPeriod.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/fromP", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueDialogToPeriodClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._toYearInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputToPeriod = this.byId("inputToPeriod");
				if (newValue && newValue.trim()) {
					inputToPeriod.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputToPeriod.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/toP", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},*/
		_handleValueGLClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._glInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputGL = this.byId("inputGL");
				if (newValue && newValue.trim()) {
					inputGL.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputGL.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/GL", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueDeptClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._deptInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				//chk the blank input box validation
				var inputDept = this.byId("inputDept");
				if (newValue && newValue.trim()) {
					inputDept.setValueState(sap.ui.core.ValueState.None);
				} else {
					inputDept.setValueState(sap.ui.core.ValueState.Error);
				}

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/Dept", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		/*************** radio Button & drop down selection  *****************/

		onRadioButtonSelectReports: function(oEvent) {
			var radioButtonSelectReport = oEvent.getSource();
			var selectedButtonReport = radioButtonSelectReport.getSelectedButton().getText();

			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/reportS", selectedButtonReport);
			}
		},
		onRadioButtonSelectList: function(oEvent) {
			var radioButtonList = oEvent.getSource();
			var selectedButtonListText = radioButtonList.getSelectedButton().getText();

			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/listS", selectedButtonListText === "Detailed List" ? 'X' : '');
				oGlobalDataModel.setProperty("/pdfTableName", selectedButtonListText);
			}

		},
		onSelectChartType: function(oEvent) {
			// Get the selected radio button
			var selectedIndex = oEvent.getParameter("selectedIndex");
			var oVizFrame = this.byId("oVizFrame");
			var chartType;

			switch (selectedIndex) {
				case 0:
					chartType = "column";
					break;
				case 1:
					chartType = "pie";
					break;
				case 2:
					chartType = "line";
					break;
				case 3:
					chartType = "donut";
					break;
				default:
					chartType = "column";
			}

			// Update the vizType of the VizFrame
			oVizFrame.setVizType(chartType);
		},
		onTabularToChartChanged: function(oEvent) {
			var oSwitch = oEvent.getSource();
			var sId = oSwitch.getId();
			var aSwitches = [
				/*this.byId("splitViewSwitch"),*/
				this.byId("tabularDataSwitch"),
				this.byId("chartDataSwitch")
			]; // Array of all switches

			// SplitterLayoutData elements
			var oSplitterLayoutData1 = this.byId("splitterLayoutData1");
			var oSplitterLayoutData2 = this.byId("splitterLayoutData2");

			// which switch was toggled and get the corresponding text
			var sText;
			/*if (sId === this.byId("splitViewSwitch").getId()) {
				sText = "Split View";
			} else */
			if (sId === this.byId("tabularDataSwitch").getId()) {
				sText = "Tabular Data";
			} else if (sId === this.byId("chartDataSwitch").getId()) {
				sText = "Chart Data";
			} else {
				sText = "";
			}

			// If a valid switch was toggled
			if (sText) {
				// Turn off other switches and update SplitterLayoutData sizes
				aSwitches.forEach(function(s) {
					if (s.getId() !== sId) {
						s.setState(false);
					}
				});

				// Perform actions based on the text value of the toggled switch
				switch (sText) {
					case "Split View":
						oSplitterLayoutData1.setSize("50%");
						oSplitterLayoutData2.setSize("50%");
						break;
					case "Tabular Data":
						oSplitterLayoutData1.setSize("100%");
						oSplitterLayoutData2.setSize("0%");

						// pdf btn
						this.byId("downloadPdfBtn").setEnabled(true);
						break;
					case "Chart Data":
						oSplitterLayoutData1.setSize("0%");
						oSplitterLayoutData2.setSize("100%");

						// pdf btn
						this.byId("downloadPdfBtn").setEnabled(false);
						break;
					default:
						break;
				}
			}
		},

		/*************** Table column visible on based on flag  *****************/

		_assignVisiblity: function(oData, then) {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oColumnVisibleData = then.getOwnerComponent().getModel("columnVisible").getData();

			oColumnVisibleData.glAcct = oData[0].Racct === "" ? false : true;
			oColumnVisibleData.glAcctLongText = oData[0].GlText === "" ? false : true;
			oColumnVisibleData.graphColumnVisible = oData[0].DET_FLAG === "X" ? false : true;
			oGlobalData.togglePanelVisibility = oData[0].DET_FLAG === "X" ? "X" : "";

			// SplitterLayoutData elements
			var oSplitterLayoutData1 = this.byId("splitterLayoutData1");
			var oSplitterLayoutData2 = this.byId("splitterLayoutData2");

			for (var i = 1; i <= 16; i++) {
				var flagKey = "L" + (i < 10 ? '0' + i : i) + "_FLAG";
				var columnKey = "l" + (i < 10 ? '0' + i : i) + "VFlag";
				oColumnVisibleData[columnKey] = oData[0][flagKey] === 'X' ? true : false;
			}

			if (oData[0].DET_FLAG === "") {
				this.loadDefaultGraph();
				this.byId("panelForm").setExpanded(false);
				this.byId("chartDataSwitch").setState(true);

				// Update SplitterLayoutData sizes for split view
				oSplitterLayoutData1.setSize("0%");
				oSplitterLayoutData2.setSize("100%");

				// pdf button
				this.byId("downloadPdfBtn").setEnabled(false);

			} else {

				this.byId("panelForm").setExpanded(false);
				this.byId("chartDataSwitch").setState(false);
				// pdf button
				this.byId("downloadPdfBtn").setEnabled(true);
				this._removeHighlight();
			}

			then.getOwnerComponent().getModel("columnVisible").setData(oColumnVisibleData);
			then.getOwnerComponent().getModel("globalData").setData(oGlobalData);
		},

		/*************** get the table data from oData service  *****************/

		getListData: function() {
			// Validate input fields
			if (!this._validateInputFields()) {
				// Validation failed, return without fetching data
				return;
			}

			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			//var oUrl = /ZFI_FCR_SRV/ZFI_FCRSet?$filter=Rldnr eq '0L' and Rbukrs eq '1100' and Ryear eq '2023' and PrctrGr eq 'FTRS' and MinPr eq '03' and MaxPr eq '10' and DET_FLAG eq 'X';
			var oUrl = "/DEPTSet";
			var ledgrNo = new Filter('Rldnr', FilterOperator.EQ, oGlobalData.ledgrNo);
			var cmpnyCode = new Filter('Rbukrs', FilterOperator.EQ, oGlobalData.cmpnyCode);
			/*var fiscalY = new Filter('Ryear', FilterOperator.EQ, oGlobalData.fiscalY);*/
			var reportS = new Filter('PrctrGr', FilterOperator.EQ, oGlobalData.reportS);
			var fromDate = new Filter('FmDate', FilterOperator.EQ, oGlobalData.fromDate);
			var toDate = new Filter('ToDate', FilterOperator.EQ, oGlobalData.toDate);
			var GL = new Filter('Racct', FilterOperator.EQ, oGlobalData.GL);
			var Dept = new Filter('Dept', FilterOperator.EQ, oGlobalData.Dept);
			var listS = new Filter('DET_FLAG', FilterOperator.EQ, oGlobalData.listS);

			sap.ui.core.BusyIndicator.show();

			oModel.read(oUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				filters: [ledgrNo, cmpnyCode, reportS, fromDate, toDate, GL, Dept, listS],
				success: function(response) {
					var oData = response.results;
					console.log(oData);

					// Format decimal properties to 2 digits after the decimal point
					oData.forEach(function(item) {
						that._formatDecimalProperties(item, that);
					});

					var hslData = oData.map(function(item) {
						var newItem = {};
						for (var prop in item) {
							if (prop.includes("Hsl")) {
								var newProp = prop.replace("Hsl", "");
								newItem[newProp] = item[prop];
							} else {
								newItem[prop] = item[prop];
							}
						}
						return newItem;
					});
					
					console.log(hslData);

					// Extract "Hsl" properties
					/*var hslProperties = [];
					oData.forEach(function(item) {
						for (var prop in item) {
							if (prop.includes("Hsl")) {
								if (!hslProperties.includes(prop)) {
									hslProperties.push(prop);
								}
							}
						}
					});

					var oListDataModel = that.getOwnerComponent().getModel("listData");
					oListDataModel.setData({
						items: oData,
						hslProperties: hslProperties
					});*/

					var oListDataModel = that.getOwnerComponent().getModel("listData");
					oListDataModel.setData(oData);

					// check in oData value is available or not 
					if (typeof oData !== 'undefined' && oData.length === 0) {

						// hide the busy indicator
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.information('There are no data available!');
						that._columnVisible();
					} else {
						that._assignVisiblity(oData, that);

						// hide the busy indicator
						sap.ui.core.BusyIndicator.hide();
					}

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},
		_formatDecimalProperties: function(obj, then) {
			for (var key in obj) {

				if (key === 'Racct') {
					continue;
				} else if (typeof obj[key] === "object") {
					continue;
				} else if (!isNaN(parseFloat(obj[key])) && isFinite(obj[key])) {
					obj[key] = parseFloat(obj[key]).toFixed(2);
				}
			}

		},
		clearListData: function() {
			var that = this;

			sap.m.MessageBox.confirm(
				"Are you sure you want to clear all data?", {
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							// Clear input fields
							that.byId("inputLedger").setValue("0L");
							that.byId("inputCompanyCode").setValue("1100");
							that.byId("inputFiscalYear").setValue("");
							/*that.byId("inputFromPeriod").setValue("01");
							that.byId("inputToPeriod").setValue("12");*/

							// Deselect radio buttons
							that.byId("PRS").setSelected(true);
							that.byId("FTRS").setSelected(false);
							that.byId("CORP").setSelected(false);
							that.byId("companytotal").setSelected(false);
							that.byId("detailedlist").setSelected(true);
							that.byId("summarylist").setSelected(false);

							// Clear list data
							var oListDataModel = that.getOwnerComponent().getModel("listData");
							oListDataModel.setData({});

							// clear the chart data 
							var oChartDataModel = that.getOwnerComponent().getModel("chartData");
							oChartDataModel.setData({});

							// Update global data model properties
							var oGlobalDataModel = that.getOwnerComponent().getModel("globalData");
							if (oGlobalDataModel) {
								oGlobalDataModel.setProperty("/listS", "X");
								oGlobalDataModel.setProperty("/togglePanelVisibility", "X");
							}

							that._columnVisible();
							that.byId("downloadPdfBtn").setEnabled(false);
						}
					}
				}
			);
		},

		/*************** chart function & plotting the chart data  *****************/

		loadDefaultGraph: function() {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oListData = this.getOwnerComponent().getModel("listData").getData();
			var defaultFilterChartData = oListData[0]; // Assuming default data is at index 0
			var extractChartData = this.extractData(defaultFilterChartData);

			// Set default chart data
			this.getOwnerComponent().getModel("chartData").setData(extractChartData);

			// Set default panel visibility
			oGlobalData.togglePanelVisibility = defaultFilterChartData.DET_FLAG === "X" ? "X" : "";
			this.getOwnerComponent().getModel("globalData").setData(oGlobalData);

			// highlight the default table 
			/*var oTable = this.byId("dynamicTable");
			var aItems = oTable.getItems();*/
			this._highlightRow(0);
		},
		onChartButtonPress: function(oEvent) {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oListData = this.getOwnerComponent().getModel("listData").getData();
			var oChartDataModel = this.getOwnerComponent().getModel("chartData");

			var oButton = oEvent.getSource();
			var oRow = oButton.getParent();
			var oTable = this.byId("dynamicTable");
			var iIndex = oTable.indexOfItem(oRow);
			// Highlight the clicked row
			this._highlightRow(iIndex);

			var filterChartData = oListData[iIndex];
			var extractChartData = this.extractData(filterChartData);
			oChartDataModel.setData(extractChartData);

			// set the globaldata
			oGlobalData.togglePanelVisibility = oListData[0].DET_FLAG === "X" ? "X" : "";
			this.getOwnerComponent().getModel("globalData").setData(oGlobalData);

			// SplitterLayoutData elements
			var oSplitterLayoutData1 = this.byId("splitterLayoutData1");
			var oSplitterLayoutData2 = this.byId("splitterLayoutData2");

			// set the split view switch state to true
			/*this.byId("splitViewSwitch").setState(true);*/
			this.byId("tabularDataSwitch").setState(false);
			this.byId("chartDataSwitch").setState(true);

			// Update SplitterLayoutData sizes for split view
			oSplitterLayoutData1.setSize("0%");
			oSplitterLayoutData2.setSize("100%");

		},
		extractData: function(obj) {
			var result = [];
			var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			var monthColors = {
				'Jan': '#5B9BD5', // Blue
				'Feb': '#FF7F0E', // Orange
				'Mar': '#4CAF50', // Green
				'Apr': '#F44336', // Red
				'May': '#9C27B0', // Purple
				'Jun': '#FFEB3B', // Yellow
				'Jul': '#00BCD4', // Cyan
				'Aug': '#607D8B', // Grey
				'Sep': '#FF5722', // Deep Orange
				'Oct': '#673AB7', // Deep Purple
				'Nov': '#8BC34A', // Light Green
				'Dec': '#FF9800' // Amber
			};

			var oVizFrame = this.byId("oVizFrame");
			oVizFrame.setVizProperties({
				title: {
					visible: true,
					text: obj.GlAcGroup
				},
				/*legend: {
					title: {
						visible: true,
						text: 'Months'
					}
				},*/
				plotArea: {
					dataPointStyle: {
						rules: months.map(function(month) {
							return {
								dataContext: {
									Month: month
								},
								properties: {
									color: monthColors[month]
								}
							};
						})
					}
				}
			});

			for (var i = 1; i <= 16; i++) {
				var flagKey = "L" + (i < 10 ? '0' + i : i) + "_FLAG";
				var flag = obj[flagKey];
				var monthIndex = i - 1 < 9 ? i + 3 : i - 9;
				var month = months[monthIndex - 1] || 'Total';
				var valueKey = i < 10 ? "L0" + i : "L" + i;
				var value = obj[valueKey];

				if (flag === "X") {
					result.push({

						Month: month,
						Value: value
					});
				}
			}

			return result;
		},
		_highlightRow: function(iIndex) {
			var oTable = this.byId("dynamicTable");
			oTable.getItems().forEach(function(item, index) {
				if (index === iIndex) {
					item.addStyleClass("highlightedRow");
				} else {
					item.removeStyleClass("highlightedRow");
				}
			});
		},
		_removeHighlight: function() {
			var oTable = this.byId("dynamicTable");
			oTable.getItems().forEach(function(item) {
				item.removeStyleClass("highlightedRow");
			});
		},

		/*************** download pdf function  *****************/

		onDownloadPDF: function() {
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			var pdfTableName = oGlobalDataModel.oData.pdfTableName;
			var oTable = this.byId("dynamicTable");
			var oTableHtml = oTable.getDomRef().outerHTML;

			// Create a temporary DOM element to manipulate the table HTML
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = oTableHtml;

			// Remove the "Chart" column from the table header and body
			var chartColumnIndex = -1;
			var table = tempDiv.querySelector('table');
			var headers = table.querySelectorAll('th, td');

			headers.forEach((header, index) => {
				if (header.innerText === "Chart") {
					chartColumnIndex = index;
				}
			});

			if (chartColumnIndex !== -1) {
				// Remove the header cell
				table.querySelector('thead tr').deleteCell(chartColumnIndex);

				// Remove the corresponding cells in the body rows
				var rows = table.querySelectorAll('tbody tr');
				rows.forEach(row => {
					row.deleteCell(chartColumnIndex);
				});
			}

			var updatedTableHtml = tempDiv.innerHTML;

			// Show the global BusyIndicator
			sap.ui.core.BusyIndicator.show(0);

			var opt = {
				margin: [0.5, 0.5, 0.5, 0.5], // Adjust margins as needed
				filename: 'Fixed Cost Report' + ' ' + pdfTableName + '.pdf',
				image: {
					type: 'jpeg',
					quality: 0.98
				},
				html2canvas: {
					scale: 1, // Keep scale at 1 to capture full width
					scrollX: 0, // Capture entire width including horizontal scroll
					scrollY: 0,
					useCORS: true,
					logging: true
				},
				jsPDF: {
					unit: 'in',
					format: 'a4',
					orientation: 'landscape'
				},
				pagebreak: {
					mode: ['avoid-all', 'css', 'legacy']
				} // Ensure proper page breaks
			};

			// Use html2pdf.js to generate the PDF
			html2pdf()
				.from(updatedTableHtml)
				.set(opt)
				.toPdf()
				.get('pdf')
				.then((pdf) => {
					var totalPages = pdf.internal.getNumberOfPages();
					for (var i = 1; i <= totalPages; i++) {
						pdf.setPage(i);
						pdf.setFontSize(11);
						pdf.setTextColor(100);
						pdf.text(
							'Page ' + i + ' of ' + totalPages,
							pdf.internal.pageSize.getWidth() / 2,
							pdf.internal.pageSize.getHeight() - 10
						);
					}
				})
				.save()
				.finally(() => {
					// Hide the global BusyIndicator
					sap.ui.core.BusyIndicator.hide();
				});
		}

	});
});