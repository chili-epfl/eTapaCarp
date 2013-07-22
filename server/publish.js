

this.Shapes = new Meteor.Collection('shapes');


Meteor.publish('shapes', function(){
  var collection = Shapes.find({});
  console.log(collection.count())
  return collection;
});

Shapes.allow({
  insert: function(userId, doc) {
    return userId && Meteor.user().admin;
  },
  update: function(userId, doc) {
    return userId && Meteor.user().admin;
  },
  remove: function(userId, doc) {
    return userId && Meteor.user().admin;
  }
});

this.Lang = new Meteor.Collection('lang');

Meteor.publish('lang', function() {
  return Lang.find({});
});

Lang.allow({
  insert: function(userId, doc) {
    return userId && Meteor.user().admin;
  },
  update: function(userId, doc) {
    return userId && Meteor.user().admin;
  },
  remove: function(userId, doc) {
    return userId && Meteor.user().admin;
  }
});