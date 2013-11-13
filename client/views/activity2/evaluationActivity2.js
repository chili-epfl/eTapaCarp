var rendered = false;
var animationId = null;

Template.evaluationActivity2.lang = function(e){
  return Session.get('lang');
}

Template.activity2Difficulty.lang = function(e){
  return Session.get('lang');
}

Template.activity2Ready.lang = function(e){
  return Session.get('lang');
}

var viewManager = new ViewManager();
var markersDetector;
var isNotJittering = false;
var startTime = null;
var stopTime = null;
var scoreId = null;
var shapes = null;

Template.evaluationActivity2.rendered = function(){
	//To be sure the models of the shapes are loaded
	MODELS = Session.get('shapes');
	if (typeof(MODELS[6]) == "undefined"){
		return;
	}

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

		markersDetector = new MarkersDetector("cam", "camcanvas");
	    markersDetector.accessCamera();
	    var frontview = new FrontView('front');
	    frontview.setDynamic(false);
		viewManager.addView(frontview);
	    var sideview = new SideView('side');
	    sideview.setDynamic(false);
		viewManager.addView(sideview);
		viewManager.addView(new TopView('top'));
		viewManager.init();
		viewManager.setAxis(false);
		viewManager.activity2Difficulty(Session.get('activity2Level'));
		shapes = viewManager.generateRandomPositions();
		while(shapes[0]){
			shapes = viewManager.generateRandomPositions();
		}
		Template.evaluationActivity2.animate();
	}
}

Template.evaluationActivity2.events({
	'click #transparency-on': function () {
		$('#transparency-off').removeClass('btn-primary');
		$('#transparency-on').addClass('btn-primary');
		viewManager.setTransparency(true);
		viewManager.setChangedLayout(true);
	},

	'click #transparency-off': function () {
		$('#transparency-on').removeClass('btn-primary');
		$('#transparency-off').addClass('btn-primary');
		viewManager.setTransparency(false);
		viewManager.setChangedLayout(true);
	},

	'click #axis-on': function () {
		$('#axis-off').removeClass('btn-primary');
		$('#axis-on').addClass('btn-primary');
		viewManager.setAxis(true);
		viewManager.setChangedLayout(true);
	},

	'click #axis-off': function () {
		$('#axis-on').removeClass('btn-primary');
		$('#axis-off').addClass('btn-primary');
		viewManager.setAxis(false);
		viewManager.setChangedLayout(true);
	},

	'click #feedback-on': function () {
		$('#feedback-off').removeClass('btn-primary');
		$('#feedback-on').addClass('btn-primary');
		$('#feedback').show();
	},

	'click #feedback-off': function () {
		$('#feedback-on').removeClass('btn-primary');
		$('#feedback-off').addClass('btn-primary');
		$('#feedback').hide();
	}
});

Template.evaluationActivity2.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
	isNotJittering = false;
	startTime = null;
	stopTime = null;
	scoreId = null;
}

Template.activity2Difficulty.events({
	'click a[id^="difficulty"]': function(e, tmpl){
		Session.set('activity2Level',e.target.id.split('difficulty')[1]);
		Meteor.Router.to('/activity2/scoring/ready');
	}
});

Template.activity2Ready.events({
	'click #startButton': function(e,tmpl) {
		if (!$('#startButton').hasClass('disabled')){
			Meteor.Router.to('/activity2/scoring');
		}
	}
});

Template.activity2Ready.rendered = function(){
	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

		markersDetector = new MarkersDetector("cam", "camcanvas");
	    markersDetector.accessCamera();
		Template.activity2Ready.animate();
	}
}

Template.activity2Ready.destroyed = function(){
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}