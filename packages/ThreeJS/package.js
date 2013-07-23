Package.describe({
	summary: "three.js"
});

Package.on_use(function (api, where) {
 	api.add_files('three.js', 'client');
});