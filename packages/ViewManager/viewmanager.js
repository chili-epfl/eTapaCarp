var SHAPES = [6, 20, 64];

ViewManager = function(){
    this.views = {};
}

ViewManager.prototype.addView = function(view){
    // view.init();
    this.views[view.name] = view;
};

ViewManager.prototype.init = function(){
    for (var i in this.views){
        this.views[i].init(); 
    }
};

ViewManager.prototype.setTransparency = function(bool){
    for (var i in this.views){
        this.views[i].transparency = bool;
        this.views[i].brickManager.setTransparency(bool); 
    }
};

ViewManager.prototype.edgeToSelect = function(markerId, difficulty, name){
    for (var i in this.views){
        if (i == name){
            this.views[i].edgeToSelect(markerId, difficulty);
        }
        else{
            this.views[i].removeSelectedEdges();
        }
    }
};

ViewManager.prototype.addStandardDisplayOptions = function() {
    var that = this;
	$('#transparency-on').on('click', function () {
		$('#transparency-off').removeClass('btn-primary');
		$('#transparency-on').addClass('btn-primary');
		that.setTransparency(true);
		// views.setChangedLayout(true);
	});

	$('#transparency-off').on('click', function () {
		$('#transparency-on').removeClass('btn-primary');
		$('#transparency-off').addClass('btn-primary');
		that.setTransparency(false);
		// views.setChangedLayout(true);
	});

	$('#axis-on').on('click', function () {
		$('#axis-off').removeClass('btn-primary');
		$('#axis-on').addClass('btn-primary');
		that.setAxis(true);
		// views.setChangedLayout(true);
	});

	$('#axis-off').on('click', function () {
		$('#axis-on').removeClass('btn-primary');
		$('#axis-off').addClass('btn-primary');
		that.setAxis(false);
		// views.setChangedLayout(true);
	});
}

ViewManager.prototype.addFeedbackDisplay = function() {
	$('#feedback-on').on('click', function () {
		$('#feedback-off').removeClass('btn-primary');
		$('#feedback-on').addClass('btn-primary');
		$('.feedback').parent().show();
	});

	$('#feedback-off').on('click', function () {
		$('#feedback-on').removeClass('btn-primary');
		$('#feedback-off').addClass('btn-primary');
		$('.feedback').parent().hide();
	});
}

ViewManager.prototype.findClickedView = function(click){
    if(click.target && click.target.parentElement){
    	for (var i in this.views){
    		var currView = this.views[i];
    		if (click.target.parentElement.id == currView.name && !(currView instanceof PerspectiveView)){
    			return this.views[i];
    		}
    	}
    }
}

// ViewManager.prototype.setChangedLayout = function(bool){
//     for (var i in this.views){
//         this.views[i].changedLayout = bool; 
//     }
// };

ViewManager.prototype.setAxis = function(bool){
    for (var i in this.views){
        this.views[i].axis = bool; 
    }
};

// ViewManager.prototype.setIsNotJittering = function(bool){
//     for (var i in this.views){
//         this.views[i].isNotJittering = bool; 
//     }
// };

ViewManager.prototype.setClick = function(click){
    for (var i in this.views){
        this.views[i].click = click; 
    }
};

ViewManager.prototype.render = function(markers){
    for (var i in this.views){
        this.views[i].render(markers);
    }
};

// ViewManager.prototype.activity2Difficulty = function(difficulty){
//     for (var i in this.views){
//         this.views[i].difficulty = difficulty;
//     }
// }

// ViewManager.prototype.updateActivity2Feedback = function(markers){
//     for (var i in this.views){
//         this.views[i].updateActivity2Feedback(markers);
//         break;
//     }
// }
// 
// ViewManager.prototype.checkActivity2Solution = function(markers){
//     for (var i in this.views){
//         if (this.views[i] instanceof FrontView){
//             var count = [];
//             var rotationOK = true;
//             var positionOK = true;
//             var diffRotation = [];
//             for (var j in markers){
//                 var marker = markers[j];
//                 if (count.indexOf(marker.id) == -1){
//                     count.push(marker.id);
//                 }
//                 for (var j = 0; j<ACTIVITYSHAPES.length; j++){
//                     if (marker.id == ACTIVITYSHAPES[j]){
//                         var Z = this.views[i].markerZ[marker.id];
//                         var marker_position = [marker.corners[0].x, marker.corners[0].y,1];
//                         var marker_position2 = [marker.corners[1].x, marker.corners[1].y,1];
//                         position = pixel2mm(marker_position[0], marker_position[1], Z);
//                         position2 = pixel2mm(marker_position2[0], marker_position2[1], Z);
//                         var rotation;
//                         var diffx = position.x-position2.x;
//                         var diffy = position.y-position2.y;
//                         if (diffy == 0){
//                             diffy = 1;
//                         }
//                         if ((diffx < 0 && diffy > 0) || (diffx > 0 && diffy > 0)){
//                             rotation = -Math.atan(diffx/diffy)+Math.PI/2;
//                         }
//                         else{
//                             rotation = -Math.atan(diffx/diffy)-Math.PI/2;
//                         }
//                         diffRotation.push(rotation, ACTIVITYROTATION[marker.id],rotation - ACTIVITYROTATION[marker.id])
//                         if (Math.abs(rotation - ACTIVITYROTATION[marker.id]) > 0.2){
//                             rotationOK = false;
//                         }
//                         if (Math.abs(position.x - ACTIVITYTRANSLATION[marker.id][0]) > 20 || Math.abs(position.y - ACTIVITYTRANSLATION[marker.id][1]) > 20){
//                             positionOK = false;
//                         }
//                     }
//                 }
//             }
//             if (count.length == this.views[i].difficulty && rotationOK && positionOK){
//                 var stopTime = new Date().getTime();
//                 return stopTime;
//             }
//             else{
//                 return null;
//             }
//         }
//     }
// }

ViewManager.prototype.init_objects = function(){

    for (var i in this.views){
        var view = this.views[i];
        if (!view.dynamic){
            view.init_objects();
        }
    }
}

ViewManager.prototype.clearChoiceEdges = function(){
    for(var i in this.views){
        this.views[i].edgesToSelect = [];
        this.views[i].levels = {};
        // this.views[i].changedLayout = true;
    }
}

// shows the level when selection hits several superposed edges
ViewManager.prototype.showHelpOnSelect = function(click){
    for (var i in this.views){
        var currentView = this.views[i];
        if (currentView instanceof FrontView){
            var helpingView, sideView;
            for (var j in this.views){
                if (this.views[j] instanceof TopView){
                    helpingView = this.views[j];
                }
                else if (this.views[j] instanceof SideView){
                    sideView = this.views[j];
                }
            }
                
            if (click.target.parentElement.id == currentView.name){
                currentView.levels = {};
                // currentView.changedLayout = true;
                sideView.levels = {};
                sideView.edgesToSelect = [];
                // sideView.changedLayout = true;
                helpingView.levels = {};
                helpingView.edgesToSelect = [];
            }
            helpingView.levels.y = {};
            for (var j in currentView.edgesToSelect){
                helpingView.levels.y[j] = currentView.edgesToSelect[j];
            }
            // helpingView.changedLayout = true;

        }
        else if (currentView instanceof SideView){
            var helpingView, frontView;
            for (var j in this.views){
                if (this.views[j] instanceof TopView){
                    helpingView = this.views[j];
                }
                else if (this.views[j] instanceof FrontView){
                    frontView = this.views[j];
                }
            }
                
            if (click.target.parentElement.id == currentView.name){
                currentView.levels = {};
                // currentView.changedLayout = true;
                frontView.levels = {};
                frontView.edgesToSelect = [];
                // frontView.changedLayout = true;
                helpingView.levels = {};
                helpingView.edgesToSelect = [];
            }
            helpingView.levels.x = {};
            for (var j in currentView.edgesToSelect){
                helpingView.levels.x[j] = currentView.edgesToSelect[j];
            }
            
            // helpingView.changedLayout = true;

        }
        else if (currentView instanceof TopView){
            var helpingView;
            for (var j in this.views){
                if (click.target.parentElement.id == currentView.name){
                    currentView.levels = {};
                    // currentView.changedLayout = true;
                    if (this.views[j] instanceof FrontView || this.views[j] instanceof SideView){
                        helpingView = this.views[j];
                        helpingView.levels = {};
                        helpingView.edgesToSelect = [];
                        if (currentView.edgesToSelect.length > 0){
                            var count = 1;
                            for (var j in currentView.edgesToSelect){
                                helpingView.levels[j] = currentView.edgesToSelect[j];
                            }
                        }
                        // helpingView.changedLayout = true;
                    }
                }
            }
        }
    }
}


//ViewManager.prototype.generateRandomPositions = function(numberOfShapes, shapesToChooseFrom)
//TODO put while in here, and return an array of shapes/objects

	
ViewManager.prototype.generateRandomPositions = function(){
    var testObjects = [];
    ACTIVITYSHAPES = [];
    var count = 0;
    var redoRandom = false;
    var randomShape = Math.ceil(Math.random()*SHAPES.length)-1;
    for (var name in this.views){
            var view = this.views[name];
            view.clear();
            for (var i = 0; i<SHAPES.length; i++){
                if (view.difficulty == 1){
                    if (i == randomShape){
                        var thisShape = SHAPES[i];
                        var filledShape = view.shape(MODELS[thisShape]);
                        testObjects[thisShape] = new THREE.Mesh(filledShape, new THREE.MeshBasicMaterial());
                        ACTIVITYSHAPES.push(thisShape);
                        ACTIVITYROTATION[thisShape] = Math.random()*Math.PI;
                        ACTIVITYTRANSLATION[thisShape] = [Math.random()*WS_WIDTH-(WS_WIDTH/2),Math.random()*WS_HEIGHT-(WS_HEIGHT/2)];
                    } 
                }
                else if (view.difficulty == 2){
                    if (i != randomShape){
                        var thisShape = SHAPES[i];
                        var filledShape = view.shape(MODELS[thisShape]);
                        testObjects[thisShape] = new THREE.Mesh(filledShape, new THREE.MeshBasicMaterial());
                        ACTIVITYSHAPES.push(thisShape);
                        ACTIVITYROTATION[thisShape] = Math.random()*Math.PI;
                        ACTIVITYTRANSLATION[thisShape] = [Math.random()*WS_WIDTH-(WS_WIDTH/2),Math.random()*WS_HEIGHT-(WS_HEIGHT/2)];
                    } 
                }
                else{
                    var thisShape = SHAPES[i];
                    var filledShape = view.shape(MODELS[thisShape]);
                    testObjects[thisShape] = new THREE.Mesh(filledShape, new THREE.MeshBasicMaterial());
                    ACTIVITYSHAPES.push(thisShape);
                    ACTIVITYROTATION[thisShape] = Math.random()*Math.PI;
                    ACTIVITYTRANSLATION[thisShape] = [Math.random()*WS_WIDTH-(WS_WIDTH/2),Math.random()*WS_HEIGHT-(WS_HEIGHT/2)];
                }
            }
            for (var i in testObjects){
                var object = testObjects[i];
                object.rotation.z = ACTIVITYROTATION[i];
                object.position.x = ACTIVITYTRANSLATION[i][0];
                object.position.y = ACTIVITYTRANSLATION[i][1];
                object.updateMatrix();
                object.geometry.applyMatrix(object.matrix);
                object.geometry.computeBoundingBox();
            }
            for (var i in testObjects){
                var object1 = testObjects[i];
                for (var i = 0; i < object1.geometry.vertices.length; i++){
                    var vertex = object1.geometry.vertices[i];
                    if (Math.abs(vertex.x) > (WS_WIDTH/2-40) || Math.abs(vertex.y) > (WS_HEIGHT/2-40)){
                        redoRandom = true;
                        break;
                    }
                }
                if (redoRandom){
                    break;
                }
            }
            if (!redoRandom){
                for (var i in testObjects){
                    var object1 = testObjects[i];
                    for (var j in testObjects){
                        if (j != i){
                            var object2 = testObjects[j];
                            if (object1.geometry.boundingBox.isIntersectionBox(object2.geometry.boundingBox)){
                                redoRandom = true;
                                break;
                            }
                        }
                    }
                    if (redoRandom){
                        break;
                    }
                }
            }
        break;
    }
    testObjects = [];
    return [redoRandom, ACTIVITYSHAPES];
}

ViewManager.prototype.destroy = function(){
    for (var i in this.views){
        var view = this.views[i];
        view.clear();
        view.scene = null;
        view.renderer = null;
    }
}