Activity3 = function(difficulty) {
	this.isFinished = false;
	this.renderingCallback = null;
	this.template = null;
	this.lastActiveMarkers = null;
	
	this.brickToMatch = null;
	this.difficulty = typeof difficulty === 'undefined' ? 1 : difficulty;
	
	this.solution = {
		correctBrick : false,
		correctTrans : {x: false, y: false},
		correctRot   : false
	}
	this.message = "";
}

Activity3.ACCEPTED_MARGIN = {
	translation: {x:10, y:10},
	rotation: 5
}


Activity3.prototype.setRenderingCallback = function(context, callback){
	this.renderingCallback = function(markers) {
		callback.call(context, markers);
	}
}

Activity3.prototype.update = function(markersDetector) {
	if (typeof markersDetector !== 'undefined') 
		this.lastActiveMarkers = markersDetector.activeMarkers;
	
	this.isFinished = this.checkSolution(this.lastActiveMarkers);
	
	this.template.updateFeedback(this.solution);
	
	this.renderingCallback(this.lastActiveMarkers);
	
	if (this.isFinished)
		this.template.activityFinished();
}

Activity3.prototype.checkRotation = function(rot) {
	return (Math.abs(rot-this.brickToMatch.rotation) < Activity3.ACCEPTED_MARGIN.rotation);
}

Activity3.prototype.checkTranslation = function(pos) {
	return (Math.abs(pos.x-this.brickToMatch.translation.x) < Activity3.ACCEPTED_MARGIN.translation.x 
		 && Math.abs(pos.y-this.brickToMatch.translation.y) < Activity3.ACCEPTED_MARGIN.translation.y);
}


Activity3.prototype.checkSolution = function(markers) {
	if (Utils.dictLength(markers) != 1) {
		this.message = "You must use only one block for this activity."
	} else {
		console.log(typeof(markers[this.brickToMatch.id]));
		if (typeof(markers[this.brickToMatch.id]) !== 'undefined') {
			var rotPos = BrickManager.getRotationAndPositionOfBrick(markers[this.brickToMatch.id])
			this.solution.correctBrick = true;
			this.solution.correctRot = this.checkRotation(rotPos.r);
			this.solution.correctTrans = this.checkTranslation(rotPos.p);
		}
	}
	return (this.solution.correctBrick && this.solution.correctRot && this.solutionCorrectTrans);
}


Activity3.prototype.generateMovements = function(numberOfMovements) {
	for (i in numberOfMovements) 
		this.movements.push(this.getMovement())
}

Activity3.prototype.getMovement = function() {
	var currPos = {x: 0, y: 0}; //TODO = this.shape.translation;
	var t = {x: 0, y: 0}
	var boundaries = {
		x : [
			-Config.WORKSPACE_DIMENSION.x - currPos.x, 
			 Config.WORKSPACE_DIMENSION.x - currPos.x
		],
		y: [
			-Config.WORKSPACE_DIMENSION.y - currPos.y,
			 Config.WORKSPACE_DIMENSION.y - currPos.y
		]
	}
	
	// always add a translation
	var tAmplitude = { 
		x : getTranslationAmplitude(boundaries.x),
		y : getTranslationAmplitude(boundaries.y)
	}
	var move = {x : true, y: true }; 
	if (this.difficulty == 1) {
		var chooseAxis = Math.round(Math.random()) == 0; // only move on one axis
		var move = {x : chooseAxis, y: !chooseAxis }; 
	}
	var tRot = (this.difficulty > 2) ? (Math.round(Math.random()*135)) : 0
	
	var movement = {
		translation : {
			x : move.x ? tAmplitude.x : 0,
			y : move.y ? tAmplitude.y : 0,
		},
		rotation : tRot
	}
	
	console.log(movement)
	
	return movement;
}

function getTranslationAmplitude(bound) {
	var range = bound[1] - bound[0];
	return (bound[0] + Math.round(Math.random()*range))
}
