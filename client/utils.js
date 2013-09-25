Utils = {
	
	areModelsLoaded : function() {
		MODELS = Session.get('shapes');
		return !(typeof(MODELS[6]) == "undefined");
	},
	
	getAvailableShapes : function() {
		return [6, 20, 64];
	},
	
}
