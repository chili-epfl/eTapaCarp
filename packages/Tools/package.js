Package.describe({
	summary: "Diverse useful functions"
});

Package.on_use(function (api, where) {

 	api.add_files('distancePointToSegment.js', 'client');
 	api.add_files('findMarkerPosition.js', 'client');
 	api.export(['distancePointToSegment', 'findMarkerPosition'], 'client');

});