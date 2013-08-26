Package.describe({
  summary: "NumericJS library"
});

Package.on_use(function (api, where) {
  api.add_files('numeric.js', 'client');
  api.export('numeric','client');
});