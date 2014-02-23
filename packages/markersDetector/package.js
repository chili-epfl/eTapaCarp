Package.describe({
    summary: "Fiducial Markers Detector and fake marker detector for\n\
virtual activities"
});

Package.on_use(function(api, where) {
    api.use('CoordinateMapper', 'client')
    api.use('ThreeJS');
	api.use('Chilitags');

    api.add_files('markersDetector.js', 'client');
    api.add_files('fakeMD_Mouse.js', 'client');

    api.export(['MarkersDetector', 'FakeMD_Mouse'], 'client');
});
