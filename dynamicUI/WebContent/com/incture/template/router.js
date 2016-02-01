jQuery.sap.declare("com.incture.template.router");
jQuery.sap.require("sap.ui.core.routing.HashChanger");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

com.incture.template.router = {
	hashChanger : new sap.ui.core.routing.HashChanger(),
	
	init : function(){
		//var oHashChanger = this.hashChanger.getInstance();  
		this.hashChanger.attachEvent("hashChanged", function(oEvent) {  
		  alert(oEvent.getParameter("newHash") + "," + oEvent.getParameter("oldHash"));  
		});  
	},

	getHash : function(){
		return this.hashChanger.getHash();
	},
	
	setHash : function(hashValue){
		this.hashChanger.setHash(hashValue);
	}
};