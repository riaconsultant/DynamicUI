/**
 * @file : Parser.js
 * @className : com.incture.template.Parser.js
 * @author : manojchaurasiya
 * @date : 20-Jan-20163:18:04 pm
 * @description : 
 */
jQuery.sap.declare("com.incture.template.Parser");

com.incture.template.Parser={
	
		init: function(jsonPath){
			var oModel = new sap.ui.model.json.JSONModel();
			//create json model
			if(jsonPath){
				oModel= new sap.ui.model.json.JSONModel(jsonPath);
			}
			//create screens and layouts from the data
			var content = this.getContentFromJson(oModel.getData());
			
			var page= new sap.m.Page({
				id: "initalPage",
				title : "Template Test", 
				content : content,
				footer : undefined,
			});
			
			page.setModel(oModel,"defaultModel");
			
			// create an app that contains the initial page
			var app = new sap.m.App({initialPage:"initalPage"});
			app.addPage(page);
			
			return app;
		},
		
		/**Function to generate the screens , layouts and all the controls based on input json data **/
		getContentFromJson: function(jsonData){
			var content=[];
			content.push(this.getForm());
			content.push(this.getToolBar());
			content.push(this.getTable());
			
			return content;
		},
		
		/**Function to generate form control **/
		getForm: function(){
			var form = new sap.ui.layout.form.SimpleForm({
				busy : false, 
				busyIndicatorDelay : 1000,
				visible : true, 
				maxContainerCols : 2, 
				minWidth : -1,
				editable : true, 
				labelMinWidth : 192,
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
				customData : [ new sap.ui.core.CustomData({
					key : undefined, 
					value : undefined, 
					writeToDom : false, 
					tooltip : undefined, 
					customData : [], 
					dependents : []
				}) ], 
				dependents : [],
				content : [
				           new sap.m.Label({
				        	   text: "Name",
				        	   required: true
				           }),
				           new sap.m.Input({
				        	   width:"50%",
				        	   value: "{defaultModel>/results/0/name}",
				        	   editable: true,
				        	   showValueHelp: false,
				        	   valueHelpRequest: function(){
				        		   
				        	   },
				        	   liveChange: function(){
				        		   
				        	   }
				           }),
				           new sap.m.Label({
				        	   text: "DOB",
				        	   required: true
				           }),
				           new sap.m.DatePicker({
							visible : true,
							value : "{defaultModel>/results/0/DOB}", 
							width : "50%",
							enabled : true, 
							valueState : sap.ui.core.ValueState.None, // sap.ui.core.ValueState
							name : undefined, 
							placeholder : "pick a date",
							editable : true, 
							valueStateText : undefined, 
							showValueStateMessage : true,
							textAlign : sap.ui.core.TextAlign.Initial,
							displayFormat : undefined, 
							valueFormat : undefined,
							dateValue : undefined, 
							change : [ function(oEvent) {
								var control = oEvent.getSource();
							}, this ]
				           	}),
				           	new sap.m.Label({
					        	   text: "Designation",
					        	   required: true
					           }),
					        new sap.m.Input({
					        	  width:"50%",
					        	  value: "{defaultModel>/results/0/designation}",
					        	  editable: true,
					        	  showValueHelp: false,
					        	  valueHelpRequest: function(){
					        	   },
					        	  liveChange: function(){
					        	   }
					           }),
				           ], 
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
		
		/**Function to generate table control **/
		getTable: function(){
			var template=  new sap.m.ColumnListItem({
				busy : false, 
				busyIndicatorDelay : 1000, 
				visible : true, 
				type : sap.m.ListType.Inactive, 
				visible : true,
				unread : false, 
				selected : false,
				counter : undefined,
				tooltip : undefined,
				cells : [
				         new sap.m.Text({text:"{defaultModel>name}"}),
				         new sap.m.Text({text:"{defaultModel>DOB}"}),
				         new sap.m.Text({text:"{defaultModel>designation}"})
				         ], 
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
			var table= new sap.m.Table({
				id:"tableID",
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
				columns : [
				           new sap.m.Column({
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
							header : new sap.m.Text({text:"Name"}),
							footer : undefined
						}),
						new sap.m.Column({
								header : new sap.m.Text({text:"DOB"}),
							}),
						new sap.m.Column({
								header : new sap.m.Text({text:"Designation"}),
							}),
				  ],
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
			
			table.bindAggregation("items","defaultModel>/results",template);
			
			return table;
		},
		
		/**Function to create and return tool bar **/
		getToolBar: function(){
			var toolBar = new sap.m.Toolbar({
				visible : true,
				visible : true,
				width : "",
				active : false, 
				enabled : true, 
				height : "",
				design : sap.m.ToolbarDesign.Auto, 
				content : [
				           new sap.m.ToolbarSpacer({width : ""}),
				           new sap.m.Button({
							visible : true,
							text : "Save", 
							type : sap.m.ButtonType.Default, 
							width : "8%", 
							enabled : true,
							icon : "sap-icon://accept", 
							iconFirst : true, 
							activeIcon : undefined, 
							iconDensityAware : true, 
							tooltip : undefined, 
							ariaDescribedBy : [],
							ariaLabelledBy : [],
							tap : [ function(oEvent) {
								var control = oEvent.getSource();
							}, this ],
							press : [ function(oEvent) {
								var control = oEvent.getSource();
								alert("save action");
							}, this ]
				           }),
				           new sap.m.Button({
								visible : true,
								text : "Cancel", 
								type : sap.m.ButtonType.Default, 
								width : "8%", 
								enabled : true,
								icon : "sap-icon://decline", 
								iconFirst : true, 
								activeIcon : undefined, 
								iconDensityAware : true, 
								tooltip : undefined, 
								ariaDescribedBy : [],
								ariaLabelledBy : [],
								tap : [ function(oEvent) {
									var control = oEvent.getSource();
								}, this ],
								press : [ function(oEvent) {
									var control = oEvent.getSource();
									alert("cancel action");
								}, this ]
					           }),
					           new sap.m.ToolbarSpacer({width : "10%"})
				           ],
				press : [ function(oEvent) {
					var control = oEvent.getSource();
				}, this ]
			});
			
			return toolBar;
		},
		
}