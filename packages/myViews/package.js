Package.describe({
	summary: "Orthographic views"
});

Package.on_use(function (api, where) {
	api.use('three.js');
 	api.add_files('views.js', 'client');
});