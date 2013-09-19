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

var views = new Views();
var markersDetector;
var isNotJittering = false;
var click = null;
var startTime = null;
var stopTime = null;
var scoreId = null;
var objectDetectedOnce = 0;

function onDocumentMouseDown( event ) {
	if (event.which == 1){
    	click = event;
	}
};

function updateFeedback(){
	var correct = true;
	var correction = views.checkEdgeSolution();
	for (var i in correction[0]){
		if (i == 'dessus'){
			if (correction[0][i] != views.views[i].difficulty-correction[2] || correction[1][i] != 0){
				correct = false;
			}
		}
		else{
			if (correction[0][i] != views.views[i].difficulty || correction[1][i] != 0){
				correct = false;
			}
		}
	}
	if (typeof(i) == "undefined"){
		correct = false;
	}
	return correct;
}

var objectDetectedOnce = 0;

Template.evaluationActivity1.animate = function() {

	//id to be able to cancel the animation later
	animationId = requestAnimationFrame( Template.evaluationActivity1.animate );

    markersDetector.getMarkers();
	
	if ($('#calibration').hasClass('in')){
		markersDetector.changeStatus();
		markersDetector.calibrationContext.drawImage(markersDetector.video, 0, 0, markersDetector.calibrationCanvas.width, markersDetector.calibrationCanvas.height);
		if (markersDetector.corners){
			if (localStorage.getItem('rotationMatrix') &&
					localStorage.getItem('translationMatrix') &&
					localStorage.getItem('intrinsicMatrix')){
                markersDetector.drawContour([[-180,-140,0],[-180,140,0],[180,140,0],[180,-140,0]],markersDetector.calibrationContext,"blue");
                markersDetector.drawContour([[-180,-140,60],[-180,140,60],[180,140,60],[180,-140,60]],markersDetector.calibrationContext,"red");
			}
            markersDetector.drawCorners(markersDetector.corners,markersDetector.calibrationContext);
		}
	}

	if (objectDetectedOnce < 2){
		var count = 0;
		for (var i in markersDetector.activeMarkers){
			count++;
		}
		if (count == 1){
			objectDetectedOnce++;
			if(objectDetectedOnce == 2){
				views.edgeToSelect(i,'perspective');
				startTime = new Date().getTime();
				scoreId = Score.insert({time:null, activity:"activity1", userId:Meteor.userId(), date: new Date(), difficulty: Session.get('activity1Level'), shape: i});
			}
		}
	}

    isNotJittering = markersDetector.notJittering();
    views.setIsNotJittering(isNotJittering);
	
	views.setClick(click);
	views.render(markersDetector.activeMarkers);
	if (click){
		updateFeedback();
		views.showHelpOnSelect(click);
	}

	if (stopTime == null && startTime){
		if (updateFeedback()){
			stopTime = new Date().getTime();
		}
		var endTime;
		if (stopTime){
			endTime = (stopTime-startTime)/1000.0;
			Score.update({'_id':scoreId},{$set:{time:endTime}});
		}
		else{
			endTime = (new Date().getTime()-startTime)/1000.0;
		}
		$('#time').text(endTime);
	}
	click = null;

};

Template.evaluationActivity1.rendered = function(){
	//To be sure the models of the shapes are loaded
	MODELS = Session.get('shapes');
	if (MODELS == {}){
		return;
	}

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

	    markersDetector = new MarkersDetector("cam", "camcanvas");
	    markersDetector.accessCamera();
		views.addView(new FrontView('face'));
		views.addView(new SideView('cote'));
		views.addView(new TopView('dessus'));
		views.addView(new PerspectiveView('perspective'));
		views.init()
	    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		$(document).keyup(function(e) {
			if (e.keyCode == 27){
				views.clearChoiceEdges();
			}
		});
		views.edgeSelectionDifficulty(Session.get('activity1Level'));
		Template.evaluationActivity1.animate();

		$('#transparency-on').on('click', function () {
			$('#transparency-off').removeClass('btn-primary');
			$('#transparency-on').addClass('btn-primary');
			views.setTransparency(true);
			views.setChangedLayout(true);
		});

		$('#transparency-off').on('click', function () {
			$('#transparency-on').removeClass('btn-primary');
			$('#transparency-off').addClass('btn-primary');
			views.setTransparency(false);
			views.setChangedLayout(true);
		});

		$('#axis-on').on('click', function () {
			$('#axis-off').removeClass('btn-primary');
			$('#axis-on').addClass('btn-primary');
			views.setAxis(true);
			views.setChangedLayout(true);
		});

		$('#axis-off').on('click', function () {
			$('#axis-on').removeClass('btn-primary');
			$('#axis-off').addClass('btn-primary');
			views.setAxis(false);
			views.setChangedLayout(true);
		});

		$('#selectEdge').on('click', function () {
			var count = 0;
			var id = null;
			for (var i in markersDetector.activeMarkers){
				id = i;
				count++;
			}
			if(count == 1){
				views.edgeToSelect(id,'perspective');
				updateFeedback();
			}
		});
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
					views.edgeSelectionDifficulty(level);
					$('#difficulty'+((level+1)%3 || 3)).removeClass("btn-primary");
					$('#difficulty'+((level+2)%3 || 3)).removeClass("btn-primary");
					$(that).addClass("btn-primary");

					views.edgeToSelect(id,'perspective');
					updateFeedback();
				}
			}	
		});
	}
}

Template.evaluationActivity1.destroyed = function(){
	views.destroy();
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
	isNotJittering = false;
	click = null;
	startTime = null;
	stopTime = null;
	scoreId = null;
	objectDetectedOnce = 0;
}

Template.activity1Ready.animate = function(){

	animationId = requestAnimationFrame( Template.activity1Ready.animate );

    markersDetector.getMarkers();
	
	if ($('#calibration').hasClass('in')){
		markersDetector.changeStatus();
		markersDetector.calibrationContext.drawImage(markersDetector.video, 0, 0, markersDetector.calibrationCanvas.width, markersDetector.calibrationCanvas.height);
		if (markersDetector.corners){
			if (localStorage.getItem('rotationMatrix') &&
					localStorage.getItem('translationMatrix') &&
					localStorage.getItem('intrinsicMatrix')){
                markersDetector.drawContour([[-180,-140,0],[-180,140,0],[180,140,0],[180,-140,0]],markersDetector.calibrationContext,"blue");
                markersDetector.drawContour([[-180,-140,60],[-180,140,60],[180,140,60],[180,-140,60]],markersDetector.calibrationContext,"red");
			}
            markersDetector.drawCorners(markersDetector.corners,markersDetector.calibrationContext);
		}
	}
	if ($('#cameraMoved').is(":visible")){
        $('#calibrated').parent().addClass('alert alert-error');
		$('#calibrated').text('');
		$('#calibrated').append('<i class="icon-remove"></i>');
	}
	else{
        $('#calibrated').parent().removeClass('alert alert-error');
		$('#calibrated').text('');
		$('#calibrated').append('<i class="icon-ok"></i>');
	}
	var numMarkers = 0;
	for (var i in markersDetector.activeMarkers){
		numMarkers++;
	}
	if (numMarkers != 1){
        $('#objectDetected').parent().addClass('alert alert-error');
		$('#objectDetected').text('');
		$('#objectDetected').append('<i class="icon-remove"></i>');
	}
	else{
        $('#objectDetected').parent().removeClass('alert alert-error');
		$('#objectDetected').text('');
		$('#objectDetected').append('<img class="rowShape" src="/shape'+i+'.png"></img>');
	}
	if (numMarkers == 1 && !$('#cameraMoved').is(":visible")){
		$('#startButton').removeClass("disabled");
	}
	else {
		$('#startButton').addClass("disabled");
	}

}

Template.activity1Difficulty.events({
	'click a[id^="difficulty"]': function(e, tmpl){
		Session.set('activity1Level',e.target.id.split('difficulty')[1]);
		Meteor.Router.to('/activity1/scoring/ready');
	}
});

Template.activity1Ready.events({
	'click #startButton': function(e,tmpl) {
		if (!$('#startButton').hasClass('disabled')){
			Meteor.Router.to('/activity1/scoring');
		}
	}
})

Template.activity1Ready.rendered = function(){
	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

		markersDetector = new MarkersDetector("cam", "camcanvas");
	    markersDetector.accessCamera();
		Template.activity1Ready.animate();
	}
}

Template.activity1Ready.destroyed = function(){
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}