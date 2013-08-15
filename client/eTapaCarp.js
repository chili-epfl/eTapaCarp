var langHandle, setNav;

langHandle = Meteor.subscribe('lang');

var Lang = new Meteor.Collection('lang');

Session.setDefault('lang_id', 'fr');

Session.setDefault('lang', {});

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

Template.main.lang = function(e){
	return Session.get('lang');
}

setNav = function(name) {
  return Session.set('navbar:navId', name);
};

Meteor.Router.add({
  '/activity1': 'activity1',
  '/activity2': 'activity2',

  '/activities': function() {
    setNav('Activities');
    return 'activities';
  },

  '/home': function() {
    setNav('Home');
    return 'home';
  },
  
  '/about': function() {
    setNav('About');
    return 'about';
  }
});
