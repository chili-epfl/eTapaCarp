Template.activities.events({
  'click .details': function(event) {
  	var div = $(event.target.parentElement.parentElement);
  	var details = div.find('.hide');
  	details.toggle('show');
  }
});