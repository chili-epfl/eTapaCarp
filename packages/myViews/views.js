var WS_WIDTH = 360.0;
var WS_HEIGHT = 280.0;
var SHAPES = [6, 20, 64];
var ACTIVITYTRANSLATION = [];
var ACTIVITYROTATION = [];
var COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xf0f0f0];

Views = function(){
    this.views = {};
}

Views.prototype.addView = function(view){
    // view.init();
    this.views[view.name] = view;
};

Views.prototype.init = function(){
    for (var i in this.views){
        this.views[i].init(); 
    }
};

Views.prototype.setTransparency = function(bool){
    for (var i in this.views){
        this.views[i].transparency = bool; 
    }
};

Views.prototype.edgeToSelect = function(markerId, name){
    for (var i in this.views){
        if (i == name){
            this.views[i].edgeToSelect(markerId);
        }
        else{
            this.views[i].removeSelectedEdges();
        }
    }
};

Views.prototype.checkEdgeSolution = function(){
    var correct = [];
    var wrong = [];
    var userSol = [];
    var correctSol = null;
    var verticalEdge = 0;
    for (var i in this.views){
        if (this.views[i].camera instanceof THREE.PerspectiveCamera){
            correctSol = this.views[i].selected;
            for (var j in correctSol){
                if (correctSol[j].geometry.vertices[0].x == correctSol[j].geometry.vertices[1].x
                    && correctSol[j].geometry.vertices[0].y == correctSol[j].geometry.vertices[1].y){
                    verticalEdge++;
                }
            }
        }
        else{
            if (this.views[i].selected && this.views[i].selected.length > 0){
                userSol[i] = this.views[i].selected;
            }
            else{
                correct[i] = 0;
                wrong[i] = 0;
            }
        }
    }
    for (var i in userSol){
        correct[i] = 0;
        wrong[i] = 0;
        for (var j in userSol[i]){
            var isCorrect = false;
            for (var k in correctSol){
                if (userSol[i][j].geometry.vertices[0].x == correctSol[k].geometry.vertices[0].x
                    && userSol[i][j].geometry.vertices[0].y == correctSol[k].geometry.vertices[0].y
                    && userSol[i][j].geometry.vertices[0].z == correctSol[k].geometry.vertices[0].z
                    && userSol[i][j].geometry.vertices[1].x == correctSol[k].geometry.vertices[1].x
                    && userSol[i][j].geometry.vertices[1].y == correctSol[k].geometry.vertices[1].y
                    && userSol[i][j].geometry.vertices[1].z == correctSol[k].geometry.vertices[1].z){
                    isCorrect = true;
                }
                else if (userSol[i][j].geometry.vertices[1].x == correctSol[k].geometry.vertices[0].x
                    && userSol[i][j].geometry.vertices[1].y == correctSol[k].geometry.vertices[0].y
                    && userSol[i][j].geometry.vertices[1].z == correctSol[k].geometry.vertices[0].z
                    && userSol[i][j].geometry.vertices[0].x == correctSol[k].geometry.vertices[0].x
                    && userSol[i][j].geometry.vertices[0].y == correctSol[k].geometry.vertices[0].y
                    && userSol[i][j].geometry.vertices[0].z == correctSol[k].geometry.vertices[0].z){
                    isCorrect = true;
                }
            }
            if (isCorrect){
                correct[i]++;
            }
            else{
                wrong[i]++;
            }
        }
    }

    //divided by 2 because there are the stippled and plain lines
    for (var i in correct){
        correct[i] = correct[i]/2;
        wrong[i] = wrong[i]/2;
    }
    verticalEdge = verticalEdge/2;
    return [correct, wrong, verticalEdge];
}

Views.prototype.setChangedLayout = function(bool){
    for (var i in this.views){
        this.views[i].changedLayout = bool; 
    }
};

Views.prototype.setAxis = function(bool){
    for (var i in this.views){
        this.views[i].axis = bool; 
    }
};

Views.prototype.setIsNotJittering = function(bool){
    for (var i in this.views){
        this.views[i].isNotJittering = bool; 
    }
};

Views.prototype.setClick = function(click){
    for (var i in this.views){
        this.views[i].click = click; 
    }
};

Views.prototype.render = function(markers){
    for (var i in this.views){
        this.views[i].render(markers);
    }
};

Views.prototype.edgeSelectionDifficulty = function(difficulty){
    for (var i in this.views){
        this.views[i].difficulty = difficulty;
    }
}

Views.prototype.modelMatchingDifficulty = function(difficulty){
    for (var i in this.views){
        this.views[i].difficulty = difficulty;
    }
    this.generateRandomPositions();
}

Views.prototype.checkSolution = function(markers){
    for (var i in this.views){
        this.views[i].checkSolution(markers);
        break;
    }
}

Views.prototype.init_objects = function(){

    for (var i in this.views){
        var view = this.views[i];
        if (!view.dynamic){
            view.init_objects();
        }
    }
}

Views.prototype.clearChoiceEdges = function(){
    for(var i in this.views){
        this.views[i].edgesToSelect = [];
        this.views[i].levels = {};
        this.views[i].changedLayout = true;
    }
}

Views.prototype.showHelpOnSelect = function(click){
    for (var i in this.views){
        var currentView = this.views[i];
        if (currentView instanceof FrontView){
            var helpingView, sideView;
            for (var j in this.views){
                if (this.views[j] instanceof TopView){
                    helpingView = this.views[j];
                }
                else if (this.views[j] instanceof SideView){
                    sideView = this.views[j];
                }
            }
                
            if (click.target.parentElement.id == currentView.name){
                currentView.levels = {};
                currentView.changedLayout = true;
                sideView.levels = {};
                sideView.edgesToSelect = [];
                sideView.changedLayout = true;
                helpingView.levels = {};
                helpingView.edgesToSelect = [];
            }
            helpingView.levels.y = {};
            for (var j in currentView.edgesToSelect){
                helpingView.levels.y[j] = currentView.edgesToSelect[j];
            }
            helpingView.changedLayout = true;

        }
        else if (currentView instanceof SideView){
            var helpingView, frontView;
            for (var j in this.views){
                if (this.views[j] instanceof TopView){
                    helpingView = this.views[j];
                }
                else if (this.views[j] instanceof FrontView){
                    frontView = this.views[j];
                }
            }
                
            if (click.target.parentElement.id == currentView.name){
                currentView.levels = {};
                currentView.changedLayout = true;
                frontView.levels = {};
                frontView.edgesToSelect = [];
                frontView.changedLayout = true;
                helpingView.levels = {};
                helpingView.edgesToSelect = [];
            }
            helpingView.levels.x = {};
            for (var j in currentView.edgesToSelect){
                helpingView.levels.x[j] = currentView.edgesToSelect[j];
            }
            
            helpingView.changedLayout = true;

        }
        else if (currentView instanceof TopView){
            var helpingView;
            for (var j in this.views){
                if (click.target.parentElement.id == currentView.name){
                    currentView.levels = {};
                    currentView.changedLayout = true;
                    if (this.views[j] instanceof FrontView || this.views[j] instanceof SideView){
                        helpingView = this.views[j];
                        helpingView.levels = {};
                        helpingView.edgesToSelect = [];
                        if (currentView.edgesToSelect.length > 0){
                            var count = 1;
                            for (var j in currentView.edgesToSelect){
                                helpingView.levels[j] = currentView.edgesToSelect[j];
                            }
                        }
                        helpingView.changedLayout = true;
                    }
                }
            }
        }
    }
}

Views.prototype.generateRandomPositions = function(){
    var testObjects = [];
    var count = 0;
    var redoRandom = false;
    for (var name in this.views){
            var view = this.views[name];
            view.clear();
            for (var i = 0; i<view.difficulty; i++){
                var thisShape = SHAPES[i];
                var filledShape = view.shape(MODELS[thisShape]);
                testObjects[thisShape] = new THREE.Mesh(filledShape, new THREE.MeshBasicMaterial());
                ACTIVITYROTATION[SHAPES[i]] = Math.random()*Math.PI;
                ACTIVITYTRANSLATION[SHAPES[i]] = [Math.random()*WS_WIDTH-(WS_WIDTH/2),Math.random()*WS_HEIGHT-(WS_HEIGHT/2)];
            }
            for (var i in testObjects){
                var object = testObjects[i];
                object.rotation.z = ACTIVITYROTATION[i];
                object.position.x = ACTIVITYTRANSLATION[i][0];
                object.position.y = ACTIVITYTRANSLATION[i][1];
                object.updateMatrix();
                object.geometry.applyMatrix(object.matrix);
                object.geometry.computeBoundingBox();
            }
            for (var i in testObjects){
                var object1 = testObjects[i];
                for (var i = 0; i < object1.geometry.vertices.length; i++){
                    var vertex = object1.geometry.vertices[i];
                    if (Math.abs(vertex.x) > (WS_WIDTH/2-40) || Math.abs(vertex.y) > (WS_HEIGHT/2-40)){
                        redoRandom = true;
                        break;
                    }
                }
            }
            for (var i in testObjects){
                var object1 = testObjects[i];
                for (var j in testObjects){
                    if (j != i){
                        var object2 = testObjects[j];
                        if (object1.geometry.boundingBox.isIntersectionBox(object2.geometry.boundingBox)){
                            redoRandom = true;
                            break;
                        }
                    }
                }
                if (redoRandom){
                    break;
                }
            }
        break;
    }

    if (redoRandom){
        this.generateRandomPositions();
    }
    else{
        this.init_objects();
    }
}

Views.prototype.destroy = function(){
    for (var i in this.views){
        var view = this.views[i];
        view.clear();
        view.scene = null;
        view.renderer = null;
    }
}

function View(name) {
    this.name = name;
    this.dynamic = true;
    this.difficulty = 1;
    this.click = null;
    this.isNotJittering = false;
    this.scene = new THREE.Scene();
    this.transparency = true;
    this.axis = true;
    this.changedLayout = true;
    this.edges = [];
    this.faces = [];
    this.axisObjects = [];
    this.selected = {};
    this.edgesToSelect = [];
    this.model = false;
    this.helpLines = [];
    this.levels = {};
    this.levelLines = [];
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

View.prototype.setCamera = function () {
};

View.prototype.render = function (markers) {
    if (this.click){
        this.selectEdge();
    }
    if (this.dynamic) {
        if (this.isNotJittering || this.changedLayout){
            this.changedLayout = false;
            this.clear();
            for (var i in markers) {
                var marker = markers[i];
                this.createObjects(marker.id);
            }
            if (this.axis) {
                this.showAxis();
            }
            else{
                this.showGrid();
            }
            this.computeNewPositions(markers);
            this.renderer.setSize(this.width, this.height);
            this.renderer.render(this.scene, this.camera);
        }
    }
    else{
        if(this.changedLayout){
            this.init_objects();
            if (this.axis) {
                this.showAxis();
            }
            else{
                this.showGrid();
            }
            this.renderer.setSize(this.width, this.height);
            this.renderer.render(this.scene, this.camera);
        }
    }
    
};

View.prototype.setDynamic = function (bool) {
    this.dynamic = bool;
};

View.prototype.clear = function () {
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

View.prototype.createObjects = function (markerId) {
    if (typeof(this.edges[markerId]) == "undefined") {
        this.edges[markerId] = [];
        this.faces[markerId] = [];
        var meshMaterial = new THREE.MeshBasicMaterial({color: false, side: THREE.DoubleSide, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
        var filledShape = this.shape(MODELS[markerId]);
        var dashedShape = this.shapeLines(MODELS[markerId]);
        filledShape.computeFaceNormals();
        for (var i = 0; i < dashedShape.length; i++){
            dashedShape[i].computeLineDistances();
            var lineDashedMaterial = new THREE.LineDashedMaterial({color: 0x000000, depthTest: false});
            var object1 = new THREE.Line(dashedShape[i], lineDashedMaterial);
            var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, depthTest: true});;
            

            var object1 = new THREE.Line(dashedShape[i], lineDashedMaterial);

            //To fix problem with stippled lines not showing
            object1.renderDepth = 9007199254740992;
            
            object1.selected = false;
            object1.visible = true;
            if (!this.transparency) {
                object1.visible = false;
            }
            this.edges[markerId].push(object1);
            this.scene.add(object1);

            var object2 = new THREE.Line(dashedShape[i], lineMaterial);
            object2.selected = false;
            object2.visible = true;
            this.edges[markerId].push(object2);
            this.scene.add(object2);
        }

        var object3 = new THREE.Mesh(filledShape, meshMaterial);
        this.faces[markerId].push(object3);
        this.scene.add(object3);
    }
    else{
        for (var j in this.edges[markerId]){
            var object = this.edges[markerId][j];
            if (object.selected){
                object.material.color.setHex( 0xff0000 );
                object.material.linewidth = 3;
            }
            else{
                object.material.color.setHex( 0x000000 );
                object.material.linewidth = 1;
            }
            if (!this.transparency && object.material instanceof THREE.LineDashedMaterial) {
                object.visible = false;
            }
            else{
                object.visible = true;
            }
        }
        for (var j in this.faces[markerId]){
            var object = this.faces[markerId][j];
            object.visible = true;
        }
    }
};

View.prototype.init_objects = function(){
    this.clear();
    for (var j = 0; j<this.difficulty; j++){
        var thisShape = SHAPES[j];
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

View.prototype.shape = function (loadedShape) {
    var geometry = new THREE.Geometry();
    var points = loadedShape.coordinates;
    var faces = loadedShape.faces;
    for (var i = 0; i < points.length; i++) {
        geometry.vertices.push(new THREE.Vector3(points[i][0], points[i][1], points[i][2]));
    }
    for (var j = 0; j < faces.length; j++) {
        var face = faces[j];
        for (var k = 0; k < face.length - 2; k++) {
            geometry.faces.push(new THREE.Face3(face[0], face[k + 1], face[k + 2]));
        }
    }
    return geometry;
};

View.prototype.shapeLines = function (loadedShape) {
    var geometries = [];
    var points = loadedShape.coordinates;
    var edges = loadedShape.edges;
    for (var i = 0; i < edges.length; i++) {
        var geometry = new THREE.Geometry();
        var edge = edges[i];
        geometry.vertices.push(new THREE.Vector3(points[edge[0]][0], points[edge[0]][1], points[edge[0]][2]));
        geometry.vertices.push(new THREE.Vector3(points[edge[1]][0], points[edge[1]][1], points[edge[1]][2]));
        geometries.push(geometry);
    }
    return geometries;
};

View.prototype.findZ = function (id) {
    var coordinates = MODELS[id]['coordinates'];
    var maxZ = coordinates[0][2];
    for (var i = 1; i < coordinates.length; i++) {
        if (coordinates[i][2] > maxZ) {
            maxZ = coordinates[i][2];
        }
    }
    return maxZ;
};

View.prototype.computeNewPositions = function (markers) {
    var numMarkers = 0;
    for (var k in this.edges) {
        for (var l in markers) {
            numMarkers++;
            var marker = markers[l];
            if (k == marker.id) {
                var Z = this.findZ(marker.id);
                var marker_position = [marker.corners[0].x, marker.corners[0].y, 1];
                var marker_position2 = [marker.corners[1].x, marker.corners[1].y, 1];
                var position = pixel2mm(marker_position[0], marker_position[1], Z);
                var position2 = pixel2mm(marker_position2[0], marker_position2[1], Z);
                var rotation = this.calculateRotation(position, position2);
                for (var j in this.faces[k]){
                    this.faces[k][j].position.x = position.x;
                    this.faces[k][j].position.y = position.y;
                    this.faces[k][j].rotation.z = rotation;
                }
                for (var j in this.edges[k]){
                    this.edges[k][j].position.x = position.x;
                    this.edges[k][j].position.y = position.y;
                    this.edges[k][j].position.z = 0;
                    this.edges[k][j].rotation.z = rotation;
                }
            }
        }
    }
    if (numMarkers == 1){
        this.separateEdges();
    }
};

View.prototype.selectEdge = function(){
    if (this.click.target.parentElement.id == this.name){
        var position = {x:null,y:null};
        if (navigator.vendor == "Google Inc."){
            position.x = this.click.layerX;
            position.y = this.click.layerY;
        }
        else{
            position.x = this.click.clientX-this.click.originalTarget.offsetLeft;
            position.y = this.click.clientY-this.click.originalTarget.offsetTop;
        }
        var camera = this.camera;
        var vector = new THREE.Vector3( ( position.x / this.click.target.width ) * 2 - 1,
                                        -( position.y / (this.click.target.height) )*2  +1,
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
        for (var j in this.edges){
            var intersects = raycaster.intersectObjects( this.edges[j] );
            if (intersects.length > 0){
                this.changedLayout = true;
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
                else{
                    for (var i = 0; i < intersects.length; i++ ) {
                        var currentObject = intersects[i].object;
                        for (var j = 0; j < this.edgesToSelect.length; j++){
                            if (currentObject.id == this.edgesToSelect[j].object.id){
                                this.edgesToSelect = [];
                            }
                        }
                        if (currentObject.selected){
                            currentObject.selected = false;
                            delete this.selected[currentObject.id];
                        }
                        else{
                            currentObject.material.color.setHex( 0xff0000 );
                            this.selected[currentObject.id] = currentObject;
                            currentObject.selected = true;
                        }
                    }   
                }
            }
        }
    }
};

View.prototype.selectFromChoice = function(id){
    var count = 1;
    for (var i in this.edgesToSelect){
        if (count == id){
            this.edgesToSelect[i].object.selected = true;
            this.selected.push(this.edgesToSelect[i].object);
        }
        if (i%2 == 1){
            count++;
        }
    }
    this.edgesToSelect = [];
    this.changedLayout = true;
}

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

View.prototype.checkSolution = function(markers){
    var count = [];
    for (var i in markers){
        var marker = markers[i];
        if (count.indexOf(marker.id) == -1){
            count.push(marker.id);
        }
        for (var j = 0; j<this.difficulty; j++){
            if (marker.id == SHAPES[j]){
                var td1 = $($('#rowShape'+marker.id).children()[1]);
                if (td1.children().length == 0){
                    td1.append('<i class="icon-ok"></i>');
                }
                var Z = this.findZ(marker.id);
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
    for (var j = 0; j<this.difficulty; j++){
        if (count.indexOf(SHAPES[j]) == -1){
            var td1 = $($('#rowShape'+SHAPES[j]).children()[1]);
            if (td1.children().length > 0){
                td1.children().remove();
            }
        }
    }
};

View.prototype.edgeToSelect = function(markerId){
    var range = this.edges[markerId].length-1;
    var selectedEdges = [];
    while (selectedEdges.length < this.difficulty*2){
        var edge = Math.ceil(Math.random()*range);
        if (edge % 2 == 1){
            edge--;
        }
        if (selectedEdges.indexOf(edge) == -1){
            selectedEdges.push(edge);
            selectedEdges.push(edge+1);
        }
    }
    this.removeSelectedEdges();
    for (var i in selectedEdges){
        this.edges[markerId][selectedEdges[i]].selected = true;
        this.selected.push(this.edges[markerId][selectedEdges[i]]);
    }
    this.changedLayout = true;
};

View.prototype.removeSelectedEdges = function(){
    for (var i in this.selected){
        this.selected[i].selected = false;
    }
    this.selected = [];
    this.changedLayout = true;
}

View.prototype.showAxis = function(){
    var lineMaterial2 = new THREE.LineBasicMaterial({color: 0xff0000, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,WS_HEIGHT/2,0));
    line.computeLineDistances();
    var object1 = new THREE.Line(line, lineMaterial2);
    this.axisObjects.push(object1);
    this.scene.add(object1);

    lineMaterial2 = new THREE.LineBasicMaterial({color: 0x00ff00, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,-WS_HEIGHT/2,0));
    line.computeLineDistances();
    var object2 = new THREE.Line(line, lineMaterial2);
    this.axisObjects.push(object2);
    this.scene.add(object2);

    lineMaterial2 = new THREE.LineBasicMaterial({color: 0x0000ff, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
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
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(-WS_WIDTH/2,-WS_HEIGHT/2,0));
    line.vertices.push(new THREE.Vector3(WS_WIDTH/2,-WS_HEIGHT/2,0));
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