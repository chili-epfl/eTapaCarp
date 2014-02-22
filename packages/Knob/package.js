Package.describe({
  summary: "Knob by Anthony Terrien"
});

Package.on_use(function (api, where) {
  api.add_files('Knob.js', 'client');
});