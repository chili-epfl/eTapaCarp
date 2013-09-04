Template.navbar.lang = function(e){
  return Session.get('lang');
}
Template.navbar.events({
  'click li': function(event) {
    var id;

    event.preventDefault();
    id = event.currentTarget.id;
    switch (id) {
      case 'navbarActivities':
        return Meteor.Router.to('/activities');
      case 'navbarHome':
        return Meteor.Router.to('/home');
      case 'navbarAbout':
        return Meteor.Router.to('/about');
      case 'navbarCreateAnObject':
        return Meteor.Router.to('/createAnObject');
      case 'navbarMyAccount':
        return Meteor.Router.to('/myAccount');
      case 'set-lang-fr':
        return Session.set('lang_id', 'fr');
      case 'set-lang-de':
        return Session.set('lang_id', 'de');
      case 'set-lang-en':
        return Session.set('lang_id', 'en');
    }
  },
  'click a.brand': function(event) {
    event.preventDefault();
    return Meteor.Router.to('/');
  }
});

Template.navbar.rendered = function() {
  return Deps.autorun(function() {
    var navId;

    navId = Session.get('navbar:navId');
    $('#titleNavbar li').removeClass('active');
    return $('#navbar' + navId).addClass('active');
  });
};