var shapesHandle = Meteor.subscribe('shapes');
var Shapes = new Meteor.Collection('shapes');
var scoreHandle = Meteor.subscribe('score');
this.Score = new Meteor.Collection('score');

Deps.autorun(function() {
  var data, shapesData;
  shapesData = {};
  data = Shapes.find({});
  data.forEach(function(entry) {
    return shapesData[entry.id] = entry;
  });
  Session.set('shapes', shapesData);
  return null;
});

Template.activities.events({
  'click .details': function(event) {
  	var div = $(event.target.parentElement.parentElement);
  	var details = div.find('.hide');
  	details.toggle('show');
  }
});