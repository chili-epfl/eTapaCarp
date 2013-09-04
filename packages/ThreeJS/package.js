Package.describe({
	summary: "three.js"
});

Package.on_use(function (api, where) {
 	api.add_files('three.js', 'client');
 	api.add_files('OrbitControls.js', 'client');
 	api.export(['THREE'],'client');
});