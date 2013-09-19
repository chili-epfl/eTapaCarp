Package.describe({
	summary: "d3.js"
});

Package.on_use(function (api, where) {
 	api.add_files('d3.v3.js', 'client');
 	api.export(['d3'],'client');
});