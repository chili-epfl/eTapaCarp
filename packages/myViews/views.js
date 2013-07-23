(function(root){
var WS_WIDTH = 360.0;
var WS_HEIGHT = 280.0;

function Views(){
    this.views = {};
}

Views.prototype.addView = function(view){
    // view.init();
    this.views[view.name] = view;
};

Views.prototype.init = function(){
    for (var i in this.views){
        console.log('init '+this.views[i].name)
        this.views[i].init(); 
    }
},

Views.prototype.setTransparency = function(bool){
    for (var i in this.views){
        this.views[i].transparency = bool; 
    }
},

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
}

function View(name) {
    this.name = name;
    this.dynamic = true;
    this.selected = [];
    this.click = null;
    this.isNotJittering = false;
    this.scene = new THREE.Scene();
    this.transparency = true;
    this.axis = true;
    this.changedLayout = true;
    this.objects = [];
    this.axisObjects = [];
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
        console.log('click')
        this.selectEdge();
    }
    if (this.isNotJittering || this.changedLayout){
        this.clear();
        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            this.createObjects(marker.id);
        }
        if (this.axis) {
            this.showAxis();
        }
        else{
            this.showGrid();
        }
    }
    if (this.dynamic) {
        this.computeNewPositions(markers);
    }
    
    this.renderer.setSize(this.width, this.height);
    this.renderer.render(this.scene, this.camera);
};

View.prototype.setDynamic = function (bool) {
    this.dynamic = bool;
};

View.prototype.clear = function () {
    for(var i in this.objects){
        for (var j in this.objects[i]){
            this.scene.remove(this.objects[i][j]);
        }
        this.objects[i] = [];
    }
    for (var i in this.axisObjects){
        this.scene.remove(this.axisObjects[i]);
    }
    this.axisObjects = [];
    this.renderer.clear();
};

View.prototype.createObjects = function (markerId) {
    var meshMaterial = new THREE.MeshBasicMaterial({color: false, side: THREE.DoubleSide, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
    var filledShape = this.shape(MODELS[markerId]);
    var dashedShape = this.shapeLines(MODELS[markerId]);
    filledShape.computeFaceNormals();
    if (typeof(this.objects[markerId]) == "undefined") {
        this.objects[markerId] = [];
    }
    for (var i = 0; i < dashedShape.length; i++){
        dashedShape[i].computeLineDistances();
        var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, depthTest: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});;
        if (this.transparency) {
            var lineDashedMaterial = new THREE.LineDashedMaterial({color: 0x000000, depthTest: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}); var object1 = new THREE.Line(dashedShape[i], lineDashedMaterial);
            object1.renderDepth = 9007199254740992;
            this.objects[markerId].push(object1);
            this.scene.add(object1);
        }

        var object2 = new THREE.Line(dashedShape[i], lineMaterial);
        this.objects[markerId].push(object2);
        this.scene.add(object2);
        if (this.selected[markerId] &&
            this.selected[markerId].filter(
            function(x){
                return x.vertices[0].distanceTo(dashedShape[i].vertices[0]) == 0
                    && x.vertices[1].distanceTo(dashedShape[i].vertices[1]) == 0;
            }).length > 0
            ){
            if (typeof(object1) != 'undefined'){
                object1.material.color.setHex(0xff0000);
            }
            object2.material.color.setHex(0xff0000);
        }
    }

    var object3 = new THREE.Mesh(filledShape, meshMaterial);
    this.objects[markerId].push(object3);
    this.scene.add(object3);
};

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
    for (var k in this.objects) {
        for (var l = 0; l < markers.length; l++) {
            var marker = markers[l];
            if (k == marker.id) {
                var Z = this.findZ(marker.id);
                var marker_position = [marker.corners[0].x, marker.corners[0].y, 1];
                var marker_position2 = [marker.corners[1].x, marker.corners[1].y, 1];
                var position = pixel2mm(marker_position[0], marker_position[1], Z);
                var position2 = pixel2mm(marker_position2[0], marker_position2[1], Z);
                var rotation = this.calculateRotation(position, position2);
                var count = 0;
                for (var j in this.objects[k]){
                    var that = this;
                    if (this.selected[k] &&
                        this.selected[k].length > 2 &&
                        that.objects[k][j] instanceof THREE.Line &&
                        this.selected[k].filter(
                        function(x){
                            return x.vertices[0].distanceTo(that.objects[k][j].geometry.vertices[0]) == 0
                                && x.vertices[1].distanceTo(that.objects[k][j].geometry.vertices[1]) == 0;
                        }).length > 0){
                        this.objects[k][j].position.x = position.x + Math.ceil((count+1/2)*5);
                        this.objects[k][j].position.y = position.y + Math.ceil((count+1/2)*5);
                        this.objects[k][j].position.z += Math.ceil((count+1/2)*5);
                        this.objects[k][j].rotation.z = rotation;
                        count++;
                    }
                    else{
                    this.objects[k][j].position.x = position.x;
                    this.objects[k][j].position.y = position.y;
                    this.objects[k][j].rotation.z = rotation;
                    }
                }
            }
        }
    }
};

View.prototype.selectEdge = function(){
    if (this.click.target.parentElement.id == this.name){
        var camera = this.camera;
        var vector = new THREE.Vector3( ( this.click.layerX / this.click.target.width ) * 2 - 1,-( this.click.layerY / (this.click.target.height) )*2  +1, 0.5  );
        var projector = new THREE.Projector();
        var raycaster;
        /* for perspective cameras */
        if (this.name == "perspective"){
            projector.unprojectVector( vector, camera);
            raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
            raycaster.linePrecision = 3;

        }
        /* for orthographic cameras */
        else{
            raycaster = projector.pickingRay( vector, camera);
            raycaster.linePrecision = 3;
        }
        for (var j in this.objects){
            var intersects = raycaster.intersectObjects( this.objects[j] );
            var geometry = new THREE.CubeGeometry( 5, 5, 5 );
            var first = true;
            if (intersects.length > 0 && this.click.type == 'contextmenu'){
                this.selected[j] = [];
                this.changedLayout = true;
            }
            else{
                intersects = intersects.filter(function(x){ return x.object instanceof THREE.Line });
                for (var i = 0; i < intersects.length; i++ ) {
                    if (first){
                        this.selected[j] = [];
                        first = false;
                        this.changedLayout = true;
                    }
                    intersects[ i ].object.material.color.setHex( 0xff0000 );
                    this.selected[j].push(intersects[i].object.geometry);
                }
            }
        }
            
    }
};

View.prototype.calculateRotation = function (vector1, vector2) {
    var rotation;
    var diffx = vector1.x - vector2.x;
    var diffy = vector1.y - vector2.y;
    if (diffy == 0) {
        diffx = 0;
        diffy = 1;
    }
    if ((diffx < 0 && diffy > 0) || (diffx > 0 && diffy > 0)) {
        rotation = -Math.atan(diffx / diffy) + Math.PI / 2;
    }
    else {
        rotation = -Math.atan(diffx / diffy) - Math.PI / 2;
    }
    return rotation
};

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

function FrontView(name){
    View.call(this, name);
}
FrontView.prototype = new View();
FrontView.prototype.constructor = FrontView;

FrontView.prototype.setCamera = function(){
    this.width = $(this.container).width();
    this.height = Math.ceil(this.width/(175/135)/2);
    this.camera = new THREE.OrthographicCamera(-WS_WIDTH/2, WS_WIDTH/2, 0, -WS_HEIGHT/2, -200, 200 );
    this.camera.position.z = WS_HEIGHT/2 - 1;
    this.camera.rotation.x = Math.PI/2;
};


function SideView(name){
    View.call(this, name);
}
SideView.prototype = new View();
SideView.prototype.constructor = SideView;
SideView.prototype.setCamera = function() {
    this.width = $(this.container).width();
    this.height = Math.ceil(this.width/(175/135)/2);
    this.camera = new THREE.OrthographicCamera(-WS_WIDTH/2, WS_WIDTH/2, 0, -WS_HEIGHT/2, -200, 200 );
    this.camera.position.z = WS_HEIGHT/2 - 1;
    this.camera.rotation.z = -Math.PI/2;
    this.camera.rotation.y = -Math.PI/2;
};

function TopView(name){
    View.call(this, name);
}

TopView.prototype = new View();
TopView.prototype.constructor = TopView;

TopView.prototype.setCamera = function() {
    this.width = $(this.container).width();
    this.height = Math.ceil(this.width/(175/135));
    this.camera =  new THREE.OrthographicCamera(-WS_WIDTH/2, WS_WIDTH/2, WS_HEIGHT/2, -WS_HEIGHT/2, 1, 1000 );
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = WS_WIDTH/2;
    this.camera.lookAt(new THREE.Vector3( 0, 0, -WS_WIDTH/2 ));
};

function PerspectiveView(name){
    View.call(this, name);
}

PerspectiveView.prototype = new View();
PerspectiveView.prototype.constructor = PerspectiveView;

PerspectiveView.prototype.setCamera = function() {
    this.width = $(this.container).width();
    this.height = Math.ceil(this.width/(175/135));
    this.camera =  new THREE.PerspectiveCamera( 50, WS_WIDTH/WS_HEIGHT, 1, 1000 );
    this.camera.position.x = 0;
    this.camera.position.y = -300;
    this.camera.position.z = 200;
    this.camera.lookAt(new THREE.Vector3( 0, 200, -200 ));
};

root.Views = Views;
root.View=View;
root.FrontView = FrontView;
root.TopView = TopView;
root.SideView = SideView;
root.PerspectiveView = PerspectiveView;

root.WS_WIDTH = WS_WIDTH;
root.WS_HEIGHT = WS_HEIGHT;
})(this);