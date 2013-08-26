mm2pixel = function(x, y, height)
{
	var new_x, new_y;

	var rotationMat = JSON.parse(localStorage.getItem('rotationMatrix'));
	var transVector = JSON.parse(localStorage.getItem('translationMatrix'))[0];
	var A = JSON.parse(localStorage.getItem('intrinsicMatrix'));
	var projectionPoint = []

	projectionPoint.push(x);
	projectionPoint.push(y);
	projectionPoint.push(height);

	// (R|T)*M = m'
	projectionPoint = numeric.dot(rotationMat, projectionPoint);
	projectionPoint = numeric.add(transVector, projectionPoint);

	// m = m'/m'_z
	var scale = projectionPoint[2];
	projectionPoint = numeric.mul(projectionPoint,1.0/scale);

	// m = Am
	projectionPoint = numeric.dot(A,projectionPoint);

	new_x = projectionPoint[0];
	new_y = projectionPoint[1];

	return {x: new_x, y: new_y}
}