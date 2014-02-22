Package.describe({
	summary: "Tool manager"
});

Package.on_use(function (api, where) {
 	api.add_files('Tool.js', 'client');
 	api.add_files('ToolManager.js', 'client');
 	api.export(['Tool','ToolManager','ToolFactory'],'client');
});