ToolManager = function(){
	this.tools = {};
}

ToolManager.prototype.addTool = function(tool){
    this.tools[tool.id] = tool;
};

/*BrickManager.getRotationAndPositionOfBrick = function(marker) {
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
    else{
        rotation = -Math.atan(diffx/diffy)-Math.PI/2;
    }
	return {r : rotation, p: position};
}*/

