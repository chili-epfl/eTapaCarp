var rendered = false;
var animationId = null;
var lang;

Template.practiceActivity1.lang = function(e){
	lang = Session.get('lang');
	return lang;
}

var viewManager = new ViewManager();
var markersDetector;
var activity;

Template.practiceActivity1.rendered = function(){

	if (!Utils.areModelsLoaded()) { return; }
	
	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;
		
		activity = new Activity1();
		activity.setRenderingCallback(viewManager, viewManager.render);
		activity.template = Template.practiceActivity1;

	    markersDetector = new MarkersDetector("cam", "camcanvas");		
		markersDetector.setActivity(activity);
		markersDetector.Start();
		
		viewManager.addView(new FrontView('front'));
		viewManager.addView(new SideView('side'));
		viewManager.addView(new TopView('top'));
		viewManager.addView(new PerspectiveView('perspective'));
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

Template.practiceActivity1.activityFinished = function() {
	$("#activityFinish").modal('show');
}

function initActivity() {
	viewManager.edgeToSelect(activity.objectId, activity.difficulty, 'perspective');
	var result = activity.checkSolution(viewManager.views)
	updateFeedback(result);
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

Template.practiceActivity1.destroyed = function(){
	viewManager.destroy();
	markersDetector.stopTagDetection();
	rendered = false;
}
