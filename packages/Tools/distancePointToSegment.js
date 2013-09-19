distancePointToSegment = function(point1, point2, point3){
	var px = point3.x-point2.x;
    var py = point3.y-point2.y;

    var squareDist = px*px + py*py;

    var u =  ((point1.x - point2.x) * px + (point1.y - point2.y) * py) / squareDist;

    if (u > 1){
        u = 1;
    }
    else if (u < 0){
        u = 0;
    }

    var x = point2.x + u * px;
    var y = point2.y + u * py;

    var dx = x - point1.x;
    var dy = y - point1.y;

    var dist = Math.sqrt(dx*dx + dy*dy);

    return [dist, dx, dy];
}