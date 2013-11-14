var rendered = false;
var animationId = null;
var lang;
var viewManager;// = new ViewManager();
var markersDetector;
var activity;

Template.activity2.lang = function(e){
	lang = Session.get('lang');
	return lang;
}

Template.activity2.isPractice = function(){
	isPractice = Session.get('isPractice');
	return isPractice;
}

Template.activity2Difficulty.lang = function(){
	lang = Session.get('lang');
	return lang;
}

Template.activity2Ready.lang = function(){
	lang = Session.get('lang');
	return lang;
}

Template.activity2Difficulty.events({
	'click a[id^="difficulty"]': function(e, tmpl){
		activity = new activity2();
		activity.difficulty = e.target.id.split('difficulty')[1];
		Meteor.Router.to('/activity2/scoring/ready'); 
	}
});

Template.activity2Ready.events({
	'click #startButton': function(e,tmpl) {
		var numMarkers = 0;
		for (var i in markersDetector.activeMarkers)
			numMarkers++;
		if (numMarkers == 1 && !CalibStatic.needCalibration) {
			// activity.lastActiveMarkers = null;
			Meteor.Router.to('/activity2/scoring');
		}
	}
})

Template.activity2Ready.rendered = function(){

	if (!Utils.areModelsLoaded()) { return; }

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;
		// console.log(activity)
		activity.setRenderingCallback(activity, activity.updateReadyInfo);
		CalibStatic.setNeedCalibrationCallback(activity, activity.update);

	    markersDetector = new MarkersDetector("cam", "camcanvas");		
		markersDetector.setActivity(activity);
		markersDetector.Start();
	}
}

Template.activity2Ready.destroyed = function(){
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}



//--------------
// activity 2 specific code
//-------------
Template.activity2.rendered = function(){

	if (!Utils.areModelsLoaded()) { 
        console.log("Error: the models are not loaded")
        return; 
    }
    
	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;
		
        viewManager = new ViewManager();
	    markersDetector = new MarkersDetector("cam", "camcanvas");		
        activity = new Activity2();
		
        activity.setRenderingCallback(viewManager, viewManager.render);
		activity.template = Template.activity2;
		activity.evaluationMode = !Session.get('isPractice');

		markersDetector.setActivity(activity);
		markersDetector.Start();
		
        initActivity();
        viewManager.init()
        
		createNewChallengeHandler();
		createDifficultyHandler();
		createNextActivityHandler();
		
		viewManager.render({});
	}
	$("#difficulty" + activity.difficulty).addClass("btn-primary");
}

Template.activity2.updateTime = function(){
	if (timer){
		var endTime = (new Date().getTime()-startTime)/1000.0;
		$('#time').text(endTime);
		timer = setTimeout(Template.activity2.updateTime, 100);
	}
}

Template.activity2.activityFinished = function() {
	if (!Session.get('isPractice')){
		timer = null;
		var stopTime = new Date().getTime();
		endTime = (stopTime-startTime)/1000.0;
        //TODO update database here once it is setup
//		Score.update({'_id':scoreId},{$set:{time:endTime}});
		$('#time').text(endTime);
	}
	$("#activityFinish").modal('show');
}

function initActivity() {
    console.log("init activity " + Session.get('isPractice'))    
    
	if (Session.get('isPractice')){
    	var availableBricks = $.map(Session.get('shapes'), function(a) {return a.id;})
    	var bricks = BrickManager.generateRandomPositions(1, availableBricks);
    	activity.bricksToMatch = bricks;
    	var clonedBricks = Brick.cloneBricks(bricks);
    	$("tr[id^='rowShape']").hide();
    	for (var i in bricks){
    		$('#rowShape'+i).show();
    	}

        var firstTime = !("side" in viewManager.views); // we only create views the first time 
        var front, side;
        if (!firstTime) {
            front = viewManager.views['front'];
            side = viewManager.views['side'];
            top = viewManager.views['top'];
        } else  {
            front = new FrontView('front');
            side = new SideView('side');
            viewManager.setView(new TopView('top'));
            viewManager.setAxis(false);
            viewManager.setGrid(true);
            viewManager.addStandardDisplayOptions();
            viewManager.addFeedbackDisplay();
            viewManager.setAxis(false);
        }
        vs = [side, front]
        bs = [bricks, clonedBricks]
        for (i in vs) {
            vs[i].removeStaticBricks();
            vs[i].addStaticBricks(bs[i]);
            vs[i].setDynamic(false);
        	viewManager.setView(vs[i]);
        }
        if (!firstTime) {
            front.render({})
            side.render({})
        }
        
        var result = activity.checkSolution(viewManager.views)
        updateFeedback(result);
	}
	else {
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
		newDiff = Math.min(activity.difficulty + 1, Config.Activity2.MAX_DIFFICULTY);
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
        // if(count == 1) {
//			activity.objectId = id;
			newChallenge(activity.difficulty);
        // } else {
            // console.log("need one object to create a challenge"); // TODO put that as error
        // }
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
		activity.update(markersDetector);	
	});
}



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

Template.activity2.startActivity = function(markerId) {
	viewManager.selectEdgesRandomly(markerId, activity.difficulty, 'perspective');
	startTime = new Date().getTime();
	scoreId = Score.insert({time:null, activity:"activity2", userId:Meteor.userId(), date: new Date(), difficulty: activity.difficulty, shape: markerId});
	timerStarted = true;
	timer = setTimeout(Template.activity2.updateTime, 1000);
	activity.update(markersDetector);
}

Template.activity2.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
	startTime = null;
	stopTime = null;
	scoreId = null;
	timer = null;
	activity.isFinished = false;
}
