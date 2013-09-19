var rendered = false;
var animationId = null;

Template.evaluationActivity2.lang = function(e){
  return Session.get('lang');
}

Template.activity2Difficulty.lang = function(e){
  return Session.get('lang');
}

Template.activity2Ready.lang = function(e){
  return Session.get('lang');
}

var views = new Views();
var markersDetector;
var isNotJittering = false;
var startTime = null;
var stopTime = null;
var scoreId = null;
var shapes = null;

Template.evaluationActivity2.animate = function() {

	animationId = requestAnimationFrame( Template.evaluationActivity2.animate );

    markersDetector.getMarkers();

    if (startTime == null && markersDetector.stream != null){
		startTime = new Date().getTime();
		scoreId = Score.insert({
			time:null, 
			activity:"activity2", 
			userId:Meteor.userId(), 
			date: new Date(), 
			difficulty: Session.get('activity2Level'),
			shapes: shapes[1]
		});
    }
	
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
	
	if (startTime != null){

	    isNotJittering = markersDetector.notJittering();
	    views.setIsNotJittering(isNotJittering);
		views.render(markersDetector.activeMarkers);

		if (stopTime == null){
			stopTime = views.checkActivity2Solution(markersDetector.activeMarkers,startTime);
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

	}
};

Template.evaluationActivity2.rendered = function(){
	//To be sure the models of the shapes are loaded
	MODELS = Session.get('shapes');
	if (typeof(MODELS[6]) == "undefined"){
		return;
	}

	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

		markersDetector = new MarkersDetector("cam", "camcanvas");
	    markersDetector.accessCamera();
	    var frontview = new FrontView('face');
	    frontview.setDynamic(false);
		views.addView(frontview);
	    var sideview = new SideView('cote');
	    sideview.setDynamic(false);
		views.addView(sideview);
		views.addView(new TopView('dessus'));
		views.init();
		views.setAxis(false);
		views.activity2Difficulty(Session.get('activity2Level'));
		shapes = views.generateRandomPositions();
		while(shapes[0]){
			shapes = views.generateRandomPositions();
		}
		Template.evaluationActivity2.animate();
	}
}

Template.evaluationActivity2.events({
	'click #transparency-on': function () {
		$('#transparency-off').removeClass('btn-primary');
		$('#transparency-on').addClass('btn-primary');
		views.setTransparency(true);
		views.setChangedLayout(true);
	},

	'click #transparency-off': function () {
		$('#transparency-on').removeClass('btn-primary');
		$('#transparency-off').addClass('btn-primary');
		views.setTransparency(false);
		views.setChangedLayout(true);
	},

	'click #axis-on': function () {
		$('#axis-off').removeClass('btn-primary');
		$('#axis-on').addClass('btn-primary');
		views.setAxis(true);
		views.setChangedLayout(true);
	},

	'click #axis-off': function () {
		$('#axis-on').removeClass('btn-primary');
		$('#axis-off').addClass('btn-primary');
		views.setAxis(false);
		views.setChangedLayout(true);
	},

	'click #feedback-on': function () {
		$('#feedback-off').removeClass('btn-primary');
		$('#feedback-on').addClass('btn-primary');
		$('#feedback').show();
	},

	'click #feedback-off': function () {
		$('#feedback-on').removeClass('btn-primary');
		$('#feedback-off').addClass('btn-primary');
		$('#feedback').hide();
	}
});

Template.evaluationActivity2.destroyed = function(){
	views.destroy();
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
	isNotJittering = false;
	startTime = null;
	stopTime = null;
	scoreId = null;
}

Template.activity2Ready.animate = function(){

	animationId = requestAnimationFrame( Template.activity2Ready.animate );

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
	if (numMarkers != 0){
        $('#objectDetected').parent().addClass('alert alert-error');
		$('#objectDetected').text('');
		$('#objectDetected').append('<i class="icon-remove"></i>');
	}
	else{
        $('#objectDetected').parent().removeClass('alert alert-error');
		$('#objectDetected').text('');
		$('#objectDetected').append('<i class="icon-ok"></i>');
	}
	if (numMarkers == 0 && !$('#cameraMoved').is(":visible") && markersDetector.stream){
		$('#startButton').removeClass("disabled");
	}
	else {
		$('#startButton').addClass("disabled");
	}

}

Template.activity2Difficulty.events({
	'click a[id^="difficulty"]': function(e, tmpl){
		Session.set('activity2Level',e.target.id.split('difficulty')[1]);
		Meteor.Router.to('/activity2/scoring/ready');
	}
});

Template.activity2Ready.events({
	'click #startButton': function(e,tmpl) {
		if (!$('#startButton').hasClass('disabled')){
			Meteor.Router.to('/activity2/scoring');
		}
	}
});

Template.activity2Ready.rendered = function(){
	if(!rendered){
		//prevent to do the initialization twice
		rendered = true;

		markersDetector = new MarkersDetector("cam", "camcanvas");
	    markersDetector.accessCamera();
		Template.activity2Ready.animate();
	}
}

Template.activity2Ready.destroyed = function(){
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}