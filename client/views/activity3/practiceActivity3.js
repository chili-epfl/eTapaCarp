var rendered = false;
var animationId = null;

Template.practiceActivity3.lang = function(e){
  return Session.get('lang');
}

var viewManager = new ViewManager();
var markersDetector;
var activity;

Template.practiceActivity3.rendered = function(){

	if (!Utils.areModelsLoaded) { return; }

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

		var availableBricks = $.map(Session.get('shapes'), function(a) {return a.id;})
		var bricks = BrickManager.generateRandomPositions(1, availableBricks);
		var clonedBricks = Brick.cloneBricks(bricks)

		activity = new Activity3();
		activity.setRenderingCallback(viewManager, viewManager.render);
		activity.generateMovements(4);
		activity.template = Template.practiceActivity3;
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

Template.practiceActivity1.activityFinished = function() {
	$("#activityFinish").modal('show');
}

Template.practiceActivity3.updateFeedback = function(solution) {
	var correctHTML = '<i class="icon-ok"></i>';
	var wrongHTML = '<i class="icon-remove"></i>'

	if (solution.correctBrick) {
		$("#correctBrick i").removeClass("icon-remove");
		$("#correctBrick i").addClass("icon-ok");
	}

	
//		$("#feedback tbody tr").children()
	
}


Template.practiceActivity3.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
}
