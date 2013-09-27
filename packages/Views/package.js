Package.describe({
	summary: "Orthographic views"
});

Package.on_use(function (api, where) {
	api.use('ThreeJS');
	api.use('BrickManager');
 	api.add_files('views.js', 'client');
 	api.export(['FrontView','SideView','TopView','PerspectiveView'],'client');
});