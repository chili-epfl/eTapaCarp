Meteor.startup(function(){
    $(window).resize(function(evt) {
      Session.set("resized", new Date());
    });
});

var langHandle, setNav;

langHandle = Meteor.subscribe('lang');

var Lang = new Meteor.Collection('lang');

Session.setDefault('lang_id', 'fr');

Session.setDefault('lang', {});

Session.setDefault('virtual', false);

/*Deps.autorun runs the function when 
 *lang_id changes. It update the session collection
 *lang. */
Deps.autorun(function() {
  var data, langData, lang_id;
  langData = {};
  lang_id = Session.get('lang_id');
  data = Lang.find({});
  data.forEach(function(entry) {
    return langData[entry.word] = entry[lang_id];
  });
  Session.set('lang', langData);
  return null;
});


setNav = function(name) {
  return Session.set('navbar:navId', name);
};

/*These functions takes an URL(the colon identifies a variable) and 
 * return the templetes to render.
 * https://github.com/tmeasday/meteor-router */
Meteor.Router.add({
    '/activity:id/practice': function(id) {
        if (Meteor.user()) {
    Session.set('isPractice', true);
            if (id == 1) {
                return 'activity' + id;
            }
            else if (id == 4 || id == 5) {
                return 'activity'+id+"Difficulty";
            }
            else
                return 'practiceActivity' + id;
        }
        else {
            return 'notLoggedIn';
        }
    }, '/activity:id/practice/ready': function(id) {
        if (Meteor.user()) {
            Session.set('isPractice', true);
            if (id == 1||id == 4 || id == 5) {
                return 'activity' + id;
            }

            else
                return 'practiceActivity' + id;
    }
    else{
      return 'notLoggedIn';
    }
    }
    ,
    '/activity:id/scoring/difficulty': function(id) {
        if (Meteor.user()) {
            return 'activity' + id + 'Difficulty';
        }
        else {
            return 'notLoggedIn';
        }
  },
    '/activity:id/scoring/ready': function(id) {
        if (Meteor.Router.page() == 'activity' + id + 'Difficulty' || Meteor.Router.page() == 'activity' + id + 'Ready') {
            if (Meteor.user()) {
                return 'activity' + id + 'Ready';
      }
      else{
        return 'notLoggedIn';
      }
    }
    else{
      return 'notAllowed';
    }
  },
    '/activity:id/scoring': function(id) {
        if (Meteor.Router.page() == 'activity' + id || Meteor.Router.page() == 'activity' + id + 'Ready') {
            if (Meteor.user()) {
        Session.set('isPractice', false);
        return 'activity'+id;
      }
      else{
        return 'notLoggedIn';
      }
    }
    else{
      return 'notAllowed';
    }
  },
  '/activity:id/practice/difficulty': function(id){
  	return 'activity'+id+'Difficulty';
  },
  
  '/activity:id/practice/ready': function(id){
	  return "activity"+id+"Ready";
  },
  '/activity:id/scoring/difficulty': function(id){
    if(Meteor.user()){
      return 'activity'+id+'Difficulty';
    }
    else{
      return 'notLoggedIn';
    }
  },

  '/activities': function() {
    setNav('Activities');
    return 'activities';
  },

  '/': function() {
    setNav('Home');
    return 'home';
  },

  '/home': function() {
    setNav('Home');
    return 'home';
  },
  
  '/about': function() {
    setNav('About');
    return 'about';
  },
  
  '/createAnObject': function() {
    setNav('CreateAnObject');
    return 'createAnObject';
  },
  
  '/importObject': function() {
    setNav('ImportObject');
    return 'importObject';
  },
  
  '/myAccount': function() {
    if(Meteor.user()){
      setNav('MyAccount');
      return 'myAccount';
    }
    else{
      return 'notLoggedIn';
    }
  }
});
