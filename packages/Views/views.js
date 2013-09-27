var WS_WIDTH = 360.0;
var WS_HEIGHT = 280.0;
var ACTIVITYSHAPES = [];
var ACTIVITYTRANSLATION = [];
var ACTIVITYROTATION = [];
var COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xf0f0f0];

function View(name) {
    this.name = name;
    this.dynamic = true;
    this.difficulty = 1;
    this.click = null;
    // this.isNotJittering = false;
    this.scene = new THREE.Scene();
    this.transparency = true;
    this.axis = true;
    this.brickManager = new BrickManager();
    // this.changedLayout = true;
    this.edges = [];
    this.faces = [];
    this.axisObjects = [];
    this.selected = {};
    this.edgesToSelect = [];
    this.model = false;
    this.helpLines = [];
    this.levels = {};
    this.levelLines = [];
    this.tempObject = {points:[], texts:[], edges:[], stippledEdges:[], faces:[], marker:[]};
    this.markerZ = {};
}

View.prototype.init = function () {

    this.renderer = new THREE.WebGLRenderer({ clearColor: 0xffffff, clearAlpha: 1, antialias: true});

    this.container = document.getElementById(this.name);
    this.container.appendChild(this.renderer.domElement);
    this.setCamera();
};

View.prototype.setClick = function(click){
    this.click = click;
}

View.prototype.setCamera = function () {};

View.prototype.addStaticBricks = function(bricks) {
	for (i in bricks) {
		var b = bricks[i]
		this.brickManager.addStaticBrick(b);
		this.addBrickToScene(b);
	}
}

View.prototype.render = function (markers) {
	if (this.click){
		this.selectEdge();
	}
	if (this.dynamic) {
		this.clear();
		for (var i in markers) {
			var marker = markers[i];
			this.createObjects(marker.id);
		}
		this.computeNewPositions(markers);
	} else {
		this.init_objects();
	}
	
	if (this.axis) 
		this.showAxis();
	else
		this.showGrid();
	
	this.renderer.setSize(this.width, this.height);
	this.renderer.render(this.scene, this.camera);
};

View.prototype.renderTempObject = function(model, addNumbers){
    for (var i in this.tempObject){
        for (var j in this.tempObject[i]){
            this.scene.remove(this.tempObject[i][j]);
        }
        this.tempObject[i] = [];
    }
    if (model.edges.length > 0){
        var edges = this.shapeLines(model);
        for (var i in edges){
            if(this.transparency){
                var lineDashedMaterial = new THREE.LineDashedMaterial({color: 0x2E9AFE, depthTest: false, linewidth: 2});
                edges[i].computeLineDistances();
                var line1 = new THREE.Line(edges[i], lineDashedMaterial);
                line1.renderDepth = 9007199254740992;
                this.tempObject.stippledEdges.push(line1);
                this.scene.add(line1);
            }
            var lineMaterial = new THREE.LineBasicMaterial({color: 0x2E9AFE, depthTest: true, linewidth: 2});
            var line2 = new THREE.Line(edges[i], lineMaterial);
            this.tempObject.edges.push(line2);
            this.scene.add(line2);
        }
    }
    for (var i in model.coordinates){
        var point = model.coordinates[i];
        var geo = new THREE.SphereGeometry(2);
        var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0x000000}));
        mesh.geometry.applyMatrix(new THREE.Matrix4(1,0,0,point[0], 0,1,0,point[1], 0,0,1,point[2], 0,0,0,1));
        this.tempObject.points.push(mesh);
        this.scene.add(mesh);

        if (addNumbers){
            var textGeo = new THREE.TextGeometry(i,{size: 7, height:5});
            var text = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({color: 0x000000, depthTest: false}));
            text.renderDepth = 9007199254740992;
            text.rotation.x = this.camera.rotation.x;
            text.rotation.y = this.camera.rotation.y;
            text.rotation.z = this.camera.rotation.z;
            text.position.x = point[0];
            text.position.y = point[1];
            text.position.z = point[2];
            // text.geometry.applyMatrix(new THREE.Matrix4(1,0,0,point[0], 0,1,0,point[1], 0,0,1,point[2], 0,0,0,1));
            this.tempObject.texts.push(text);
            this.scene.add(text);
        }
    }
    for (var i in model.faces){
        var meshMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc, side: THREE.DoubleSide, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
        var face = model.faces[i];
        var points = model.coordinates;
        if (face.length == 3){
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(points[face[0]][0], points[face[0]][1], points[face[0]][2]));
            geometry.vertices.push(new THREE.Vector3(points[face[1]][0], points[face[1]][1], points[face[1]][2]));
            geometry.vertices.push(new THREE.Vector3(points[face[2]][0], points[face[2]][1], points[face[2]][2]));
            geometry.faces.push(new THREE.Face3(0,1,2));
            var mesh = new THREE.Mesh(geometry, meshMaterial);
            this.tempObject.faces.push(mesh);
            this.scene.add(mesh);

        }
        else{
            //To create faces we need to rotate its 3D plane to 2D plane, triangulate, then rotate back
            var geometry = new THREE.Geometry();
            for(var j in face){
                var point = face[j];
                geometry.vertices.push(new THREE.Vector3(points[point][0],points[point][1],points[point][2]));
            }
            geometry.faces.push(new THREE.Face3(0,1,2));
            geometry.computeFaceNormals();
            var M = geometry.faces[0].normal.clone();
            var N = new THREE.Vector3(0,0,1);
            var c = M.dot(N);
            var s = Math.sqrt(1-c*c);
            var C = 1-c;
            var axis = new THREE.Vector3().crossVectors(M,N).normalize();
            var x = axis.x;
            var y = axis.y;
            var z = axis.z;
            var rot = new THREE.Matrix4(x*x*C+c, x*y*C-z*s, x*z*C+y*s, 0,
                                        y*x*C+z*s, y*y*C+c, y*z*C-x*s, 0,
                                        z*x*C-y*s, z*y*C+x*s, z*z*C+c, 0,
                                        0,0,0,1);
            geometry.applyMatrix(rot);
            var Points2D = [];
            var height = 0;
            for (var j in geometry.vertices){
                var vertex = geometry.vertices[j];
                height = vertex.z;
                Points2D.push(new THREE.Vector2(vertex.x, vertex.y));
            }
            var shape = new THREE.Shape( Points2D );
            var geo = new THREE.ShapeGeometry(shape);
            var mesh = new THREE.Mesh(geo, meshMaterial);
            var translate = new THREE.Matrix4(1,0,0,0, 0,1,0,0, 0,0,1,height, 0,0,0,1);
            mesh.geometry.applyMatrix(translate);
            var c = N.dot(M);
            var s = Math.sqrt(1-c*c);
            var C = 1-c;
            var axis = new THREE.Vector3().crossVectors(N,M).normalize();
            var x = axis.x;
            var y = axis.y;
            var z = axis.z;
            var rot = new THREE.Matrix4(x*x*C+c, x*y*C-z*s, x*z*C+y*s, 0,
                                        y*x*C+z*s, y*y*C+c, y*z*C-x*s, 0,
                                        z*x*C-y*s, z*y*C+x*s, z*z*C+c, 0,
                                        0,0,0,1);
            mesh.geometry.applyMatrix(rot);
            this.tempObject.faces.push(mesh);
            this.scene.add(mesh);
            if (model.marker.length > 0){
                if (model.marker[0] == i){
                    var markerGeo = new THREE.CubeGeometry(27,27,0);
                    var marker = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({color: 0x000000}));
                    var markerGeo2 = new THREE.CubeGeometry(37,37,0);
                    var marker2 = new THREE.Mesh(markerGeo2, new THREE.MeshBasicMaterial({color: 0xffffff}));
                    marker.geometry.applyMatrix(new THREE.Matrix4(1,0,0,model.marker[1].x, 0,1,0,model.marker[1].y, 0,0,1,model.marker[1].z, 0,0,0,1));
                    marker.geometry.applyMatrix(translate);
                    marker.geometry.applyMatrix(rot);
                    marker2.geometry.applyMatrix(new THREE.Matrix4(1,0,0,model.marker[1].x, 0,1,0,model.marker[1].y, 0,0,1,model.marker[1].z, 0,0,0,1));
                    marker2.geometry.applyMatrix(translate);
                    marker2.geometry.applyMatrix(rot);
                    marker.position.z += 1;
                    
                    this.tempObject.marker = [marker, marker2];
                    this.scene.add(marker);
                    this.scene.add(marker2);
                    
                }
            }
            
        }
    }
    if (model.marker.length > 0 && model.markerZ == null){
        var maxX = minY = maxZ = null;
        for (var j in this.tempObject.marker[0].geometry.vertices){
            var vertex = this.tempObject.marker[0].geometry.vertices[j];
            if (maxZ == null || maxZ < vertex.z){
                maxZ = vertex.z;
            }
            if (maxX == null || maxX < vertex.x){
                maxX = vertex.x;
            }
            if (minY == null || minY > vertex.y){
                minY = vertex.y;
            }
        }
        model.markerZ = maxZ;
        model.coordinates = [];
        for (var i in this.tempObject){
            if (i != 'edges' && i != 'stippledEdges'){
                for (var j in this.tempObject[i]){
                    var mesh = this.tempObject[i][j];
                    mesh.geometry.applyMatrix(new THREE.Matrix4(1,0,0,-maxX, 0,1,0,-minY, 0,0,1,0, 0,0,0,1));
                    if (i == 'points'){
                        mesh.geometry.computeBoundingBox();
                        var center = mesh.geometry.boundingBox.center();
                        model.coordinates.push([center.x, center.y, center.z]);
                    }
                }
            }
            else{
                for (var j in this.tempObject[i]){
                    var mesh = this.tempObject[i][j];
                    if (this.transparency){
                        mesh.geometry.applyMatrix(new THREE.Matrix4(1,0,0,-maxX/2, 0,1,0,-minY/2, 0,0,1,0, 0,0,0,1));
                    }
                    else{
                        mesh.geometry.applyMatrix(new THREE.Matrix4(1,0,0,-maxX, 0,1,0,-minY, 0,0,1,0, 0,0,0,1));
                    }
                }
            }
        }
        model.marker[1] = new THREE.Vector3(-13.5,13.5,0);
    }
    this.renderer.render(this.scene, this.camera);
}

View.prototype.setDynamic = function (bool) {
    this.dynamic = bool;
};

View.prototype.clear = function () {
    for(var i in this.brickManager.bricks){
        this.brickManager.bricks[i].changeVisibility(false);
    }
    for(var i in this.levelLines){
        this.scene.remove(this.levelLines[i]);
    }
    for(var i in this.helpLines){
        this.scene.remove(this.helpLines[i]);
    }
    for (var i in this.axisObjects){
        this.scene.remove(this.axisObjects[i]);
    }
    for (var i in this.texts){
        this.scene.remove(this.texts[i]);
    }
    this.texts = [];
    this.levelLines = [];
    this.helpLines = [];
    this.axisObjects = [];
    this.renderer.clear();
};

View.prototype.addBrickToScene = function(brick) {
	for (var i in brick.stippledLines) 
		this.scene.add(brick.stippledLines[i]);
	for (var i in brick.lines) 
		this.scene.add(brick.lines[i]);

	this.scene.add(brick.faces);		
}


View.prototype.createObjects = function (markerId) {
    if (!this.brickManager.bricks[markerId]) {
		var brick = new Brick(markerId);
        this.brickManager.addBrick(brick);
		this.addBrickToScene(brick)
    }
    else{
        this.brickManager.bricks[markerId].changeVisibility(true);
        this.brickManager.bricks[markerId].setSelectedToRed();
        this.brickManager.bricks[markerId].setRotationAndTranslation(0,{x:0,y:0});
    }
};


View.prototype.init_objects = function(){
    this.clear();
    for (var j = 0; j<ACTIVITYSHAPES.length; j++){
        var thisShape = ACTIVITYSHAPES[j];
        this.createObjects(thisShape);
        for (var k in this.edges[thisShape]){
            var object = this.edges[thisShape][k];
            object.rotation.z = ACTIVITYROTATION[thisShape];
            object.position.x = ACTIVITYTRANSLATION[thisShape][0];
            object.position.y = ACTIVITYTRANSLATION[thisShape][1];
        }
        for (var k in this.faces[thisShape]){
            var object = this.faces[thisShape][k];
            object.rotation.z = ACTIVITYROTATION[thisShape];
            object.position.x = ACTIVITYTRANSLATION[thisShape][0];
            object.position.y = ACTIVITYTRANSLATION[thisShape][1];
        }
    }
}

View.prototype.computeNewPositions = function (markers) {
    var numMarkers = 0;
    for (var k in this.brickManager.bricks) {
        var brick = this.brickManager.bricks[k];
        for (var l in markers) {
            numMarkers++;
            var marker = markers[l];
            if (k == marker.id) {
                var Z = brick.markerZ;
                var marker_position = [marker.corners[0].x, marker.corners[0].y, 1];
                var marker_position2 = [marker.corners[1].x, marker.corners[1].y, 1];
                var position = pixel2mm(marker_position[0], marker_position[1], Z);
                var position2 = pixel2mm(marker_position2[0], marker_position2[1], Z);
                var rotation = this.calculateRotation(position, position2);
                brick.setRotationAndTranslation(rotation, {x:position.x,y:position.y});
            }
        }
    }
    if (numMarkers == 1){
        this.separateEdges();
    }
};

View.prototype.selectEdge = function(click){
        var position = {x:null,y:null};
        if (navigator.vendor == "Google Inc."){
            position.x = click.layerX;
            position.y = click.layerY;
        }
        else{
            position.x = click.clientX-click.originalTarget.offsetLeft;
            position.y = click.clientY-click.originalTarget.offsetTop;
        }
        var camera = this.camera;
        var vector = new THREE.Vector3( ( position.x / click.target.width ) * 2 - 1,
                                        -( position.y / (click.target.height) )*2  +1,
                                        0.5  );
        var projector = new THREE.Projector();
        var raycaster;
        /* for perspective cameras */
        if (this.camera instanceof THREE.PerspectiveCamera){
            projector.unprojectVector( vector, camera);
            raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
            raycaster.linePrecision = 3;

        }
        /* for orthographic cameras */
        else{
            raycaster = projector.pickingRay( vector, camera);
            raycaster.linePrecision = 3;
        }
        for (var j in this.brickManager.bricks){
            var brick = this.brickManager.bricks[j];
            var alllines = [];
            for (var i in brick.lines){
                alllines.push(brick.lines[i])
                alllines.push(brick.stippledLines[i])
            }
            var intersects = raycaster.intersectObjects( alllines );
            if (intersects.length > 0){
//                this.changedLayout = true;
                if (intersects.length > 2){
                    this.edgesToSelect = [];
                    for (var i in intersects){
                        var currentObject = intersects[i].object;
                        var rot = currentObject.rotation.z;
                        var realPosition = {x:null, y:null};
                        var y = (intersects[i].point.y - intersects[i].point.x * Math.sin(rot) / Math.cos(rot) + currentObject.position.x * Math.sin(rot) / Math.cos(rot) - currentObject.position.y) / (Math.sin(rot)*Math.sin(rot)/Math.cos(rot)+Math.cos(rot));
                        var x = (intersects[i].point.x + y * Math.sin(rot) - currentObject.position.x) / Math.cos(rot);
                        intersects[i].point.x = x;
                        intersects[i].point.y = y;
                        this.edgesToSelect.push({object: intersects[i].object, point: intersects[i].point});
                    }
                }
                else {
                    for (var i = 0; i < intersects.length; i++ ) {
                        var currentObject = intersects[i].object;
                        for (var j = 0; j < this.edgesToSelect.length; j++){
                            if (currentObject.id == this.edgesToSelect[j].object.id){
                                this.edgesToSelect = [];
                            }
                        }
                        if (currentObject.selected){
                            currentObject.material.color.setHex( 0x000000 );
                            currentObject.material.linewidth = 1;
                            currentObject.selected = false;
                            delete brick.selectedLines[currentObject.id];
                        }
                        else{
                            currentObject.material.color.setHex( 0xff0000 );
                            brick.selectedLines[currentObject.id] = currentObject;
                            currentObject.selected = true;
                        }
                    }   
                }
            }
        }
};

View.prototype.calculateRotation = function (vector1, vector2) {
    var rotation;
    var diffx = -(vector1.x - vector2.x);
    var diffy = -(vector1.y - vector2.y);
    if (diffx < 0){
        rotation = Math.atan(diffy/diffx);
    }
    else if (diffx == 0){
        if (diffy > 0){
            rotation = Math.PI/2;
        }
        else{
            rotation = 3*Math.PI/2;
        }
    }
    else if (diffy >= 0){
        rotation = -Math.PI+Math.atan(diffy/Math.abs(diffx));
    }
    else if (diffy < 0){
        rotation = -Math.PI-Math.atan(Math.abs(diffy)/Math.abs(diffx));
    }
    return rotation
};

View.prototype.updateActivity2Feedback = function(markers){
    var count = [];
    for (var i in markers){
        var marker = markers[i];
        if (count.indexOf(marker.id) == -1){
            count.push(marker.id);
        }
        for (var j = 0; j<ACTIVITYSHAPES.length; j++){
            if (marker.id == ACTIVITYSHAPES[j]){
                var td1 = $($('#rowShape'+marker.id).children()[1]);
                if (td1.children().length == 0){
                    td1.append('<i class="icon-ok"></i>');
                }
                var Z = this.markerZ[marker.id];
                var marker_position = [marker.corners[0].x, marker.corners[0].y,1];
                var marker_position2 = [marker.corners[1].x, marker.corners[1].y,1];
                position = pixel2mm(marker_position[0], marker_position[1], Z);
                position2 = pixel2mm(marker_position2[0], marker_position2[1], Z);
                var rotation;
                var diffx = position.x-position2.x;
                var diffy = position.y-position2.y;
                if (diffy == 0){
                    diffy = 1;
                }
                if ((diffx < 0 && diffy > 0) || (diffx > 0 && diffy > 0)){
                    rotation = -Math.atan(diffx/diffy)+Math.PI/2;
                }
                else{
                    rotation = -Math.atan(diffx/diffy)-Math.PI/2;
                }
                var td2 = $($('#rowShape'+marker.id).children()[3]);
                if (Math.abs(rotation - ACTIVITYROTATION[marker.id]) < 0.2){
                    if (td2.children().length == 0){
                        td2.append('<i class="icon-ok"></i>');
                    }
                }
                else{
                    if (td2.children().length > 0){
                        td2.children().remove();
                    }
                }
                var td3 = $($('#rowShape'+marker.id).children()[2]);
                if (Math.abs(position.x - ACTIVITYTRANSLATION[marker.id][0]) < 20 && Math.abs(position.y - ACTIVITYTRANSLATION[marker.id][1]) < 20){
                    if (td3.children().length == 0){
                        td3.append('<i class="icon-ok"></i>');
                    }
                }
                else{
                    if (td3.children().length > 0){
                        td3.children().remove();
                    }
                }
            }
        }
    }
    for (var j = 0; j<ACTIVITYSHAPES.length; j++){
        if (count.indexOf(ACTIVITYSHAPES[j]) == -1){
            var td1 = $($('#rowShape'+ACTIVITYSHAPES[j]).children()[1]);
            if (td1.children().length > 0){
                td1.children().remove();
            }
        }
    }
};

View.prototype.edgeToSelect = function(markerId, difficulty){
    var brick = this.brickManager.bricks[markerId];
    var range = brick.lines.length-1;
    var selectedEdges = [];
    while (selectedEdges.length < difficulty){
        var edge = Math.ceil(Math.random()*range);
        if (selectedEdges.indexOf(edge) == -1){
            selectedEdges.push(edge);
        }
    }
    this.removeSelectedEdges(brick);
    for (var i in selectedEdges){
        var line = brick.lines[selectedEdges[i]];
        var stippledLine = brick.stippledLines[selectedEdges[i]];
        line.selected = true;
        stippledLine.selected = true;
        brick.selectedLines[line.id] = line;
        brick.selectedLines[stippledLine.id] = stippledLine;
    }
    // this.changedLayout = true;
};

View.prototype.removeSelectedEdges = function(){
    for (var j in this.brickManager.bricks){
        var brick = this.brickManager.bricks[j];
        for (var i in brick.selectedLines){
            brick.selectedLines[i].material.color.setHex( 0x000000 );
            brick.selectedLines[i].material.linewidth = 1;
            brick.selectedLines[i].selected = false;
        }
        brick.selectedLines = {};
    }
    // this.changedLayout = true;
}

View.prototype.showAxis = function(){
    var lineMaterial2 = new THREE.LineBasicMaterial({color: 0xff0000});
    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,WS_HEIGHT/2,0));
    line.computeLineDistances();
    var object1 = new THREE.Line(line, lineMaterial2);
    this.axisObjects.push(object1);
    this.scene.add(object1);

    lineMaterial2 = new THREE.LineBasicMaterial({color: 0x00ff00});
    line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,-WS_HEIGHT/2,0));
    line.computeLineDistances();
    var object2 = new THREE.Line(line, lineMaterial2);
    this.axisObjects.push(object2);
    this.scene.add(object2);

    lineMaterial2 = new THREE.LineBasicMaterial({color: 0x0000ff});
    line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,WS_WIDTH/2));
    line.computeLineDistances();
    var object3 = new THREE.Line(line, lineMaterial2);
    this.axisObjects.push(object3);
    this.scene.add(object3);

    var material = new THREE.MeshBasicMaterial({color: 0xffe0ff, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,WS_HEIGHT/2,WS_WIDTH/2));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,WS_WIDTH/2));
    line.faces.push(new THREE.Face3(0,1,2));
    line.faces.push(new THREE.Face3(0,2,3));
    line.computeFaceNormals();
    var object4 = new THREE.Mesh(line, material);
    this.axisObjects.push(object4);
    this.scene.add(object4);

    material = new THREE.MeshBasicMaterial({color: 0xe0ffff,side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,-WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,-WS_HEIGHT/2,WS_WIDTH/2));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,WS_WIDTH/2));
    line.faces.push(new THREE.Face3(0,1,2));
    line.faces.push(new THREE.Face3(0,2,3));
    line.computeFaceNormals();
    var object5 = new THREE.Mesh(line, material);
    this.axisObjects.push(object5);
    this.scene.add(object5);

    material = new THREE.MeshBasicMaterial({color: 0xffffe0,side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,-0.1));
    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,WS_HEIGHT/2,-0.1));
    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,-WS_HEIGHT/2,-0.1));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,-WS_HEIGHT/2,-0.1));
    line.faces.push(new THREE.Face3(0,1,2));
    line.faces.push(new THREE.Face3(0,2,3));
    line.computeFaceNormals();
    var object6 = new THREE.Mesh(line, material);
    this.axisObjects.push(object6);
    this.scene.add(object6);
};

View.prototype.showGrid = function(){
    for (var i = -WS_WIDTH/2; i < WS_WIDTH/2; i += 20){
        var material;
        if (i % 40 != 0){
            material = new THREE.LineBasicMaterial({color: 0x000000});
        }
        else{
            material = new THREE.LineBasicMaterial({color: 0xcccccc});
        }
        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(i,WS_HEIGHT/2,0));
        line.vertices.push(new THREE.Vector3(i,WS_HEIGHT/2,WS_HEIGHT));
        line.computeLineDistances();
        var object = new THREE.Line(line, material);
        this.axisObjects.push(object);
        this.scene.add(object);
    }
    for (var i = -WS_HEIGHT/2; i < WS_HEIGHT/2; i += 20){
        var material;
        if (i % 40 != 0){
            material = new THREE.LineBasicMaterial({color: 0x000000});
        }
        else{
            material = new THREE.LineBasicMaterial({color: 0xcccccc});
        }
        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(WS_WIDTH/2,i,0));
        line.vertices.push(new THREE.Vector3(WS_WIDTH/2,i,270));
        line.computeLineDistances();
        var object = new THREE.Line(line, material);
        this.axisObjects.push(object);
        this.scene.add(object);
    }

    for (var i = -WS_HEIGHT/2; i < WS_HEIGHT/2; i += 20){
        var material;
        if (i % 40 != 0){
            material = new THREE.LineBasicMaterial({color: 0x000000});
        }
        else{
            material = new THREE.LineBasicMaterial({color: 0xcccccc});
        }
        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(WS_WIDTH/2,i,0));
        line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,i,0));
        line.computeLineDistances();
        var object = new THREE.Line(line, material);
        this.axisObjects.push(object);
        this.scene.add(object);
    }
    for (i = -WS_WIDTH/2; i < WS_WIDTH/2; i += 20){
        if (i % 40 != 0){
            material = new THREE.LineBasicMaterial({color: 0x000000});
        }
        else{
            material = new THREE.LineBasicMaterial({color: 0xcccccc});
        }
        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(i,WS_HEIGHT/2,0));
        line.vertices.push(new THREE.Vector3(i,-WS_HEIGHT/2,0));
        line.computeLineDistances();
        object = new THREE.Line(line, material);
        this.axisObjects.push(object);
        this.scene.add(object);
    }
};

FrontView = function(name){
    View.call(this, name);
}
FrontView.prototype = new View();
FrontView.prototype.constructor = FrontView;

FrontView.prototype.setCamera = function(){
    this.width = $(this.container).width();
    this.height = Math.ceil(this.width/(180/140)/2);
    if (this.height*4 > window.innerHeight){
        this.height = window.innerHeight/4;
        this.width = Math.ceil(this.height/(140/180)*2);
    }
    this.camera = new THREE.OrthographicCamera(-WS_WIDTH/2, WS_WIDTH/2, 0, -WS_HEIGHT/2, -600, 600 );
    this.camera.position.z = WS_HEIGHT/2 - 1;
    this.camera.rotation.x = Math.PI/2;
};

FrontView.prototype.separateEdges = function(){
    var count = 0;
    if (this.edgesToSelect.length > 2){
        for (var i in this.edgesToSelect){
            var currentEdge = this.edgesToSelect[i].object;
            
            // currentEdge.position.y -= 300;
            currentEdge.position.z += (count+1)*8;
            currentEdge.material.color = new THREE.Color(COLORS[count]);
            currentEdge.material.linewidth = 3;
            if(i%2 == 1){
                count++;
            }
        }
    }
    count = 0;
    for (var i in this.levels){
        if (i%2 == 1){
            count++;
        }
        else{
            var level = this.levels[i];
            var material = new THREE.LineBasicMaterial({color: COLORS[count],linewidth:3, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
            var line = new THREE.Geometry();
            line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,-200,level.point.z));
            line.vertices.push(new THREE.Vector3(WS_WIDTH/2,-200,level.point.z));
            var object = new THREE.Line(line, material);
            this.levelLines.push(object);
            this.scene.add(object);
            var textGeo = new THREE.TextGeometry(Session.get('lang')['Level']+(count+1),{size: 10, height:10, weight: "bold"});
            var text = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({color: COLORS[count]}));
            text.position.z = level.point.z+2;
            text.position.x = -WS_WIDTH/2+2;
            text.position.y = -300;
            text.rotation.x = Math.PI/2;
            this.texts.push(text);
            this.scene.add(text);
        }
    }
}


SideView = function(name){
    View.call(this, name);
}
SideView.prototype = new View();
SideView.prototype.constructor = SideView;
SideView.prototype.setCamera = function() {
    this.width = $(this.container).width();
    this.height = Math.ceil(this.width/(180/140)/2);
    if (this.height*4 > window.innerHeight){
        this.height = window.innerHeight/4;
        this.width = Math.ceil(this.height/(140/180)*2);
    }
    this.camera = new THREE.OrthographicCamera(-WS_WIDTH/2, WS_WIDTH/2, 0, -WS_HEIGHT/2, -600, 600 );
    this.camera.position.z = WS_HEIGHT/2 - 1;
    this.camera.rotation.z = -Math.PI/2;
    this.camera.rotation.y = -Math.PI/2;
};

SideView.prototype.separateEdges = function(){
    var count = 0;
    if (this.edgesToSelect.length > 2){
        for (var i in this.edgesToSelect){
            var currentEdge = this.edgesToSelect[i].object;
            // currentEdge.position.x -= 300;
            currentEdge.position.z += (count+1)*8;
            currentEdge.material.color = new THREE.Color(COLORS[count]);
            currentEdge.material.linewidth = 3;
            if (i%2 == 1){
                count++;
            }
        }
    }
    count = 0;
    for (var i in this.levels){
        if (i%2 == 1){
            count++;
        }
        else{
            var level = this.levels[i];
            var material = new THREE.LineBasicMaterial({color: COLORS[count],linewidth:3, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
            var line = new THREE.Geometry();
            line.vertices.push(new THREE.Vector3(-300,-WS_HEIGHT/2,level.point.z));
            line.vertices.push(new THREE.Vector3(-300,WS_HEIGHT/2,level.point.z));
            var object = new THREE.Line(line, material);
            this.levelLines.push(object);
            this.scene.add(object);
            var textGeo = new THREE.TextGeometry(Session.get('lang')['Level']+(count+1),{size: 10, height:10, weight: "bold"});
            var text = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({color: COLORS[count]}));
            text.position.z = level.point.z+2;
            text.position.y = WS_HEIGHT/2-2;
            text.rotation.y = -Math.PI/2;
            text.rotation.x = Math.PI/2;
            text.position.x = -300;
            this.texts.push(text);
            this.scene.add(text);
        }
    }
}

TopView = function(name){
    View.call(this, name);
}

TopView.prototype = new View();
TopView.prototype.constructor = TopView;

TopView.prototype.setCamera = function() {
    this.width = $(this.container).width();
    this.height = Math.ceil(this.width/(180/140));
    if (this.height*2 > window.innerHeight){
        this.height = window.innerHeight/2;
        this.width = Math.ceil(this.height/(140/180));
    }
    this.camera =  new THREE.OrthographicCamera(-WS_WIDTH/2, WS_WIDTH/2, WS_HEIGHT/2, -WS_HEIGHT/2, 1, 1000 );
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = WS_WIDTH/2;
    this.camera.lookAt(new THREE.Vector3( 0, 0, -WS_WIDTH/2 ));
};

TopView.prototype.clear = function () {
    for(var i in this.edges){
        for (var j in this.edges[i]){
            this.edges[i][j].visible = false;
        }
    }
    for(var i in this.faces){
        for (var j in this.faces[i]){
            this.faces[i][j].visible = false;
        }
    }
    for(var i in this.levelLines){
        this.scene.remove(this.levelLines[i]);
    }
    for(var i in this.helpLines){
        for (var j in this.helpLines[i]){
            this.scene.remove(this.helpLines[i][j]);
        }
    }
    for (var i in this.axisObjects){
        this.scene.remove(this.axisObjects[i]);
    }
    for (var i in this.texts){
        this.scene.remove(this.texts[i]);
    }
    this.texts = [];
    this.levelLines = [];
    this.helpLines = [];
    this.axisObjects = [];
    this.renderer.clear();
};

TopView.prototype.separateEdges = function(){
    var that = this;
    var count = 0;
    if (this.edgesToSelect.length > 2){
        for (var i in this.edgesToSelect){
            var currentEdge = this.edgesToSelect[i].object;
            var originalEdgeRotation = this.calculateRotation(currentEdge.geometry.vertices[0], currentEdge.geometry.vertices[1]);
            var rotation = currentEdge.rotation.z;
            currentEdge.position.x -= (count+1)*8*Math.cos(rotation+Math.PI/2-originalEdgeRotation);
            currentEdge.position.y -= (count+1)*8*Math.sin(rotation+Math.PI/2-originalEdgeRotation);
            currentEdge.material.color = new THREE.Color(COLORS[count]);
            currentEdge.material.linewidth = 3;
            currentEdge.position.z += 50+(count+1)*5;
            if (i%2 == 1){
                count++;
            }
        }
    }
    for (var i in this.levels){
        var count = 0;
        for (var j in this.levels[i]){
            
            if (j%2 == 1){
                count++;
            }
            else{
                var level = this.levels[i][j];
                var material = new THREE.LineBasicMaterial({color: COLORS[count],linewidth:3, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
                var line = new THREE.Geometry();
                var textGeo = new THREE.TextGeometry(Session.get('lang')['Level']+(count+1),{size: 10, height:10, weight: "bold"});
                var text = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({color: COLORS[count]}));
                var x = level.point.x*Math.cos(level.object.rotation.z)-level.point.y*Math.sin(level.object.rotation.z)+level.object.position.x;
                var y = level.point.x*Math.sin(level.object.rotation.z)+level.point.y*Math.cos(level.object.rotation.z)+level.object.position.y;
                if (i == "x"){
                    line.vertices.push(new THREE.Vector3(x,-WS_HEIGHT/2,100));
                    line.vertices.push(new THREE.Vector3(x,WS_HEIGHT/2,100));
                    text.position.z = 150;
                    text.position.y = WS_HEIGHT/2-count*15-12;
                    text.position.x = x+2;
                }
                else{                   
                    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,y,100));
                    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,y,100));
                    text.position.z = 150;
                    text.position.x = -WS_WIDTH/2+count*60+2;
                    text.position.y = y+2;
                }
                var object = new THREE.Line(line, material);
                this.levelLines.push(object);
                this.scene.add(object);
                this.texts.push(text);
                this.scene.add(text);
            }
        }
    }
}

PerspectiveView = function(name){
    View.call(this, name);
}

PerspectiveView.prototype = new View();
PerspectiveView.prototype.constructor = PerspectiveView;

PerspectiveView.prototype.setCamera = function() {
    this.width = $(this.container).width();
    this.height = Math.ceil(this.width/(180/140));
    if (this.height*2 > window.innerHeight){
        this.height = window.innerHeight/2;
        this.width = Math.ceil(this.height/(140/180));
    }
    this.camera =  new THREE.PerspectiveCamera( 50, WS_WIDTH/WS_HEIGHT, 1, 1000 );
    this.camera.position.x = 0;
    this.camera.position.y = -300;
    this.camera.position.z = 200;
    this.camera.lookAt(new THREE.Vector3( 0, 200, -200 ));
};

PerspectiveView.prototype.separateEdges = function(){
}