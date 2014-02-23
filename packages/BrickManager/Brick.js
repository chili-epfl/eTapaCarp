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
    this.centroid = null;

    this.colors = [
        0xffd070,
        0xe6ff6f,
        0xff886f,
        0x6f9eff,
        0x80ff00,
        0x00ff8e,
        0x00b6ae,
        0xe08e66,
        0x0082a5
    ];
    this.HTMLcolors = [
        '#ffd070',
        '#e6ff6f',
        '#ff886f',
        '#6f9eff',
        '#80ff00',
        '#00ff8e',
        '#00b6ae',
        '#e08e66',
        '#0082a5'
    ]
    this.lineDashedMaterial = new THREE.LineDashedMaterial({color: 0x000000, depthTest: false});
    this.lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, depthTest: true, linewidth: 2});


    /*This function returns un unique id for the 
     *parts generations*/
    var that = this;
    this.uniqueIdFunction = function(initialValue) {
        var id = initialValue || 0;
        var result = function() {
            return id++;
        };
        result.clone = function() {
            return that.uniqueIdFunction(id);
        }
        return result;
    };
    this.uniqueID = this.uniqueIdFunction();


    /*A map containing the blocks.*/
    this.blocks = [];
    this.removedBlocks = [];
	this.init();
}

Brick.prototype.init = function(){
	this.createLines();
	this.createFaces();
}

Brick.prototype.clone = function() {
	var newBrick = new Brick(this.id);
    newBrick.setRotationAndTranslation(this.rotation, this.translation, true);
	return newBrick;
}

Brick.cloneBricks = function(bricks) {
	var clonedBricks = {}
	for (i in bricks)
		clonedBricks[i] = bricks[i].clone()
	return clonedBricks
}

Brick.prototype.changeVisibility = function(visibility) {
    Logger.postEvent("Brick:" + this.id + ";visibility:" + visibility)
	this.visibility = visibility;
    if (visibility) {
        $('#Shape' + this.id + 'head').show();
        $('#Shape' + this.id).show();

    }

    else {
        $('#Shape' + this.id + 'head').hide();
        $('#Shape' + this.id).hide();
    }
    for (var i in this.lines) {
		this.lines[i].visible = visibility;
	}
	this.changeStippledLinesVisibility();
	this.faces.visible = visibility;
    for (var i in this.faces.children) {
        this.faces.children[i].visible = visibility;
}
    this.highlightBlock();
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

//    var centroid=new THREE.Vector3(0,0,0);
//    var centroid_count=0;
//    for(var i in points){
//        centroid_count++;
//        centroid.add(new THREE.Vector3(points[i][0],points[i][1],points[i][2]));
//    }
//    this.centroid=centroid.divideScalar(centroid_count);
//    
    var geometry_centr = new THREE.Geometry();
    for (var i in points) {
        geometry_centr.vertices.push(new THREE.Vector3(points[i][0], points[i][1], points[i][2]));
    }
    geometry_centr.computeBoundingBox();
    this.centroid = new THREE.Vector3(0.5 * (geometry_centr.boundingBox["max"].x + geometry_centr.boundingBox["min"].x),
            0.5 * (geometry_centr.boundingBox["max"].y + geometry_centr.boundingBox["min"].y),
            0.5 * (geometry_centr.boundingBox["max"].z + geometry_centr.boundingBox["min"].z));

    geometry_centr.dispose();
    var block = new Block(this.uniqueID());

	for (var i = 0; i < edges.length; i++) {
		var geometry = new THREE.Geometry();
    	var edge = edges[i];
    	geometry.vertices.push(new THREE.Vector3(points[edge[0]][0], points[edge[0]][1], points[edge[0]][2]));
    	geometry.vertices.push(new THREE.Vector3(points[edge[1]][0], points[edge[1]][1], points[edge[1]][2]));
    	geometries.push(geometry);
	}
	for (var i = 0; i < geometries.length; i++){
		geometries[i].computeLineDistances();
        var stippledLine = new THREE.Line(geometries[i], this.lineDashedMaterial);
        var line = new THREE.Line(geometries[i], this.lineMaterial);
		//To fix problem with stippled lines not showing
		stippledLine.renderDepth = 9007199254740992;
            
        stippledLine.selected = false;
        stippledLine.visible = this.transparency && this.visibility;
        this.stippledLines[i] = stippledLine;

        line.selected = false;
        line.visible = this.visibility;
        line.name = block.id.toString();
        this.lines[i] = line;

        block.lines.push(line);
    }
    this.blocks.push(block);
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
        var plane = new Array();
        for (var k = 0; k < face.length - 2; k++) {
            geometry.faces.push(new THREE.Face3(face[0], face[k + 1], face[k + 2]));
        }
        for (var k = 0; k < face.length; k++) {
            plane.push(geometry.vertices[face[k]]);
    }
        this.blocks[0].faces.push(plane);
    }

    var meshMaterial = new THREE.MeshBasicMaterial({color: this.colors[0], side: THREE.DoubleSide, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    var faces = new THREE.Mesh(geometry, meshMaterial);
    this.faces = faces;
    this.faces.name = 0;
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

Brick.prototype.setRotationAndTranslation = function(rotation, translation, postFlag) {
    if (postFlag)
        Logger.postEvent("Brick:" + this.id + ";position:(" + translation.x + ","
                + translation.y + ");RotationRad:" + rotation + ";RotationDeg:" + rotation * (180 / Math.PI))
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


Brick.prototype.highlightBlock = function() {
    //console.log("In highlight");
    if (!this.visibility)
        return;
    var block;
    if ($('#Shape' + this.id + '>' + "[id*='All'][class~='btn-primary']").length > 0) {
        block = -1
    }
    else {
        var blockName = $('#Shape' + this.id + '>' + "[id*='Block'][class~='btn-primary']").attr('id');
        if (blockName == undefined)
            return;
        var block = blockName.replace(/^\D+/g, '');
    }
    Logger.postEvent("Brick:" + this.id + ";highlighting block:" + block);
    if (block == -1 || this.faces.name == block) {
        this.faces.visible = true;
    }
    else
        this.faces.visible = false;
    for (var i in this.faces.children) {
        if (block == -1 || this.faces.children[i].name == block) {
            this.faces.children[i].visible = true;
        }
        else
            this.faces.children[i].visible = false;

    }
    for (var i in this.lines) {
        if (block == -1 || this.lines[i].name == block) {
            this.lines[i].visible = true;
        }
        else
            this.lines[i].visible = false;

    }

}

Brick.prototype.deleteBlock = function() {
    var block;
    if ($('#Shape' + this.id + '>' + "[id*='All'][class~='btn-primary']").length > 0
            || $('#Shape' + this.id + '>' + "[id*='Block']").length == 1) {
        block = -1;
    }
    else {

        var blockName = $('#Shape' + this.id + '>' + "[id*='Block'][class~='btn-primary']").attr('id');
        if (blockName === undefined)
            return;
        var block = blockName.replace(/^\D+/g, '');
    }
    if (block != -1) {
        Logger.postEvent("Brick:" + this.id + ";deleting block:" + block);

        for (var blockIndex = 0; blockIndex < this.blocks.length; blockIndex++) {
            if (this.blocks[blockIndex].id == block) {
                var removed = this.blocks.splice(blockIndex, 1)[0];
                this.removedBlocks.push(removed);
                break;
            }
        }
        $('#Shape' + this.id + '>' + "[id*='Block'][class~='btn-primary']").remove();

        this.recreateBrick();

        this.highlightBlock();
    }

}

Brick.prototype.restoreBlock = function() {
    if (this.removedBlocks.length == 0)
        return null;
    else {
        Logger.postEvent("Brick:" + this.id + ";Undo");
        var restoredBlock = this.removedBlocks[this.removedBlocks.length - 1];
        this.removedBlocks.splice(this.removedBlocks.length - 1, 1);
        if (!(restoredBlock instanceof Array)) {
            this.blocks.push(restoredBlock);
            this.recreateBrick();
            return restoredBlock.id;
        }
        else {
            //console.log(restoredBlock);
            this.uniqueID = restoredBlock[0];
            restoredBlock.splice(0, 1);
            this.blocks = restoredBlock;
            this.recreateBrick();
            return -1;
        }
    }
}

Brick.prototype.recreateBrick = function() {
    $('#Shape' + this.id + '>' + "button[id*='Block']").removeClass('btn-primary');
    $('#Shape' + this.id + '>' + "button[id*='All']").addClass('btn-primary');

    var pointsSet = [];
    var brick = this;

    var mesh = null;
    for (var indexLine = brick.lines.length - 1; indexLine >= 0; indexLine--) {
        //brick.lines[indexLine].geometry.dispose();
    }
    for (var indexLine = brick.stippledLines.length - 1; indexLine >= 0; indexLine--) {
        //brick.stippledLines[indexLine].geometry.dispose();
    }
    brick.lines = new Array()//.length = 0;
    brick.stippledLines = new Array()//.length = 0;
    //qui nascono preblemi se non è consecutivo!!!
    for (var indexBlock = 0; indexBlock < brick.blocks.length; indexBlock++) {
        var block = brick.blocks[indexBlock];
        var meshMaterial = new THREE.MeshBasicMaterial({color: this.colors[block.id % this.colors.length], side: THREE.DoubleSide, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
        for (var indexLine = 0; indexLine < block.lines.length; indexLine++) {
            block.lines[indexLine].geometry.computeLineDistances();
            var line = block.lines[indexLine];
            line.name = block.id.toString();
            brick.lines.push(line);
            var stippledLine = new THREE.Line(block.lines[indexLine].geometry, this.lineDashedMaterial);
            stippledLine.renderDepth = 9007199254740992;
            brick.stippledLines.push(stippledLine);
        }

        for (var faceIndex = 0; faceIndex < block.faces.length; faceIndex++) {
            var geometry = new THREE.Geometry();
            for (var pointIndex = 0; pointIndex < block.faces[faceIndex].length; pointIndex++) {
                geometry.vertices.push(block.faces[faceIndex][pointIndex]);
                var flag = false;
                for (var i in pointsSet) {
                    if (pointsSet[i].equals(block.faces[faceIndex][pointIndex])) {
                        //console.log("in");
                        flag = true;
                        break;
                    }
                }
                if (!flag)
                    pointsSet.push(block.faces[faceIndex][pointIndex]);
            }
            for (var k = 0; k < geometry.vertices.length - 2; k++) {
                geometry.faces.push(new THREE.Face3(0, k + 1, k + 2));
            }
            if (mesh == null) {
                mesh = new THREE.Mesh(geometry, meshMaterial);
                mesh.name = block.id;
            } else {
                var tempMesh = new THREE.Mesh(geometry, meshMaterial);
                tempMesh.name = block.id;
                mesh.add(tempMesh);
            }
        }
    }

    var geometry_centr = new THREE.Geometry();
    for (var i in pointsSet) {
        geometry_centr.vertices.push(pointsSet[i]);
    }
    geometry_centr.computeBoundingBox();
    this.centroid = new THREE.Vector3(0.5 * (geometry_centr.boundingBox["max"].x + geometry_centr.boundingBox["min"].x),
            0.5 * (geometry_centr.boundingBox["max"].y + geometry_centr.boundingBox["min"].y),
            0.5 * (geometry_centr.boundingBox["max"].z + geometry_centr.boundingBox["min"].z));
    brick.faces = mesh;

    geometry_centr.dispose();
    this.setRotationAndTranslation(this.rotation, this.translation,true);
    this.highlightBlock();
    this.save();
}


Block = function(id) {
    this.id = id;
    this.lines = new Array();
    this.faces = new Array();
}

Brick.prototype.save = function() {
    Logger.postBrick("Update--" + Date.now())
    Logger.postBrick("Brick:" + this.id);
    Logger.postBrick("Blocks:" + this.blocks.length);
    for (var index = 0; index < this.blocks.length; index++) {
        var block = this.blocks[index];
        Logger.postBrick("Block:" + block.id);
        Logger.postBrick("Lines:" + block.lines.length);
        for (var indexLine = 0; indexLine < block.lines.length; indexLine++) {
            var line = block.lines[indexLine];
            Logger.postBrick("Line:" + indexLine +
                    ";(" + line.geometry.vertices[0].x + "," + line.geometry.vertices[0].y + "," + line.geometry.vertices[0].z + ")" +
                    ";(" + line.geometry.vertices[1].x + "," + line.geometry.vertices[1].y + "," + line.geometry.vertices[1].z + ")"
                    )
        }
        for (var indexF = 0; indexF < block.faces.length; indexF++) {
            Logger.postBrick("Face:" + indexF);

            var face = block.faces[indexF];
            for (var indexP = 0; indexP < face.length; indexP++) {
                Logger.postBrick("(" +
                        face[indexP].x + "," + face[indexP].y + ")"
                        )
            }
        }
    }

}
