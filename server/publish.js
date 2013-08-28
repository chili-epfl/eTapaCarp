

this.Shapes = new Meteor.Collection('shapes');


Meteor.publish('shapes', function(){
  var collection = Shapes.find({});
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

this.Score = new Meteor.Collection('score');

Meteor.publish('score', function() {
  return Score.find({});
});

Score.allow({
  insert: function(userId, doc) {
    return userId;
  },
  update: function(userId, doc, fields, modifier) {
    if (doc.userId == userId){
      if(typeof(modifier.$set.date) == "undefined"){
        if(doc.time == null){
          var now = new Date();
          var diffDate = now-doc.date;
          var time = modifier.$set.time;
          var diffTime = Math.abs(time*1000 - diffDate);
          console.log(diffTime);
          if (diffTime < 1000){
            return userId;
          }
        }
      }
    }
  },
  remove: function(userId, doc) {
    return userId && Meteor.user().admin;
  }
});