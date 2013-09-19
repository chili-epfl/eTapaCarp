Template.createAnObject.lang = function(e){
	return Session.get('lang');
}

var model = {coordinates:[], edges:[], faces:[], marker:[]};
var view;
var rendered = false;

model.coordinates = [[0,0,0],[100,0,0],[100,60,0],[0,60,0],[0,0,50],[100,0,50],[100,60,50],[0,60,50]];
model.edges = [[0,1],[1,2],[2,3],[3,0],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],[7,4]];
model.faces = [[0,1,2,3],[4,5,6,7],[2,3,7,6],[0,3,7,4],[1,2,6,5],[0,1,5,4]];

Template.createAnObject.render = function(){
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
	view.render([]);
	view.renderTempObject(model, true);
	view.renderer.render(view.scene, view.camera)
}

Template.createAnObject.rendered = function(){
	if (!rendered){
		rendered = true;
		view = new PerspectiveView('perspective1');
		view.init();
		Template.createAnObject.render();
		controls = new THREE.OrbitControls( view.camera, document.getElementById('perspective1') );
		controls.addEventListener( 'change', Template.createAnObject.render );
	}
	if (view != undefined){
		
		Template.createAnObject.render();
	}
}

Template.createAnObject.textToArray = function(text){
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

Template.createAnObject.destroyed = function(){

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

Template.createAnObject.events({
	'click #transparency-on': function(e,tmpl){
		view.transparency = true;
		$('#transparency-off').removeClass('btn-primary');
		$('#transparency-on').addClass('btn-primary');
		Template.createAnObject.render();
	},
	'click #transparency-off': function(e,tmpl){
		view.transparency = false;
		$('#transparency-on').removeClass('btn-primary');
		$('#transparency-off').addClass('btn-primary');
		Template.createAnObject.render();
	},
	'click #axis-on': function(e,tmpl){
		view.axis = true;
		view.changedLayout = true;
		$('#axis-off').removeClass('btn-primary');
		$('#axis-on').addClass('btn-primary');
		Template.createAnObject.render();
	},
	'click #axis-off': function(e,tmpl){
		view.axis = false;
		view.changedLayout = true;
		$('#axis-on').removeClass('btn-primary');
		$('#axis-off').addClass('btn-primary');
		Template.createAnObject.render();
	},
	'submit': function(e,tmpl){
		e.preventDefault();
		if (e.target.inputX !== undefined){
			var x = parseInt(e.target.inputX.value);
			var y = parseInt(e.target.inputY.value);
			var z = parseInt(e.target.inputZ.value);
			if(!isNaN(x) && !isNaN(y) && !isNaN(z)){
				model.coordinates.push([x,y,z]);
				$('#listPoints').append('<tr><td>'+(model.coordinates.length-1)+'</td><td>['+x+','+y+','+z+']</td><td><a class="point" href="#"><i class="icon-remove"></i></a></td></tr>');
			}
			else{
				alert(Session.get('lang').InputNotValid);
			}
		}
		else if (e.target.inputEdge !== undefined){
			var array = Template.createAnObject.textToArray(e.target.inputEdge.value);
			if (array.isOK && array.array.length == 2){
				model.edges.push(array.array);
				var string = '<tr><td>['+array.array+']</td><td><a class="edge" href="#"><i class="icon-remove"></i></a></td></tr>';
				$('#listEdges').append(string);
			}
			else{
				alert(Session.get('lang').InputNotValid);
			}
		}
		else if (e.target.inputFace !== undefined){
			var array = Template.createAnObject.textToArray(e.target.inputFace.value);
			if (array.isOK){
				var allEdgesExist = true;
				for (var i = 0; i < array.array.length && allEdgesExist; i++){
					var edgeExists = false;
					var val1 = array.array[i];
					var val2 = array.array[((i+1)%array.array.length)];
					for (var j = 0; j < model.edges.length && !edgeExists; j++){
						if(model.edges[j].indexOf(val1) != 1 && model.edges[j].indexOf(val2) != -1){
							edgeExists = true;
						}
					}
					if(!edgeExists){
						allEdgesExist = false;
					}
				}
				if (allEdgesExist){
					model.faces.push(array.array);
					var string = '<tr>'+
									'<td>['+array.array+']</td>'+
									'<td><a class="face" href="#"><i class="icon-remove"></i></a></td>'+
								'</tr>';
					$('#listFaces').append(string);
				}
				else{
					alert(Session.get('lang').InputNotValid);
				}
			}
			else{
				alert(Session.get('lang').InputNotValid);
			}
		}
		else if (e.target.inputMarkerX !== undefined){
			var x = parseInt(e.target.inputMarkerX.value);
			var y = parseInt(e.target.inputMarkerY.value);
			var z = parseInt(e.target.inputMarkerZ.value);
			if(!isNaN(x) && !isNaN(y) && !isNaN(z)){
				model.marker = [x, y, z];
			}
			else{
				alert(Session.get('lang').InputNotValid);
			}
		}
		view.renderTempObject(model, true);
	},
	'click a.point': function(e, tmpl){
		e.preventDefault();
		var row = $(e.target).closest('tr');
		var ID = parseInt($(row.children('td')[0]).text())
		var arrayPoints = [];
		var arrayEdges = [];
		var arrayFaces = [];
		for (var i in model){
			for (var j in model[i]){
				if (i == 'coordinates' && j != ID){
					arrayPoints.push(model.coordinates[j]);
				}
				else if (i == 'edges' && model[i][j].indexOf(ID) == -1){
					if (ID < model.edges[j][0]){
						model.edges[j][0]--;
					}
					if (ID < model.edges[j][1]){
						model.edges[j][1]--;
					}
					arrayEdges.push(model.edges[j]);
				}
				else if (i == 'faces'){
					if (model[i][j].indexOf(ID) == -1){
						for (var k in model.faces[j]){
							if (ID < model.faces[j][k]){
								model.faces[j][k]--;
							}
						}
						arrayFaces.push(model.faces[j]);
					}
					else if (j == model.marker[0]){
						model.marker = [];
					}
				}
			}
		}
		model = {coordinates:arrayPoints, edges:arrayEdges, faces:arrayFaces, marker:model.marker};
		view.renderTempObject(model,true);
		$('.point, .edge, .face').closest('tr').remove();
		for (var i in arrayPoints){
			$('#listPoints').append('<tr><td>'+(parseInt(i))+'</td><td>['+arrayPoints[i]+']</td><td><a class="point" href="#"><i class="icon-remove"></i></a></td>');
		}
		for (var i in arrayEdges){
			$('#listEdges').append('<tr><td>['+arrayEdges[i]+']</td><td><a class="edge" href="#"><i class="icon-remove"></i></a></td>');
		}
		for (var i in arrayFaces){
			var string = '<tr><td>['+arrayFaces[i]+']</td><td><a class="face" href="#"><i class="icon-remove"></i></a></td>';
			$('#listFaces').append(string);
		}
	},
	'click a.edge': function(e, tmpl){
		e.preventDefault();
		var edge = $(e.target).closest('tr').text();
		var array = Template.createAnObject.textToArray(edge).array;
		var arrayEdges = [];
		var arrayFaces = [];
		for (var i in model.edges){
			if (JSON.stringify(array) != JSON.stringify(model.edges[i])){
				arrayEdges.push(model.edges[i]);
			}
		}
		for (var i in model.faces){
			if(model.faces[i].indexOf(array[0]) == -1 || model.faces[i].indexOf(array[1]) == -1){
				arrayFaces.push(model.faces[i]);
			}
			else if (i == model.marker[0]){
				model.marker = [];
			}
		}
		model.edges = arrayEdges;
		model.faces = arrayFaces;
		view.renderTempObject(model,true);
		$('.edge, .face').closest('tr').remove();
		for (var i in arrayEdges){
			$('#listEdges').append('<tr><td>['+arrayEdges[i]+']</td><td><a class="edge" href="#"><i class="icon-remove"></i></a></td>');
		}
		for (var i in arrayFaces){
			var string = '<tr><td>['+arrayFaces[i]+']</td><td><a class="face" href="#"><i class="icon-remove"></i></a></td>';
			$('#listFaces').append(string);
		}
		
	},
	'click a.face': function(e, tmpl){
		e.preventDefault();
		var face = $(e.target).closest('tr').text();
		var array = Template.createAnObject.textToArray(face).array;
		var arrayFaces = [];
		for (var i in model.faces){
			if (JSON.stringify(array) != JSON.stringify(model.faces[i])){
				arrayFaces.push(model.faces[i]);
			}
			else if (i == model.marker[0]){
				model.marker = [];
			}
		}
		model.faces = arrayFaces;
		view.renderTempObject(model,true);
		$('.face').closest('tr').remove();
		for (var i in arrayFaces){
			var string = '<tr><td>['+arrayFaces[i]+']</td><td><a class="face" href="#"><i class="icon-remove"></i></a></td>';
			$('#listFaces').append(string);
		}
	},

	'click #findMarker': function(e, tmpl){
		if (!$(e.target).hasClass('disabled')){
			model.marker = findMarkerPosition(40, view, model);
			if (model.marker.length > 0){
				$('#saveObject').removeClass('disabled');
				$('#findMarker').addClass('disabled');
			}
			Template.createAnObject.render();
		}
	},

	'click #saveObject': function(e, tmpl){
		if (!$(e.target).hasClass('disabled')){
			saveObject(model);
			$('#saveObject').addClass('disabled');
		}
	}
});