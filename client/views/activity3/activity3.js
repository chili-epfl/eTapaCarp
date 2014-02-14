Activity3 = function(brick, difficulty) {
	this.isFinished = false;
	this.renderingCallback = null;
	this.template = null;
	this.lastActiveMarkers = null;
	
	this.brickToMatch = brick;
	this.hasStarted = false;
	this.difficulty = typeof difficulty === 'undefined' ? 1 : difficulty;
	
	this.ready = {
		calib : false,
		oneObjectDetected: false
	}
	
	this.originalPosRot = {
		pos: {x: 0, y: 0},
		rot: 0
	}
    
    this.movements = []
    this.currMovIndex = -1;
	
	this.solution = {
		correctBrick : false,
		correctTranslation : {x: false, y: false},
		correctRotation   : false
	}
	this.message = "";
}

Activity3.Config = {
	ACCEPTED_MARGIN : {
		translation: {x:10, y:10},
		rotation: .2 // in radians, about 10 degrees
	},
    numberOfMovements: 4,
	rotationRange : [30, 330]
}

Activity3.prototype.isReady = function(markersDetector) {
	if (typeof markersDetector !== 'undefined') 
		this.lastActiveMarkers = markersDetector.activeMarkers;
	
	var numMarkers = Utils.dictLength(this.lastActiveMarkers);
	this.ready.oneObjectDetected = (numMarkers == 1);
	this.ready.calibrated = !CalibStatic.needCalibration;
    // if (this.ready.oneObjectDetected && this.ready.calibrated) 
        // this.brickToMatch = this.lastActiveMarkers[Object.keys(this.lastActiveMarkers)[0]];
	this.hasStarted = this.ready.calibrated && this.ready.oneObjectDetected;
	return this.hasStarted;
}

Activity3.prototype.updateReadyInfo = function() {
	var changeDisplay = function(el, isOK) {
		if (isOK) {
	        el.parent().removeClass('alert alert-error');
			el.children("i").addClass("icon-ok").removeClass("icon-remove");
		} else {
	        el.parent().addClass('alert alert-error');
			el.children("i").removeClass("icon-ok").addClass("icon-remove");
		}
	}
	changeDisplay($('#calibrated'), this.ready.calibrated);
	changeDisplay($('#objectDetected'), this.ready.oneObjectDetected);

	if (this.hasStarted)
		$('#startButton').removeClass("disabled");
	else 
		$('#startButton').addClass("disabled");
}

Activity3.prototype.setRenderingCallback = function(context, callback){
	this.renderingCallback = function(markers) {
		callback.call(context, markers);
	}
}

Activity3.prototype.update = function(markersDetector) {
	if (typeof markersDetector !== 'undefined') 
		this.lastActiveMarkers = markersDetector.activeMarkers;
	
	if (this.hasStarted) {
//        console.log("has started...")
		this.isFinished = this.checkSolution(this.lastActiveMarkers);
//        console.log("finished: " + this.isFinished);
		this.template.updateFeedback(this.solution);
	} else {
		this.isReady(markersDetector);
	}
	
	this.renderingCallback(this.lastActiveMarkers);
	
	if (this.isFinished)
		this.template.activityFinished();
	
}

Activity3.prototype.checkRotation = function(rot) {
    // console.log(rot, this.brickToMatch.rotation, (Math.abs(rot-this.brickToMatch.rotation) < Activity3.Config.ACCEPTED_MARGIN.rotation))
	return (Math.abs(rot-this.brickToMatch.rotation) < Activity3.Config.ACCEPTED_MARGIN.rotation);
}

Activity3.prototype.checkTranslation = function(pos) {
	return (Math.abs(pos.x-this.brickToMatch.translation.x) < Activity3.Config.ACCEPTED_MARGIN.translation.x 
		 && Math.abs(pos.y-this.brickToMatch.translation.y) < Activity3.Config.ACCEPTED_MARGIN.translation.y);
}


Activity3.prototype.checkSolution = function(markers) {
	if (Utils.dictLength(markers) != 1) {
		this.message = "You must use only one block for this activity."
	} else {
		if (typeof(markers[this.brickToMatch.id]) !== 'undefined') {
			var rotPos = BrickManager.getRotationAndPositionOfBrick(markers[this.brickToMatch.id])
			this.solution.correctBrick = true;
			this.solution.correctRotation = this.checkRotation(rotPos.r);
			this.solution.correctTranslation = this.checkTranslation(rotPos.p);
            // console.log(this.solution.correctBrick, this.solution.correctTranslation, this.solution.correctRotation)
		}
	}
    console.log("solution right? " + this.solution.correctBrick && this.solution.correctRotation && this.solution.correctTranslation)
	return (this.solution.correctBrick && this.solution.correctRotation && this.solution.correctTranslation);
}

Activity3.prototype.loadNextMovement = function() {
    this.currMovIndex += 1;
    console.log(this.currMovIndex, this.movements.length)
    if (this.currMovIndex < this.movements.length) {
        var m = this.movements[this.currMovIndex]
        this.brickToMatch.rotation += m.rotation;
        this.brickToMatch.translation = {	
    		x: this.brickToMatch.translation.x+m.translation.x,
    		y: this.brickToMatch.translation.y+m.translation.y
    	}
    
        console.log("new pos: " + this.brickToMatch.translation.x + ", " + this.brickToMatch.translation.y)
        // update static views
        this.template.updateStaticViews(this.brickToMatch)
    
        return true;
    } else {
        return false;
    }
}

// TODO probably need to be smarter... could also be hardcoded as it was in TapaCarp...
Activity3.prototype.generateMovements = function(numberOfMovements) {
	for (i=0; i<numberOfMovements; i++) 
		this.movements.push(this.getMovement());
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
	var rotAngle = Activity3.Config.rotationRange[1]-Activity3.Config.rotationRange[0];
	var tRot = (this.difficulty > 2) 
			 ? (Math.round(Math.random()*rotAngle)+Activity3.Config.rotationRange[1]) 
			 : 0
	
	var movement = {
		translation : {
			x : move.x ? tAmplitude.x : 0,
			y : move.y ? tAmplitude.y : 0,
		},
		rotation : tRot
	}
	
	return movement;
}

function getTranslationAmplitude(bound) {
	var range = bound[1] - bound[0];
	return (bound[0] + Math.round(Math.random()*range))
}
