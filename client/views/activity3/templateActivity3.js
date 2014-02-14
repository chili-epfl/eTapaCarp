var rendered = false;
var animationId = null;

var viewManager;
var markersDetector;
var activity;

// sequence of template for the scoring: difficulty -> ready -> practiceActivity 
// for the practice, we just start the activity right away
Template.activity3.lang = function(){ return Session.get('lang'); }
Template.activity3.isPractice = function(){	return  Session.get('isPractice');}
Template.activity3Difficulty.lang = function(){ return Session.get('lang'); }
Template.activity3Ready.lang = function(){ return Session.get('lang'); }


//-----------
Template.activity3Difficulty.events({
    // 'click a[id^="difficulty"]': function(e, tmpl){
    //     var availableBricks = $.map(Session.get('shapes'), function(a) {return a.id;})
    //     activity = new Activity3();
    //     activity.difficulty = e.target.id.split('difficulty')[1];
    //     Meteor.Router.to('/activity3/scoring/ready');
    // }
});

//-------------

Template.activity3Ready.events({
	'click #startButton': function(e,tmpl) {
		var numMarkers = Utils.dictLength(markersDetector.activeMarkers);
        if (numMarkers == 1 && !CalibStatic.needCalibration) {
        	Meteor.Router.to('/activity2/scoring');
        }
	}
})

Template.activity3Ready.rendered = function(){
	if (!Utils.areModelsLoaded()) { return; }
	
	if (typeof(activity) === "undefined") { // if for some reason the activity difficulty is not defined
		Meteor.Router.to('/activity3/practice/difficulty')
	} else {
		if(!rendered){
			rendered = true;
		
//			activity.isReady(markersDetector);
			activity.setRenderingCallback(activity, activity.updateReadyInfo);
			CalibStatic.setNeedCalibrationCallback(activity, activity.update);
            		
			markersDetector = new MarkersDetector("cam", "camcanvas");		
			markersDetector.setActivity(activity);
			markersDetector.Start();
		}
	}
}

Template.activity3Ready.destroyed = function(){
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}


//--------------
// activity 3 specific code
//-------------
Template.activity3.rendered = function(){

	if (!Utils.areModelsLoaded()) { 
        console.log("Error: the models are not loaded")
        return; 
    }

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;
    	var availableBricks = $.map(Session.get('shapes'), function(a) {return a.id;})
        var bricks = BrickManager.generateRandomPositions(1, availableBricks);
        activity = new Activity3(bricks[Object.keys(bricks)[0]]);
        // console.log("brick " + bricks[Object.keys(bricks)[0]])

        activity.generateMovements(Activity3.Config.numberOfMovements);

        // activity.brickToMatch = bricks[Object.keys(bricks)[0]]
        viewManager = new ViewManager();
        markersDetector = new MarkersDetector("cam", "camcanvas");		
        
		activity.setRenderingCallback(viewManager, viewManager.render);
		activity.template = Template.activity3;
        activity.evaluationMode = !Session.get('isPractice');
        
		markersDetector.setActivity(activity);
		markersDetector.Start();
        
        initActivity();
        viewManager.init()
        
		createNewChallengeHandler(activity);
		createDifficultyHandler(activity);
		createNextActivityHandler(activity);     

		viewManager.render({});		
	}
	
	// TODO put potential graphical initialization here
}

Template.activity3.updateStaticViews = function(brick) {
    var front = viewManager.views['front'];
    var side = viewManager.views['side'];
    var vs = [side, front]
    var bs = [brick, brick.clone()]
    for (i in vs) {
        vs[i].removeStaticBricks();
        vs[i].addStaticBricks([bs[i]]);
        vs[i].setDynamic(false);
    	viewManager.setView(vs[i]);
    }
}

function initActivity() {
    if (Session.get('isPractice')){
        console.log('init activity')
    
        var firstTime = !("side" in viewManager.views); // we only create views the first time 
        var front, side;
        if (!firstTime) {
            front = viewManager.views['front'];
            side = viewManager.views['side'];
            top = viewManager.views['top'];
        } else {
            front = new FrontView('front');
            side = new SideView('side');
            viewManager.addStandardDisplayOptions();
            viewManager.addFeedbackDisplay();
            viewManager.setAxis(true);
            viewManager.setGrid(true);
        }
        var vs = [side, front]
        var brick = activity.brickToMatch;
        var bs = [brick, brick.clone()]
        for (i in vs) {
            vs[i].removeStaticBricks();
            vs[i].addStaticBricks([bs[i]]);
            vs[i].setDynamic(false);
        	viewManager.setView(vs[i]);
        }
        if (!firstTime) {
            front.render({})
            side.render({})
        }
        
        activity.loadNextMovement();
        activity.hasStarted = true
        
        // var result = activity.checkSolution(viewManager.views)
        // activity.template.updateFeedback(result);
    } else {
        // TODO 
        // reinit everything that needs to be for the evaluation mode
    }
    
}


 Template.activity3.activityFinished = function() {
     console.log("finished => load next movement");
     if (!activity.loadNextMovement()) {
          $("#activityFinish").modal('show');
     }
}

Template.activity3.updateFeedback = function(solution) {
	var wClass = "icon-remove";
    var cClass = "icon-ok";

	var changeClasses = function(isCorrect, el) {
		if (isCorrect) {
			el.removeClass(wClass)
			el.addClass(cClass)
		} else {
			el.removeClass(cClass)
			el.addClass(wClass)		    
		}
	}
    // console.log(solution.correctRotation, solution.correctTranslation)
	changeClasses(solution.correctBrick, $("#correctBrick i"));
	changeClasses(solution.correctRotation, $("#correctRotation i"));
	changeClasses(solution.correctTranslation, $("#correctTranslation i"));
}

Template.activity3.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
}

//------------------------
// HANDLERS
//------------------------
function createNextActivityHandler() {
	$("#nextActivityButton").on('click', function() {
		newDiff = Math.min(activity.difficulty + 1, Config.Activity2.MAX_DIFFICULTY);
		newChallenge(newDiff);
	});
}

// TODO this should probably take into account the brick that is active at the moment
function createNewChallengeHandler() {
	$('#newChallenge').on('click', function () {
			newChallenge(activity.difficulty);
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

