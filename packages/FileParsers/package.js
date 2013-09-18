Package.describe({
	summary: "File parsers for 3D objects"
});

Package.on_use(function (api, where) {
 	api.add_files('satParser.js', 'client');
 	api.add_files('objParser.js', 'client');
 	api.export(['satParser', 'objParser'],'client');
});