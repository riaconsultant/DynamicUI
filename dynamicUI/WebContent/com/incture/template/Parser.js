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
		
		var oModel = new sap.ui.model.json.JSONModel();
		//create json model
		if (jsonPath) {
			var data = this.fnGetJson(jsonPath, null,"get", false);
			oModel = new sap.ui.model.json.JSONModel(data);
		}
		
		var app = new sap.m.App({
			id:oModel.getProperty('/app/app_detail/id'),
			initialPage : "initalPage"
		});
		
		/** One model to hold our global values - */
		var applicationModel = new sap.ui.model.json.JSONModel({
			modelNames:[],
			applicationId:app.getId()
		});
		sap.ui.getCore().setModel(applicationModel,"applicationModel");
		
		//create screens and layouts from the data
		var content = this.getContentFromJson(oModel.getData());
		
		/**
		 * function to create models 
		 */
		
		this.fnCreateModels();
		
		var page = new sap.m.Page({
			id : "initalPage",
			title : "Template Test",
			content : content,
			footer : undefined,
		});
		page.setModel(oModel, "defaultModel");
		// create an app that contains the initial page
		app.addPage(page);
		return app;
	},

	/**Function to generate the screens , layouts and all the controls based on input json data **/
	getContentFromJson : function(jsonData) {
		var content = [];
		this.data=[];
		var that = this;
		$.ajax({
			  url: 'com/incture/data/structure.json',
			  dataType: 'json',
			  async: false,
			  data: "",
			  success: function(data) {
			    that.data=data;
			  },
			});

		var aScreens = jsonData.app.screens;
		if(!aScreens){
			aScreens=[];
		}
		for (var incScreen = 0; incScreen < aScreens.length; incScreen++) {
			var screenElement = aScreens[incScreen];
			var aControlsForScreen = screenElement.layouts[0].controls;
			for (var controlInc = 0; controlInc < aControlsForScreen.length; controlInc++) {
				var control = aControlsForScreen[controlInc];
				var oControl = this.fnParseControl(control);
				var oActionControl = this.fnParseControlForActions(control);
				content.push(oControl);
				var actionData=[];
				actionData.push(new sap.m.ToolbarSpacer({}));
				for(var actionInc=0 ; actionInc< oActionControl.length; actionInc++){
					actionData.push(oActionControl[actionInc]);
					//oControl.addContent(oActionControl[actionInc]);
				}
				var actionBar = this.fnCreateToolBar(actionData);
				content.push(actionBar);
				
			}
		}

		/*content.push(this.getForm());
		content.push(this.getToolBar());
		content.push(this.getTable());*/

		return content;
	},
	
	fnParseControl : function(controlData, parentControl) {
		var controlType = controlData.type;
		if(controlType!==undefined){
			controlType = controlType.toLowerCase();
		}
		var oReturnControl = null;
		switch (controlType) {
		case "input":
			oReturnControl = this.fnCreateInput(controlData);
			break;
		case "radiobutton":
			oReturnControl = this.fnCreateRadioButton(controlData);
			break;
		case "checkbox":
			oReturnControl = this.fnCreateCheckBox(controlData);
			break;
		case "datetime":
			oReturnControl = this.fnCreateCheckBox(controlData);
			break;
		case "textarea":
			oReturnControl = this.fnCreateTextArea(controlData);
			break;
		case "text":
			oReturnControl = this.fnCreateText(controlData);
			break;
		case "form":
			oReturnControl = this.fnCreateGrid(controlData);
			break;
		case "select":
			oReturnControl = this.fnCreateSelect(controlData);
			break;
		case "submit":
		case "button":
			oReturnControl = this.fnCreateButton(controlData, parentControl);
			break;
		case "link":
			oReturnControl = this.fnCreateLink(controlData, parentControl);
			break;
		default:
			break;
		}

		sap.ui.getCore().getModel('applicationModel').getProperty("/modelNames").push(controlData.model);
		return oReturnControl;
	},
	
	fnCreateGrid : function(controlData){
		var oFormElements = controlData.elements;
		var aFormContents = [];
		var isLabelRequired = true;
		
		for (var elementInc = 0; elementInc < oFormElements.length; elementInc++) {
			var element = oFormElements[elementInc];
			var oControl = this.fnParseControl(element);
			isLabelRequired= this.fnIsLabelRequired(element);
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
		
		return oGrid;
	},
	
	/**Function to generate form control **/
	fnCreateSimpleForm : function(controlData) {
		var oFormElements = controlData.elements;
		var aFormContents = [];

		for (var elementInc = 0; elementInc < oFormElements.length; elementInc++) {
			var element = oFormElements[elementInc];
			var oLabelForControl = this.fnCreateLabel(element);
			var oControl = this.fnParseControl(element);
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
	
	fnCreateInput : function(controlData) {
		var oInput = new sap.m.Input({
			visible : Boolean(controlData.visible), // boolean
			value : "{" + controlData.model + ">"+controlData.bindingName + "}", // string
			width : controlData.width, // sap.ui.core.CSSSize
			enabled :Boolean( controlData.enable), // boolean
			placeholder : controlData.placeholder, // string
			styleClass:controlData.className,
			editable : true, // boolean, since 1.12.0
			type : sap.m.InputType.Text, // sap.m.InputType
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

		return oInput;
	},
	
	fnCreateLabel : function(controlData,alignment) {
		if(alignment === undefined)
			alignment = "Begin";
		var oLabel = new sap.m.Label({
			styleClass:controlData.className,
			visible : Boolean(controlData.visible), // boolean
			design : sap.m.LabelDesign.Standard, // sap.m.LabelDesign
			text : controlData.label, // string
			textAlign : alignment, // sap.ui.core.TextAlign
			width : "", // sap.ui.core.CSSSize
			required : Boolean(controlData.mandatory), // boolean
			tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
			labelFor : controlData.id
		});

		return oLabel;
	},
	
	/**Function to generate table control **/
	getTable : function() {
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
			cells : [ new sap.m.Text({
				text : "{defaultModel>name}"
			}), new sap.m.Text({
				text : "{defaultModel>DOB}"
			}), new sap.m.Text({
				text : "{defaultModel>designation}"
			}) ],
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

		//create table 
		var table = new sap.m.Table({
			id : "tableID",
			busy : false,
			busyIndicatorDelay : 1000,
			visible : true,
			inset : false,
			headerText : "header",
			headerDesign : sap.m.ListHeaderDesign.Standard,
			footerText : undefined,
			mode : sap.m.ListMode.None,
			width : "100%",
			includeItemInSelection : false,
			showUnread : false,
			noDataText : undefined,
			showNoData : true,
			enableBusyIndicator : true,
			modeAnimationOn : true,
			showSeparators : sap.m.ListSeparators.All,
			swipeDirection : sap.m.SwipeDirection.Both,
			growing : false,
			growingThreshold : 20,
			growingTriggerText : undefined,
			growingScrollToLoad : false,
			rememberSelections : true,
			backgroundDesign : sap.m.BackgroundDesign.Translucent,
			fixedLayout : true,
			showOverlay : false,
			tooltip : undefined,
			items : [],
			swipeContent : undefined,
			headerToolbar : new sap.m.Toolbar({}),
			infoToolbar : undefined,
			columns : [ new sap.m.Column({
				width : undefined,
				hAlign : sap.ui.core.TextAlign.Begin,
				vAlign : sap.ui.core.VerticalAlign.Inherit,
				styleClass : undefined,
				visible : true,
				minScreenWidth : "",
				demandPopin : false,
				popinHAlign : sap.ui.core.TextAlign.Begin,
				popinDisplay : sap.m.PopinDisplay.Block,
				mergeDuplicates : false,
				mergeFunctionName : "getText",
				tooltip : undefined,
				header : new sap.m.Text({
					text : "Name"
				}),
				footer : undefined
			}), new sap.m.Column({
				header : new sap.m.Text({
					text : "DOB"
				}),
			}), new sap.m.Column({
				header : new sap.m.Text({
					text : "Designation"
				}),
			}), ],
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

		table.bindAggregation("items", "defaultModel>/results", template);

		return table;
	},

	/**Function to create and return tool bar **/
	fnCreateToolBar : function(toolBarContent) {
		var toolBar = new sap.m.Toolbar({
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

		return toolBar;
	},
	
	fnCreateSelect : function(controlData){
		var oSelect = new sap.m.Select({
			visible : Boolean(controlData.visible), // boolean
			enabled : Boolean(controlData.enable), // boolean
			width : "100%", // sap.ui.core.CSSSize
			maxWidth : "100%", // sap.ui.core.CSSSize
			selectedKey : "{"+controlData.model+">"+controlData.bindingName+"}", // string, since 1.11
			selectedItemId : "", // string, since 1.12
			icon : controlData.icon, // sap.ui.core.URI, since 1.16
			type : sap.m.SelectType.Default, // sap.m.SelectType, since 1.16
			autoAdjustWidth : false, // boolean, since 1.16
			tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
			items : {
				path:controlData.itemBinding.model+">"+controlData.itemBinding.bindingPath,
				template: new sap.ui.core.Item({
					text : "{"+controlData.itemBinding.model+">"+controlData.itemBinding.itemLabel+"}", // string
					enabled : true, // boolean
					textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection
					key : "{"+controlData.itemBinding.model+">"+controlData.itemBinding.itemKey+"}", // string
					tooltip : undefined, // sap.ui.core.TooltipBase
				}) 
			}, // sap.ui.core.Item
			selectedItem : undefined, // sap.ui.core.Item
			change : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ]
		});
		
		/**
		 * Need to create a model and fetch data from service URL and set it to entire app
		 */
			this.fnCreateModelAndFetchData(controlData,controlData.itemBinding.model);
			return oSelect;
	},
	
	fnCreateDateTimeInput:function(controlData){
		var oDateTime = new sap.m.DateTimeInput({
			visible : Boolean(controlData.visible), // boolean
			value : "{"+controlData.model+">"+controlData.bindingName+"}", // string
			width : controlData.width, // sap.ui.core.CSSSize
			enabled : Boolean(controlData.enable), // boolean
			placeholder : controlData.placeholder, // string
			editable : true, // boolean, since 1.12.0
			type : sap.m.DateTimeInputType.Date, // sap.m.DateTimeInputType
			displayFormat : undefined, // string
			valueFormat : undefined, // string
			dateValue : undefined, // object
			tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
			change : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			change : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ]
		});
		return oDateTime;
	},
	
	fnCreateTextArea :function(controlData){
		var oTextArea = new sap.m.TextArea({
			visible : Boolean(controlData.visible), // boolean
			value :  "{"+controlData.model+">"+controlData.bindingName+"}", // string
			width : controlData.width, // sap.ui.core.CSSSize
			enabled :  Boolean(controlData.enable), // boolean
			placeholder : controlData.placeholder, // string
			editable : true, // boolean, since 1.12.0
			rows : 2, // int
			cols : 20, // int
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
		return oTextArea;
	},
	
	fnCreateCheckBox : function(controlData){
		var oCheckBox = new sap.m.CheckBox({
			visible :  Boolean(controlData.visible), // boolean
			selected : Boolean("{"+controlData.model+">"+controlData.bindingName+"}"), // boolean
			enabled : Boolean(controlData.enable), // boolean
			name : controlData.name, // string
			text : controlData.label, // string
			width : controlData.width, // sap.ui.core.CSSSize
			activeHandling : true, // boolean
			editable : true, // boolean, since 1.25
			tooltip : undefined, // sap.ui.core.TooltipBase
			select : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ]
		});
		
		return oCheckBox;
	},
	
	fnCreateRadioButton: function(controlData){
		var oRadioButton = new sap.m.RadioButton({
			visible : Boolean(controlData.visible), // boolean
			enabled : Boolean(controlData.enable), // boolean
			selected : Boolean("{"+controlData.model+">"+controlData.bindingName+"}"), // boolean
			groupName : controlData.name, // string
			text : controlData.label, // string
			width : controlData.width, // sap.ui.core.CSSSize
			editable : true, // boolean, since 1.25
			tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
			select : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ]
		});
		return oRadioButton;
	},
	
	fnCreateText:function(controlData){
		var oText = new sap.m.Text({
			visible : Boolean(controlData.visible), // boolean
			text : "{"+controlData.model+">"+controlData.bindingName+"}", // string
			wrapping : true, // boolean
			textAlign : sap.ui.core.TextAlign.Begin, // sap.ui.core.TextAlign
			width : controlData.width, // sap.ui.core.CSSSize
			maxLines : undefined, // int, since 1.13.2
			tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
		});
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
	
	fnIsLabelRequired:function(controlData){
		var isLabelReq = true;
		var controlType = controlData.type;
		if(controlType!==undefined){
			controlType = controlType.toLowerCase();
		}
		switch(controlType){

		case "input":
		case "select":
		case "datetime":
		case "textarea":
				isLabelReq = true;
			break;
		case "text":
				if(controlData.label===undefined){
					isLabelReq = false;
				}
				else{
					isLabelReq = true;
				}
				break;
		case "form":
		case "checkbox":
		case "radiobutton":
				isLabelReq = false;
			break;
		
		default:
			isLabelReq = false;
			break;
		
		}
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
		var serviceUrl = controlData.serviceUrl;
		var fetchData = this.fnGetJson(serviceUrl,null,"get",false);
		var applicationId = sap.ui.getCore().getModel('applicationModel').getProperty('/applicationId');
		if(modelName === undefined){
			modelName = controlData.model;
		}
		var oModel = new sap.ui.model.json.JSONModel(fetchData);
		sap.ui.getCore().byId(applicationId).setModel(oModel,modelName);
	},
/** Function methods for parsing actions **/
	fnCreateButton : function(actionData, parentControl){
		var oButton = new sap.m.Button({
			visible : true, // boolean
			text : actionData.label, // string
			type : sap.m.ButtonType.Default, // sap.m.ButtonType
			width : undefined, // sap.ui.core.CSSSize
			enabled : true, // boolean
			icon : undefined, // sap.ui.core.URI
			iconFirst : true, // boolean
			activeIcon : undefined, // sap.ui.core.URI
			iconDensityAware : true, // boolean
			tooltip : actionData.tooltip, // sap.ui.core.TooltipBase
			ariaDescribedBy : [], // sap.ui.core.Control
			ariaLabelledBy : [], // sap.ui.core.Control
			tap : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ],
			press : [ function(oEvent) {
				var control = oEvent.getSource();
				var oModel = control.getModel("parentModel").getProperty('/Model').model;
				var applicationId = sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId');
				var modelData = sap.ui.getCore().byId(applicationId).getModel(oModel).getData();
				var method = control.getModel("parentModel").getProperty('/Model').serviceMethod;
				var serviceURL = control.getModel("parentModel").getProperty('/Action').serviceUrl;
				
				var returnData = this.fnGetJson(serviceURL, modelData, method, false);
				
				//var url = "http://jsonplaceholder.typicode.com/posts/1";
			}, this ]
		});
		var oModel = new sap.ui.model.json.JSONModel({"Model": parentControl,"Action":actionData});
		oButton.setModel(oModel,"parentModel");
		
		return oButton;
	},
	
	fnCreateLink : function(actionData){
		var oLink = new sap.m.Link({
			visible : Boolean(actionData.visible), 
			text : actionData.label, 
			enabled : Boolean(actionData.enabled), // boolean
			target : undefined, // string
			width : undefined, // sap.ui.core.CSSSize
			href : actionData.screenRef, // sap.ui.core.URI
			wrapping : false, // boolean
			subtle : false, // boolean, since 1.22
			emphasized : Boolean(actionData.emphasized), // boolean, since 1.22
			tooltip : actionData.tooltip, // sap.ui.core.TooltipBase
			press : [ function(oEvent) {
				var control = oEvent.getSource();
			}, this ]
		});
		return oLink;
	},
	
	fnParseControlForActions : function(control){
		var oActionControl = [];
		var controlActions = control.actions;
		for(var actionInc=0; actionInc< controlActions.length; actionInc++){
			var oAction = controlActions[actionInc];
			oActionControl.push(this.fnParseControl(oAction, control));
		}
		return oActionControl;
	},
	/**
	 * JQuery Ajax methods
	 */
	fnGetJson:function(serviceUrl, data, method, async, jsonData){
		jsonData="string";
		var returnData = {};
		var that=this;
		$.ajax({
			  dataType: "json",
			  url: serviceUrl,
			  async: async,
			  data: data,
			  method: method,
			  success: function(data, jqXHR, options){
				  returnData =  data;
			  },
			  error:function(error){
				  console.log(error);
				  returnData= {};
			  }
			});
		
		return returnData;
	},
	
	/** **/
}