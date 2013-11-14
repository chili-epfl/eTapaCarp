Activity2 = function() {
	this.renderingCallback = null;
	this.isFinished = false;
	this.difficulty = 1;
	this.template = null;
	this.lastActiveMarkers = null;
    this.objectDetected = false;
    this.evaluationMode = false;
    this.evaluationStarted = false;
    this.bricksToMatch = {};
}

Activity2.ACCEPTED_MARGIN = {
    translation: {x:10, y:10},
    rotation: 0.2
}

Activity2.prototype.update = function(markersDetector) {
	if (typeof markersDetector !== 'undefined') {
		this.lastActiveMarkers = markersDetector.activeMarkers;
	}
	
	this.renderingCallback(this.lastActiveMarkers);

    if (this.evaluationMode && !this.evaluationStarted){
        var numMarkers = 0;
        var markerId = null;
        for (var i in this.lastActiveMarkers){
            numMarkers++;
            markerId = i;
        }
        if (numMarkers == 1 && !this.objectDetected){
            this.objectDetected = true;
        }
        if (numMarkers == 1 && this.objectDetected){
            this.evaluationStarted = true;
            this.objectDetected = true;
            this.template.startActivity(markerId);
        }
    }
    this.isFinished = this.checkSolution(this.lastActiveMarkers);
	
	if (this.isFinished) 
		this.template.activityFinished();
	
}

Activity2.prototype.setRenderingCallback = function(context, callback){
	this.renderingCallback = function(markers) {
		callback.call(context, markers);
	}
//	this.renderingCallback = callback;
}

Activity2.prototype.updateReadyInfo = function(markers){
    if (CalibStatic.needCalibration) {
        $('#calibrated').parent().addClass('alert alert-error');
        $('#calibrated').text('');
        $('#calibrated').append('<i class="icon-remove"></i>');
    }
    else{
        $('#calibrated').parent().removeClass('alert alert-error');
        $('#calibrated').text('');
        $('#calibrated').append('<i class="icon-ok"></i>');
    }
    var numMarkers = 0;
    for (var i in markers){
        numMarkers++;
    }
    if (numMarkers != 1){
        $('#objectDetected').parent().addClass('alert alert-error');
        $('#objectDetected').text('');
        $('#objectDetected').append('<i class="icon-remove"></i>');
    }
    else{
        $('#objectDetected').parent().removeClass('alert alert-error');
        $('#objectDetected').text('');
        $('#objectDetected').append('<img class="rowShape" src="/shape'+i+'.png"></img>');
    }
    if (numMarkers == 1 && !CalibStatic.needCalibration) {
        $('#startButton').removeClass("disabled");
    }
    else {
        $('#startButton').addClass("disabled");
    }
}


Activity2.prototype.checkRotation = function(brick,rot) {
    if (Math.abs(rot-brick.rotation) < Activity2.ACCEPTED_MARGIN.rotation){
        $($('#rowShape'+brick.id+' i')[2]).removeClass('icon-remove').addClass('icon-ok');
        return true;
    }
    else{
        $($('#rowShape'+brick.id+' i')[2]).removeClass('icon-ok').addClass('icon-remove');
        return false;
    }
}

Activity2.prototype.checkTranslation = function(brick, pos) {
    if (Math.abs(pos.x-brick.translation.x) < Activity2.ACCEPTED_MARGIN.translation.x 
         && Math.abs(pos.y-brick.translation.y) < Activity2.ACCEPTED_MARGIN.translation.y){
        $($('#rowShape'+brick.id+' i')[1]).removeClass('icon-remove').addClass('icon-ok');
        return true;
    }
    else{
        $($('#rowShape'+brick.id+' i')[1]).removeClass('icon-ok').addClass('icon-remove');
        return false;
    }
}

Activity2.prototype.checkSolution = function(markers){
    var solutionOK = Utils.dictLength(markers) == this.difficulty;
    for (var i in markers){
        var marker = markers[i];
        if (typeof(this.bricksToMatch[marker.id]) != 'undefined') {
            var brick = this.bricksToMatch[marker.id];
            $($('#rowShape'+brick.id+' i')[0]).removeClass('icon-remove').addClass('icon-ok')
            var rotPos = BrickManager.getRotationAndPositionOfBrick(marker);
            solutionOK &= this.checkRotation(brick, rotPos.r);
            solutionOK &= this.checkTranslation(brick, rotPos.p);
        }
        else{
            solutionOK &= false;
        }
    }
    return solutionOK;
}

