Template.importObject.lang = function(e){
	return Session.get('lang');
}


var model = {coordinates:[], edges:[], faces:[], marker:[]};
var view;
var rendered = false;
var controls;
var changeView = false;

Template.importObject.render = function(){
	view.render([]);
	view.renderTempObject(model, false);
}

Template.importObject.cameraMoved = function(){
	view.renderer.render(view.scene, view.camera)
}

Template.importObject.rendered = function(){
	if (!rendered){
		rendered = true;
		view = new PerspectiveView('perspective');
		view.init();
		Template.importObject.render();
		$( "#sliderScale" ).slider({
			min:1,
			max:1000,
			value: 1000,
			range: "min",
			slide: function( event, ui ) {
        		$( "#scale" ).text( Math.ceil(ui.value/1000*100) );
      		}
		});
		controls = new THREE.OrbitControls( view.camera, document.getElementById('perspective') );
		controls.addEventListener( 'change', Template.importObject.cameraMoved );
	}
}

Template.importObject.destroyed = function(){
	for (var i in view.tempObject){
        for (var j in view.tempObject[i]){
            view.scene.remove(view.tempObject[i][j]);
        }
        view.tempObject[i] = [];
    }
    view.clear();
    view.scene = null;
    view.renderer = null;
	rendered = false;
}

Template.importObject.textToArray = function(text){
	var textArray = text.split('[')[1].split(']')[0].split(',');
	var array = [];
	var OK = true;
	for (var i in textArray){
		var num = parseInt(textArray[i]);
		if (isNaN(num) || num < 0 || num > model.coordinates.length-1 || array.indexOf(num) != -1){
			OK = false;
			break;
		}
		else{
			array.push(num);
		}
	}
	return {isOK: OK, array: array};
}

Template.importObject.events({
	'click #transparency-on': function(e,tmpl){
		view.transparency = true;
		$('#transparency-off').removeClass('btn-primary');
		$('#transparency-on').addClass('btn-primary');
		Template.importObject.render();
	},
	'click #transparency-off': function(e,tmpl){
		view.transparency = false;
		$('#transparency-on').removeClass('btn-primary');
		$('#transparency-off').addClass('btn-primary');
		Template.importObject.render();
	},
	'click #axis-on': function(e,tmpl){
		view.axis = true;
		view.changedLayout = true;
		$('#axis-off').removeClass('btn-primary');
		$('#axis-on').addClass('btn-primary');
		Template.importObject.render();
	},
	'click #axis-off': function(e,tmpl){
		view.axis = false;
		view.changedLayout = true;
		$('#axis-on').removeClass('btn-primary');
		$('#axis-off').addClass('btn-primary');
		Template.importObject.render();
	},
	'submit': function(e,tmpl){
		e.preventDefault();
		var file = document.getElementById('uploadedFile').files[0];
		if (file.name.substring(file.name.length-4,file.name.length) == '.sat' || file.name.substring(file.name.length-4,file.name.length) == '.obj'){
			var reader = new FileReader();
			reader.onloadend = function(e) {
				var text = e.target.result;
				if (file.name.search('.sat') == file.name.length-4){
					model = satParser(text,parseInt($("#scale").text()));
				}
				else{
					model = objParser(text,parseInt($("#scale").text()));
				}
				$('.point, .edge, .face').closest('tr').remove();
				var arrayPoints = model.coordinates;
				var arrayEdges = model.edges;
				var arrayFaces = model.faces;
				for (var i in arrayPoints){
					$('#listPoints').append('<tr><td>'+parseInt(i)+'</td><td>['+arrayPoints[i]+']</td><td><a class="point" href="#"><i class="icon-remove"></i></a></td>');
				}
				for (var i in arrayEdges){
					$('#listEdges').append('<tr><td>['+arrayEdges[i]+']</td><td><a class="edge" href="#"><i class="icon-remove"></i></a></td>');
				}
				for (var i in arrayFaces){
					var string = '<tr><td>['+arrayFaces[i]+']</td><td><a class="face" href="#"><i class="icon-remove"></i></a></td>';
					$('#listFaces').append(string);
				}
				Template.importObject.render();
			} 
			reader.readAsText(file);
		}
		else{
			alert(Session.get('lang').FileFormatError);
		}
	},

	'click #findMarker': function(e, tmpl){
		model.marker = findMarkerPosition(40, view, model);
		Template.importObject.render();
	}
});