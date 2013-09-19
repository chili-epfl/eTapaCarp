satParser = function(file,scale){
	var sat = file.split('\n');
	var vertices = [];
	var verticesLine = {};
	var edges = [];
	var edgesLine = {};
	var faces = [];
	var offset = -1;
	var bodyFound = false;
	var lump = -1;
	var minX = null;
	var minY = null;
	var minZ = null;
	var maxX = null;
	var maxY = null;
	var maxZ = null;
	for(var i in sat){
		var line = sat[i].replace(/\$/g, '');
		if (line.search('body') == 0 && !bodyFound){
            offset = parseInt(i);
            lump = line.split(" ")[2].replace(/\$/g,"");  
            bodyFound = true;
        }
		if (line.search('vertex') == 0){
			var lsplit = line.split(" ");
		    var i1 = parseInt(lsplit[2]) + offset;
		    var i2 = parseInt(lsplit[3]) + offset;
		    var point = sat[i2].trim().replace(/\$/g, '').split(" ");
		    var x = parseFloat(point[2]);
		    var y = parseFloat(point[3]);
		    var z = 0;
		    if (x < minX || minX == null){
		    	minX = x;
		    }
		    if (x > maxX || maxX == null){
		    	maxX = x;
		    }
		    if (y < minY || minY == null){
		    	minY = y;
		    }
		    if (y > maxY || maxY == null){
		    	maxY = y;
		    }
		    if (z < minZ || minZ == null){
		    	minZ = z;
		    }
		    if (z > maxZ || maxZ == null){
		    	maxZ = z;
		    }
		    if (point[4] != "#"){
		    	z = parseFloat(point[4]);
		    }
		    verticesLine[i-offset] = vertices.length;
		    vertices.push([x,y,z]);
		}
		if (line.search('edge') == 0){
			var e = line.split(" ");
		    var isReversed = false;
		    if (e[8] == "reversed"){
				isReversed = true;
			}
		    
		    var v0 = parseInt(e[2]);
		    var v1 = parseInt(e[4]);
		    edgesLine[i-offset] = edges.length;
		    edges.push([v0,v1]);
		}
		if (line.search('face') == 0){
			var face = [];
		    var f = line.split(" ");
		    var loop = sat[parseInt(f[3])+offset].replace(/\$/g, '').split(" ");
		    var c0Index = loop[3];
		    var coedge = sat[parseInt(c0Index)+offset];
		    var cIndex = c0Index;	    
		    var cNextIndex = -1;
		    while (cNextIndex != c0Index){
				var isReversed = false;
				var coedgeSplit = coedge.replace(/\$/g, '').split(" ");
				var edgeIndex = coedgeSplit[5];
				cNextIndex = coedgeSplit[2];
				if (coedgeSplit[6] == "reversed"){
				    isReversed = true
				}
				face.push(edgeIndex);
				cIndex = cNextIndex;
				coedge = sat[parseInt(cIndex)+offset];
			}	 
					
		    faces.push(face);
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
	convertEdgeIndex(edges, vertices, verticesLine);
	convertFaceIndex(faces, edges, edgesLine);
	return {coordinates: vertices, edges: edges, faces: faces, marker:[]};
}

function convertEdgeIndex(edges, vertices, verticesLine){
	for (var i in edges){
		var v0 = edges[i][0];
		var v1 = edges[i][1];
		edges[i][0] = verticesLine[v0];
		edges[i][1] = verticesLine[v1];
	}
}

function convertFaceIndex(faces, edges, edgesLine){
	for (var i in faces){
		var face = [];
		for (var j in faces[i]){
			var edge = faces[i][j];
			var vertices = edges[edgesLine[edge]];
			if (face.length < 2){
				face = vertices;
			}
			else if (face.indexOf(vertices[0]) == -1){
				if (face.indexOf(vertices[1]) == 0){
					var newFace = [];
					newFace.push(vertices[0]);
					for (var k in face){
						newFace.push(face[k]);
					}
					face = newFace;
				}
				else{
					face.push(vertices[0]);
				}
			}
			else if (face.indexOf(vertices[1]) == -1){
				if (face.indexOf(vertices[0]) == 0){
					var newFace = [];
					newFace.push(vertices[1]);
					for (var k in face){
						newFace.push(face[k]);
					}
					face = newFace;
				}
				else{
					face.push(vertices[1]);
				}
			}
		}
		faces[i] = face;
	}
}