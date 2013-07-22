var shapesHandle = Meteor.subscribe('shapes');
var Shapes = new Meteor.Collection('shapes');

var rendered = false;

Deps.autorun(function() {
  var data, shapesData;
  shapesData = {};
  data = Shapes.find({});
  data.forEach(function(entry) {
    return shapesData[entry.id] = entry;
  });
  Session.set('shapes', shapesData);
  return null;
});

Template.activity.lang = function(e){
  return Session.get('lang');
}

$(document).ready(function(){

	var views = new Views();
	var markerDetector;
	var markers_before = [];
	var isJittering = false;
	var click = null; 

	function onDocumentMouseDown( event ) {
	    event.preventDefault();
	    click = event;
	};

	function animate() {

		requestAnimationFrame( animate );

	    markersDetector.getMarkers();
		
		if ($('#myModal').hasClass('in')){
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
		
		views.setClick(click);
		views.render(markersDetector.markers);
		click = null;

	};

	
	MODELS = Session.get('shapes');
    markersDetector = new MarkersDetector("cam", "camcanvas");
    markersDetector.accessCamera();
	views.addView(new FrontView('face'));
	views.addView(new SideView('cote'));
	views.addView(new TopView('dessus'));
	views.addView(new PerspectiveView('perspective'));
	views.init()
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
});