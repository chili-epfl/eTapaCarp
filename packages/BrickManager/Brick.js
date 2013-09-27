Brick = function(id){
	this.id = id;
	this.lines = [];
	this.stippledLines = [];
	this.selectedLines = {};
	this.faces = null;
	this.translation = {x: 0, y:0};
	this.rotation = 0;
	this.transparency = true;
	this.visibility = true;
	this.markerZ = null;
	this.init();
}

Brick.prototype.init = function(){
	this.createLines();
	this.createFaces();
}

Brick.prototype.clone = function() {
	var newBrick = new Brick(this.id);
	newBrick.setRotationAndTranslation(this.rotation, this.translation);
	return newBrick;
}

Brick.cloneBricks = function(bricks) {
	var clonedBricks = {}
	for (i in bricks)
		clonedBricks[i] = bricks[i].clone()
	return clonedBricks
}

Brick.prototype.changeVisibility = function(visibility){
	this.visibility = visibility;
	for (var i in this.lines){
		this.lines[i].visible = visibility;
	}
	this.changeStippledLinesVisibility();
	this.faces.visible = visibility;
}

Brick.prototype.changeStippledLinesVisibility = function(){
	var visibility = this.transparency && this.visibility;
	for(var i in this.stippledLines){
		this.stippledLines[i].visible = visibility;
	}
}

Brick.prototype.createLines = function(){
    var model = Session.get('shapes')[this.id];
	this.markerZ = model.markerZ;
	var geometries = [];
	var points = model.coordinates;
	var edges = model.edges;
	for (var i = 0; i < edges.length; i++) {
		var geometry = new THREE.Geometry();
    	var edge = edges[i];
    	geometry.vertices.push(new THREE.Vector3(points[edge[0]][0], points[edge[0]][1], points[edge[0]][2]));
    	geometry.vertices.push(new THREE.Vector3(points[edge[1]][0], points[edge[1]][1], points[edge[1]][2]));
    	geometries.push(geometry);
	}
	for (var i = 0; i < geometries.length; i++){
		geometries[i].computeLineDistances();
		var lineDashedMaterial = new THREE.LineDashedMaterial({color: 0x000000, depthTest: false});
		var stippledLine = new THREE.Line(geometries[i], lineDashedMaterial);
		var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, depthTest: true});
		var line = new THREE.Line(geometries[i], lineMaterial);
		//To fix problem with stippled lines not showing
		stippledLine.renderDepth = 9007199254740992;
            
        stippledLine.selected = false;
        stippledLine.visible = this.transparency && this.visibility;
        this.stippledLines[i] = stippledLine;

        line.selected = false;
        line.visible = this.visibility;
        this.lines[i] = line;
    }
}

Brick.prototype.createFaces = function(){
    var model = Session.get('shapes')[this.id];
    var geometry = new THREE.Geometry();
    var points = model.coordinates;
    var faces = model.faces;
    for (var i = 0; i < points.length; i++) {
        geometry.vertices.push(new THREE.Vector3(points[i][0], points[i][1], points[i][2]));
    }
    for (var j = 0; j < faces.length; j++) {
        var face = faces[j];
        for (var k = 0; k < face.length - 2; k++) {
            geometry.faces.push(new THREE.Face3(face[0], face[k + 1], face[k + 2]));
        }
    }

    var meshMaterial = new THREE.MeshBasicMaterial({color: false, side: THREE.DoubleSide, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    var faces = new THREE.Mesh(geometry, meshMaterial);
    this.faces = faces;
}

Brick.prototype.setSelectedToRed = function(){
    for (var j in this.lines){
        var line = this.lines[j]
        if (line.selected){
            line.material.color.setHex( 0xff0000 );
            line.material.linewidth = 3;
        }
        else{
            line.material.color.setHex( 0x000000 );
            line.material.linewidth = 1;
        }
    }
    for (var j in this.stippledLines){
        var line = this.stippledLines[j]
        if (line.selected){
            line.material.color.setHex( 0xff0000 );
            line.material.linewidth = 3;
        }
        else{
            line.material.color.setHex( 0x000000 );
            line.material.linewidth = 1;
        }
    }
}

Brick.prototype.setRotationAndTranslation = function(rotation, translation){
	this.rotation = rotation;
	this.translation = translation;
	for (var i in this.lines){
		var line = this.lines[i];
		line.rotation.z = rotation;
		line.position.x = translation.x;
		line.position.y = translation.y;
		line.position.z = 0;
	}
	for (var i in this.stippledLines){
		var stippledLine = this.stippledLines[i];
		stippledLine.rotation.z = rotation;
		stippledLine.position.x = translation.x;
		stippledLine.position.y = translation.y;
		stippledLine.position.z = 0;
	}
	this.faces.rotation.z = rotation;
	this.faces.position.x = translation.x;
	this.faces.position.y = translation.y;
	this.faces.position.z = 0;
}
