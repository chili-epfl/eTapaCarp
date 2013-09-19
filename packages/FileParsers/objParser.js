objParser = function(file, scale){
	var obj = file.split('\n');
	var vertices = [];
	var edges = [];
	var faces = [];
	var normals = [];
	var offset = null;
	var minZ = null;
	var minX = null;
	var maxX = null;
	var minY = null;
	var maxY = null;
	for (var i in obj){
		var line = obj[i];
		if (line.search('v ') == 0){
			while (line.search('  ') != -1){
				line = line.replace(/  /g, ' ');
			}
			line = line.split(" ");
			if (minX == null || minX > parseFloat(line[1])){
				minX = parseFloat(line[1]);
			}
			if (maxX == null || maxX < parseFloat(line[1])){
				maxX = parseFloat(line[1]);
			}
			if (minY == null || minY > parseFloat(line[3])){
				minY = parseFloat(line[3]);
			}
			if (maxY == null || maxY < parseFloat(line[3])){
				maxY = parseFloat(line[3]);
			}
			if (minZ == null || minZ > parseFloat(line[2])){
				minZ = parseFloat(line[2]);
			}
			vertices.push([parseFloat(line[1]), parseFloat(line[3]), parseFloat(line[2])]);
		}
		else if (line.search('f ') == 0){
			while (line.search('  ') != -1){
				line = line.replace(/  /g, ' ');
			}
			line = line.split(' ');
			var face = [];
			for (var j = 1; j<line.length; j++){
				line[j] = line[j].split('/')[0]
				if (offset == null || parseInt(line[j]) < offset){
					offset = line[j];
				}
				if (!isNaN(parseInt(line[j]))){
					face.push(line[j]);
				}
			}
			faces.push(face);
		}
		else if (line.search('vn ') == 0){
			while (line.search('  ') != -1){
				line = line.replace(/  /g, ' ');
			}
			line = line.split(" ");
			normals.push([parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3])]);
		}

	}

	var centerX = minX+(maxX-minX)/2;
	var centerY = minY+(maxY-minY)/2;
	var maxWidth = maxX-minX;
	var maxHeight = maxY-minY;
	var ratioX = maxWidth/(360*(scale/100));
	var ratioY = maxHeight/(280*(scale/100));
	var ratio = null;
	if (ratioX > ratioY){
		ratio = ratioX;
	}
	else{
		ratio = ratioY;
	}

	for (var i in vertices){
		vertices[i][2] -= minZ;
		vertices[i][0] -= centerX;
		vertices[i][1] -= centerY;
		vertices[i][2] = vertices[i][2]/ratio;
		vertices[i][0] = vertices[i][0]/ratio;
		vertices[i][1] = vertices[i][1]/ratio;
	}
	for (var i in faces) {
		var face = faces[i];
		for (var j in face){
			face[j] -= offset;
		}
	}
	for (var i in faces) {
		var face = faces[i];
		for (var j = 0; j < face.length; j++){
			var alreadyAdded = false;
			for (var k in edges){
				if (edges[k].indexOf(face[j]) != -1 && edges[k].indexOf(face[(j+1)%face.length]) != -1){
					alreadyAdded = true;
					break;
				}
			}
			if (!alreadyAdded){
				edges.push([face[j], face[(j+1)%face.length]]);
			}
		}
	}
	return {coordinates: vertices, edges:edges, faces:faces, marker:[]};
}