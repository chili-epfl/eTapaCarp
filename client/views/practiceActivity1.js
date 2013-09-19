var rendered = false;
var animationId = null;
var lang;

Template.practiceActivity1.lang = function(e){
	lang = Session.get('lang');
	return lang;
}

var views = new Views();
var markersDetector;
var isNotJittering = false;
var click = null; 

function onDocumentMouseDown( event ) {
	if (event.which == 1){
    	click = event;
	}
};

function updateFeedback(){
	var correction = views.checkEdgeSolution();
	for (var i in correction[0]){
		if (i == 'dessus'){
			$('#'+i+'Correct').text(correction[0][i]+correction[2]+"/"+views.views[i].difficulty);
			if (correction[1][i] > 0){
				$('#'+i+'Error').text(', '+correction[1][i]+' '+lang.Errors);
			}
			else{
				$('#'+i+'Error').text('');
			}
			if (correction[0][i] == views.views[i].difficulty-correction[2] && correction[1][i] == 0){
				$('#'+i+'Correct').parent().removeClass('btn-danger').addClass('btn-success');
				$('#'+i+'Error').append('<i class="icon-ok icon-white"></i>');
			}
			else{
				$('#'+i+'Correct').parent().removeClass('btn-success').addClass('btn-danger');
			}
		}
		else{
			$('#'+i+'Correct').text(correction[0][i]+"/"+views.views[i].difficulty);
			if (correction[1][i] > 0){
				$('#'+i+'Error').text(', '+correction[1][i]+' '+lang.Errors);
			}
			else{
				$('#'+i+'Error').text('');
			}
			if (correction[0][i] == views.views[i].difficulty && correction[1][i] == 0){
				$('#'+i+'Correct').parent().removeClass('btn-danger').addClass('btn-success');
				$('#'+i+'Error').append('<i class="icon-ok icon-white"></i>');
			}
			else{
				$('#'+i+'Correct').parent().removeClass('btn-success').addClass('btn-danger');
			}
		}
	}
}

function animate() {

	//id to be able to cancel the animation later
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
            markersDetector.drawCorners(markersDetector.markers,markersDetector.calibrationContext);
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
	click = null;

};

Template.practiceActivity1.rendered = function(){
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
		animate();

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

		$('#feedback-on').on('click', function () {
			$('#feedback-off').removeClass('btn-primary');
			$('#feedback-on').addClass('btn-primary');
			$('span[id$=Correct]').parent().show();
		});

		$('#feedback-off').on('click', function () {
			$('#feedback-on').removeClass('btn-primary');
			$('#feedback-off').addClass('btn-primary');
			$('span[id$=Correct]').parent().hide();
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

Template.practiceActivity1.destroyed = function(){
	views.destroy();
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}