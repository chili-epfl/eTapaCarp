ToolFactory = function() {
    this.createTool = function(id, brickManager, markers) {
        if (id == 83)
            return new PlaneCutter(id, brickManager, markers);
    }
}
Tool = function(id, brickManager, markers) {
    this.id = id;
    this.brickManager = brickManager;
    this.geometry;
    this.mesh;
    this.visibility;
    //this.init(markers);
}

Tool.prototype.changeVisibility = function(visibility) {
    Logger.postEvent("Tool:" + this.id + ";visibility:" + visibility);
    this.visibility = visibility;
    this.mesh.visible = visibility;

}
Tool.prototype.init = function(markers) {

}
Tool.prototype.computeNewPosition = function(markers) {
}
Tool.prototype.computeNewStatus = function(markers) {
}
Tool.prototype.reset = function() {
};

PlaneCutter = function(id, brickManager, markers) {
    Tool.call(this, id, brickManager, markers);
    this.minDistance;
    this.maxDistance;
    this.rotationMarkerZ;
    this.cutAvailable = true;
    this.horizMesh = null;
    this.SimLineDashMaterial = new THREE.LineDashedMaterial({color: 0xff1919, gapSize: 4, dashSize: 4, linewidth: 3, depthTest: false});
    this.SimMeshMaterial = new THREE.MeshBasicMaterial({color: 0xffec45, depthWrite: false, depthTest: false, transparent: true, opacity: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2});
    this.lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, depthTest: true, linewidth: 2});

    this.selection = null;
    this.floorLine;
    this.init(markers);
    this.lastInclination = 0;
    this.lastZ = this.mesh.position.z;

    this.testOldRot = null;

    this.colors = [
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

};
PlaneCutter.prototype = new Tool();
PlaneCutter.prototype.constructor = PlaneCutter;
PlaneCutter.prototype.changeVisibility = function(visibility) {
    Tool.prototype.changeVisibility.call(this, visibility);
    if (this.selection != null) {
        this.selection.visible = visibility;
        for (var i in this.selection.children) {
            this.selection.children[i].visible = visibility;

        }
    }
    this.floorLine.visible = visibility;
    this.horizMesh.visible = false;

}
PlaneCutter.prototype.init = function(markers) {
    this.minDistance = Session.get('tools')[this.id]['extra_info']['minDistance'];
    this.maxDistance = Session.get('tools')[this.id]['extra_info']['maxDistance'];
    this.rotationMarkerZ = Session.get('tools')[this.id]['extra_info']['rotationMarkerZ'];

    var mUp, mDown;
    mUp = markers[41];
    mDown = markers[42];
    //Take the 2 opposite corners of the marker and compute the center
    var mUp_position = [mUp.corners[0].x, mUp.corners[0].y, 1];
    var mUp_position2 = [mUp.corners[2].x, mUp.corners[2].y, 1];
    var position, position2;
    if (Session.get('virtual') == true) {
        position = {x: mUp_position[0], y: mUp_position[1]};
        position2 = {x: mUp_position2[0], y: mUp_position2[1]}

    }
    else {
        position = pixel2mm(mUp_position[0], mUp_position[1], 1);
        position2 = pixel2mm(mUp_position2[0], mUp_position2[1], 1);
    }
    var centerUpX = (position.x + position2.x) / 2;
    var centerUpY = (position.y + position2.y) / 2;
    var mDown_position = [mDown.corners[0].x, mDown.corners[0].y, 1];
    var mDown_position2 = [mDown.corners[2].x, mDown.corners[2].y, 1];

    if (Session.get('virtual') == true) {
        position = {x: mDown_position[0], y: mDown_position[1]};
        position2 = {x: mDown_position2[0], y: mDown_position2[1]}

    }
    else {
        position = pixel2mm(mDown_position[0], mDown_position[1], 1);
        position2 = pixel2mm(mDown_position2[0], mDown_position2[1], 1);
    }

    var centerDownX = (position.x + position2.x) / 2;
    var centerDownY = (position.y + position2.y) / 2;
    var distance = Math.sqrt(Math.pow(centerDownX - centerUpX, 2) + Math.pow(centerUpY - centerDownY, 2));

    //this.geometry = new THREE.PlaneGeometry(distance / 2, distance);
    var horizGeometry = new THREE.PlaneGeometry(200, 400);


    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(new THREE.Vector3(0, 200, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, -200, 0));
    this.geometry.vertices.push(new THREE.Vector3(-200, -200, 0));
    this.geometry.vertices.push(new THREE.Vector3(-200, 200, 0));

    this.geometry.faces.push(new THREE.Face3(0, 1, 2));
    this.geometry.faces.push(new THREE.Face3(0, 2, 3));

    var floorLineGeometry = new THREE.Geometry();
    floorLineGeometry.vertices.push(new THREE.Vector3(0, -200, 0));
    floorLineGeometry.vertices.push(new THREE.Vector3(0, 200, 0));
    floorLineGeometry.computeLineDistances();
    this.floorLine = new THREE.Line(floorLineGeometry, this.SimLineDashMaterial);
    this.floorLine.renderDepth = 9007199254740992;

    var material = new THREE.MeshBasicMaterial({color: 0xffec45, side: THREE.DoubleSide, transparent: true, opacity: 0.4, depthWrite: false, depthTest: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1})
    var material2 = new THREE.MeshBasicMaterial({color: 0xC1FFC1, side: THREE.DoubleSide, transparent: true, opacity: 0.4, depthWrite: false, depthTest: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1})


    this.mesh = new THREE.Mesh(this.geometry, material);
    Logger.postEvent("Plane-Cutter-Created;TopMarker:(" +
            centerUpX + "," + centerUpY + ");BottomMarker:(" +
            centerDownX + "," + centerDownY + ");RotationRad:" + 0+";RotationDeg:"+ 0
            +";Height:" + 0
            )
    this.horizMesh = new THREE.Mesh(horizGeometry, material2)
    this.mesh.add(this.horizMesh);
    this.horizMesh.visible = false;

    this.reset();
};

PlaneCutter.prototype.reset = function() {
    this.mesh.rotation.x = 0;
    this.mesh.rotation.y = 0;
    this.mesh.rotation.z = 0;
    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;
    this.mesh.rotateY(Math.PI / 2);
    this.floorLine.rotation.x = 0;
    this.floorLine.rotation.y = 0;
    this.floorLine.rotation.z = 0;
    this.floorLine.position.x = 0;
    this.floorLine.position.y = 0;
    this.floorLine.position.z = 0;
    this.horizMesh.visible = false;


}

PlaneCutter.prototype.computeNewPosition = function(markers) {
    this.reset();
    var mUp, mDown,text;
    mUp = markers[41];
    mDown = markers[42];
    //Take the 2 opposite corners of the marker and compute the center
    var mUp_position = [mUp.corners[0].x, mUp.corners[0].y, 1];
    var mUp_position2 = [mUp.corners[2].x, mUp.corners[2].y, 1];
    var position, position2;
    if (Session.get('virtual') == true) {
        position = {x: mUp_position[0], y: mUp_position[1]};
        position2 = {x: mUp_position2[0], y: mUp_position2[1]}

    }
    else {
        //Hard Coding Height
        position = pixel2mm(mUp_position[0], mUp_position[1], 5);
        position2 = pixel2mm(mUp_position2[0], mUp_position2[1], 5);
    }
    var centerUpX = (position.x + position2.x) / 2;
    var centerUpY = (position.y + position2.y) / 2;
    var mDown_position = [mDown.corners[0].x, mDown.corners[0].y, 1];
    var mDown_position2 = [mDown.corners[2].x, mDown.corners[2].y, 1];
    if (Session.get('virtual') == true) {
        position = {x: mDown_position[0], y: mDown_position[1]};
        position2 = {x: mDown_position2[0], y: mDown_position2[1]}

    }
    else {
        //Hard Coding Height

        position = pixel2mm(mDown_position[0], mDown_position[1], 5);
        position2 = pixel2mm(mDown_position2[0], mDown_position2[1], 5);
    }
    var centerDownX = (position.x + position2.x) / 2;
    var centerDownY = (position.y + position2.y) / 2;


    var planeCenterX = (centerUpX + centerDownX) / 2;
    var planeCenterY = (centerUpY + centerDownY) / 2;


    this.mesh.position.x = planeCenterX;
    this.mesh.position.y = planeCenterY;

    this.floorLine.position.x = planeCenterX;
    this.floorLine.position.y = planeCenterY;
    var rotation;

    var diffx = (centerUpX - centerDownX);
    var diffy = (centerUpY - centerDownY);
    rotation = Math.atan2(diffx, diffy);

    this.mesh.rotateX(rotation);
    this.floorLine.rotateZ(-rotation);


    if (markers.hasOwnProperty(45)) {
        //Rotation
        var marker = markers[45];
        var marker_position = [marker.corners[0].x, marker.corners[0].y, 1];
        var marker_position2 = [marker.corners[1].x, marker.corners[1].y, 1];
        var real_position, real_position2;
        if (Session.get('virtual') == true) {
            real_position = {x: marker_position[0], y: marker_position[1]};
            real_position2 = {x: marker_position2[0], y: marker_position2[1]}

        } else {
            real_position = pixel2mm(marker_position[0], marker_position[1], this.rotationMarkerZ);
            real_position2 = pixel2mm(marker_position2[0], marker_position2[1], this.rotationMarkerZ);
        }

        diffx = (real_position.x - real_position2.x);
        diffy = (real_position.y - real_position2.y);
        rotation = Math.atan2(diffy, diffx);
        if (this.testOldRot != null) {
            if ((this.testOldRot >= 0 && rotation >= 0) || (this.testOldRot <= 0 && rotation <= 0))
                rotation = rotation - this.testOldRot;
            else if (this.testOldRot > 0 && rotation < 0) {
                //--
                if (this.testOldRot < Math.PI / 2 && rotation > -Math.PI / 2)
                    rotation = (-this.testOldRot + rotation);
                //++
                if (this.testOldRot > Math.PI / 2 && rotation < -Math.PI / 2)
                    rotation = ((Math.PI - this.testOldRot) - (-Math.PI - rotation));
            }
            else if (this.testOldRot < 0 && rotation > 0) {
                //--  
                if (this.testOldRot < -Math.PI / 2 && rotation > Math.PI / 2)
                    rotation = ((-Math.PI - this.testOldRot) + (-Math.PI + rotation));
                //++
                if (this.testOldRot > -Math.PI / 2 && rotation < Math.PI / 2)
                    rotation = ((-this.testOldRot) + (rotation));
            }
            if (rotation != 0)
                rotation = Math.round(rotation / 0.03490);
            var val = rotation * -0.0174532925;
            if (centerUpY < centerDownY) {
                val = val * -1;
            }

            val = this.lastInclination + val;
            if (val < -Math.PI / 2)
                val = -Math.PI / 2;
            else if (val > Math.PI / 2)
                val = Math.PI / 2;

            this.mesh.rotateY(val);
            this.lastInclination = val;

            $("label[for='Degrees-Plane']").empty( );
            text = Math.round(val / -0.0174532925);
            $("label[for='Degrees-Plane']").append("Plane Inclination:<strong>" + text + "</strong>");
        }
        else
            this.mesh.rotateY(this.lastInclination);
        this.testOldRot = Math.atan2(diffy, diffx);

//        if (rotation < 0)
//            rotation = Math.PI + rotation;
//        if (rotation > Math.PI / 2)
//            rotation = -(Math.PI - rotation);
//        this.mesh.rotateY(rotation);
//        this.lastInclination = rotation;
//        console.log(this.lastInclination)
//        //Translantion && (rotation<Math.PI/2+0.44 && rotation>Math.PI/2-0.44)

    }
    else {
        this.testOldRot = null;
        this.mesh.rotateY(this.lastInclination);
        //this.mesh.position.z = this.lastZ;
    }
    if (markers.hasOwnProperty(39) && markers.hasOwnProperty(38)) {
        //39 moves
        var markerT1 = markers[38];
        var markerT1_position = [markerT1.corners[0].x, markerT1.corners[0].y, 1];
        var markerT1_position2 = [markerT1.corners[1].x, markerT1.corners[1].y, 1];
        var T1real_position, T1real_position2;
        if (Session.get('virtual') == true) {
            T1real_position = {x: markerT1_position[0], y: markerT1_position[1]};
            T1real_position2 = {x: markerT1_position2[0], y: markerT1_position2[1]}

        } else {
            //Hard code
            T1real_position = pixel2mm(markerT1_position[0], markerT1_position[1], 25);
            T1real_position2 = pixel2mm(markerT1_position2[0], markerT1_position2[1], 25);
        }

        var centroidUpX = (T1real_position.x + T1real_position2.x) / 2;
        var centroidUpY = (T1real_position.y + T1real_position2.y) / 2


        var markerT = markers[39];
        var markerT_position = [markerT.corners[0].x, markerT.corners[0].y, 1];
        var markerT_position2 = [markerT.corners[1].x, markerT.corners[1].y, 1];
        var Treal_position, Treal_position2;
        if (Session.get('virtual') == true) {
            Treal_position = {x: markerT_position[0], y: markerT_position[1]};
            Treal_position2 = {x: markerT_position2[0], y: markerT_position2[1]}

        } else {
            //Hard Code
            Treal_position = pixel2mm(markerT_position[0], markerT_position[1], 50);
            Treal_position2 = pixel2mm(markerT_position2[0], markerT_position2[1], 50);
        }

        var centroidDownX = (Treal_position.x + Treal_position2.x) / 2;
        var centroidDownY = (Treal_position.y + Treal_position2.y) / 2;
        var distance = Math.sqrt(Math.pow(centroidDownX - centroidUpX, 2) + Math.pow(centroidDownY - centroidUpY, 2));
        distance = Math.round(distance);
        //TODO:Set session variable
        if (Session.get('maxBrickZ') == undefined) {
            distance = 95 * ((distance - this.minDistance) / (this.maxDistance - this.minDistance)) - 20;
        }
        else {
            distance = (Session.get('maxBrickZ') + Session.get('maxBrickZ') * 0.25) * ((distance - this.minDistance) / (this.maxDistance - this.minDistance)) - 20;

        }
        //console.log("Distance:"+distance)
        if(distance>0)
            this.lastZ = distance;
        else 
            this.lastZ = 0;
    }
    else {
//        this.mesh.position.z = this.lastZ;
    }
//
    if (this.lastInclination > 1.50 || this.lastInclination < -1.50) {
        this.horizMesh.visible = true;
        this.mesh.visible = false;
        this.mesh.position.z = this.lastZ;
    }

    Logger.postEvent("Plane-Cutter;TopMarker:(" +
            centerUpX + "," + centerUpY + ");BottomMarker:(" +
            centerDownX + "," + centerDownY + ");RotationRad:" + this.lastInclination 
            +";RotationDeg:"+ Math.round(this.lastInclination / -0.0174532925)
            +
            ";Height:" + this.lastZ
            )
}

PlaneCutter.prototype.computeNewStatus = function(markers, view) {
    if (markers.hasOwnProperty(43) && !markers.hasOwnProperty(40)) {
        if (this.cutAvailable == false)
            Logger.postEvent("Enabling the Cut...")
        this.cutAvailable = true;
    }
    /*Simulate a cut*/
    if (!markers.hasOwnProperty(40) || this.cutAvailable == false) {
        view.scene.remove(this.selection);
        if (this.selection != null) {
            this.selection.geometry.dispose();
            for (var i in this.selection.children) {
                this.selection.children[i].geometry.dispose();
            }
        }
        this.selection = null;
        var points = THREE.GeometryUtils.randomPointsInGeometry(this.mesh.geometry, 3);
        points[0].applyMatrix4(this.mesh.matrix);
        points[1].applyMatrix4(this.mesh.matrix);
        points[2].applyMatrix4(this.mesh.matrix);
        var plane = new THREE.Plane();
        plane.setFromCoplanarPoints(points[0], points[1], points[2]);
        for (var brickIndex in this.brickManager.bricks) {
            var brick = this.brickManager.bricks[brickIndex];
            if (brick.visibility) {
                brick.faces.updateMatrix();
                /*In thise way we avoid to take into account the new blocks :)*/
                for (var blockIndex = 0, numBlocks = brick.blocks.length; blockIndex < numBlocks; blockIndex++) {
                    var block = brick.blocks[blockIndex];
                    var intersectionPoints = new Array();
                    if (this.checkFaceCut2(brick, plane, false)) {
                        continue;
                    }


                    /*Find intersection point*/
                    for (var lineIndex = 0; lineIndex < block.lines.length; lineIndex++) {
                        var line = block.lines[lineIndex];
                        var line3 = new THREE.Line3(line.geometry.vertices[0].clone(), line.geometry.vertices[1].clone());
                        line3.applyMatrix4(line.matrix);
                        if (plane.isIntersectionLine(line3)) {
                            var point = plane.intersectLine(line3);
                            intersectionPoints.push(point);
                        }

                    }
                    /*I've got the intersection points :) */
                    if (intersectionPoints.length > 1) {
                        intersectionPoints = this.sortVertices(intersectionPoints);
                        var geometry = new THREE.Geometry();
                        for (var i in intersectionPoints) {
                            geometry.vertices.push(intersectionPoints[i].clone());

                        }
//                        for (var k = 0; k < geometry.vertices.length - 2; k++) {
//                            var newFace = new THREE.Face3(0, k + 1, k + 2);
//                            geometry.faces.push(newFace);
//                        }
//
//                        var face = new THREE.Mesh(geometry, this.SimMeshMaterial);
//                        face.renderDepth = 9007199254740992;
                        var lineGeometry = geometry.clone();
                        /*Close the line*/
                        lineGeometry.vertices.push(lineGeometry.vertices[0]);
                        lineGeometry.computeLineDistances();
                        var line = new THREE.Line(lineGeometry, this.SimLineDashMaterial);
                        line.renderDepth = 9007199254740992;

                        if (this.selection == null)
                            this.selection = line;
                        else
                            this.selection.add(line);

                        // this.selection.add(line);
                    }
                }
                //view.renderer.clear();
                view.scene.add(this.selection);
//                if (Session.get("virtual") == true)
//                    MarkersDetector.forceUpdate = true;
////                else {
//                    view.renderer.clear();
//                    view.renderer.render(view.scene, view.camera);
//                }
            }
        }
    }
    //Cut the bricks
    if (markers.hasOwnProperty(40) && this.cutAvailable) {
        Logger.postEvent("Cutting...")
        console.log("Cutting");
        this.cutAvailable = false;
        var points = THREE.GeometryUtils.randomPointsInGeometry(this.mesh.geometry, 3);
        points[0].applyMatrix4(this.mesh.matrix);
        points[1].applyMatrix4(this.mesh.matrix);
        points[2].applyMatrix4(this.mesh.matrix);
        var plane = new THREE.Plane();
        plane.setFromCoplanarPoints(points[0], points[1], points[2]);
        var cutDone = false;
        /*TODO: gestire caso del piano che contiene la retta
         **/
        for (var brickIndex in this.brickManager.bricks) {
            var brick = this.brickManager.bricks[brickIndex];
            if (brick.visibility) {
                Logger.postEvent("Cutting-Brick:" + brick.id);
                brick.faces.updateMatrix();
                var brickMatrix = brick.faces.matrix.clone();
                if (this.checkFaceCut2(brick, plane, true)) {
                    console.log("Invalid cut");
                    $("#anyError > #text").text("Cutting a face");
                    $("#anyError").show(200, function() {
                        $("#anyError").hide(5000);
                    });
                    continue;
                }


                view.removeBrickFromScene(brick);

                /*In thise way we avoid to take into account the new blocks :)*/
                for (var blockIndex = 0, numBlocks = brick.blocks.length; blockIndex < numBlocks; blockIndex++) {
                    var block = brick.blocks[blockIndex];
                    //console.log("Checking Block:" + block.id)
                    /*These arrays will contain the lines of the 2 new blocks */
                    var geometries1 = new Array();
                    var geometries2 = new Array();
                    var intersectionPoints = new Array();
                    /*These arrays contain the lines which are not involved in the cut.
                     * Obviously, they need to be put in the right side*/
                    var oldLines1 = new Array();
                    var oldLines2 = new Array();
                    /*Find intersection point*/
                    for (var lineIndex = 0; lineIndex < block.lines.length; lineIndex++) {
                        var line = block.lines[lineIndex];
                        var line3 = new THREE.Line3(line.geometry.vertices[0].clone(), line.geometry.vertices[1].clone());
                        line3.applyMatrix4(line.matrix);
                        if (plane.isIntersectionLine(line3)
                                ||
                                plane.distanceToPoint(line3.start) == 0 ||
                                plane.distanceToPoint(line3.end) == 0
                                )
                        {
                            var point = plane.intersectLine(line3);
                            if (point != undefined) {
                                var inverseMatrix = line.matrix.clone();
                                inverseMatrix = inverseMatrix.getInverse(inverseMatrix);
                                var pointN = point.applyMatrix4(inverseMatrix);
                                intersectionPoints.push([pointN, line]);
                            }
                        }
                        /*If the line is not involved in the cut i keep it*/
                        else {
                            if (plane.distanceToPoint(line3.start) > 0) {
                                var oldLine = line.clone();
                                oldLine.name = "";
                                oldLines1.push(oldLine);
                            }
                            else {
                                var oldLine = line.clone();
                                oldLine.name = "";
                                oldLines2.push(oldLine);
                            }
                        }
                    }
                    //console.log("Intersections:" + intersectionPoints.length);
                    /*I've got the intersection points :) */
                    if (intersectionPoints.length > 0) {
                        if (this.checkFaceCut(block, intersectionPoints, plane)) {
                            console.log("Invalid cutting");
                            Logger.postEvent("Cutting-a-Face-of-Block:" + block.id);
                            for (var i in intersectionPoints) {
                                Logger.postEvent("Intersection-Point:(" +
                                        intersectionPoints[i][0].x + "," +
                                        intersectionPoints[i][0].y + "," +
                                        intersectionPoints[i][0].z + ");Local-Coordinates");
                            }
                            $("#anyError > #text").text("Cutting a face");
                            $("#anyError").show(200, function() {
                                $("#anyError").hide(5000);
                            })
                            break;
                        }
                        if (this.checkDegenerateCut(intersectionPoints)) {
                            console.log("Invalid cutting");
                            Logger.postEvent("Cutting-only-a-Point-of-Block:" + block.id);
                            for (var i in intersectionPoints) {
                                Logger.postEvent("Intersection-Point:(" +
                                        intersectionPoints[i][0].x + "," +
                                        intersectionPoints[i][0].y + "," +
                                        intersectionPoints[i][0].z + ");Local-Coordinates");
                            }
                            $("#anyError > #text").text("Cutting on only one Point");
                            $("#anyError").show(200, function() {
                                $("#anyError").hide(5000);
                            });
                            break;
                        }
                        if (cutDone == false) {
                            cutDone = true;
                            var backUp = [];
                            backUp.push(brick.uniqueID.clone());
                            for (var i in brick.blocks) {
                                var bb = new Block(brick.blocks[i].id);
                                bb.faces = brick.blocks[i].faces;
                                bb.lines = brick.blocks[i].lines;
                                backUp.push(bb);
                            }
                            brick.removedBlocks.push(backUp);
                        }
                        var newBlock = new Block(brick.uniqueID());
                        var newId = newBlock.id;

                        Logger.postEvent("Create-new-Block:" + newBlock.id + ";from-Block:" + block.id);
                        for (var i in intersectionPoints) {
                            Logger.postEvent("Intersection-Point:(" +
                                    intersectionPoints[i][0].x + "," +
                                    intersectionPoints[i][0].y + "," +
                                    intersectionPoints[i][0].z + ");Local-Coordinates");
                        }


                        //$('#Shape' + brick.id + '>' + '#delete-shape').remove();
                        $('#Shape' + brick.id + "> #actions").before("<button id=\"Block" + newId + "\" class=\"btn btn-mini\"  style=\"margin-top:5px;\">" + newId + "</button>");
                        $('#Shape' + brick.id + '>' + '#Block' + newId).css({'background-image': 'none', 'background-color': (this.colors[newId % this.colors.length])});

                        (function(brick, newId, view) {
                            $('#Shape' + brick.id + '>' + '#Block' + newId).on('click', $.proxy(function() {
                                if (brick.visibility) {
                                    $('#Shape' + brick.id + '>' + "button[id*='Block']").removeClass('btn-primary');
                                    $('#Shape' + brick.id + '>' + "button[id*='All']").removeClass('btn-primary');
                                    $('#Shape' + brick.id + '>' + '#Block' + newId).addClass('btn-primary');
                                    //console.log(newId);
                                    brick.highlightBlock();
                                    //view.renderer.clear();
//                                    if (Session.get("virtual") == true)
                                    MarkersDetector.forceUpdate = true;
//                                    else
//                                        view.renderer.render(view.scene, view.camera);
                                }
                            }, this));
                        })(brick, newId, view);


//                    $('#Shape' + brick.id).append("<button id=\"delete-shape\" class=\"btn btn-mini\">Delete</button>");
//                    $('#Shape' + brick.id + '> #delete-shape').on('click', function() {
//                        view.removeBrickFromScene(brick);
//                        brick.deleteBlock();
//                        view.addBrickToScene(brick);
//                        view.renderer.render(view.scene, view.camera);
//
//                    });

                        brick.blocks.push(newBlock);

                        var oldFaces = block.faces;

                        /*For each face, the first array contains the points on the 
                         * "right" side; the other for the left side 
                         *  */
                        var blockPoints = new Array(oldFaces.length);
                        var newBlockPoints = new Array(oldFaces.length);

                        block.lines = new Array();
                        block.faces = new Array();

                        for (var pointIndex = 0, length = intersectionPoints.length; pointIndex < length; pointIndex++) {
                            var geometry1 = new THREE.Geometry();
                            var geometry2 = new THREE.Geometry();
                            var point = intersectionPoints[pointIndex][0];
                            var startN = intersectionPoints[pointIndex][1].geometry.vertices[0].clone();
                            var start = startN.clone().applyMatrix4(intersectionPoints[pointIndex][1].matrix);
                            var endN = intersectionPoints[pointIndex][1].geometry.vertices[1].clone();
                            var end = endN.clone().applyMatrix4(intersectionPoints[pointIndex][1].matrix);

                            if (plane.distanceToPoint(start) == 0 && plane.distanceToPoint(end) == 0) {
                                /*When the line is on the plane, the intersection point is the start.
                                 * So we add the end as intersection point and 
                                 * computeNewLinesAndFaces will think about 
                                 * recreating the line*/
                                if (point.distanceTo(start) < point.distanceTo(start))
                                    intersectionPoints.push([endN.clone(), intersectionPoints[pointIndex][1].clone()]);
                                else
                                    intersectionPoints.push([startN.clone(), intersectionPoints[pointIndex][1].clone()]);

                            }
                            else if (plane.distanceToPoint(start) == 0) {
                                if (plane.distanceToPoint(end) > 0) {
                                    /*In this way we notify that start belongs
                                     * to the block 1.*/
                                    intersectionPoints[pointIndex].push(1);
                                    geometry1.vertices.push(startN);
                                    geometry1.vertices.push(endN);

                                }
                                else if (plane.distanceToPoint(end) < 0) {
                                    intersectionPoints[pointIndex].push(-1);
                                    geometry2.vertices.push(startN);
                                    geometry2.vertices.push(endN);
                                }

                            }
                            else if (plane.distanceToPoint(end) == 0) {
                                if (plane.distanceToPoint(start) > 0) {
                                    /*In this way we notify that start belongs
                                     * to the block 1.*/
                                    intersectionPoints[pointIndex].push(1);
                                    geometry1.vertices.push(startN);
                                    geometry1.vertices.push(endN);

                                }
                                else if (plane.distanceToPoint(start) < 0) {
                                    intersectionPoints[pointIndex].push(-1);
                                    geometry2.vertices.push(startN);
                                    geometry2.vertices.push(endN);
                                }
                            }
                            else if (plane.distanceToPoint(start) > 0) {
                                /*In this way we notify that start belongs
                                 * to the block 1.*/
                                intersectionPoints[pointIndex].push(1);
                                geometry1.vertices.push(startN);
                                geometry1.vertices.push(point);
                                geometry2.vertices.push(endN);
                                geometry2.vertices.push(point);

                            }
                            else if (plane.distanceToPoint(start) < 0) {
                                intersectionPoints[pointIndex].push(-1);
                                geometry2.vertices.push(startN);
                                geometry2.vertices.push(point);
                                geometry1.vertices.push(endN);
                                geometry1.vertices.push(point);
                            }

                            geometries1.push(geometry1);
                            geometries2.push(geometry2);

                        }

                        for (var indexFace = 0; indexFace < oldFaces.length; indexFace++) {
                            for (var indexPoint = 0; indexPoint < oldFaces[indexFace].length; indexPoint++) {
                                var pointN = oldFaces[indexFace][indexPoint].clone();
                                var point = pointN.clone().applyMatrix4(brickMatrix);

                                if (blockPoints[indexFace] === undefined) {
                                    blockPoints[indexFace] = new Array();
                                    newBlockPoints[indexFace] = new Array();

                                }
                                if (plane.distanceToPoint(point) > 0) {
                                    blockPoints[indexFace].push(pointN);
                                }
                                else if (plane.distanceToPoint(point) < 0) {
                                    newBlockPoints[indexFace].push(pointN);
                                }
                                /*If the point is on the plane, it's an intersection
                                 * point, the computeNewLinesAndFaces will
                                 * deal with it*/
                            }
                        }

                        /*At this point we have the lines of the two sides.*/
                        for (var lineIndex = 0; lineIndex < geometries1.length; lineIndex++) {
                            geometries1[lineIndex].computeLineDistances();
                            var newline = new THREE.Line(geometries1[lineIndex], this.lineMaterial);
                            block.lines.push(newline);
                        }
                        for (var lineIndex = 0; lineIndex < geometries2.length; lineIndex++) {
                            geometries2[lineIndex].computeLineDistances();
                            var newline = new THREE.Line(geometries2[lineIndex], this.lineMaterial);
                            newBlock.lines.push(newline);
                        }

                        var newElements = this.computeNewLinesAndFaces(oldFaces, intersectionPoints, oldLines1, blockPoints, newBlockPoints);
                        var newLines = newElements[0];
                        block.faces = newElements[1];
                        newBlock.faces = newElements[2];
                        block.lines = block.lines.concat(oldLines1, newLines);
                        var newLines2 = new Array();
                        for (var g in newLines) {
                            newLines2.push(newLines[g].clone());
                        }
                        newBlock.lines = newBlock.lines.concat(oldLines2, newLines2);

                    }
                }

                //brick.removedBlocks = new Array();
                //$('#Shape' + brick.id + '> #restore-shape').text("Undo(0)");
                brick.recreateBrick();
                view.addBrickToScene(brick);
//                if (Session.get("virtual") == true)
//                    MarkersDetector.forceUpdate = true;
//                else
//                    view.renderer.render(view.scene, view.camera);
            }
        }
        console.log("Cuttind end")
    }

}

/*Check if a face is on the cutting plane*/
PlaneCutter.prototype.checkFaceCut = function(block, intersectionPoints, plane) {
    if (intersectionPoints.length <= 2)
        return true;
    //console.log("Checking face for block:" + block.id);
    var newInterPoint = [];

    for (var index = 0, indexMax = intersectionPoints.length; index < indexMax; index++) {
        /*Adding intersection points when the line is coplanar*/
        var line = intersectionPoints[index][1];
        var line3 = new THREE.Line3(line.geometry.vertices[0].clone(), line.geometry.vertices[1].clone());
        line3.applyMatrix4(line.matrix);
        newInterPoint.push(intersectionPoints[index]);
        if (plane.distanceToPoint(line3.start) == 0 && plane.distanceToPoint(line3.end) == 0) {
            newInterPoint.push([line.geometry.vertices[1].clone(), line.clone()]);
        }
    }

    intersectionPoints = newInterPoint;
    for (var indexFace = 0; indexFace < block.faces.length; indexFace++) {
        var face = block.faces[indexFace];
        var flag = 0;
        for (var indexPoint = 0; indexPoint < face.length; indexPoint++) {
            var minD = 1000;
            for (var indexIntersect = 0; indexIntersect < intersectionPoints.length; indexIntersect++) {
                var facePoint = face[indexPoint].clone();
                var cutPoint = intersectionPoints[indexIntersect][0].clone();
                var distance = facePoint.distanceTo(cutPoint);
                if (distance < minD)
                    minD = distance;

            }
            if (minD < 0.5)
                flag++;
        }
        if (flag > 2)
            return true;

    }
    return false;
}
PlaneCutter.prototype.checkFaceCut2 = function(brick, plane, postFlag) {

    for (var indexBlock = 0; indexBlock < brick.blocks.length; indexBlock++) {
        var block = brick.blocks[indexBlock];
        for (var indexFace = 0; indexFace < block.faces.length; indexFace++) {
            var flag = 0;
            for (var indexPoint = 0; indexPoint < block.faces[indexFace].length; indexPoint++) {
                var point = block.faces[indexFace][indexPoint].clone();
                point = point.applyMatrix4(brick.faces.matrix);
                if (Math.abs(plane.distanceToPoint(point)) < 0.5) {
                    flag++;
                }
            }
            if (flag > 2) {
                if (postFlag)
                    Logger.postEvent("Cutting-a-Face;Brick:" + brick.id + ";Block:" + block.id + ";Face:" + indexFace);
                return true;
            }
        }
    }
    return false;

}

PlaneCutter.prototype.computeNewLinesAndFaces = function(oldFaces, intersectionPoints, OldLines1, blockPoints, newBlockPoints) {
    /*Create new lines between intersection points and new faces*/
    var newLines = new Array();
    var newFaces1 = new Array();
    var newFaces2 = new Array();

    /*Initial creation of the faces. This puts the points of the old block
     * in the correct new block*/
    for (var faceIndex = 0; faceIndex < oldFaces.length; faceIndex++) {
        newFaces1.push(blockPoints[faceIndex]);
        newFaces2.push(newBlockPoints[faceIndex]);
    }

    for (var pointIndex1 = 0; pointIndex1 < intersectionPoints.length; pointIndex1++) {
        var start = intersectionPoints[pointIndex1][1].geometry.vertices[0].clone();
        var end = intersectionPoints[pointIndex1][1].geometry.vertices[1].clone();
        for (var faceIndex = 0; faceIndex < oldFaces.length; faceIndex++) {
            var checkFlag = 0;
            /*Find the face which contains the line*/
            for (var planePointIndex = 0; planePointIndex < oldFaces[faceIndex].length; planePointIndex++) {
                if (oldFaces[faceIndex][planePointIndex].equals(start) || oldFaces[faceIndex][planePointIndex].equals(end)) {
                    checkFlag++;
                }
            }
            if (checkFlag == 2) {
                /*Add the intersection point to the faces of the new blocks*/
                newFaces1[faceIndex].push(intersectionPoints[pointIndex1][0].clone());
                newFaces2[faceIndex].push(intersectionPoints[pointIndex1][0].clone());

                /*Look for another intersaction point on the same face to create
                 * a new line*/
                for (var pointIndex2 = pointIndex1 + 1; pointIndex2 < intersectionPoints.length; pointIndex2++) {
                    var start2 = intersectionPoints[pointIndex2][1].geometry.vertices[0].clone();
                    var end2 = intersectionPoints[pointIndex2][1].geometry.vertices[1].clone();
                    var checkFlag2 = 0;

                    for (var planePointIndex = 0; planePointIndex < oldFaces[faceIndex].length; planePointIndex++) {
                        if (oldFaces[faceIndex][planePointIndex].equals(start2) || oldFaces[faceIndex][planePointIndex].equals(end2)) {
                            checkFlag2++;
                        }
                    }
                    if (checkFlag2 == 2) {
                        //Add lines
                        var geometry = new THREE.Geometry();
                        geometry.vertices.push(intersectionPoints[pointIndex1][0].clone());
                        geometry.vertices.push(intersectionPoints[pointIndex2][0].clone());
                        var line = new THREE.Line(geometry, this.lineMaterial);
                        newLines.push(line);
                    }
                }

            }

        }
    }

    /*Basically add the new faces made of the intersection points*/
    var lastFace = new Array();
    var lastFace2 = new Array();
    for (var pointIndex1 = 0; pointIndex1 < intersectionPoints.length; pointIndex1++) {
        lastFace.push(intersectionPoints[pointIndex1][0].clone());
        lastFace2.push(intersectionPoints[pointIndex1][0].clone());
    }
    newFaces1.push(lastFace);
    newFaces2.push(lastFace2);

    /*Delete empty faces*/
    for (var i = newFaces1.length - 1; i >= 0; i--) {
        if (newFaces1[i].length == 0) {
            newFaces1.splice(i, 1);
        }
    }
    for (var i = newFaces2.length - 1; i >= 0; i--) {
        if (newFaces2[i].length == 0) {
            newFaces2.splice(i, 1);
        }
    }

    /*Sort the vertices in the faces*/
    for (var indexFace = 0; indexFace < newFaces1.length; indexFace++) {
        var face = newFaces1[indexFace];
        newFaces1[indexFace] = this.sortVertices(face);
    }
    for (var indexFace = 0; indexFace < newFaces2.length; indexFace++) {
        var face = newFaces2[indexFace];
        newFaces2[indexFace] = this.sortVertices(face);
    }
    return [newLines, newFaces1, newFaces2];

}

PlaneCutter.prototype.sortVertices = function(face) {
    //console.log("Sorting Vertices:", face);
    /*Delete duplicates*/
    var clean_face = new Array();
    for (var indexPoint1 = 0; indexPoint1 < face.length; indexPoint1++) {
        var unique = true;
        for (var indexPoint2 = indexPoint1 + 1; indexPoint2 < face.length; indexPoint2++) {
            if (face[indexPoint1].equals(face[indexPoint2])) {
                unique = false;
                break;
            }
        }
        if (unique)
            clean_face.push(face[indexPoint1]);
    }
    //console.log("Aftern Cleaning:", clean_face);

    //face =clean_face;


    var plane = new THREE.Plane();
    //inultile

    plane.setFromCoplanarPoints(clean_face[0], clean_face[1], clean_face[2]);

    //centroid
    var centroid = new THREE.Vector3(clean_face[0].x, clean_face[0].y, clean_face[0].z);
    for (var indexPoint = 1; indexPoint < clean_face.length; indexPoint++) {
        centroid = centroid.add(clean_face[indexPoint]);
    }
    centroid = centroid.divideScalar(clean_face.length);
    // console.log("Centroid:", centroid);

    var angles = new Array();

    var z_axis = plane.normal;
    z_axis = z_axis.normalize();
    if (z_axis.equals(new THREE.Vector3(0, 0, 0))) {
        console.log("er");
//        console.log(clean_face[0]);
//        console.log(clean_face[1]);
//        console.log(clean_face[2]);
    }
    var x_axis, y_axis;
    if (z_axis.equals(new THREE.Vector3(0, 0, 1)) || z_axis.equals(new THREE.Vector3(0, 0, -1))) {
        x_axis = new THREE.Vector3(1, 0, 0);
        y_axis = new THREE.Vector3(0, 1, 0);
    }
    else {
        x_axis = z_axis.clone().cross(new THREE.Vector3(0, 0, 1));
        y_axis = x_axis.clone().cross(z_axis);
    }
    x_axis = x_axis.normalize();
    y_axis = y_axis.normalize();
    // console.log("Axis:", x_axis, y_axis, z_axis);

    var newIndexOrder = new Array();
    for (var indexPoint = 0; indexPoint < clean_face.length; indexPoint++) {
        newIndexOrder.push(indexPoint);
        var point = clean_face[indexPoint].clone();
        point = point.sub(centroid);
        angles[indexPoint] = Math.atan2(point.dot(y_axis), point.dot(x_axis));
    }

    var newFace = new Array(clean_face.length);
    newIndexOrder.sort(function(a, b) {
        return angles[a] - angles[b]
    });





    for (var i = 0; i < newIndexOrder.length; i++) {
        newFace[i] = clean_face[newIndexOrder[i]];
    }
    return newFace;
}

PlaneCutter.prototype.intersectionPlaneLine = function(plane, line) {

    var startSign = plane.distanceToPoint(line.start);
    var endSign = plane.distanceToPoint(line.end);

    if (Math.abs(startSign) < 0.5)
        startSign = 0;
    if (Math.abs(endSign) < 0.5)
        endSign = 0;

    return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);
}

PlaneCutter.prototype.checkDegenerateCut = function(intersectionPoints) {
    if (intersectionPoints.length == 1)
        return true;

    return false;
}


 