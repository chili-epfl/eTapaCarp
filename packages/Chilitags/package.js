Package.describe({
	summary: "Chilitags"
});

Package.on_use(function (api, where) {
 	api.add_files('Chilitags.js', 'client');
 	api.export(['Module'], 'client');
});
