Package.describe({
	summary: "rickshaw.js"
});

Package.on_use(function (api, where) {
	api.use('d3JS','client');
	api.use('jquery-ui','client');

 	api.add_files('rickshaw.css', 'client');
 	api.add_files('rickshaw.js', 'client');
 	api.export(['Rickshaw'],'client');
});