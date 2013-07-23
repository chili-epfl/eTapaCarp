Package.describe({
  summary: "Coordinate Mapper"
});

Package.on_use(function (api, where) {
  api.add_files('mm2pixel.js', 'client');
  api.add_files('pixel2mm.js', 'client');
});