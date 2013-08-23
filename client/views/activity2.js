var rendered = false;
var animationId = null;

Template.activity2.lang = function(e){
  return Session.get('lang');
}

var views = new Views();
var markersDetector;
var isNotJittering = false;
var click = null; 

function onDocumentMouseDown( event ) {
    event.preventDefault();
    click = event;
};

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
	
	views.setClick(click);
	views.render(markersDetector.activeMarkers);
	views.checkSolution(markersDetector.activeMarkers);
	click = null;

};

Template.activity2.rendered = function(){
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
		views.generateRandomPositions();
	    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	    document.addEventListener( 'contextmenu', onDocumentMouseDown, false );
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
			$('#feedback').show();
		});

		$('#feedback-off').on('click', function () {
			$('#feedback-on').removeClass('btn-primary');
			$('#feedback-off').addClass('btn-primary');
			$('#feedback').hide();
		});

		$('button[id^="difficulty"]').on('click', function(){
			var that = this;
			var level = $(this).attr('id')[$(this).attr('id').length-1];
			if (!$(that).hasClass('btn-primary')){
				$('#loader').show("fast",function(){
					views.modelMatchingDifficulty(level);
					$('#difficulty'+(((level+1)%3+1))).removeClass("btn-primary");
					$('#difficulty'+(((level+2)%3+1))).removeClass("btn-primary");
					$(that).addClass("btn-primary");
					if (level == 1){
						$('#rowShape20').hide();
						$('#rowShape64').hide();
					}
					else if (level == 2){
						$('#rowShape20').show();
						$('#rowShape64').hide();
					}
					else{
						$('#rowShape20').show();
						$('#rowShape64').show();
					}
					$('#loader').hide();
				});
			}	
		});


		$('#newChallenge').on('click', function(){
			$('#loader').show("fast",function(){
				views.generateRandomPositions();
				$('#loader').hide();
			});
		});
	}
}

Template.activity2.destroyed = function(){
	views.destroy();
	markersDetector.stopCamera();
	cancelAnimationFrame(animationId);
	rendered = false;
}