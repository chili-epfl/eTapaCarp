(function(root){
function pixel2mm(x, y, height)
{
	var rotationMat, transVector, KK, invA, invRot, new_x, new_y;

	rotationMat = JSON.parse(localStorage.getItem('rotationMatrix'));
	transVector = JSON.parse(localStorage.getItem('translationMatrix'))[0];
	KK = JSON.parse(localStorage.getItem('intrinsicMatrix'));
	invA = numeric.inv(KK);
	invRot = numeric.inv(rotationMat);
	m_nProjectionPoint = [x,y,1];

	m_nProjectionPoint = numeric.dot(invA,m_nProjectionPoint);

	var Z = height;
	var a = rotationMat[0][0]/rotationMat[1][0];
	var b = rotationMat[0][0]/rotationMat[2][0];
	var c = rotationMat[0][1] - a * rotationMat[1][1];
	var d = rotationMat[0][2] - a * rotationMat[1][2];
	var e = rotationMat[0][1] - b * rotationMat[2][1];
	var f = rotationMat[0][2] - b * rotationMat[2][2];
	var g = (d-f*c/e)*Z+(1-c/e)*transVector[0]-a*transVector[1]+(b*c/e)*transVector[2];
	var h = (1-c/e)*m_nProjectionPoint[0]-a*m_nProjectionPoint[1]+b*c/e;
	var zp = g/h;
	var xp = m_nProjectionPoint[0]*zp;
	var yp = m_nProjectionPoint[1]*zp;

	m_nProjectionPoint[0] = xp;
	m_nProjectionPoint[1] = yp;
	m_nProjectionPoint[2] = zp;

	m_nProjectionPoint = numeric.sub(m_nProjectionPoint,transVector);
	m_nProjectionPoint = numeric.dot(invRot,m_nProjectionPoint);

	new_x = m_nProjectionPoint[0];
	new_y = m_nProjectionPoint[1];
	return {x: new_x, y: new_y};
}
root.pixel2mm = pixel2mm;
})(this);