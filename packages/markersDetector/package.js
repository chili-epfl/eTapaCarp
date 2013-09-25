Package.describe({
  summary: "Fiducial Markers Detector"
});

Package.on_use(function (api, where) {
	api.use('CoordinateMapper', 'client')
  api.add_files('markersDetector.js', 'client');
  api.export('MarkersDetector','client');
});