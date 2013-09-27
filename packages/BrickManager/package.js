Package.describe({
	summary: "Brick manager"
});

Package.on_use(function (api, where) {
 	api.add_files('Brick.js', 'client');
 	api.add_files('BrickManager.js', 'client');
 	api.export(['Brick','BrickManager'],'client');
});