var rendered = false;
var animationId = null;

var viewManager = new ViewManager();
var markersDetector;
var activity;

// sequence of template is: difficulty -> ready -> practiceActivity

Template.activity3Difficulty.lang = function(){ return Session.get('lang'); }
Template.activity3Ready.lang = function(){ return Session.get('lang'); }
Template.practiceActivity3.lang = function(){ return Session.get('lang'); }


//-----------
Template.activity3Difficulty.events({
	'click a[id^="difficulty"]': function(e, tmpl){
		activity = new Activity3();
		activity.difficulty = e.target.id.split('difficulty')[1];
		Meteor.Router.to('/activity3/practice/ready');
	}
});

//-------------

Template.activity3Ready.events({
	'click #startButton': function(e,tmpl) {
		if (activity.hasStarted) {
			Meteor.Router.to('/activity3/practice');
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
		
			markersDetector = new MarkersDetector("cam", "camcanvas");		
			markersDetector.setActivity(activity);
			markersDetector.Start();
		
			activity.isReady(markersDetector);
			activity.setRenderingCallback(activity, activity.updateReadyInfo);
			CalibStatic.setNeedCalibrationCallback(activity, activity.update);		
		}
	}
}

Template.activity3Ready.destroyed = function(){
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}


//------------
Template.practiceActivity3.rendered = function(){

	if (!Utils.areModelsLoaded) { return; }

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

		var availableBricks = $.map(Session.get('shapes'), function(a) {return a.id;})
		var bricks = BrickManager.generateRandomPositions(1, availableBricks);
		var clonedBricks = Brick.cloneBricks(bricks)
		
		//TODO get the bricks from the activity

//		activity = new Activity3();
		activity.setRenderingCallback(viewManager, viewManager.render);
		activity.generateMovements(4);
		activity.template = Template.practiceActivity3;
		activity.hasStarted = true;
		activity.brickToMatch = bricks[Object.keys(bricks)[0]]
		console.log(activity.brickToMatch);
		
		var front = new FrontView('front');
		var side = new SideView('side');
		front.addStaticBricks(bricks);
		side.addStaticBricks(clonedBricks);

		viewManager.addView(front);
		viewManager.addView(side);
		viewManager.init()
		viewManager.addStandardDisplayOptions();
		viewManager.addFeedbackDisplay();
		viewManager.setAxis(true);
		
	    markersDetector = new MarkersDetector("cam", "camcanvas");		
		markersDetector.setActivity(activity);
		markersDetector.Start();
		
		// TODO create handlers for the UI events
		
		viewManager.render({});		
	}
	
	// TODO put potential graphical initialization here
}


// Template.practiceActivity1.activityFinished = function() {
// 	$("#activityFinish").modal('show');
// }

Template.practiceActivity3.updateFeedback = function(solution) {
	var wClass = "icon-remove";
    var cClass = "icon-ok";

	var changeClasses = function(isCorrect, el) {
		if (isCorrect) {
			el.removeClass(wClass)
			el.addClass(cClass)
		}
	}
	
	console.log(solution)
	
	changeClasses(solution.correctBrick, $("#correctBrick i"));
	changeClasses(solution.correctRotation, $("#correctRotation i"));
	changeClasses(solution.correctTranslation, $("#correctTranslation i"));
}

Template.practiceActivity3.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
}



