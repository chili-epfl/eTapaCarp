Package.describe({
	summary: "Orthographic views"
});

Package.on_use(function (api, where) {
	api.use('ThreeJS');
 	api.add_files('views.js', 'client');
});