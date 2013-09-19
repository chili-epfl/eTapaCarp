findMarkerPosition = function(angle,view,model){
	var geometries = [];
	var tagGeo = new THREE.Geometry();
	tagGeo.vertices = [new THREE.Vector3(0,0,0),new THREE.Vector3(32,0,0),new THREE.Vector3(32,32,0),new THREE.Vector3(0,32,0)];
	tagGeo.faces = [new THREE.Face4(0,1,2,3)];
	var tag = new THREE.Mesh(tagGeo, new THREE.MeshBasicMaterial());
	var highestFace = [0,180];
	model.marker = [];
	//faces with at least two points at the same height
	for (var i in view.tempObject.faces){
		var mesh = view.tempObject.faces[i];
		var heights = [];
		var highestZ = 0;
		var heightsOK = false;
		var angleOK = false;
		for (var j in mesh.geometry.vertices){
			var vertex = mesh.geometry.vertices[j];
			if (vertex.z > highestZ){
				highestZ = Math.round(vertex.z);
			}
			if (heights.indexOf(vertex.z) == -1){
				heights.push(vertex.z);
			}
			else{
				heightsOK = true;
			}
			if (heights.length == 1 && heights[0] == 0){
				heightsOK = false;
			}
		}
        var M = mesh.geometry.faces[0].normal.clone();
        var N = new THREE.Vector3(0,0,1);
        var rot = Math.acos(M.dot(N))*180/Math.PI;
		if (rot < angle || 180-rot < angle){
			angleOK = true;
		}
		if (heightsOK && angleOK){
            mesh.geometry.computeFaceNormals();
            var M = mesh.geometry.faces[0].normal.clone();
            var N = new THREE.Vector3(0,0,1);
            var c = M.dot(N);
            var s = Math.sqrt(1-c*c);
            var C = 1-c;
            var axis = new THREE.Vector3().crossVectors(M,N).normalize();
            var x = axis.x;
            var y = axis.y;
            var z = axis.z;
            var rmat = new THREE.Matrix4(x*x*C+c, x*y*C-z*s, x*z*C+y*s, 0,
                                        y*x*C+z*s, y*y*C+c, y*z*C-x*s, 0,
                                        z*x*C-y*s, z*y*C+x*s, z*z*C+c, 0,
                                            0,         0,        0,    1);
            mesh.geometry.applyMatrix(rmat);
			mesh.geometry.computeBoundingBox();
            var Points2D = [];
        	var width = mesh.geometry.boundingBox.max.x-mesh.geometry.boundingBox.min.x;
        	var height = mesh.geometry.boundingBox.max.y-mesh.geometry.boundingBox.min.y;
        	var centerX = mesh.geometry.boundingBox.center().x;
        	var centerY = mesh.geometry.boundingBox.center().y;
            for (var j in mesh.geometry.vertices){
                var vertex = mesh.geometry.vertices[j];
                Points2D.push(new THREE.Vector2(vertex.x-mesh.geometry.boundingBox.min.x, vertex.y-mesh.geometry.boundingBox.min.y));
            }
            var randPoints = [];
	      	var geo = new THREE.ShapeGeometry(new THREE.Shape(Points2D));
	      	var mymesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:0x000000, side: THREE.DoubleSide}));
      		mymesh.geometry.applyMatrix(new THREE.Matrix4(1,0,0,-width/2, 0,1,0,-height/2, 0,0,1,0, 0,0,0,1));
        	var camera =  new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, -1000, 1000 );
		    camera.position.x = 0;
		    camera.position.y = 0;
		    camera.position.z = 100;
            for (var j = 0; j < 15; j++){
            	for (var k = 0; k < 15; k++){
	            	var x = width/15*j; 
	            	var y = height/15*k;
	            	var point =  new THREE.Vector3(x,y,mesh.geometry.boundingBox.min.z);
				    var projector = new THREE.Projector();
				    var vector = new THREE.Vector3((point.x)/width*2-1,-(point.y)/height*2+1,0.5);
			      	raycaster = projector.pickingRay( vector, camera);
			      	var intersects = raycaster.intersectObject(mymesh);
	            	if (intersects.length > 0){
	        			randPoints.push(intersects[0].point);
	            	}
            	}
            }
    		var max = [0,null];
            for (var j in randPoints){
            	var point = randPoints[j];
        		var minDist = [null,null];
        		for (var k = 0; k < mymesh.geometry.vertices.length; k++){
            		var segmentPoint1 = mymesh.geometry.vertices[k];
            		var segmentPoint2 = mymesh.geometry.vertices[(parseInt(k)+1)%model.faces[i].length];
            		var dist = distancePointToSegment(point, segmentPoint1, segmentPoint2);
            		if (dist[0] < minDist[0] || minDist[0] == null){
            			minDist[0] = dist[0];
            			minDist[1] = new THREE.Vector3(-mesh.geometry.boundingBox.min.x-width/2,-mesh.geometry.boundingBox.min.y-height/2,0);
            			minDist[1].x = centerX-point.x;
            			minDist[1].y = centerY-point.y;
            			if (rot >= 180){
	            			minDist[1].x = -centerX-point.x;
	            			minDist[1].y = -centerY-point.y;
            			}
            		}
        		}
            	if (minDist[0] > max[0]){
            		max = minDist;
            	}
            }
            
            if (max[0] > Math.sqrt(27*27+27*27)/2){
            	if (highestZ >= highestFace[0]){
            		if (rot < highestFace[1]){
	            		model.marker = [i, max[1]];
	            		highestFace = [highestZ, rot];
            		}
            		else if (180-rot < highestFace[1]){
	            		model.marker = [i, max[1]];
	            		highestFace = [highestZ, rot];
            		}
            	}
            }
		}
	}
	if (highestFace[0] == 0){
		alert(Session.get('lang').NoPlaceFound);
	}
	else{
		$('#saveObject').removeClass('disabled')
	}
	
	return model.marker;
}