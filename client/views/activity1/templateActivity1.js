var rendered = false;
var animationId = null;
var lang, isPractice;

Template.activity1.lang = function(e){
	lang = Session.get('lang');
	return lang;
}

Template.activity1.isPractice = function(){
	isPractice = Session.get('isPractice')
	return isPractice;
}

Template.activity1Difficulty.lang = function(){
	lang = Session.get('lang');
	return lang;
}

Template.activity1Ready.lang = function(){
	lang = Session.get('lang');
	return lang;
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

var viewManager = new ViewManager();
var markersDetector;
var activity;

Template.activity1.rendered = function(){

	if (!Utils.areModelsLoaded()) { return; }
	
	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;
		
		CalibStatic.needCalibrationCallback = null;
		if (typeof(activity) == 'undefined'){
			activity = new Activity1();
		}
		activity.setRenderingCallback(viewManager, viewManager.render);
		activity.template = Template.activity1;
		activity.evaluationMode = !isPractice;

	    markersDetector = new MarkersDetector("cam", "camcanvas");		
		markersDetector.setActivity(activity);
		markersDetector.Start();
		
		viewManager.addView(new FrontView('front'));
		viewManager.addView(new SideView('side'));
		viewManager.addView(new TopView('top'));
		viewManager.addView(new PerspectiveView('perspective'));
		viewManager.setAxis(true);
		viewManager.setGrid(false);
		viewManager.init()
		viewManager.addStandardDisplayOptions();
		viewManager.addFeedbackDisplay();
		
		// handle clicks on edges
	    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		$(document).keyup(function(e) {
			if (e.keyCode == 27) { // ESC
				viewManager.clearChoiceEdges();
			}
		});

		createNewChallengeHandler();
		createDifficultyHandler();
		createNextActivityHandler();
		
		viewManager.render({});
	}
	$("#difficulty" + activity.difficulty).addClass("btn-primary");
}

Template.activity1.updateTime = function(){
	if (timer){
		var endTime = (new Date().getTime()-startTime)/1000.0;
		$('#time').text(endTime);
		timer = setTimeout(Template.activity1.updateTime, 100);
	}
}

Template.activity1.activityFinished = function() {
	if (!isPractice){
		timer = null;
		var stopTime = new Date().getTime();
		endTime = (stopTime-startTime)/1000.0;
		Score.update({'_id':scoreId},{$set:{time:endTime}});
		$('#time').text(endTime);
	}
	$("#activityFinish").modal('show');
}

function initActivity() {
	if (isPractice){
		viewManager.edgeToSelect(activity.objectId, activity.difficulty, 'perspective');
		var result = activity.checkSolution(viewManager.views)
		updateFeedback(result);
	}
	else{
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
}

function createNextActivityHandler() {
	$("#nextActivityButton").on('click', function() {
		console.log('next activity')
		newDiff = Math.min(activity.difficulty + 1, Config.Activity1.MAX_DIFFICULTY);
		newChallenge(newDiff);
	});
}

function createNewChallengeHandler() {
	$('#newChallenge').on('click', function () {
		var count = 0;
		var id = null;
		for (var i in markersDetector.activeMarkers){
			id = i;
			count++;
		}
		if(count == 1) {
			activity.objectId = id;
			newChallenge(activity.difficulty);
		}
	});	
}

function newChallenge(difficulty) {
	activity.difficulty = difficulty;
	$('#difficulty'+((difficulty+1)%3 || 3)).removeClass("btn-primary");
	$('#difficulty'+((difficulty+2)%3 || 3)).removeClass("btn-primary");
	$('#difficulty' + difficulty).addClass("btn-primary");

	initActivity();
}
	
	

function createDifficultyHandler() {
	$('button[id^="difficulty"]').on('click', function(){
		var that = this;
		var level = $(this).attr('id')[$(this).attr('id').length-1];

		var count = 0;
		var id = null;
		for (var i in markersDetector.activeMarkers){
			id = i;
			count++
		}
		if(count == 1){
			if (!$(that).hasClass('btn-primary')){
				activity.objectId = id;
				newChallenge(level);
			}
		}
		console.log('updating diff')
		activity.update(markersDetector);	
	});
}

function onDocumentMouseDown( event ) {
	if (event.which == 1){
		var clickedView = viewManager.findClickedView(event);
		if(clickedView !== undefined){
			console.log(activity.objectId)
			clickedView.selectEdge(event);
			var correction = activity.checkSolution(viewManager.views);
			updateFeedback(correction);
			viewManager.showHelpOnSelect(event);
			activity.update(markersDetector)
		}
	}
};

function updateFeedback(correction){
	for (var i in correction[0]){
		if (i == 'top'){
			$('#'+i+'Correct').text(correction[0][i]+correction[2]+"/"+activity.difficulty);
			if (correction[1][i] > 0){
				$('#'+i+'Error').text(', '+correction[1][i]+' '+lang.Errors);
			}
			else{
				$('#'+i+'Error').text('');
			}
			if (correction[0][i] == activity.difficulty-correction[2] && correction[1][i] == 0){
				$('#'+i+'Correct').parent().removeClass('btn-danger').addClass('btn-success');
				$('#'+i+'Error').append('<i class="icon-ok icon-white"></i>');
			}
			else{
				$('#'+i+'Correct').parent().removeClass('btn-success').addClass('btn-danger');
			}
		}
		else{
			$('#'+i+'Correct').text(correction[0][i]+"/"+activity.difficulty);
			if (correction[1][i] > 0){
				$('#'+i+'Error').text(', '+correction[1][i]+' '+lang.Errors);
			}
			else{
				$('#'+i+'Error').text('');
			}
			if (correction[0][i] == activity.difficulty && correction[1][i] == 0){
				$('#'+i+'Correct').parent().removeClass('btn-danger').addClass('btn-success');
				$('#'+i+'Error').append('<i class="icon-ok icon-white"></i>');
			}
			else{
				$('#'+i+'Correct').parent().removeClass('btn-success').addClass('btn-danger');
			}
		}
	}
}

Template.activity1.startActivity = function(markerId){
	viewManager.edgeToSelect(markerId, activity.difficulty, 'perspective');
	startTime = new Date().getTime();
	scoreId = Score.insert({time:null, activity:"activity1", userId:Meteor.userId(), date: new Date(), difficulty: activity.difficulty, shape: markerId});
	timerStarted = true;
	timer = setTimeout(Template.activity1.updateTime, 100);
	activity.update(markersDetector);
}

Template.activity1.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
	startTime = null;
	stopTime = null;
	scoreId = null;
	timer = null;
	activity.isFinished = false;
}