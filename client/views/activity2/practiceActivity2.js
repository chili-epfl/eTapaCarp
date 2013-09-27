var rendered = false;
var animationId = null;

Template.practiceActivity2.lang = function(e){
  return Session.get('lang');
}

var viewManager = new ViewManager();
var markersDetector;
var isNotJittering = false;

Template.practiceActivity2.rendered = function(){
	//To be sure the models of the shapes are loaded
	if (!Utils.areModelsLoaded()) { return; }

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;
		
		activity = new Activity2();
		activity.setRenderingCallback(viewManager, viewManager.render);
		activity.template = Template.practiceActivity1;

	    markersDetector = new MarkersDetector("cam", "camcanvas");		
		markersDetector.setActivity(activity);
		markersDetector.Start();
		
		var availableBricks = $.map(Session.get('shapes'), function(a) {return a.id;})
		var bricks = BrickManager.generateRandomPositions(1, availableBricks);
		activity.bricksToMatch = bricks;
		var clonedBricks = Brick.cloneBricks(bricks);
		$("tr[id^='rowShape']").hide();
		for (var i in bricks){
			$('#rowShape'+i).show();
		}
		
		var front = new FrontView('front');
		var side = new SideView('side');
		front.addStaticBricks(bricks);
		side.addStaticBricks(clonedBricks);
		front.setDynamic(false);
		side.setDynamic(false);

		viewManager.addView(front);
		viewManager.addView(side);
		viewManager.addView(new TopView('top'));
		viewManager.setAxis(false);
		viewManager.setGrid(true);
		viewManager.init()
		viewManager.addStandardDisplayOptions();
		viewManager.addFeedbackDisplay();
		
		viewManager.setAxis(false);
		
		viewManager.render({});
	}
}

Template.practiceActivity2.activityFinished = function() {
	$("#activityFinish").modal('show');
}

function initActivity() {
	var front = viewManager.views['front'];
	var side = viewManager.views['side'];
	front.removeStaticBricks();
	side.removeStaticBricks();
	var availableBricks = $.map(Session.get('shapes'), function(a) {return a.id;})
	var bricks = BrickManager.generateRandomPositions(activity.difficulty, availableBricks);
	activity.bricksToMatch = bricks;
	var clonedBricks = Brick.cloneBricks(bricks);
	front.addStaticBricks(bricks);
	side.addStaticBricks(clonedBricks);
	activity.update(markersDetector);
	$("tr[id^='rowShape']").hide();
	for (var i in bricks){
		$('#rowShape'+i).show();
	}
}

function newChallenge(difficulty) {
	activity.difficulty = difficulty;
	$('#difficulty'+((difficulty+1)%3 || 3)).removeClass("btn-primary");
	$('#difficulty'+((difficulty+2)%3 || 3)).removeClass("btn-primary");
	$('#difficulty' + difficulty).addClass("btn-primary");

	initActivity();
}

Template.practiceActivity2.events({

	'click #newChallenge': function(e, tmpl){
		$('#loader').show("fast",function(){
			initActivity()
			$('#loader').hide();
		});
	},
	'click button[id^="difficulty"]': function(e, tmpl){
		var that = this;
		var level = $(e.target).attr('id')[$(e.target).attr('id').length-1];
		if (!$(that).hasClass('btn-primary')){
			$('#loader').show("fast",function(){
				activity.difficulty = level;
				initActivity();
				$('button[id^="difficulty"').removeClass("btn-primary");
				$('#difficulty'+level).addClass("btn-primary");
				$('#loader').hide();
			});
		}
	},

	'click #nextActivityButton': function(e, tmpl) {
		var newDiff = Math.min(activity.difficulty + 1, Config.Activity1.MAX_DIFFICULTY);
		newChallenge(newDiff);
	}

});

Template.practiceActivity2.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
}