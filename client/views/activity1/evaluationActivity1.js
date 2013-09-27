
var rendered = false;
var animationId = null;
var lang;

Template.evaluationActivity1.lang = function(e){
	lang = Session.get('lang');
	return lang;
}

Template.activity1Difficulty.lang = function(){
	lang = Session.get('lang');
	return lang;
}

Template.activity1Ready.lang = function(){
	lang = Session.get('lang');
	return lang;
}

var viewManager = new ViewManager();
var markersDetector;
var activity;
var startTime = null;
var stopTime = null;
var timerStarted = false;
var timer = null;
var scoreId = null;
var objectDetectedOnce = 0;


function onDocumentMouseDown( event ) {
	if (event.which == 1){
		var clickedView = viewManager.findClickedView(event);
		if(clickedView !== undefined){
			clickedView.selectEdge(event);
			var correction = activity.checkSolution(viewManager.views);
			viewManager.showHelpOnSelect(event);
			activity.update(markersDetector);
		}
	}
};

Template.evaluationActivity1.updateTime = function(){
	if (timer){
		var endTime = (new Date().getTime()-startTime)/1000.0;
		$('#time').text(endTime);
		timer = setTimeout(Template.evaluationActivity1.updateTime, 100);
	}
}

Template.evaluationActivity1.rendered = function(){

	if (!Utils.areModelsLoaded()) {return;}
	
	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

		CalibStatic.needCalibrationCallback = null;
		activity.setRenderingCallback(viewManager, viewManager.render);
		activity.template = Template.evaluationActivity1;
		activity.evaluationMode = true;

	    markersDetector = new MarkersDetector("cam", "camcanvas");		
		markersDetector.setActivity(activity);
		markersDetector.Start();

		viewManager.addView(new FrontView('front'));
		viewManager.addView(new SideView('side'));
		viewManager.addView(new TopView('top'));
		viewManager.addView(new PerspectiveView('perspective'));
		viewManager.setAxis(true);
		viewManager.setGrid(false);
		viewManager.init();
		viewManager.addStandardDisplayOptions();

		// handle clicks on edges
	    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		$(document).keyup(function(e) {
			if (e.keyCode == 27){
				viewManager.clearChoiceEdges();
			}
		});

		createNextActivityHandler();
		
		viewManager.render({});
	}
}


function initActivity() {
	startTime = null;
	stopTime = null;
	timerStarted = false;
	timer = null;
	scoreId = null;
	activity.isFinished = false;
	activity.lastActiveMarkers = null;
    activity.objectDetected = false;
    activity.evaluationStarted = false;
}


function createNextActivityHandler() {
	$("#nextActivityButton").on('click', function() {
		activity.difficulty++;
		newDiff = Math.min(activity.difficulty, Config.Activity1.MAX_DIFFICULTY);
		newChallenge(newDiff);
	});
}

function newChallenge(difficulty) {
	activity.difficulty = difficulty;

	initActivity();
}

Template.evaluationActivity1.startActivity = function(markerId){
	viewManager.edgeToSelect(markerId, activity.difficulty, 'perspective');
	startTime = new Date().getTime();
	scoreId = Score.insert({time:null, activity:"activity1", userId:Meteor.userId(), date: new Date(), difficulty: activity.difficulty, shape: markerId});
	timerStarted = true;
	timer = setTimeout(Template.evaluationActivity1.updateTime, 100);
	activity.update(markersDetector);
}

Template.evaluationActivity1.activityFinished = function() {
	timer = null;
	var stopTime = new Date().getTime();
	endTime = (stopTime-startTime)/1000.0;
	Score.update({'_id':scoreId},{$set:{time:endTime}});
	$('#time').text(endTime);
	$("#activityFinish").modal('show');
}

Template.evaluationActivity1.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
	startTime = null;
	stopTime = null;
	scoreId = null;
	timer = null;
	activity.isFinished = false;
}

Template.activity1Difficulty.events({
	'click a[id^="difficulty"]': function(e, tmpl){
		activity = new Activity1();
		activity.difficulty = e.target.id.split('difficulty')[1];
		Meteor.Router.to('/activity1/scoring/ready');
	}
});

Template.activity1Ready.events({
	'click #startButton': function(e,tmpl) {
		var numMarkers = 0;
		for (var i in markersDetector.activeMarkers){
			numMarkers++;
		}
		if (numMarkers == 1 && !CalibStatic.needCalibration) {
			activity.lastActiveMarkers = null;
			Meteor.Router.to('/activity1/scoring');
		}
	}
})

Template.activity1Ready.rendered = function(){

	if (!Utils.areModelsLoaded()) { return; }

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;
		console.log(activity)
		activity.setRenderingCallback(activity, activity.updateReadyInfo);
		CalibStatic.setNeedCalibrationCallback(activity, activity.update);

	    markersDetector = new MarkersDetector("cam", "camcanvas");		
		markersDetector.setActivity(activity);
		markersDetector.Start();

	}
}

Template.activity1Ready.destroyed = function(){
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}
