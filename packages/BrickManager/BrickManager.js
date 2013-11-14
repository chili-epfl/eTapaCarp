BrickManager = function(){
	this.bricks = {};
	this.staticBricks = {};
}

BrickManager.prototype.addBrick = function(brick){
    this.bricks[brick.id] = brick;
}

BrickManager.prototype.addStaticBrick = function(brick) {
	this.staticBricks[brick.id] = brick;
}

BrickManager.prototype.setTransparency = function(bool){
    for (var i in this.bricks){
        this.bricks[i].transparency = bool;
        this.bricks[i].changeStippledLinesVisibility();
    }
    for (var i in this.staticBricks){
        this.staticBricks[i].transparency = bool;
        this.staticBricks[i].changeStippledLinesVisibility();
    }
}

BrickManager.prototype.changeVisibility = function(bool){
    for (var i in this.bricks){
        this.bricks[i].changeVisibility(bool);
    }
}

BrickManager.getRotationAndPositionOfBrick = function(marker) {
    var Z = Session.get('shapes')[marker.id].markerZ;
    var marker_position = [marker.corners[0].x, marker.corners[0].y, 1];
    var marker_position2 = [marker.corners[1].x, marker.corners[1].y, 1];
    var position = pixel2mm(marker_position[0], marker_position[1], Z);
    var position2 = pixel2mm(marker_position2[0], marker_position2[1], Z);
    var rotation;
    var diffx = position.x-position2.x;
    var diffy = position.y-position2.y;
    if (diffy == 0){  diffy = 1;    }
    if ((diffx < 0 && diffy > 0) || (diffx > 0 && diffy > 0)) {
        rotation = -Math.atan(diffx/diffy)+Math.PI/2;
    }
    else {
        rotation = -Math.atan(diffx/diffy)-Math.PI/2;
    }
	return {r : rotation, p: position};
}

//numberOfBricks <= listOfBrickIds.length
// TODO improve: the positioning seems to be always in the top right corner of the top view
BrickManager.generateRandomPositions = function(numberOfBricks, listOfBrickIds){
	var MODELS = Session.get('shapes');
    var redoRandom = true;
    var bricks = {};
	while(redoRandom){
		redoRandom = false;
	    var count = 0;
	    var randomShapes = [];
	    while (randomShapes.length < numberOfBricks){
	    	var rand = Math.ceil(Math.random()*listOfBrickIds.length)-1;
	    	var brickId = listOfBrickIds[rand];
	    	if (randomShapes.indexOf(brickId) == -1){
	    		randomShapes.push(brickId);
	    	}
	    }
        for (var i = 0; i<randomShapes.length; i++){
            var brickId = randomShapes[i];
            var brick = new Brick(brickId);
            brick.rotation = Math.random()*Math.PI;
            brick.translation = {	
				x: Math.random()*Config.WORKSPACE_DIMENSION.x/2,
				y: Math.random()*Config.WORKSPACE_DIMENSION.y/2
			}
            bricks[brickId] = brick;
            brick.setRotationAndTranslation(Math.random()*Math.PI,{ x: Math.random()*Config.WORKSPACE_DIMENSION.x/2, y: Math.random()*Config.WORKSPACE_DIMENSION.y/2 });
            brick.faces.updateMatrix();
            brick.faces.geometry.computeBoundingBox();
            brick.faces.geometry.boundingBox.applyMatrix4(brick.faces.matrix);
			
        }
        for (var i in bricks){
            var brick = bricks[i].faces;
            var isInWorkspace = true;
            isInWorkspace &= Math.abs(brick.geometry.boundingBox.min.x) < Config.WORKSPACE_DIMENSION.x/2;
            isInWorkspace &= Math.abs(brick.geometry.boundingBox.max.x) < Config.WORKSPACE_DIMENSION.x/2;
            isInWorkspace &= Math.abs(brick.geometry.boundingBox.min.y) < Config.WORKSPACE_DIMENSION.y/2;
            isInWorkspace &= Math.abs(brick.geometry.boundingBox.max.y) < Config.WORKSPACE_DIMENSION.y/2;
            if (!isInWorkspace){
                redoRandom = true;
                break;
            }
        }
        if (!redoRandom){
            for (var i in bricks){
            	var brick1 = bricks[i].faces;
                for (var j in bricks){
                    if (j != i){
            			var brick2 = bricks[j].faces;
                        if (brick1.geometry.boundingBox.isIntersectionBox(brick2.geometry.boundingBox)){
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
	    if (redoRandom){
	    	bricks = {};
		}
	}
	return bricks;
}
