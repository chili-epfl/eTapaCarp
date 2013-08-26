Package.describe({
  summary: "JSARToolKit"
});

Package.on_use(function (api, where) {
  api.add_files('JSARToolKit.js', 'client');
  api.export(['NyARRgbRaster_Canvas2D','FLARParam','FLARMultiIdMarkerDetector'], 'client');
});