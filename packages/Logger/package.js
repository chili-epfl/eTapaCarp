Package.describe({
	summary: "Logger"
});

Package.on_use(function (api, where) {
 	api.add_files('Logger.js', 'client');
  	api.export(['Logger'],'client');
});