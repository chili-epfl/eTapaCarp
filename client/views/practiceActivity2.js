var rendered = false;
var animationId = null;

Template.practiceActivity2.lang = function(e){
  return Session.get('lang');
}

var views = new Views();
var markersDetector;
var isNotJittering = false;

function animate() {

	animationId = requestAnimationFrame( animate );

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
    isNotJittering = markersDetector.notJittering();
    views.setIsNotJittering(isNotJittering);
	views.render(markersDetector.activeMarkers);
	views.updateActivity2Feedback(markersDetector.activeMarkers);

};

Template.practiceActivity2.rendered = function(){
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
		var shapes = views.generateRandomPositions();
		while (shapes[0]){
			shapes = views.generateRandomPositions();
		}
		$("tr[id^='rowShape']").hide();
		for (var i in shapes[1]){
			$('#rowShape'+shapes[1][i]).show();
		}
		animate();
	}
}

Template.practiceActivity2.events({

	'click #transparency-on': function (e, tmpl) {
		$('#transparency-off').removeClass('btn-primary');
		$('#transparency-on').addClass('btn-primary');
		views.setTransparency(true);
		views.setChangedLayout(true);
	},

	'click #transparency-off': function (e,tmpl) {
		$('#transparency-on').removeClass('btn-primary');
		$('#transparency-off').addClass('btn-primary');
		views.setTransparency(false);
		views.setChangedLayout(true);
	},

	'click #axis-on': function (e,tmpl) {
		$('#axis-off').removeClass('btn-primary');
		$('#axis-on').addClass('btn-primary');
		views.setAxis(true);
		views.setChangedLayout(true);
	},

	'click #axis-off': function (e,tmpl) {
		$('#axis-on').removeClass('btn-primary');
		$('#axis-off').addClass('btn-primary');
		views.setAxis(false);
		views.setChangedLayout(true);
	},
	'click #feedback-on': function(e, tmpl){
		$('#feedback-off').removeClass('btn-primary');
		$('#feedback-on').addClass('btn-primary');
		$('#feedback').show();
	},
	'click #feedback-off': function(e, tmpl){
		$('#feedback-on').removeClass('btn-primary');
		$('#feedback-off').addClass('btn-primary');
		$('#feedback').hide();
	},

	'click #newChallenge': function(e, tmpl){
		$('#loader').show("fast",function(){
			var shapes = views.generateRandomPositions();
			while (shapes[0]){
				shapes = views.generateRandomPositions();
			}
			$("tr[id^='rowShape']").hide();
			for (var i in shapes[1]){
				$('#rowShape'+shapes[1][i]).show();
			}
			$('#loader').hide();
			views.updateActivity2Feedback(markersDetector.activeMarkers);
		});
	},
	'click button[id^="difficulty"]': function(e, tmpl){
		var that = this;
		var level = $(e.target).attr('id')[$(e.target).attr('id').length-1];
		if (!$(that).hasClass('btn-primary')){
			$('#loader').show("fast",function(){
				views.activity2Difficulty(level);
				var shapes = views.generateRandomPositions();
				while (shapes[0]){
					shapes = views.generateRandomPositions();
				}
				$("tr[id^='rowShape']").hide();
				for (var i in shapes[1]){
					$('#rowShape'+shapes[1][i]).show();
				}
				$('button[id^="difficulty"').removeClass("btn-primary");
				$(e.target).addClass("btn-primary");
				$('#loader').hide();
			});
		}
	}
});

Template.practiceActivity2.destroyed = function(){
	views.destroy();
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}