Activity5 = function() {
	this.renderingCallback = null;
	this.isFinished = false;
	this.difficulty = 1;
	this.template = null;
	this.objectId = -1;
	this.lastActiveMarkers = null;
    this.objectDetected = false;
    this.evaluationMode = false;
    this.evaluationStarted = false;
}

Activity5.prototype.update = function(markersDetector) {
	if (typeof markersDetector !== 'undefined') {
		this.lastActiveMarkers = markersDetector.activeMarkers;
	}
	//Call the rendering function on the views
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
            this.objectId = markerId;
        }
        if (numMarkers == 1 && this.objectDetected){
            this.evaluationStarted = true;
            this.objectDetected = true;
            this.template.startActivity(markerId);
        }
    }
	
	if (this.isFinished) 
		this.template.activityFinished();
	
}

Activity5.prototype.setRenderingCallback = function(context, callback){
	this.renderingCallback = function(markers) {
		callback.call(context, markers);
	}
//	this.renderingCallback = callback;
}

Activity5.prototype.updateReadyInfo = function(markers){
    console.log(CalibStatic.needCalibration)
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

Activity5.prototype.checkSolution = function(views){
    var correct = [];
    var wrong = [];
    var userSol = [];
    var correctSol = null;
    var verticalEdge = 0;
    for (var i in views){
        if (views[i] instanceof PerspectiveView){
            correctSol = views[i].brickManager.bricks[this.objectId].selectedLines;
            for (var j in correctSol){
                if (correctSol[j].geometry.vertices[0].x == correctSol[j].geometry.vertices[1].x
                    && correctSol[j].geometry.vertices[0].y == correctSol[j].geometry.vertices[1].y){
                    verticalEdge++;
                }
            }
        }
        else {
            if (views[i].brickManager.bricks[this.objectId].selectedLines && Utils.dictLength(views[i].brickManager.bricks[this.objectId].selectedLines) > 0){
                userSol[i] = views[i].brickManager.bricks[this.objectId].selectedLines;
            }
            else{
                correct[i] = 0;
                wrong[i] = 0;
            }
        }
    }
    console.log(correctSol)
    for (var i in userSol){
        correct[i] = 0;
        wrong[i] = 0;
        for (var j in userSol[i]){
            var isCorrect = false;
            for (var k in correctSol){
                if (userSol[i][j].geometry.vertices[0].x == correctSol[k].geometry.vertices[0].x
                    && userSol[i][j].geometry.vertices[0].y == correctSol[k].geometry.vertices[0].y
                    && userSol[i][j].geometry.vertices[0].z == correctSol[k].geometry.vertices[0].z
                    && userSol[i][j].geometry.vertices[1].x == correctSol[k].geometry.vertices[1].x
                    && userSol[i][j].geometry.vertices[1].y == correctSol[k].geometry.vertices[1].y
                    && userSol[i][j].geometry.vertices[1].z == correctSol[k].geometry.vertices[1].z){
                    isCorrect = true;
                }
                else if (userSol[i][j].geometry.vertices[1].x == correctSol[k].geometry.vertices[0].x
                    && userSol[i][j].geometry.vertices[1].y == correctSol[k].geometry.vertices[0].y
                    && userSol[i][j].geometry.vertices[1].z == correctSol[k].geometry.vertices[0].z
                    && userSol[i][j].geometry.vertices[0].x == correctSol[k].geometry.vertices[0].x
                    && userSol[i][j].geometry.vertices[0].y == correctSol[k].geometry.vertices[0].y
                    && userSol[i][j].geometry.vertices[0].z == correctSol[k].geometry.vertices[0].z){
                    isCorrect = true;
                }
            }
            if (isCorrect){
                correct[i]++;
            }
            else{
                wrong[i]++;
            }
        }
    }

    //divided by 2 because there are the stippled and plain lines
    for (var i in correct){
        correct[i] = correct[i]/2;
        wrong[i] = wrong[i]/2;
    }
    verticalEdge = verticalEdge/2;
	
	this.isFinished = this.isAllCorrect(correct, wrong, verticalEdge)
	
	this.update()
	
    return [correct, wrong, verticalEdge];
}

Activity5.prototype.isAllCorrect = function(correct, wrong, verticalEdge) {
	var isCorrect = true;
	for (var viewId in correct) {
		isCorrect &= wrong[viewId] == 0;
		if (viewId == "top") 
			isCorrect &= (correct[viewId] + verticalEdge == this.difficulty);
		else
			isCorrect &= (correct[viewId] == this.difficulty)
	}
	return isCorrect;	
} 