

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
    if (doc.userId == userId && doc.time == null){
      var now = new Date();
      var diffDate = now-doc.date;
      if(diffDate < 1000){
        return userId;
      }
    }
  },
  update: function(userId, doc, fields, modifier) {
    if (doc.userId == userId){
      console.log('in if 1')
      if(typeof(modifier.$set.date) == "undefined"){
      console.log('in if 2')
        if(doc.time == null){
      console.log('in if 3')
          var now = new Date();
          var diffDate = now-doc.date;
          var time = modifier.$set.time;
          var diffTime = Math.abs(time*1000 - diffDate);
      console.log(diffTime)
          if (diffTime < 1000){
      console.log('in if 4')
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