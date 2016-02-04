/**
 * @file : Parser.js
 * @className : com.incture.template.Parser.js
 * @author : manojchaurasiya
 * @date : 20-Jan-20163:18:04 pm
 * @description : 
 */
jQuery.sap.declare("com.incture.template.Parser");

com.incture.template.Parser = {

	init : function(jsonPath) {
		jQuery.sap.require("com.incture.template.router");
		//this.router = "com.incture.template.router";
		com.incture.template.router.init()
		
		var oModel = new sap.ui.model.json.JSONModel();
	
		//create json model
		if (jsonPath) {
			var data = this.fnGetJson(jsonPath, null,"get", false);
			oModel = new sap.ui.model.json.JSONModel(data);
		}
		//sap.ui.getCore().setModel(oModel,"defaultModel");
		var initialPageId = oModel.getData().app.screens[0].id;
		var app = new sap.m.App({
			id:oModel.getProperty('/app/app_detail/id'),
			initialPage : initialPageId
		});
		
		/** One model to hold our global values - */
		var applicationModel = new sap.ui.model.json.JSONModel({
			modelNames:[],
			applicationId:app.getId(),
			mobile:(oModel.getProperty('/app/app_detail/mobile') === "true")
		});
		sap.ui.getCore().setModel(applicationModel,"applicationModel");
		
		this.fnCreateScreensFromJson(oModel);
		
		/** function to create models */
		this.fnCreateModels();
		
		//listen or changing hash
		Path.listen();
		
		return app;
	},
	
	fnCreateScreensFromJson : function(oModel){
		var structureData = oModel.getData();
		var aScreens = structureData.app.screens;
		for (var incScreen = 0; incScreen < aScreens.length; incScreen++) {
			var screenElement = aScreens[incScreen];
			var oScreen = this.fnParseScreenType(screenElement);
			oScreen.setModel(oModel, "defaultModel");
		}
	},
	
	fnParseScreenType : function(screenElement){
		var screenType = screenElement.type;
		screenType = screenType.toLowerCase();
		var returnScreen = null;
		switch(screenType){
			case "popup" : returnScreen= this.fnCreatePopUp(screenElement);
				break;
			case "dialog" : returnScreen= this.fnCreateDialog(screenElement);
				break;
			default: returnScreen = this.fnCreatePage(screenElement);
					 sap.ui.getCore().byId(sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId')).addPage(returnScreen);
					 Path.map("#/"+returnScreen.getId()).to(function(){
						 sap.ui.getCore().byId(returnScreen.getId()).addEventDelegate({
							    onBeforeShow: function(evt) {
							    	
							        var dataObjectToTransfer = evt.data;
							    }
							});
						 
						 sap.ui.getCore().byId(sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId')).to(returnScreen.getId(),"slide",{object:"my object"});
						});

			break;
		}
		return returnScreen;
	},

	fnCreatePage : function(screenElement){
		var content = this.getContentFromJson(screenElement);
		
		var page = new sap.m.Page({
			id : screenElement.id, 
			busy : false, 
			busyIndicatorDelay : 1000,
			visible : screenElement.visible, 
			title : screenElement.title, 
			titleLevel : sap.ui.core.TitleLevel.Auto,
			showNavButton : (screenElement.navBack === "true"), 
			showHeader : true, 
			showSubHeader : true, 
			navButtonText : undefined, 
			enableScrolling : true, 
			icon : undefined, 
			backgroundDesign : sap.m.PageBackgroundDesign.Standard, 
			navButtonType : sap.m.ButtonType.Back,
			showFooter : true, 
			contentOnlyBusy : false, 
			tooltip : undefined, // sap.ui.core.TooltipBase
			content : content, 
			validateFieldGroup : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			navButtonTap : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			navButtonPress : [ function(oEvent) {
				var control = oEvent.getSource();
				var appId = sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId');
				sap.ui.getCore().byId(appId).back();
				com.incture.template.router.setHash("");
			}, this ]
		});
		
		return page;
	},
fnCreatePopUp :function(controlData){
		
		var content = this.getContentFromJson(controlData);
		
		var oRespPopover = new sap.m.ResponsivePopover({
			id : controlData.id, // sap.ui.core.ID
			visible : controlData.visible, // boolean
			placement : sap.m.PlacementType.Right, // sap.m.PlacementType
			showHeader : true, // boolean
			title : controlData.title, // string
			icon : undefined, // sap.ui.core.URI
			modal : undefined, // boolean
			offsetX : undefined, // int
			offsetY : undefined, // int
			contentWidth : controlData.width, // sap.ui.core.CSSSize
			contentHeight : undefined, // sap.ui.core.CSSSize
			horizontalScrolling : true, // boolean
			verticalScrolling : true, // boolean
			showCloseButton : true, // boolean
			tooltip : undefined, // sap.ui.core.TooltipBase
			content : content, // sap.ui.core.Control
			customHeader : undefined, // sap.m.IBar
			subHeader : undefined, // sap.m.IBar
			beginButton : undefined,// sap.m.Button, since 1.15.1
			endButton : undefined, // sap.m.Button, since 1.15.1
			beforeOpen : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			afterOpen : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			beforeClose : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			afterClose : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ]
		});
		
		return oRespPopover;
	},
	
	fnCreateDialog :function(controlData){
		
		var content = this.getContentFromJson(controlData);
		
		var oDialog = new sap.m.Dialog({
			id : controlData.id, // sap.ui.core.ID
			visible : controlData.visible, // boolean
			icon : undefined, // sap.ui.core.URI
			title : controlData.title, // string
			showHeader : true, // boolean, since 1.15.1
			type : sap.m.DialogType.Standard, // sap.m.DialogType
			state : sap.ui.core.ValueState.None, // sap.ui.core.ValueState, since 1.11.2
			stretchOnPhone : false, // boolean, since 1.11.2
			stretch : false, // boolean, since 1.13.1
			contentWidth : controlData.width, // sap.ui.core.CSSSize, since 1.12.1
			contentHeight : undefined, // sap.ui.core.CSSSize, since 1.12.1
			horizontalScrolling : true, // boolean, since 1.15.1
			verticalScrolling : true, // boolean, since 1.15.1
			resizable : false, // boolean, since 1.30
			draggable : false, // boolean, since 1.30
			tooltip : undefined, // sap.ui.core.TooltipBase
			content : content, // sap.ui.core.Control
			subHeader : undefined, // sap.m.IBar, since 1.12.2
			customHeader : undefined, // sap.m.IBar, since 1.15.1
			beginButton : undefined,// sap.m.Button, since 1.15.1
			endButton : undefined, // sap.m.Button, since 1.15.1
			buttons : [], // sap.m.Button, since 1.21.1
			leftButton : undefined, // sap.m.Button
			rightButton : undefined, // sap.m.Button
			initialFocus : undefined, // sap.ui.core.Control, since 1.15.0
			ariaDescribedBy : [], // sap.ui.core.Control
			beforeOpen : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			afterOpen : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			beforeClose : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			afterClose : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ]
		});
		return oDialog;
	},
	/**Function to generate the screens , layouts and all the controls based on input json data **/
	getContentFromJson : function(screenElement) {
		var content = [];
//		var aScreens = jsonData.app.screens;
//		if(!aScreens){
//			aScreens=[];
//		}
		var aControlsForScreen = screenElement.layouts[0].controls;
		for (var controlInc = 0; controlInc < aControlsForScreen.length; controlInc++) {
			var control = aControlsForScreen[controlInc];
			var modelName = control.id+"_model";
			var oControl = this.fnParseControl(control,screenElement);
			sap.ui.getCore().getModel('applicationModel').getProperty("/modelNames").push(modelName);
			var oActionControl = this.fnParseControlForActions(control);
			content.push(oControl);
			var actionData=[];
			actionData.push(new sap.m.ToolbarSpacer({}));
			if(oActionControl != undefined){
				for(var actionInc=0 ; actionInc< oActionControl.length; actionInc++){
					actionData.push(oActionControl[actionInc]);
					//oControl.addContent(oActionControl[actionInc]);
				}
			}
			
			actionData.push(new sap.m.ToolbarSpacer({width:"10%"}));
			var actionBar = this.fnCreateToolBar(actionData);
			content.push(actionBar);
		}

		return content;
	},
	
	/**
	 * parameter : bTable - using this we will decide whether to check Type property or template property ( for table)
	 */
	fnParseControl : function(controlData, parentControl, bTableElement) {
		
		var controlType = controlData.type;
		if(bTableElement){
			controlType = controlData.colTemplateType;
		}
		
		if(controlType!==undefined){
			controlType = controlType.toLowerCase();
		}
		var oReturnControl = null;
		switch (controlType) {
		case "input":
			oReturnControl = this.fnCreateInput(controlData,parentControl);
			break;
		case "radiobutton":
			oReturnControl = this.fnCreateRadioButton(controlData,parentControl);
			break;
		case "checkbox":
			oReturnControl = this.fnCreateCheckBox(controlData,parentControl);
			break;
		case "datepicker":
			oReturnControl = this.fnCreateDatePicker(controlData,parentControl);
			break;
		case "textarea":
			oReturnControl = this.fnCreateTextArea(controlData,parentControl);
			break;
		case "text":
			oReturnControl = this.fnCreateText(controlData,parentControl,bTableElement);
			break;
		case "form":
			var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
			if(bMobileEnabled){
				oReturnControl = this.fnCreateGrid(controlData,parentControl);
			}
			else{
				oReturnControl = this.fnCreateMatrixLayout(controlData,parentControl);
			}
			break;
		case "select":
			oReturnControl = this.fnCreateSelect(controlData,parentControl);
			break;
		case "submit":
		case "button":
			oReturnControl = this.fnCreateButton(controlData, parentControl, "parseFormActions");
			break;
		case "link":
			oReturnControl = this.fnCreateLink(controlData, parentControl);
			break;
		case "table":
			oReturnControl = this.fnCreateTable(controlData, parentControl);
			break;
		default:
			break;
		}
		return oReturnControl;
	},
	
	fnCreateGrid : function(controlData,parentControl,bTableForm){
		var oFormElements = controlData.elements;
		var aFormContents = [];
		var isLabelRequired = true;
		var sFormId = controlData.id;
		if(bTableForm){
			 oFormElements = controlData;
			 sFormId = parentControl.id+"_formId";
		}
		for (var elementInc = 0; elementInc < oFormElements.length; elementInc++) {
			var element = oFormElements[elementInc];
//			var oControl = this.fnParseControl(element,controlData);
			/**
			 * Change --  to check if control is created for Table form or normal form
			 * 
			 */
			if(bTableForm){
				var oControl = this.fnParseControl(element,parentControl);
			}
			else{
				var oControl = this.fnParseControl(element,controlData);
			}
			isLabelRequired= this.fnIsLabelRequired(element,controlData);
			if(isLabelRequired){
				var oLabelForControl = this.fnCreateLabel(element,"Center"); //2nd parameter is for begin/Center/Right Alignment
				switch(element.labelAlignment){
				case "left":
				case "Left": 
						aFormContents.push(oLabelForControl);
						aFormContents.push(oControl);
					break;
				case "right":
				case "Right": 
						aFormContents.push(oControl);
						aFormContents.push(oLabelForControl);
					break;	
				
				case "top":
				case "Top": var oVBox = this.fnCreateVBox();
								oVBox.addItem(oLabelForControl);
								oVBox.addItem(oControl);
								aFormContents.push(oVBox);
								break;
				case "bottom":
				case "Bottom":
				case "below":
				case "Below": var oVBox = this.fnCreateVBox();
								oVBox.addItem(oControl);
								oVBox.addItem(oLabelForControl);
								aFormContents.push(oVBox);
							break;
				default:
							aFormContents.push(oLabelForControl);
							aFormContents.push(oControl);
						break;
				}
			}
			else{
				aFormContents.push(oControl);
			}
		}
		
		var oGrid = new sap.ui.layout.Grid({
			id:sFormId,
			visible : true, // boolean
			width : "100%", // sap.ui.core.CSSSize
			vSpacing : 1, // float
			hSpacing : 2, // float
			position : sap.ui.layout.GridPosition.Left, // sap.ui.layout.GridPosition
			defaultSpan : "XL2 L2 M6 S12", // sap.ui.layout.GridSpan
			defaultIndent : "XL0 L0 M0 S0", // sap.ui.layout.GridIndent
			containerQuery : false, // boolean
			tooltip : undefined, // sap.ui.core.TooltipBase
			content : aFormContents
		});
		
		var sModelName = sFormId+"_model";
		sap.ui.getCore().getModel('applicationModel').getProperty('/modelNames').push(sModelName);
		return oGrid;
	},
	//3rd parameter - tells the parser that we are creating a form for table
	fnCreateMatrixLayout:function(controlData,parentControl,bTableForm){
		
		var oRow = undefined; 
		var aRows = [];
		var oFormElements = controlData.elements;
		var sFormId = controlData.id;
		if(bTableForm){
			 oFormElements = controlData;
			 sFormId = parentControl.id+"_formId";
		}
		var isLabelRequired = true;
		
		for (var elementInc = 0; elementInc < oFormElements.length; elementInc++) {
			if(oRow == undefined || oRow.getCells().length % 6 == 0){
				oRow = new sap.ui.commons.layout.MatrixLayoutRow({});
				aRows.push(oRow);
			}
			var element = oFormElements[elementInc];
			//var oControl = this.fnParseControl(element,controlData);
			if(bTableForm){
				var oControl = this.fnParseControl(element,parentControl);
			}
			else{
				var oControl = this.fnParseControl(element,controlData);
			}
			
			isLabelRequired= this.fnIsLabelRequired(element,controlData);
			if(isLabelRequired){
				var oLabelForControl = this.fnCreateLabel(element,"Center"); //2nd parameter is for begin/Center/Right Alignment
				switch(element.labelAlignment){
				case "left":
				case "Left": 
							var cellLbl = new sap.ui.commons.layout.MatrixLayoutCell(
									{
										content : [oLabelForControl]
									// sap.ui.core.Control
									});
							var cellControl =new sap.ui.commons.layout.MatrixLayoutCell(
									{
										content : [oControl]
									// sap.ui.core.Control
									});
							oRow.addCell(cellLbl);
							oRow.addCell(cellControl);
					break;
				case "right":
				case "Right": 
							var cellLbl = new sap.ui.commons.layout.MatrixLayoutCell({
										content : [oLabelForControl]
									// sap.ui.core.Control
									});
							var cellControl =new sap.ui.commons.layout.MatrixLayoutCell({
										content : [oControl]
									// sap.ui.core.Control
									});
							oRow.addCell(cellControl);
							oRow.addCell(cellControl);
					break;	
				
				case "top":
				case "Top": var oVBox = this.fnCreateVerticalLayout();
								oVBox.addContent(oLabelForControl);
								oVBox.addContent(oControl);
								var cell =  new sap.ui.commons.layout.MatrixLayoutCell({
									content : [oVBox]
								});
								oRow.addCell(cell);
								break;
				case "bottom":
				case "Bottom":
				case "below":
				case "Below": var oVBox = this.fnCreateVerticalLayout();
								oVBox.addContent(oControl);
								oVBox.addContent(oLabelForControl);
								var cell =  new sap.ui.commons.layout.MatrixLayoutCell({
									content : [oVBox]
								});
								oRow.addCell(cell);
							break;
				default:
					var cellLbl = new sap.ui.commons.layout.MatrixLayoutCell(
							{
								content : [oLabelForControl]
							// sap.ui.core.Control
							});
					var cellControl =new sap.ui.commons.layout.MatrixLayoutCell(
							{
								content : [oControl]
							// sap.ui.core.Control
							});
					oRow.addCell(cellLbl);
					oRow.addCell(cellControl);
						break;
				}
			}
			else{
				var cellControl =new sap.ui.commons.layout.MatrixLayoutCell(
						{
							content : [oControl]
						// sap.ui.core.Control
						});
				oRow.addCell(cellControl);
			}
		}
		
		var oLayout = new sap.ui.commons.layout.MatrixLayout(
				{
					id:sFormId,
					visible : true, // boolean
					width : undefined, // sap.ui.core.CSSSize
					height : undefined, // sap.ui.core.CSSSize
					layoutFixed : true, // boolean
					columns : 6, // int
					widths : undefined, // sap.ui.core.CSSSize[]
					tooltip : undefined, // sap.ui.core.TooltipBase
					rows : aRows
				// sap.ui.commons.layout.MatrixLayoutRow
				});
		var sModelName = sFormId+"_model";
		sap.ui.getCore().getModel('applicationModel').getProperty('/modelNames').push(sModelName);
		return oLayout;
	},
	/**Function to generate form control **/
	fnCreateSimpleForm : function(controlData,parentControl) {
		var oFormElements = controlData.elements;
		var aFormContents = [];

		for (var elementInc = 0; elementInc < oFormElements.length; elementInc++) {
			var element = oFormElements[elementInc];
			var oLabelForControl = this.fnCreateLabel(element,parentControl);
			var oControl = this.fnParseControl(element,parentControl);
			aFormContents.push(oLabelForControl);
			aFormContents.push(oControl);

		}

		var form = new sap.ui.layout.form.SimpleForm({
			busy : false,
			busyIndicatorDelay : 1000,
			visible : true,
			maxContainerCols : 2,
			minWidth : -1,
			editable : true,
			labelMinWidth : 192,
			styleClass:controlData.className,
			layout : sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout,
			labelSpanL : 4,
			labelSpanM : 2,
			labelSpanS : 12,
			emptySpanL : 0,
			emptySpanM : 0,
			emptySpanS : 0,
			columnsL : 2,
			columnsM : 1,
			breakpointL : 1024,
			breakpointM : 600,
			tooltip : undefined,
			content : aFormContents,
			title : new sap.ui.core.Title({
				text : undefined,
				icon : undefined,
				level : sap.ui.core.TitleLevel.Auto,
				emphasized : false,
				tooltip : undefined,
				customData : [],
				dependents : []
			})
		});

		return form;
	},
	
	fnCreateInput : function(controlData,parentControl) {
		var parentModel = parentControl.id +"_model";
		var type = parentControl.type;
		if(type!=undefined){
			type = type.toLowerCase();
			if(type == "table"){
				parentModel = parentControl.id +"_formId_model";
			}
		}
		var oInput = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		var valueType = this.fnParseInputValueType(controlData.valueType);
		if(bMobileEnabled){
			 oInput = new sap.m.Input({
				id:controlData.id,
				visible : (controlData.visible === "true"), // boolean
				value : "{" + parentModel + ">/"+controlData.bindingName + "}", // string
				width : controlData.width, // sap.ui.core.CSSSize
				enabled :(controlData.enable === "true"), // boolean
				placeholder : controlData.placeholder, // string
				styleClass:controlData.className,
				editable : (controlData.editable === "true"), // boolean, since 1.12.0
				type : valueType, // sap.m.InputType
				maxLength : Number.parseInt(controlData.maxlength), // int
				dateFormat : "YYYY-MM-dd", // string
				showValueHelp : false, // boolean, since 1.16
				showSuggestion : false, // boolean, since 1.16.1
				valueHelpOnly : false, // boolean, since 1.21.0
				startSuggestion : 1, // int, since 1.21.2
				showTableSuggestionValueHelp : true, // boolean, since 1.22.1
				fieldWidth : "50%", // sap.ui.core.CSSSize
				suggestionItems : [], // sap.ui.core.Item, since 1.16.1
				suggestionColumns : [], // sap.m.Column, since 1.21.1
				suggestionRows : [], // sap.m.ColumnListItem, since 1.21.1
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				liveChange : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				valueHelpRequest : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ], // since 1.16
				suggest : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ], // since 1.16.1
				suggestionItemSelected : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			// since 1.16.3
			});
		}
		else{
			
			oInput = new sap.ui.commons.TextField({
				id : controlData.id, // sap.ui.core.ID
				visible :  (controlData.visible === "true"), // boolean
				value : "{" + parentModel + ">/"+controlData.bindingName + "}", // string
				enabled : (controlData.enable === "true"), // boolean
				editable : (controlData.editable === "true"), // boolean
				required : false, // boolean
				width : controlData.width, // sap.ui.core.CSSSize
				maxLength : Number.parseInt(controlData.maxlength), // int
				imeMode : sap.ui.core.ImeMode.Auto, // sap.ui.core.ImeMode
				design : sap.ui.core.Design.Standard, // sap.ui.core.Design
				helpId : "", // string
				placeholder : controlData.placeholder, // string, since 1.14.0
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				liveChange : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		
		
		return oInput;
	},
	
	fnParseInputValueType : function(valueType){
		var type="";
		valueType= valueType.toLowerCase();
		
		switch(valueType){
		case "text": type= sap.m.InputType.Text;
			break;
		case "tel": type= sap.m.InputType.Tel;
			break;
		case "number": type= sap.m.InputType.Number;
			break;
		case "email": type= sap.m.InputType.email;
			break;
		default: type= sap.m.InputType.Text;
			break;
		}
		
		return type;
	},
	
	fnCreateLabel : function(controlData,alignment) {
		if(alignment === undefined)
			alignment = "Begin";
		var oLabel = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oLabel = new sap.m.Label({
				styleClass:controlData.className,
				visible : (controlData.visible === "true"), // boolean
				design : sap.m.LabelDesign.Standard, // sap.m.LabelDesign
				text : controlData.label, // string
				textAlign : alignment, // sap.ui.core.TextAlign
				width : "100%", // sap.ui.core.CSSSize
				required :(controlData.mandatory === "true"), // boolean
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				labelFor : controlData.id
			});
		}
		else{
			
			oLabel = new sap.ui.commons.Label({
				visible :  (controlData.visible === "true"), // boolean
				design : sap.ui.commons.LabelDesign.Standard, // sap.ui.commons.LabelDesign
				wrapping : false, // boolean
				width : "100%", // sap.ui.core.CSSSize
				text : controlData.label, // string
				icon : undefined, // sap.ui.core.URI
				textAlign : alignment, // sap.ui.core.TextAlign
				required :(controlData.mandatory === "true"), // boolean, since 1.11.0
				requiredAtBegin : undefined, // boolean, since 1.14.0
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				labelFor :  controlData.id
			// sap.ui.core.Control
			});
		}
		

		return oLabel;
	},
	
	/**Function to generate table control **/
	fnCreateTable : function(controlData,parentControl) {
		var table=undefined;
		var sModelName = controlData.id+"_model";
		sap.ui.getCore().getModel('applicationModel').getProperty('/modelNames').push(sModelName);
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		var aColumns =[];
		var tableColumns = controlData.columns;
		var oLayout  = undefined; 
		
		
		//console.log(oDialog.getId())
		var oToolbar = this.fnCreateToolBar();
		if(bMobileEnabled){
			oToolbar.addContent(new sap.m.ToolbarSpacer({}));
			oToolbar.setDesign("Solid");
		}
		if(controlData.addRow === "true"){
			
			var oButtonData = {
					label:"Add"
					
			};
//			/var oAddRowButton = this.fnCreateButton(oButtonData, controlData);
			var oAddRowButton = this.fnCreateButton(oButtonData, controlData,"fnAddRow");
			if(bMobileEnabled){
				oToolbar.addContent(oAddRowButton);
			}
			else{
				oToolbar.addRightItem(oAddRowButton);
			}
			
		}
		
		if(controlData.updateRow === "true"){
					
			var oButtonData = {
					label:"Update"
					
			};
//			var oUpdateRowButton = this.fnCreateButton(oButtonData, controlData);
			var oUpdateRowButton = this.fnCreateButton(oButtonData, controlData,"fnUpdateRow");
			if(bMobileEnabled){
				oToolbar.addContent(oUpdateRowButton);
			}
			else{
				oToolbar.addRightItem(oUpdateRowButton);
			}
		}
		if(controlData.deleteRow === "true"){
			
			var oButtonData = {
					label:"Delete"
					
			};
//			var oDeleteRowButton = this.fnCreateButton(oButtonData, controlData);
			var oDeleteRowButton = this.fnCreateButton(oButtonData, controlData,"fnDeleteRow");
			if(bMobileEnabled){
				oToolbar.addContent(oDeleteRowButton);
			}
			else{
				oToolbar.addRightItem(oDeleteRowButton);
			}
		}
		
		if(bMobileEnabled){
			oToolbar.addContent(new sap.m.ToolbarSpacer({ width:"10%"}));
		}
		for (var columnInc = 0; columnInc < tableColumns.length; columnInc++) {
			var arrayElement = tableColumns[columnInc];
			var oColumn = this.fnCreateColumn(arrayElement,controlData)
			aColumns.push(oColumn);
		}
		
		
		if(bMobileEnabled){
			this.fnGetJson(controlData.serviceUrl, null, "get", true, null, sModelName);
			
			
			oLayout = this.fnCreateGrid(controlData.columns, controlData,true);
			//get column header 
			var bColumns =[];
			var columns = controlData.columns;
			
			for (var columnInc = 0; columnInc < columns.length; columnInc++) {
				var arrayElement = columns[columnInc];
				var oColumn = this.fnCreateColumnHeader(arrayElement,controlData)
				bColumns.push(oColumn);
			}
			
			var template = new sap.m.ColumnListItem({
				busy : false,
				busyIndicatorDelay : 1000,
				visible : true,
				type : sap.m.ListType.Inactive,
				visible : true,
				unread : false,
				selected : false,
				counter : undefined,
				tooltip : undefined,
				cells : aColumns,
				tap : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				detailTap : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				press : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				detailPress : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});

			var selectionMode = controlData.multiSelect == 'true' ? sap.m.ListMode.MultiSelect : sap.m.ListMode.SingleSelectLeft;
			//create table 
			table = new sap.m.Table({
				id : controlData.id,
				busy : false,
				busyIndicatorDelay : 1000,
				visible : (controlData.visible === "true"),
				inset : false,
				headerText : controlData.title,
				headerDesign : sap.m.ListHeaderDesign.Standard,
				footerText : undefined,
				mode : selectionMode,
				width : "100%",
				includeItemInSelection : false,
				showUnread : false,
				noDataText : undefined,
				showNoData : true,
				enableBusyIndicator : true,
				modeAnimationOn : true,
				showSeparators : sap.m.ListSeparators.All,
				swipeDirection : sap.m.SwipeDirection.Both,
				growing : (controlData.pagination === "true"),
				growingThreshold : Number(controlData.visibleRows),
				growingTriggerText : undefined,
				growingScrollToLoad : (controlData.pagination === "true"),
				rememberSelections : true,
				backgroundDesign : sap.m.BackgroundDesign.Translucent,
				fixedLayout : true,
				showOverlay : false,
				tooltip : undefined,
				items : [],
				swipeContent : undefined,
				headerToolbar : oToolbar,
				infoToolbar : undefined,
				columns : bColumns,
				select : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				selectionChange : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				"delete" : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				swipe : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				growingStarted : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				growingFinished : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				updateStarted : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				updateFinished : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				itemPress : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});

			//set model for the table and bind template
			table.bindAggregation("items", sModelName+">/"+controlData.bindingName, template);
		}
		else{
			//3rd parameter - tells the parser that we are creating a form for table
			oLayout = this.fnCreateMatrixLayout(controlData.columns, controlData,true);
			
			var selectionMode = controlData.multiSelect == 'true' ? sap.ui.table.SelectionMode.Multi : sap.ui.table.SelectionMode.Single;
			var navigationMode = controlData.multiSelect == "true" ? sap.ui.table.NavigationMode.Paginator : sap.ui.table.NavigationMode.Scrollbar;
			
			var table = new sap.ui.table.Table({
				id : controlData.id, // sap.ui.core.ID
				visible : controlData.visible == "true" ? true:false, // boolean
				width : controlData.width, // sap.ui.core.CSSSize
				rowHeight : undefined, // int
				columnHeaderHeight : undefined, // int
				columnHeaderVisible : true, // boolean
				visibleRowCount : Number.parseInt(controlData.visibleRows), // int
				firstVisibleRow : 0, // int
				selectionMode : selectionMode, // sap.ui.table.SelectionMode
				selectionBehavior : sap.ui.table.SelectionBehavior.RowSelector, // sap.ui.table.SelectionBehavior
				selectedIndex : -1, // int
				allowColumnReordering : true, // boolean
				editable : true, // boolean
				navigationMode : navigationMode, // sap.ui.table.NavigationMode
				threshold : 100, // int
				enableColumnReordering : true, // boolean
				enableGrouping : false, // boolean
				showColumnVisibilityMenu : false, // boolean
				showNoData : true, // boolean
				visibleRowCountMode : sap.ui.table.VisibleRowCountMode.Fixed, // sap.ui.table.VisibleRowCountMode, since 1.9.2
				fixedColumnCount : Number.parseInt(controlData.fixedCols), // int
				fixedRowCount : 0, // int
				minAutoRowCount : 5, // int
				fixedBottomRowCount : 0, // int, since 1.18.7
				enableColumnFreeze : false, // boolean, since 1.21.0
				enableCellFilter : false, // boolean, since 1.21.0
				noDataText : controlData.noDataText, // string, since 1.21.0
				showOverlay : false, // boolean, since 1.21.2
				enableSelectAll : true, // boolean, since 1.23.0
				enableCustomFilter : false, // boolean, since 1.23.0
				enableBusyIndicator : false, // boolean, since 1.27.0
				tooltip : undefined, // sap.ui.core.TooltipBase
				title : controlData.title, // sap.ui.core.Control
				footer : undefined, // sap.ui.core.Control
				toolbar : oToolbar, // sap.ui.core.Toolbar
				extension : [], // sap.ui.core.Control
				columns : aColumns, // sap.ui.table.Column
				rows : [], // sap.ui.table.Row
				noData : undefined, // sap.ui.core.Control
				rowSelectionChange : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				columnSelect : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				columnResize : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				columnMove : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				sort : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				filter : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				group : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				columnVisibility : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				cellClick : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ], // since 1.21.0
				cellContextmenu : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ], // since 1.21.0
				columnFreeze : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ], // since 1.21.0
				customFilter : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			// since 1.23.0
			});
			
			table.bindRows(sModelName+">"+controlData.bindingName);
			
		}
		/*if(bMobileEnabled){
			var oDialog = new sap.m.Dialog({
				contentWidth:"100%",
				contentHeight:"100%",
				content:[oLayout]
			});
		}
		else{
			var oDialog = new sap.ui.commons.Dialog({
				width:"100%",
				height:"100%",
				content:[oLayout]
			});
		}*/
		
		var oDialog = this.fnCreateTableFormDialog(controlData,oLayout);
		
		

		return table;
	},
	
	fnCreateColumn:function(controlData,parentControl){
		
		var oColumn = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			oColumn = this.fnParseControl(controlData,parentControl,true);
		}
		else{
			
			var oColumnTemplate = this.fnParseControl(controlData,parentControl,true);
			oColumn = new sap.ui.table.Column({
				width : controlData.colWidth, // sap.ui.core.CSSSize
				flexible : true, // boolean
				resizable : true, // boolean
				hAlign : sap.ui.core.HorizontalAlign.Begin, // sap.ui.core.HorizontalAlign
				sorted : false, // boolean
				sortOrder : sap.ui.table.SortOrder.Ascending, // sap.ui.table.SortOrder
				sortProperty : undefined, // string
				filtered : false, // boolean
				filterProperty : undefined, // string
				filterValue : undefined, // string
				filterOperator : undefined, // string
				grouped : false, // boolean
				visible : true, // boolean
				filterType : undefined, // any, since 1.9.2
				name : undefined, // string, since 1.11.1
				showFilterMenuEntry : true, // boolean, since 1.13.0
				showSortMenuEntry : true, // boolean, since 1.13.0
				headerSpan : 1, // any
				autoResizable : false, // boolean, since 1.21.1
				defaultFilterOperator : undefined, // string
				tooltip : undefined, // sap.ui.core.TooltipBase
				label : controlData.colLabel, // sap.ui.core.Control
				multiLabels : [], // sap.ui.core.Control, since 1.13.1
				template : oColumnTemplate, // sap.ui.core.Control
			// sap.ui.unified.Menu
			});
		}
		return oColumn;
	},
	
	fnCreateColumnHeader : function(controlData,parentControl){
		var hAlign = sap.ui.core.TextAlign.Begin;
		switch(controlData.labelAlignment){
		case "left": hAlign = sap.ui.core.TextAlign.Left;
		break;
		case "right":hAlign = sap.ui.core.TextAlign.Right;
		break;
		case "center":hAlign = sap.ui.core.TextAlign.Center;
		break;
		default: hAlign = sap.ui.core.TextAlign.Begin;
		break;
		};
		
		var oColumn = new sap.m.Column({
			width : controlData.width,
			hAlign : hAlign,
			vAlign : sap.ui.core.VerticalAlign.Inherit,
			styleClass : controlData.className,
			visible : (controlData.visible === "true"),
			minScreenWidth : controlData.colMinScreenWidth,
			demandPopin : false,
			popinHAlign : sap.ui.core.TextAlign.Begin,
			popinDisplay : sap.m.PopinDisplay.Block,
			mergeDuplicates : false,
			mergeFunctionName : "getText",
			tooltip : undefined,
			header : new sap.m.Text({
				text : controlData.colLabel
			}),
			footer : undefined
		});
		return oColumn;
	},

	/**Function to create and return tool bar **/
	fnCreateToolBar : function(toolBarContent) {
		var toolBar = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){

			 toolBar = new sap.m.Toolbar({
				visible : true,
				visible : true,
				width : "",
				active : false,
				enabled : true,
				height : "",
				design : sap.m.ToolbarDesign.Auto,
				content : toolBarContent,
				press : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{
			
			toolBar = new sap.ui.commons.Toolbar({
				visible : true, // boolean
				width : "auto", // sap.ui.core.CSSSize
				design : sap.ui.commons.ToolbarDesign.Flat, // sap.ui.commons.ToolbarDesign
				standalone : true, // boolean
				tooltip : undefined, // sap.ui.core.TooltipBase
				items : [], // sap.ui.commons.ToolbarItem
				rightItems : toolBarContent
			// sap.ui.commons.ToolbarItem
			});
		}
		

		return toolBar;
	},
	
	fnCreateSelect : function(controlData,parentControl){
		
		var parentModel = parentControl.id +"_model";
		var itemModel = controlData.id+"_model";
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		var oSelect = undefined;
		if(bMobileEnabled){
			 oSelect = new sap.m.Select({
				id:controlData.id,
				visible : (controlData.visible === "true"), // boolean
				enabled : (controlData.enable === "true"), // boolean
				editable : (controlData.editable === "true"), // boolean
				width : controlData.width, // sap.ui.core.CSSSize
				maxWidth : "100%", // sap.ui.core.CSSSize
				selectedKey : "{"+parentModel+">/"+controlData.bindingName+"}", // string, since 1.11
				selectedItemId : "", // string, since 1.12
				icon : controlData.icon, // sap.ui.core.URI, since 1.16
				type : sap.m.SelectType.Default, // sap.m.SelectType, since 1.16
				autoAdjustWidth : false, // boolean, since 1.16
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				items : {
					path:itemModel+">"+controlData.itemBinding.bindingPath,
					template: new sap.ui.core.Item({
						text : "{"+itemModel+">"+controlData.itemBinding.itemLabel+"}", // string
						enabled : true, // boolean
						textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection
						key : "{"+itemModel+">"+controlData.itemBinding.itemKey+"}", // string
						tooltip : undefined, // sap.ui.core.TooltipBase
					}) 
				}, // sap.ui.core.Item
				selectedItem : undefined, // sap.ui.core.Item
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{
			oSelect = new sap.ui.commons.DropdownBox({
				id : controlData.id, // sap.ui.core.ID
				visible : (controlData.visible === "true"), // boolean
				value : "", // string
				enabled : (controlData.enable === "true"), // boolean
				editable : (controlData.editable === "true"), // boolean
				required : false, // boolean
				width : controlData.width, // sap.ui.core.CSSSize
				maxLength : 0, // int
				design : sap.ui.core.Design.Standard, // sap.ui.core.Design
				helpId : "", // string
				accessibleRole : sap.ui.core.AccessibleRole.Textbox, // sap.ui.core.AccessibleRole
				placeholder : controlData.placeholder, // string, since 1.14.0
				maxPopupItems : 10, // int
				displaySecondaryValues : false, // boolean
				selectedKey :  "{"+parentModel+">/"+controlData.bindingName+"}", // string
				selectedItemId : undefined, // string
				searchHelpEnabled : false, // boolean
				searchHelpText : undefined, // string
				searchHelpAdditionalText : undefined, // string
				searchHelpIcon : undefined, // sap.ui.core.URI
				maxHistoryItems : 0, // int
				tooltip : undefined, // sap.ui.core.TooltipBase
				items :{
					path:itemModel+">"+controlData.itemBinding.bindingPath,
					template: new sap.ui.core.ListItem({
						text : "{"+itemModel+">"+controlData.itemBinding.itemLabel+"}", // string
						enabled : true, // boolean
						textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection
						key : "{"+itemModel+">"+controlData.itemBinding.itemKey+"}", // string
						tooltip : undefined, // sap.ui.core.TooltipBase
					}) 
				}, // sap.ui.core.ListItem
				listBox : undefined, // sap.ui.commons.ListBox
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				liveChange : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				searchHelp : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		
		
		
		/**
		 * Need to create a model and fetch data from service URL and set it to entire app
		 */
			this.fnCreateModelAndFetchData(controlData,itemModel);
			return oSelect;
	},
	
	fnCreateDatePicker:function(controlData,parentControl){
		var parentModel = parentControl.id +"_model";
		var oDatePicker = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		
		if(bMobileEnabled){
			 oDatePicker = new sap.m.DatePicker({
				 id :controlData.id,
				visible : (controlData.visible === "true"), // boolean
				value :  "{"+parentModel+">/"+controlData.bindingName+"}", // string
				width : controlData.width, // sap.ui.core.CSSSize
				enabled : (controlData.enable === "true"), // boolean
				placeholder :  controlData.placeholder, // string
				editable : (controlData.editable === "true"), // boolean, since 1.12.0
				displayFormat : controlData.displayDateFormat, // string
				valueFormat : controlData.valueDateFormat, // string
				dateValue : undefined, // object
				displayFormatType : "", // string, since 1.28.6
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{ 
//			jQuery.sap.require("sap.ui.unified");
			oDatePicker = new sap.ui.commons.DatePicker({
				id : controlData.id, // sap.ui.core.ID
				visible : (controlData.visible === "true"), // boolean
				value : "{"+parentModel+">/"+controlData.bindingName+"}", // string
				enabled : (controlData.enable === "true"), // boolean
				editable :  (controlData.editable === "true"), // boolean
				required : false, // boolean
				width : controlData.width, // sap.ui.core.CSSSize
				maxLength : 0, // int
				placeholder : controlData.placeholder, // string, since 1.14.0
				locale : "en-US", // string
				yyyymmdd : controlData.displayDateFormat, // string
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				liveChange : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		
		return oDatePicker;
	},
	
	fnCreateTextArea :function(controlData,parentControl){
		
		var parentModel = parentControl.id +"_model";
		var oTextArea = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oTextArea = new sap.m.TextArea({
				id:controlData.id,
				visible : (controlData.visible === "true"), // boolean
				value :  "{"+parentModel+">/"+controlData.bindingName+"}", // string
				width : controlData.width, // sap.ui.core.CSSSize
				enabled :  (controlData.enable === "true"), // boolean
				placeholder : controlData.placeholder, // string
				editable :  (controlData.editable === "true"), // boolean, since 1.12.0
				rows : Number.parseInt(controlData.rows), // int
				cols : Number.parseInt(controlData.cols), // int
				height : undefined, // sap.ui.core.CSSSize
				maxLength :Number.parseInt( controlData.maxlength), // int
				wrapping : undefined, // sap.ui.core.Wrapping
				tooltip :  controlData.tooltip, // sap.ui.core.TooltipBase
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				liveChange : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{
			
			oTextArea = new sap.ui.commons.TextArea({
				id:controlData.id,
				visible :  (controlData.visible === "true"), // boolean
				value : "{"+parentModel+">/"+controlData.bindingName+"}", // string
				enabled :  (controlData.enable === "true"), // boolean
				editable :  (controlData.editable === "true"), // boolean
				required : false, // boolean
				width : controlData.width, // sap.ui.core.CSSSize
				maxLength : 0, // int
				design : sap.ui.core.Design.Standard, // sap.ui.core.Design
				helpId : "", // string
				placeholder : controlData.placeholder, // string, since 1.14.0
				height : undefined, // sap.ui.core.CSSSize
				cols : Number.parseInt(controlData.cols), // int
				rows : Number.parseInt(controlData.rows), // int
				wrapping : undefined, // sap.ui.core.Wrapping
				cursorPos : undefined, // int
				explanation : undefined, // string
				labeledBy : undefined, // string
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				liveChange : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		
			
		
		return oTextArea;
	},
	
	fnCreateCheckBox : function(controlData,parentControl){
		
		var parentModel = parentControl.id +"_model";
		var oCheckBox = undefined;s
			
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oCheckBox = new sap.m.CheckBox({
				id:controlData.id,
				visible :  (controlData.visible === "true"), // boolean
				selected : "{"+parentModel+">/"+controlData.bindingName+"}", // boolean
				enabled : (controlData.enable === "true"), // boolean
				name : controlData.name, // string
				text : controlData.label, // string
				width : controlData.width, // sap.ui.core.CSSSize
				activeHandling : true, // boolean
				editable : (controlData.editable === "true"), // boolean, since 1.25
				tooltip : undefined, // sap.ui.core.TooltipBase
				select : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{
			oCheckBox = new sap.ui.commons.CheckBox({
				id:controlData.id, // sap.ui.core.ID
				visible : (controlData.visible === "true"), // boolean
				checked : "{"+parentModel+">/"+controlData.bindingName+"}", // boolean
				text : controlData.label, // string
				enabled : (controlData.enabled === "true"), // boolean
				editable : (controlData.editable === "true"), // boolean
				width : controlData.width, // sap.ui.core.CSSSize
				textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection
				name : controlData.name, // string
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				change : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
			
		}
		return oCheckBox;
	},
	
	fnCreateRadioButton: function(controlData,parentControl){
		
		var parentModel = parentControl.id +"_model";
		
		var oRadioButton = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oRadioButton = new sap.m.RadioButton({
				id:controlData.id,
				visible : (controlData.visible === "true"), // boolean
				enabled : (controlData.enable === "true"), // boolean
				selected : "{"+parentModel+">/"+controlData.bindingName+"}", // boolean
				groupName : controlData.groupName, // string
				text : controlData.label, // string
				width : controlData.width, // sap.ui.core.CSSSize
				editable : (controlData.editable === "true"), // boolean, since 1.25
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				select : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{
			oRadioButton = new sap.ui.commons.RadioButton({
				id:controlData.id, // sap.ui.core.ID
				visible : (controlData.visible === "true"), // boolean
				text : controlData.label, // string
				enabled : (controlData.enable === "true"), // boolean
				editable : (controlData.editable === "true"), // boolean
				selected : "{"+parentModel+">/"+controlData.bindingName+"}", // boolean
				valueState : sap.ui.core.ValueState.None, // sap.ui.core.ValueState
				width : controlData.width, // sap.ui.core.CSSSize
				textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection
				groupName : controlData.groupName, // string
				key : undefined, // string
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				select : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		
			
	
		return oRadioButton;
	},
	
	/*
	 * 3rd Parameter is for relative binding
	 */
	fnCreateText:function(controlData,parentControl,bRelativeBinding){
		
		var parentModel = parentControl.id +"_model";
		var bindingPath = "{"+parentModel+">/"+controlData.bindingName+"}";
		if(bRelativeBinding){
			bindingPath = "{"+parentModel+">"+controlData.bindingName+"}";
		}
		
		var oText = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oText = new sap.m.Text({
				id:controlData.id,
				visible : (controlData.visible === "true"), // boolean
				text : bindingPath, // string
				wrapping : true, // boolean
				textAlign : sap.ui.core.TextAlign.Begin, // sap.ui.core.TextAlign
				width : controlData.width, // sap.ui.core.CSSSize
				maxLines : undefined, // int, since 1.13.2
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
			});
		}else{
			 oText = new sap.ui.commons.TextView({
				id:controlData.id, // sap.ui.core.ID
				visible : (controlData.visible === "true"), // boolean
				text : bindingPath, // string
				textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection
				enabled : (controlData.enable === "true"), // boolean
				helpId : "", // string
				accessibleRole : sap.ui.core.AccessibleRole.Document, // sap.ui.core.AccessibleRole
				design : sap.ui.commons.TextViewDesign.Standard, // sap.ui.commons.TextViewDesign
				wrapping : true, // boolean
				semanticColor : sap.ui.commons.TextViewColor.Default, // sap.ui.commons.TextViewColor
				textAlign : sap.ui.core.TextAlign.Begin, // sap.ui.core.TextAlign
				width : controlData.width, // sap.ui.core.CSSSize
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
			});
		}
		
			
	
		return oText;
		
	},
	
	fnCreateVBox:function(controlData){
		
		var oVBox =  new sap.m.VBox({
			height : "", // sap.ui.core.CSSSize, since 1.9.1
			width : "", // sap.ui.core.CSSSize, since 1.9.1
			displayInline : false, // boolean
			direction : sap.m.FlexDirection.Column, // sap.m.FlexDirection
			fitContainer : false, // boolean
			renderType : sap.m.FlexRendertype.Div, // sap.m.FlexRendertype
			justifyContent : sap.m.FlexJustifyContent.Start, // sap.m.FlexJustifyContent
			alignItems : sap.m.FlexAlignItems.Stretch, // sap.m.FlexAlignItems
			tooltip : undefined, // sap.ui.core.TooltipBase
			items : []
		// sap.ui.core.Control
		});
		return oVBox;
	},
	
	fnCreateVerticalLayout : function(controlData){
		var oLayout = new sap.ui.layout.VerticalLayout({
			visible : true, // boolean
			width : undefined, // sap.ui.core.CSSSize
			enabled : true, // boolean
			tooltip : undefined, // sap.ui.core.TooltipBase
			content : []
		// sap.ui.core.Control
		});
		
		return oLayout;
		
	},
	
	fnIsLabelRequired:function(controlData){
		var isLabelReq = true;
		var controlType = controlData.type;
		if(controlType!==undefined){
			controlType = controlType.toLowerCase();
		}
		if(controlData.label === undefined || controlData.label === ""){
			isLabelReq = false;
		}
		else
			isLabelReq = true;
		return isLabelReq;
		
	},
	
	fnCreateModels:function(){
		var aModels = sap.ui.getCore().getModel('applicationModel').getProperty('/modelNames');
		
		aModels = jQuery.unique(aModels);
		
		var applicationId = sap.ui.getCore().getModel('applicationModel').getProperty('/applicationId')
		for (var modelInc = 0; modelInc < aModels.length; modelInc++) {
			var model_element = aModels[modelInc];
			var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().byId(applicationId).setModel(oModel,model_element);
		}
	},
	
	fnCreateModelAndFetchData:function(controlData,modelName){
		var serviceUrl = controlData.itemBinding.serviceUrl;
		var applicationId = sap.ui.getCore().getModel('applicationModel').getProperty('/applicationId');
		if(modelName === undefined){
			modelName = controlData.model;
		}
		var oModel = new sap.ui.model.json.JSONModel();
		var fetchData = this.fnGetJson(serviceUrl,null,"get",true,null,modelName);
		sap.ui.getCore().byId(applicationId).setModel(oModel,modelName);
	},
	
	/** Function methods for parsing actions **/
	fnCreateButton : function(actionData, parentControl, fnCallBack){
		var oButton = undefined;
		var that = this;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oButton = new sap.m.Button({
				visible : (actionData.visible === "true"), // boolean
				text : actionData.label, // string
				type : sap.m.ButtonType.Default, // sap.m.ButtonType
				width : actionData.width, // sap.ui.core.CSSSize
				enabled : !(actionData.enable === "false"), // boolean
				icon : actionData.length, // sap.ui.core.URI
				iconFirst : true, // boolean
				activeIcon : undefined, // sap.ui.core.URI
				iconDensityAware : true, // boolean
				tooltip : actionData.tooltip, // sap.ui.core.TooltipBase
				tap : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				press : [ function(oEvent) {
					if(fnCallBack!= undefined && fnCallBack != ""){
						that[fnCallBack](oEvent);
					}
				}, this ]
			});
		}
		else{
			oButton  = new sap.ui.commons.Button({
				visible : true, // boolean
				text : actionData.label, // string
				enabled : true, // boolean
				width : undefined, // sap.ui.core.CSSSize
				helpId : "", // string
				icon : "", // sap.ui.core.URI
				iconHovered : "", // sap.ui.core.URI
				iconSelected : "", // sap.ui.core.URI
				iconFirst : true, // boolean
				height : undefined, // sap.ui.core.CSSSize
				styled : true, // boolean
				lite : false, // boolean
				style : sap.ui.commons.ButtonStyle.Default, // sap.ui.commons.ButtonStyle
				tooltip :actionData.label , // sap.ui.core.TooltipBase
				press : [ function(oEvent) {
					if(fnCallBack!= undefined && fnCallBack != ""){
						that[fnCallBack](oEvent);
					}
				}, this ]
			});
		}
		
		
		var oModel = new sap.ui.model.json.JSONModel({"Action":actionData,"ParentId":parentControl.id});
		oButton.setModel(oModel,"parentModel");
		return oButton;
	},
	
	parseFormActions:function(oEvent){
		var control = oEvent.getSource();
		var oModelName = control.getModel("parentModel").getProperty('/ParentId');
		var applicationId = sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId');
		var modelData = sap.ui.getCore().byId(applicationId).getModel(oModelName+"_model").getData();
		var actionData = control.getModel("parentModel").getProperty('/Action');
		var method = actionData.serviceMethod;
		var returnData = this.fnGetJson(actionData.serviceUrl, modelData, method, true, actionData );
		
		if(actionData.targetAction === "navigation"){
			com.incture.template.router.setHash(actionData.targetControl.targetScreenId);
		}
		if(actionData.targetAction === "Message" && actionData.serviceUrl === ""){
			sap.m.MessageBox.confirm(
			      	  actionData.targetMessage, {
			          icon: sap.m.MessageBox.Icon.INFORMATION,
			          title: "Information",
			          actions: [sap.m.MessageBox.Action.OK],
			          onClose: function(oAction) {  }
			      });
		}
		
		if(actionData.targetAction === "" || actionData.targetAction === " "){
			var actionType = actionData.label.toLowerCase();
			if(actionType === "submit"){
				var valid = this.ValidateFormData(modelData, oModelName);
				if(valid === true){
					this.fnPassDataToTarget(actionData.targetControl.targetScreenId, modelData);
				}else{
					this.showInfoMessage(valid);
				}
			}else if(actionType === "save"){
				this.fnPassDataToTarget(actionData.targetControl.targetScreenId, modelData);
			}else if(actionType === "delete" || actionType === "cancel"){
				this.fnClearFormData(oModelName);
			}
			
		}
	},
	
	fnCreateLink : function(actionData){
		var oLink = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			oLink = new sap.m.Link({
				visible : (actionData.visible === "true"), 
				text : actionData.label, 
				enabled : (actionData.enabled === "true"), // boolean
				target : undefined, // string
				width : undefined, // sap.ui.core.CSSSize
				href : actionData.screenRef, // sap.ui.core.URI
				wrapping : false, // boolean
				subtle : false, // boolean, since 1.22
				emphasized :(actionData.emphasized === "true"), // boolean, since 1.22
				tooltip : actionData.tooltip, // sap.ui.core.TooltipBase
				press : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{
			oLink =  new sap.ui.commons.Link({
				visible : true, // boolean
				text : actionData.label, // string
				enabled : true, // boolean
				helpId : "", // string
				href : actionData.screenRef, // sap.ui.core.URI
				target : undefined, // string
				width : undefined, // sap.ui.core.CSSSize, since 1.8.0
				tooltip : undefined, // sap.ui.core.TooltipBase
				press : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			})
		}
		
		return oLink;
	},
	
	fnParseControlForActions : function(control){
		var oActionControl = [];
		var controlActions = control.actions;
		if(controlActions  == undefined){
			return;
		}
		for(var actionInc=0; actionInc< controlActions.length; actionInc++){
			var oAction = controlActions[actionInc];
			oActionControl.push(this.fnParseControl(oAction, control));
		}
		return oActionControl;
	},
	/**
	 * JQuery Ajax methods
	 */
	fnGetJson:function(serviceUrl, data, method, async, actionData,modelName){
		var returnData = {};
		var that=this;
		$.ajax({
			  dataType: "json",
			  url: serviceUrl,
			  async: async,
			  data: data,
			  method: method,
			  success: function(rData, jqXHR, options){
				  returnData =  rData;
				  if(async){
					  if(!actionData && !data){
						  if(modelName){
							  var oModel = new sap.ui.model.json.JSONModel(returnData);
							  var appId = sap.ui.getCore().getModel("applicationModel").getProperty("/applicationId");
							  sap.ui.getCore().byId(appId).setModel(oModel,modelName);
						  }
					  }else{
						  returnData = that.fnParseReturnData(data,actionData);
						  if(modelName !== undefined){
							  modelName.setData(data);
						  }
					  }
				  }
			  },
			  error:function(error){
				  console.log(error);
				  returnData= {};
			  }
			});
		
		return returnData;
	},
	
	fnParseReturnData : function(data, actionData){
		var responseType = "";
		if(actionData){
			var targetAction = actionData.targetAction;
			targetAction = targetAction.toLowerCase();
			switch(targetAction){
			case "message":  sap.m.MessageBox.confirm(
				      	  "Success", {
				          icon: sap.m.MessageBox.Icon.INFORMATION,
				          title: "Inormation",
				          actions: [sap.m.MessageBox.Action.OK],
				          onClose: function(oAction) {  }
				      });
			break;
			}
		}
		
		return data;
	},
	fnAddRow:function(oEvent){
		console.log(oEvent);
		var sTableId = oEvent.getSource().getParent().getParent().getId();
		
		var appId = sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId');
		var sFormModelName = sTableId+"_formId_model";
		var oApp = sap.ui.getCore().byId(appId);
		var oFormModel = oApp.getModel(sFormModelName);
		oFormModel.setData({action:'Add'});
		var sDialogId = sTableId+"_dialog";
		var oDialog = sap.ui.getCore().byId(sDialogId);
		oDialog.open();
	},
	
	fnCreateTableFormDialog :function(controlData,pLayout){
		
		var oDialog = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		var that = this;
		if(bMobileEnabled){
			
			var saveButton = new sap.m.Button({
				busy : false, // boolean
				busyIndicatorDelay : 1000, // int
				visible : true, // boolean
				text : "Save", // string
				type : sap.m.ButtonType.Default, // sap.m.ButtonType
				width : undefined, // sap.ui.core.CSSSize
				enabled : true, // boolean
				icon : undefined, // sap.ui.core.URI
				iconFirst : true, // boolean
				activeIcon : undefined, // sap.ui.core.URI
				iconDensityAware : true, // boolean
				textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection, since 1.28.0
				tooltip : undefined, // sap.ui.core.TooltipBase
				customData : [], // sap.ui.core.CustomData
				dependents : [], // sap.ui.core.Control, since 1.19
				ariaDescribedBy : [], // sap.ui.core.Control
				ariaLabelledBy : [], // sap.ui.core.Control
				press : [ function(oEvent) {
					var control = oEvent.getSource();
					that.fnSaveDialogDataToTable(oEvent);
				}, this ]
			});
			var cancelButton = new sap.m.Button({
				busy : false, // boolean
				busyIndicatorDelay : 1000, // int
				visible : true, // boolean
				text : "Cancel", // string
				type : sap.m.ButtonType.Default, // sap.m.ButtonType
				width : undefined, // sap.ui.core.CSSSize
				enabled : true, // boolean
				icon : undefined, // sap.ui.core.URI
				iconFirst : true, // boolean
				activeIcon : undefined, // sap.ui.core.URI
				iconDensityAware : true, // boolean
				textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection, since 1.28.0
				tooltip : undefined, // sap.ui.core.TooltipBase
				customData : [], // sap.ui.core.CustomData
				dependents : [], // sap.ui.core.Control, since 1.19
				ariaDescribedBy : [], // sap.ui.core.Control
				ariaLabelledBy : [], // sap.ui.core.Control
				press : [ function(oEvent) {
					var control = oEvent.getSource();
					sap.ui.getCore().byId(controlData.id+"_dialog").close();
				}, this ]
			});
			/*oDialog = new sap.m.Dialog({
				id : controlData.id+"_dialog", // sap.ui.core.ID
				visible : true, // boolean
				icon : undefined, // sap.ui.core.URI
				title : 'mobile', // string
				showHeader : true, // boolean, since 1.15.1
				type : sap.m.DialogType.Standard, // sap.m.DialogType
				state : sap.ui.core.ValueState.None, // sap.ui.core.ValueState, since 1.11.2
				stretchOnPhone : false, // boolean, since 1.11.2
				stretch : false, // boolean, since 1.13.1
				contentWidth : undefined, // sap.ui.core.CSSSize, since 1.12.1
				contentHeight : undefined, // sap.ui.core.CSSSize, since 1.12.1
				horizontalScrolling : true, // boolean, since 1.15.1
				verticalScrolling : true, // boolean, since 1.15.1
				resizable : false, // boolean, since 1.30
				draggable : false, // boolean, since 1.30
				tooltip : undefined, // sap.ui.core.TooltipBase
				content : pLayout, // sap.ui.core.Control
				subHeader : undefined, // sap.m.IBar, since 1.12.2
				customHeader : undefined, // sap.m.IBar, since 1.15.1
				beginButton : undefined, // sap.m.Button, since 1.15.1
				endButton : undefined, // sap.m.Button, since 1.15.1
				buttons : [saveButton,cancelButton], // sap.m.Button, since 1.21.1
				leftButton : undefined, // sap.m.Button
				rightButton : undefined, // sap.m.Button
				initialFocus : undefined, // sap.ui.core.Control, since 1.15.0
				ariaDescribedBy : [], // sap.ui.core.Control
				beforeOpen : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				afterOpen : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				beforeClose : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ],
				afterClose : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});*/
			
			oDialog = new sap.m.Dialog({
				id : controlData.id+"_dialog",
				title : '',
				content:pLayout,
				buttons : [saveButton,cancelButton]
			})
		}
		else{
			
			var oSaveButton = new sap.ui.commons.Button({
				visible : true, // boolean
				text : "Save", // string
				enabled : true, // boolean
				width : undefined, // sap.ui.core.CSSSize
				helpId : "", // string
				icon : "", // sap.ui.core.URI
				iconHovered : "", // sap.ui.core.URI
				iconSelected : "", // sap.ui.core.URI
				iconFirst : true, // boolean
				height : undefined, // sap.ui.core.CSSSize
				styled : true, // boolean
				lite : false, // boolean
				style : sap.ui.commons.ButtonStyle.Default, // sap.ui.commons.ButtonStyle
				tooltip : undefined, // sap.ui.core.TooltipBase
				press : [ function(oEvent) {
					var control = oEvent.getSource();
					that.fnSaveDialogDataToTable(oEvent);
				}, this ]
			});
			
			//var oSaveButton = this.fnCreateButton({},{},"fnSaveDialogDataToTable");
//			oSaveButton.setText('Save');
			var oCancelButton = new sap.ui.commons.Button({
				visible : true, // boolean
				text : "Cancel", // string
				enabled : true, // boolean
				width : undefined, // sap.ui.core.CSSSize
				helpId : "", // string
				icon : "", // sap.ui.core.URI
				iconHovered : "", // sap.ui.core.URI
				iconSelected : "", // sap.ui.core.URI
				iconFirst : true, // boolean
				height : undefined, // sap.ui.core.CSSSize
				styled : true, // boolean
				lite : false, // boolean
				style : sap.ui.commons.ButtonStyle.Default, // sap.ui.commons.ButtonStyle
				tooltip : undefined, // sap.ui.core.TooltipBase
				press : [ function(oEvent) {
					var control = oEvent.getSource();
					that.fnCloseDialog(oEvent);
				}, this ]
			});
			
			oDialog = new sap.ui.commons.Dialog({
				id : controlData.id+"_dialog", // sap.ui.core.ID
				visible : true, // boolean
				width : undefined, // sap.ui.core.CSSSize
				height : undefined, // sap.ui.core.CSSSize
				scrollLeft : 0, // int
				scrollTop : 0, // int
				title : "", // string
				applyContentPadding : true, // boolean
				showCloseButton : true, // boolean
				resizable : true, // boolean
				minWidth : undefined, // sap.ui.core.CSSSize
				minHeight : undefined, // sap.ui.core.CSSSize
				maxWidth : undefined, // sap.ui.core.CSSSize
				maxHeight : undefined, // sap.ui.core.CSSSize
				contentBorderDesign : sap.ui.commons.enums.BorderDesign.None, // sap.ui.commons.enums.BorderDesign
				modal : false, // boolean
				accessibleRole : sap.ui.core.AccessibleRole.Dialog, // sap.ui.core.AccessibleRole
				keepInWindow : false, // boolean, since 1.9.0
				autoClose : false, // boolean, since 1.10
				tooltip : undefined, // sap.ui.core.TooltipBase
				dependents : [], // sap.ui.core.Control, since 1.19
				buttons : [oSaveButton,oCancelButton], // sap.ui.core.Control
				content : pLayout, // sap.ui.core.Control
				defaultButton : undefined, // sap.ui.commons.Button
				initialFocus : undefined, // sap.ui.core.Control
				closed : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		
		var oTable = sap.ui.getCore().byId(controlData.id);
		oTable.addDependent(oDialog);
	},
	fnSaveDialogDataToTable:function(oEvent){
		console.log(oEvent);
		var oDialog = oEvent.getSource().getParent();
		var oTable = oEvent.getSource().getParent().getParent();
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			oTable = oEvent.getSource().getParent().getParent().getParent();
		}
		var sTableId = oTable.getId();
		var oTableFormModelName = sTableId+"_formId_model";
		var oTableModelName = sTableId+"_model";
		var oApp = sap.ui.getCore().byId(sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId'))
		var oTableModel = oApp.getModel(oTableModelName);
		var oTableFormModel = oApp.getModel(oTableFormModelName);
		if(oTableFormModel.getProperty('/action') == 'Add'){
			/*oTableModel.push(oTableFormModel.getData())*/
			var data = oTableModel.getData();
			if(!Array.isArray(data)){
				oTableModel.setData([])
			}
			var oData = oTableFormModel.getData();
			delete oData.action;
			oTableModel.getData().push(oData);
			oTableModel.refresh();
		}else if(oTableFormModel.getProperty('/action') == 'Update'){
			console.log()
			var updatedData = oTableFormModel.getData();
			var path = updatedData.sPath;
			delete updatedData.action;
			delete updatedData.path;
			oTableModel.setProperty(path,updatedData);
			oTableModel.refresh();
		}
		
		oDialog.close();
		
	},
	fnDeleteRow:function(oEvent){
		
		//this.fnConfirmMessageBox("confirm delete", "confirm", "fnConfirmDelete")
		
		
		var oTable = oEvent.getSource().getParent().getParent();
		if(bMobileEnabled){
			oTable = oEvent.getSource().getParent().getParent().getParent();
		}
		var sTableId = oTable.getId();
		var oTableModelName = sTableId+"_model";
		var oApp = sap.ui.getCore().byId(sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId'))
		var oTableModel = oApp.getModel(oTableModelName);
		var aSelectedIndices = [];
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			var oSelectedContexts = oTable.getSelectedContexts();
			
			
			for(var inc = 0;inc < oSelectedContexts.length;inc++){
				var context = oSelectedContexts[inc];
				var path = context.sPath;
				path = path.split("/")[1]
				aSelectedIndices.push(parseInt(path));
			}
			if(aSelectedIndices.length == 0 ){
				return;
			}
		}
		else{
			 aSelectedIndices = oTable.getSelectedIndices();
			console.log(aSelectedIndices);
			if(aSelectedIndices.length == 0 ){
				return;
			}
			
		}
		var dupData = jQuery.extend(true, [], oTableModel.getData());
		var arr = $.grep(dupData, function(n, i) {
		    return $.inArray(i, aSelectedIndices) ==-1;
		});
		oTableModel.setData(arr);
		oTableModel.refresh();
	},
	fnUpdateRow:function(oEvent){
		var oTable = oEvent.getSource().getParent().getParent();
		if(bMobileEnabled){
			oTable = oEvent.getSource().getParent().getParent().getParent();
		}
		var sTableId = oTable.getId();
		var oTableModelName = sTableId+"_model";
		var oTableFormModelName = sTableId+"_formId_model";
		var oApp = sap.ui.getCore().byId(sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId'));
		var oTableFormModel = oApp.getModel(oTableFormModelName);
		var oTableModel = oApp.getModel(oTableModelName);
		var aSelectedIndices = [];
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		var context = undefined;
		if(bMobileEnabled){
			var oSelectedContexts = oTable.getSelectedContexts();
			
			
			
			if(oSelectedContexts.length == 0 ){
				
				//alert('Select at least one row');
				this.fnShowMessageBox('Select at least one row', "ERROR", "Error", null);
				return;
			}
			else if(oSelectedContexts.length > 1 ){
				//alert('Select at most one row');
				this.fnShowMessageBox('Select at most one row', "ERROR", "Error", null);
				return;
			}
			else{
				context = oSelectedContexts[0].getObject();
				context.action = 'Update';
				context.path = oSelectedContexts[0].sPath;
				console.log(context);
			}
		}
		else{
			 aSelectedIndices = oTable.getSelectedIndices();
			console.log(aSelectedIndices);
			if(aSelectedIndices.length == 0 ){
				
//				alert('Select at least one row');
				this.fnShowMessageBox('Select at least one row', "ERROR", "Error", null);
				return;
			}
			else if(aSelectedIndices.length > 1 ){
//				alert('Select at most one row');
				this.fnShowMessageBox('Select at most one row', "ERROR", "Error", null);
				return;
			}
			else{
				context = oTable.getContextByIndex(aSelectedIndices[0]).getObject();
				context.action = 'Update';
				context.path = oTable.getContextByIndex(aSelectedIndices[0]).sPath;
				console.log(context);
			}
			
		}
		
		oTableFormModel.setData(context);
		oTableFormModel.refresh();
		var sDialogId = sTableId+"_dialog";
		var oDialog = sap.ui.getCore().byId(sDialogId);
		oDialog.open();
	},
	fnCloseDialog:function(oEvent){
		
		var oDialog = oEvent.getSource().getParent();
		oDialog.close();
	},
	fnShowMessageBox: function(msg,icon,title,onCloseHandler){
		var that = this;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			jQuery.sap.require("sap.m.MessageBox");
			  sap.m.MessageBox.show(msg, {
			          icon: icon,
			          title: title,
			          actions: [],
			          onClose: function(oAction) { / * do something * /
			        	 // that[onCloseHandler]();
			          }
			      }
			    );
		}
		else{
			jQuery.sap.require("sap.ui.commons.MessageBox");
			  sap.ui.commons.MessageBox.show(msg,
					  icon,title,
			      [],
			      function() { / * do something * / 
				// that[onCloseHandler]();
			  }
			  );
		}
	},
	fnConfirmMessageBox:function(msg,title,onCloseHandler){
		var that = this;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.confirm(msg, {
			    title: title,                                    // default
			    onClose: function(oEvent){
			    	that[onCloseHandler](oEvent);
			    },                                         // default
			    styleClass: "",                                       // default
			    initialFocus: null   ,                                // default
			    textDirection: sap.ui.core.TextDirection.Inherit     // default
		    });
		}
		else{
			jQuery.sap.require("sap.ui.commons.MessageBox");
			sap.ui.commons.MessageBox.confirm(msg,function(oEvent){
				that[onCloseHandler](oEvent);
			},title);
		}
	},
	fnConfirmDelete:function(oEvent){
		console.log(oEvent);
		alert('called');
	},
	
	fnPassDataToTarget : function(targetId, data){
		var appId= sap.ui.getCore().getModel("applicationModel").getProperty("/applicationId");
		var targetModel = sap.ui.getCore().byId(appId).getModel(targetId+"_model");
		var targetData = targetModel.getData();
		
		var controlType = sap.ui.getCore().byId(targetId).getMetadata().getName();
		if(controlType === "sap.m.Table"){
			var binding = sap.ui.getCore().byId(targetId).getBindingInfo("items").path;
			path = binding.split("/")[1];
			if(path){
				targetData[path].push(data);
			}else{
				if(!targetData.length){
					targetData=[];
				}
				targetData.push(data);
			}
		}else if(controlType === "sap.ui.table.Table"){//replace data
			targetData=[];
			targetData.push(data);
		} 
		
		sap.ui.getCore().byId(appId).getModel(targetId+"_model").setData(targetData);
	},
	
	fnClearFormData : function(dataControlId){
		var dataControl = sap.ui.getCore().byId(dataControlId);
		
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			var elements = dataControl.getAggregation("content");
			for(var elementInc = 0; elementInc <elements.length; elementInc++){
				var aElement = elements[elementInc];
				var  elementType = aElement.getMetadata().getName();
				if(elementType === "sap.m.Label"){
					var valueType = elements[elementInc+1].getMetadata().getName();
					switch(valueType){
					case "sap.m.Text":elements[elementInc+1].setText("");
						break;
					case "sap.m.Input":
					case "sap.m.DatePicker":
					case "sap.m.TextArea":elements[elementInc+1].setValue("");
						break;
					case "sap.m.Select":elements[elementInc+1].setSelectedKey("");
						break;
					default: return true;
					}
				}
			}
		}
	},
	
	ValidateFormData: function(modelData, dataControlId){
		var dataControl = sap.ui.getCore().byId(dataControlId);
		
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			var elements = dataControl.getAggregation("content");
			var errorMsg=false;
			for(var elementInc = 0; elementInc <elements.length; elementInc++){
				var aElement = elements[elementInc];
				var  elementType = aElement.getMetadata().getName();
				if(elementType === "sap.m.Label"){
					if(aElement.getProperty("required") === true){
						var valueType = elements[elementInc+1].getMetadata().getName();
						var value = "";
						switch(valueType){
						case "sap.m.Input":value = elements[elementInc+1].getValue();
							break;
						case "sap.m.Text":value = elements[elementInc+1].getText();
							break;
						case "sap.m.DatePicker":value = elements[elementInc+1].getValue();
							break;
						case "sap.m.TextArea":value = elements[elementInc+1].getValue();
							break;
						case "sap.m.Select":value = elements[elementInc+1].getSelectedKey();
							break;
						default: return true;
						}
						if(value === ""){
							if(valueType !== "sap.m.Select"){
								elements[elementInc+1].setValueState("Error");							
							}
							errorMsg = true;
						}else{
							if(valueType !== "sap.m.Select"){
								elements[elementInc+1].setValueState("None");							
							}
						}
					}
				}
			}
			if(errorMsg){
				return "Please fill all required fields";
			}
		}
		
		return true;
	},
	
	showInfoMessage : function(message){
		sap.m.MessageBox.confirm(
		      	  message, {
		          icon: sap.m.MessageBox.Icon.INFORMATION,
		          title: "Information",
		          actions: [sap.m.MessageBox.Action.OK],
		          onClose: function(oAction) {  }
		      });
	}
	/** **/
}