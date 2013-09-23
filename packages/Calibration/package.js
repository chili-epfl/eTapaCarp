Package.describe({
	summary: "Calibration"
});

Package.on_use(function (api, where) {
 	api.add_files('calibration.js', 'client');
	api.export(['Calib', 'CalibStatic'], 'client');
});
