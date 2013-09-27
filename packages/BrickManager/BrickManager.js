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
}

BrickManager.prototype.changeVisibility = function(bool){
    for (var i in this.bricks){
        this.bricks[i].changeVisibility(bool);
    }
}

//numberOfBricks <= listOfBrickIds.length
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
            brick.faces.geometry.applyMatrix(brick.faces.matrix);
			// no need to do that for stippled lines because they share the geometry with the lines
			for (var i in brick.lines)
				brick.lines[i].geometry.applyMatrix(brick.faces.matrix);
			
            brick.faces.geometry.computeBoundingBox();
        }
        for (var i in bricks){
            var brick = bricks[i].faces;
            for (var j = 0; j < brick.geometry.vertices.length; j++){
                var vertex = brick.geometry.vertices[j];
	       	if (Math.abs(vertex.x) > (Config.WORKSPACE_DIMENSION.x/2-40) || Math.abs(vertex.y) > (Config.WORKSPACE_DIMENSION.y/2-40)){
			redoRandom = true;
                    break;
                }
            }
            if (redoRandom){
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
