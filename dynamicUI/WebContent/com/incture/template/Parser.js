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
			mobile:Boolean(oModel.getProperty('/app/app_detail/mobile'))
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
			for(var actionInc=0 ; actionInc< oActionControl.length; actionInc++){
				actionData.push(oActionControl[actionInc]);
				//oControl.addContent(oActionControl[actionInc]);
			}
			actionData.push(new sap.m.ToolbarSpacer({width:"10%"}));
			var actionBar = this.fnCreateToolBar(actionData);
			content.push(actionBar);
		}

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
			oReturnControl = this.fnCreateText(controlData,parentControl);
			break;
		case "form":
			var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
			if(bMobileEnabled){
				oReturnControl = this.fnCreateGrid(controlData,parentControl);
			}
			else{
				oReturnControl = this.fnCreateMaxrixLayout(controlData,parentControl);
			}
			break;
		case "select":
			oReturnControl = this.fnCreateSelect(controlData,parentControl);
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

		
		return oReturnControl;
	},
	
	fnCreateGrid : function(controlData,parentControl){
		var oFormElements = controlData.elements;
		var aFormContents = [];
		var isLabelRequired = true;
		
		for (var elementInc = 0; elementInc < oFormElements.length; elementInc++) {
			var element = oFormElements[elementInc];
			var oControl = this.fnParseControl(element,controlData);
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
			id:controlData.id,
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
	
	fnCreateMaxrixLayout:function(controlData,parentControl){
		
		var oRow = undefined; 
		var aRows = [];
		var oFormElements = controlData.elements;
		var isLabelRequired = true;
		
		for (var elementInc = 0; elementInc < oFormElements.length; elementInc++) {
			if(oRow == undefined || oRow.getCells().length % 6 == 0){
				oRow = new sap.ui.commons.layout.MatrixLayoutRow({});
				aRows.push(oRow)
			}
			var element = oFormElements[elementInc];
			var oControl = this.fnParseControl(element,controlData);
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
					id:controlData.id,
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
		var oInput = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oInput = new sap.m.Input({
				id:controlData.id,
				visible : Boolean(controlData.visible), // boolean
				value : "{" + parentModel + ">/"+controlData.bindingName + "}", // string
				width : controlData.width, // sap.ui.core.CSSSize
				enabled :Boolean( controlData.enable), // boolean
				placeholder : controlData.placeholder, // string
				styleClass:controlData.className,
				editable : Boolean(controlData.editable), // boolean, since 1.12.0
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
		}
		else{
			
			oInput = new sap.ui.commons.TextField({
				id : controlData.id, // sap.ui.core.ID
				visible :  Boolean(controlData.visible), // boolean
				value : "{" + parentModel + ">/"+controlData.bindingName + "}", // string
				enabled : Boolean(controlData.enable), // boolean
				editable : Boolean(controlData.editable), // boolean
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
	
	fnCreateLabel : function(controlData,alignment) {
		if(alignment === undefined)
			alignment = "Begin";
		var oLabel = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oLabel = new sap.m.Label({
				styleClass:controlData.className,
				visible : Boolean(controlData.visible), // boolean
				design : sap.m.LabelDesign.Standard, // sap.m.LabelDesign
				text : controlData.label, // string
				textAlign : alignment, // sap.ui.core.TextAlign
				width : "100%", // sap.ui.core.CSSSize
				required : Boolean(controlData.mandatory), // boolean
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				labelFor : controlData.id
			});
		}
		else{
			
			oLabel = new sap.ui.commons.Label({
				visible :  Boolean(controlData.visible), // boolean
				design : sap.ui.commons.LabelDesign.Standard, // sap.ui.commons.LabelDesign
				wrapping : false, // boolean
				width : "100%", // sap.ui.core.CSSSize
				text : controlData.label, // string
				icon : undefined, // sap.ui.core.URI
				textAlign : alignment, // sap.ui.core.TextAlign
				required : Boolean(controlData.mandatory), // boolean, since 1.11.0
				requiredAtBegin : undefined, // boolean, since 1.14.0
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				labelFor :  controlData.id
			// sap.ui.core.Control
			});
		}
		

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
				items : toolBarContent, // sap.ui.commons.ToolbarItem
				rightItems : []
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
				visible : Boolean(controlData.visible), // boolean
				enabled : Boolean(controlData.enable), // boolean
				editable : Boolean(controlData.editable), // boolean
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
				visible : Boolean(controlData.visible), // boolean
				value : "", // string
				enabled : Boolean(controlData.enable), // boolean
				editable : Boolean(controlData.editable), // boolean
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
				visible : Boolean(controlData.visible), // boolean
				value :  "{"+parentModel+">/"+controlData.bindingName+"}", // string
				width : controlData.width, // sap.ui.core.CSSSize
				enabled : Boolean(controlData.enable), // boolean
				placeholder :  controlData.placeholder, // string
				editable : Boolean(controlData.editable), // boolean, since 1.12.0
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
				visible : Boolean(controlData.visible), // boolean
				value : "{"+parentModel+">/"+controlData.bindingName+"}", // string
				enabled : Boolean(controlData.enable), // boolean
				editable :  Boolean(controlData.editable), // boolean
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
				visible : Boolean(controlData.visible), // boolean
				value :  "{"+parentModel+">/"+controlData.bindingName+"}", // string
				width : controlData.width, // sap.ui.core.CSSSize
				enabled :  Boolean(controlData.enable), // boolean
				placeholder : controlData.placeholder, // string
				editable :  Boolean(controlData.editable), // boolean, since 1.12.0
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
				visible :  Boolean(controlData.visible), // boolean
				value : "{"+parentModel+">/"+controlData.bindingName+"}", // string
				enabled :  Boolean(controlData.enable), // boolean
				editable :  Boolean(controlData.editable), // boolean
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
				visible :  Boolean(controlData.visible), // boolean
				selected : "{"+parentModel+">/"+controlData.bindingName+"}", // boolean
				enabled : Boolean(controlData.enable), // boolean
				name : controlData.name, // string
				text : controlData.label, // string
				width : controlData.width, // sap.ui.core.CSSSize
				activeHandling : true, // boolean
				editable : Boolean(controlData.editable), // boolean, since 1.25
				tooltip : undefined, // sap.ui.core.TooltipBase
				select : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{
			oCheckBox = new sap.ui.commons.CheckBox({
				id:controlData.id, // sap.ui.core.ID
				visible : Boolean(controlData.visible), // boolean
				checked : "{"+parentModel+">/"+controlData.bindingName+"}", // boolean
				text : controlData.label, // string
				enabled : Boolean(controlData.enabled), // boolean
				editable : Boolean(controlData.editable), // boolean
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
				visible : Boolean(controlData.visible), // boolean
				enabled : Boolean(controlData.enable), // boolean
				selected : "{"+parentModel+">/"+controlData.bindingName+"}", // boolean
				groupName : controlData.groupName, // string
				text : controlData.label, // string
				width : controlData.width, // sap.ui.core.CSSSize
				editable : Boolean(controlData.editable), // boolean, since 1.25
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
				select : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
		}
		else{
			oRadioButton = new sap.ui.commons.RadioButton({
				id:controlData.id, // sap.ui.core.ID
				visible : Boolean(controlData.visible), // boolean
				text : controlData.label, // string
				enabled : Boolean(controlData.enable), // boolean
				editable : Boolean(controlData.editable), // boolean
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
	
	fnCreateText:function(controlData,parentControl){
		var parentModel = parentControl.id +"_model";
		var oText = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oText = new sap.m.Text({
				id:controlData.id,
				visible : Boolean(controlData.visible), // boolean
				text : "{"+parentModel+">/"+controlData.bindingName+"}", // string
				wrapping : true, // boolean
				textAlign : sap.ui.core.TextAlign.Begin, // sap.ui.core.TextAlign
				width : controlData.width, // sap.ui.core.CSSSize
				maxLines : undefined, // int, since 1.13.2
				tooltip : controlData.tooltip, // sap.ui.core.TooltipBase
			});
		}else{
			 oText = new sap.ui.commons.TextView({
				id:controlData.id, // sap.ui.core.ID
				visible : Boolean(controlData.visible), // boolean
				text : "{"+parentModel+">/"+controlData.bindingName+"}", // string
				textDirection : sap.ui.core.TextDirection.Inherit, // sap.ui.core.TextDirection
				enabled : Boolean(controlData.enable), // boolean
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
		var fetchData = this.fnGetJson(serviceUrl,null,"get",true,null,oModel);
		sap.ui.getCore().byId(applicationId).setModel(oModel,modelName);
	},
	/** Function methods for parsing actions **/
	fnCreateButton : function(actionData, parentControl){
		var oButton = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			 oButton = new sap.m.Button({
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
					var oModelName = control.getModel("parentModel").getProperty('/ParentId');
					var applicationId = sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId');
					var modelData = sap.ui.getCore().byId(applicationId).getModel(oModelName+"_model").getData();
					var actionData = control.getModel("parentModel").getProperty('/Action');
					var method = actionData.serviceMethod;
					
					var returnData = this.fnGetJson(actionData.serviceUrl, modelData, method, true, actionData );
					// nav to detailscreen
					com.incture.template.router.setHash(actionData.targetControl.targetScreenId);
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
					var control = oEvent.getSource();
					var oModelName = control.getModel("parentModel").getProperty('/ParentId');
					var applicationId = sap.ui.getCore().getModel("applicationModel").getProperty('/applicationId');
					var modelData = sap.ui.getCore().byId(applicationId).getModel(oModelName+"_model").getData();
					var actionData = control.getModel("parentModel").getProperty('/Action');
					var method = actionData.serviceMethod;
					
					var returnData = this.fnGetJson(actionData.serviceUrl, modelData, method, true, actionData );
					// nav to detailscreen
					com.incture.template.router.setHash(actionData.targetControl.targetScreenId);
				}, this ]
			});
		}
		
		
		var oModel = new sap.ui.model.json.JSONModel({"Action":actionData,"ParentId":parentControl.id});
		oButton.setModel(oModel,"parentModel");
		return oButton;
	},
	
	fnCreateLink : function(actionData){
		var oLink = undefined;
		var bMobileEnabled = sap.ui.getCore().getModel('applicationModel').getProperty('/mobile');
		if(bMobileEnabled){
			oLink = new sap.m.Link({
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
		for(var actionInc=0; actionInc< controlActions.length; actionInc++){
			var oAction = controlActions[actionInc];
			oActionControl.push(this.fnParseControl(oAction, control));
		}
		return oActionControl;
	},
	/**
	 * JQuery Ajax methods
	 */
	fnGetJson:function(serviceUrl, data, method, async, actionData,model){
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
				  if(async){
					  returnData = that.fnParseReturnData(data,actionData);
					  if(model !== undefined){
						  model.setData(data);
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
	}
	/** **/
}