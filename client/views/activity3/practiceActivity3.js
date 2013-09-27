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

		activity = new Activity3();
		activity.setRenderingCallback(viewManager, viewManager.render);
		activity.generateMovements(4);
		activity.template = Template.practiceActivity3;

		var availableBricks = $.map(Session.get('shapes'), function(a) {return a.id;})
		var bricks = BrickManager.generateRandomPositions(1, availableBricks);
		var clonedBricks = Brick.cloneBricks(bricks)
		
		var front = new FrontView('front');
		var side = new SideView('side');
		front.addStaticBricks(bricks);
		side.addStaticBricks(clonedBricks);
		
	    markersDetector = new MarkersDetector("cam", "camcanvas");		
		markersDetector.setActivity(activity);
		markersDetector.Start();
		
		viewManager.addView(front);
		viewManager.addView(side);
		viewManager.init()
		viewManager.addStandardDisplayOptions();
		viewManager.addFeedbackDisplay();
		viewManager.setAxis(true);
		
		
		// TODO create handlers for the UI events
		
		viewManager.render({});		
	}
	
	// TODO put potential graphical initialization here
}

Template.practiceActivity1.activityFinished = function() {
	$("#activityFinish").modal('show');
}


Template.practiceActivity3.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
}
