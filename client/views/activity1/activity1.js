Activity1 = function() {
	this.renderingCallback = null;
	this.isFinished = false;
	this.difficulty = 1;
	this.template = null;
	this.objectId = -1;
	this.lastActiveMarkers = null;
}

Activity1.prototype.update = function(markersDetector) {
	if (typeof markersDetector !== 'undefined') {
		this.lastActiveMarkers = markersDetector.activeMarkers;
	}
	
	this.renderingCallback(this.lastActiveMarkers);
	
	if (this.isFinished) 
		this.template.activityFinished();
	
}

Activity1.prototype.setRenderingCallback = function(context, callback){
	this.renderingCallback = function(markers) {
		callback.call(context, markers);
	}
//	this.renderingCallback = callback;
}



Activity1.prototype.checkSolution = function(views){
    var correct = [];
    var wrong = [];
    var userSol = [];
    var correctSol = null;
    var verticalEdge = 0;
    for (var i in views){
        if (views[i] instanceof PerspectiveView){
            correctSol = views[i].selected;
            for (var j in correctSol){
                if (correctSol[j].geometry.vertices[0].x == correctSol[j].geometry.vertices[1].x
                    && correctSol[j].geometry.vertices[0].y == correctSol[j].geometry.vertices[1].y){
                    verticalEdge++;
                }
            }
        }
        else {
            if (views[i].selected && views[i].selected.length > 0){
                userSol[i] = views[i].selected;
            }
            else{
                correct[i] = 0;
                wrong[i] = 0;
            }
        }
    }
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

Activity1.prototype.isAllCorrect = function(correct, wrong, verticalEdge) {
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