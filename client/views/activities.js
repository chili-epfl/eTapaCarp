var shapesHandle = Meteor.subscribe('shapes');
this.Shapes = new Meteor.Collection('shapes');
var toolsHandle=Meteor.subscribe('tools');
this.Tools = new Meteor.Collection('tools');
var scoreHandle = Meteor.subscribe('score');
this.Score = new Meteor.Collection('score');

Deps.autorun(function() {
  var data, shapesData,toolsData;
  shapesData = {};
  toolsData={};
  data = Shapes.find({});
  data.forEach(function(entry) {
    return shapesData[entry.id] = entry;
  });
  Session.set('shapes', shapesData);
  data = Tools.find({});
  data.forEach(function(entry) {
    return toolsData[entry.id] = entry;
  });
  Session.set('tools', toolsData);
  
  
  data = Score.find({'userId':Meteor.userId()});
  
  return null;
});

Template.activities.events({
  'click .details': function(event) {
  	var div = $(event.target.parentElement.parentElement);
  	var details = div.find('.hide');
  	details.toggle('show');
  }
});