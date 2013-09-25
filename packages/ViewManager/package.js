Package.describe({
	summary: "View manager"
});

Package.on_use(function (api, where) {
	api.use('Views');
 	api.add_files('viewmanager.js', 'client');
 	api.export(['ViewManager'],'client');
});