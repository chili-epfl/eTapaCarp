Utils = {
	
	areModelsLoaded : function() {
		MODELS = Session.get('shapes');
		return !(typeof(MODELS[6]) == "undefined");
	},
	
	getAvailableShapes : function() {
		return [6, 20, 64];
	},

	goToHREFDismissModal: function(href, modalId){
		$('#'+modalId).modal('hide');
		Meteor.Router.to(href);
	},

	dictLength: function(dict){
		var count = 0;
		for (var i in dict){
			count++;
		}
		return count;
	}
	
}
