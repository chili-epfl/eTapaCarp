saveObject = function(model){
	var id = 97 + Shapes.find({}).count();
	var coordinates = model.coordinates;
	var edges = model.edges;
	var faces = model.faces;
	var markerZ = model.markerZ;
	insert = Shapes.insert({
		id: id,
		coordinates: coordinates,
		edges: edges,
		faces: faces,
		markerZ: markerZ,
		userId: Meteor.userId()
	});
}