Package.describe({
  summary: "Fiducial Markers Detector"
});

Package.on_use(function (api, where) {
  api.add_files('markersDetector.js', 'client');
});