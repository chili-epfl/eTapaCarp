/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
FakeMD_Mouse = function(view, activity) {
    Session.set('virtual', true);
    this.needUpdate = false;
    this.view = view;
    this.activity = activity;
    this.activeMarkers = {};
    this.sphereUp;
    this.sphereDown;
    this.dragging = false;
    this.dragObj;
    this.plane_rotation = 0;
    this.brick_rotation = 0;
    this.animationId;
    this.multiRend = 0;
    this.plane_hidden = false;

}
FakeMD_Mouse.prototype.Start = function() {
    var that = this;
    that.animationId = requestAnimationFrame(function() {
        that.Start();
    });
    if (this.needUpdate || MarkersDetector.forceUpdate) {
        MarkersDetector.forceUpdate = false;

        if (this.needUpdate)
            MarkersDetector.forceUpdate = true;
        this.needUpdate = false;
        Logger.postTag("----Update----")
        Logger.postEvent("----Update----")

        this.activity.update(this)

//        this.view.renderer.render(this.view.scene, this.view.camera);
    }

}

FakeMD_Mouse.prototype.init = function() {
    var canvas = document.getElementById(this.view.name);
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);

    /*Create the tool and the object*/
    var geometry = new THREE.SphereGeometry(5);

    this.sphereUp = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0xC11B17}));
    this.sphereUp.material.depthTest = false;
    this.sphereUp.renderDepth = 9007199254740992;
    this.sphereDown = new THREE.Mesh(geometry.clone(),new THREE.MeshBasicMaterial({color:0xAFDCEC}));
    this.sphereDown.material.depthTest = false;
    this.sphereDown.renderDepth = 9007199254740992;

    this.sphereUp.position.y = 100;
    this.sphereDown.position.y = -100;
    this.sphereDown.position.x = 30;
    this.view.scene.add(this.sphereUp);
    this.view.scene.add(this.sphereDown);

    var marker = {id: 41, corners: []};
    marker.corners.push({x: this.sphereUp.position.x, y: this.sphereUp.position.y});
    marker.corners.push({x: this.sphereUp.position.x, y: this.sphereUp.position.y});
    marker.corners.push({x: this.sphereUp.position.x, y: this.sphereUp.position.y});
    marker.corners.push({x: this.sphereUp.position.x, y: this.sphereUp.position.y});

    this.activeMarkers['41'] = marker;
    var marker2 = {id: 42, corners: []};
    marker2.corners.push({x: this.sphereDown.position.x, y: this.sphereDown.position.y});
    marker2.corners.push({x: this.sphereDown.position.x, y: this.sphereDown.position.y});
    marker2.corners.push({x: this.sphereDown.position.x, y: this.sphereDown.position.y});
    marker2.corners.push({x: this.sphereDown.position.x, y: this.sphereDown.position.y});
    this.activeMarkers['42'] = marker2;

    var marker3 = {id: 37, corners: []};
    marker3.corners.push({x: 0, y: 0});
    marker3.corners.push({x: 1, y: 0});
    marker3.corners.push({x: 0, y: 0});
    marker3.corners.push({x: 0, y: 0});
    this.activeMarkers['37'] = marker3;
    this.needUpdate = true;
    var marker4 = {id: 45, corners: []};
    marker4.corners.push({x: 1, y: 0});
    marker4.corners.push({x: 0, y: 0});
    marker4.corners.push({x: 0, y: 0});
    marker4.corners.push({x: 0, y: 0});
    this.activeMarkers['45'] = marker4;
    this.needUpdate = true;
    var marker5 = {id: 39, corners: []};
    marker5.corners.push({x: (Session.get('tools')[83]['extra_info']['maxDistance'] +
                Session.get('tools')[83]['extra_info']['minDistance']) / 2, y: 0});
    marker5.corners.push({x: (Session.get('tools')[83]['extra_info']['maxDistance'] +
                Session.get('tools')[83]['extra_info']['minDistance']) / 2, y: 0});
    marker5.corners.push({x: (Session.get('tools')[83]['extra_info']['maxDistance'] +
                Session.get('tools')[83]['extra_info']['minDistance']) / 2, y: 0});
    marker5.corners.push({x: (Session.get('tools')[83]['extra_info']['maxDistance'] +
                Session.get('tools')[83]['extra_info']['minDistance']) / 2, y: 0});
    var marker6 = {id: 38, corners: []};
    marker6.corners.push({x: 0, y: 0});
    marker6.corners.push({x: 0, y: 0});
    marker6.corners.push({x: 0, y: 0});
    marker6.corners.push({x: 0, y: 0});

    this.activeMarkers['38'] = marker6;
    this.needUpdate = true;
    var that = this;

    var width = $("#brickKnob").parent().width();
    $("#brickKnob").attr('data-width', width);
    $("#brickKnob").attr('data-height', width);
    $("#brickKnob").attr('data-max', 100000 * (Math.PI));
    $("#brickKnob").attr('data-min', -100000 * (Math.PI));
    $("#brickKnob").attr('data-step', 3490);

    $("#brickKnob").attr('value', 0);

    $("#brickKnob").knob({
        change: function(value) {
            var x = that.activeMarkers[37].corners[0].x;
            var y = that.activeMarkers[37].corners[0].y;
            that.brick_rotation = -value / 100000;
            var marker = {id: 37};
            marker.corners = [];
            marker.corners.push({x: x, y: y});
            marker.corners.push({x: x + Math.cos(-value / 100000), y: y + Math.sin(-value / 100000)});
            marker.corners.push({x: "Nan", y: "Nan"});
            marker.corners.push({x: "Nan", y: "Nan"});
            that.activeMarkers[37] = marker;
            that.needUpdate = true;
//            console.log(value);
            $("label[for='Degrees-Brick']").empty( );
            $("label[for='Degrees-Brick']").append(Math.round(100000 * (Math.round(value) / 100000) * 180 / Math.PI) / 100000);
        },
        release: function(value) {
            //console.log(this.$.attr('value'));
//            console.log("release : " + value);
        },
        cancel: function() {
//            console.log("cancel : ", this);
        },
        draw: function() {
            // "tron" case
            if (this.$.data('skin') == 'tron') {

                var a = this.angle(this.cv) // Angle
                        , sa = this.startAngle // Previous start angle
                        , sat = this.startAngle // Start angle
                        , ea // Previous end angle
                        , eat = sat + a // End angle
                        , r = 1;


                this.g.lineWidth = this.lineWidth;

                this.o.cursor
                        && (sat = eat - 0.3)
                        && (eat = eat + 0.3);

                if (this.o.displayPrevious) {
                    ea = this.startAngle + this.angle(this.v);
                    this.o.cursor
                            && (sa = ea - 0.3)
                            && (ea = ea + 0.3);
                    this.g.beginPath();
                    this.g.strokeStyle = this.pColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                    this.g.stroke();
                }

                this.g.beginPath();
                this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                this.g.stroke();

                this.g.lineWidth = 2;
                this.g.beginPath();
                this.g.strokeStyle = this.o.fgColor;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                this.g.stroke();

                return false;
            }
        }
    });
    $("#brickKnob").css({'background': 'url(  \'/actions/Rotation-icon.png\')'
        , 'background-repeat': 'no-repeat'
        , 'background-position': 'center center'
        , 'background-size': 'contain'});

    /*    $("#rotate-brick").slider({
     //        min: -100 * (Math.PI - 0.05),
     //        max: 100 * (Math.PI - 0.05),
     //        step: 1,
     //        value: 0,
     //        slide: function(event, ui) {
     //            var x = that.activeMarkers[20].corners[0].x;
     //            var y = that.activeMarkers[20].corners[0].y;
     //            that.brick_rotation = ui.value / 100;
     //            var marker = {id: 20};
     //            marker.corners = [];
     //            marker.corners.push({x: x, y: y});
     //            marker.corners.push({x: x + Math.cos(ui.value / 100), y: y + Math.sin(ui.value / 100)});
     //            marker.corners.push({x: "Nan", y: "Nan"});
     //            marker.corners.push({x: "Nan", y: "Nan"});
     //            that.activeMarkers[20] = marker;
     //            that.needUpdate = true;
     //            $("label[for='Degrees-Brick']").empty( );
     //            $("label[for='Degrees-Brick']").append(Math.round(100 * (Math.round(ui.value) / 100) * 180 / Math.PI) / 100);
     //        }
     //    });
     //    $("#rotate-brick-less").click(function() {
     //        var val = $("#rotate-brick").slider("option", "value");
     //        val = val - 1;
     //        $("#rotate-brick").slider("value", val);
     //        console.log(val);
     //        var x = that.activeMarkers[20].corners[0].x;
     //        var y = that.activeMarkers[20].corners[0].y;
     //        that.brick_rotation = val / 100;
     //        var marker = {id: 20};
     //        marker.corners = [];
     //        marker.corners.push({x: x, y: y});
     //        marker.corners.push({x: x + Math.cos(val / 100), y: y + Math.sin(val / 100)});
     //        marker.corners.push({x: "Nan", y: "Nan"});
     //        marker.corners.push({x: "Nan", y: "Nan"});
     //        that.activeMarkers[20] = marker;
     //        that.needUpdate = true;
     //        $("label[for='Degrees-Brick']").empty( );
     //        $("label[for='Degrees-Brick']").append(Math.round(100 * (Math.round(val) / 100) * 180 / Math.PI) / 100);
     //
     //    });
     //    $("#rotate-brick-plus").click(function() {
     //        var val = $("#rotate-brick").slider("option", "value");
     //        val = val + 1;
     //        $("#rotate-brick").slider("value", val);
     //        console.log(val);
     //        var x = that.activeMarkers[20].corners[0].x;
     //        var y = that.activeMarkers[20].corners[0].y;
     //        that.brick_rotation = val / 100;
     //        var marker = {id: 20};
     //        marker.corners = [];
     //        marker.corners.push({x: x, y: y});
     //        marker.corners.push({x: x + Math.cos(val / 100), y: y + Math.sin(val / 100)});
     //        marker.corners.push({x: "Nan", y: "Nan"});
     //        marker.corners.push({x: "Nan", y: "Nan"});
     //        that.activeMarkers[20] = marker;
     //        that.needUpdate = true;
     //        $("label[for='Degrees-Brick']").empty( );
     //        $("label[for='Degrees-Brick']").append(Math.round(100 * (Math.round(val) / 100) * 180 / Math.PI) / 100);
     //
     //    });*/


    var width = $("#planeKnob").parent().width();
    $("#planeKnob").attr('data-width', width);
    $("#planeKnob").attr('data-height', width);
    $("#planeKnob").attr('data-max', 100000 * Math.PI * 2);
    $("#planeKnob").attr('data-min', 0);
    $("#planeKnob").attr('data-step', 3490);
    $("#planeKnob").attr('data-cursor', true);


    $("#planeKnob").attr('value', 0);

    $("#planeKnob").knob({
        change: function(value) {
            that.plane_rotation = parseInt(-value) / 100000;
            var marker = {id: 45};
            marker.corners = [];
            marker.corners.push({x: Math.cos(-value / 100000), y: Math.sin(-value / 100000)});
            marker.corners.push({x: 0, y: 0});
            marker.corners.push({x: "Nan", y: "Nan"});
            marker.corners.push({x: "Nan", y: "Nan"});
            that.activeMarkers[45] = marker;
            that.needUpdate = true;
//            $("label[for='Degrees-Plane']").empty( );
//            $("label[for='Degrees-Plane']").append("Plane Inclination:<strong>"+Math.round(100000 * (Math.round(value) / 100000) * 180 / Math.PI) / 100000+"</strong>");
            
//        console.log($("Degrees-Plane"))
        },
        release: function(value) {
            //console.log(this.$.attr('value'));
//            console.log("release : " + value);
        },
        cancel: function() {
//            console.log("cancel : ", this);
        },
        draw: function() {
            // "tron" case
            if (this.$.data('skin') == 'tron') {

                var a = this.angle(this.cv) // Angle
                        , sa = this.startAngle // Previous start angle
                        , sat = this.startAngle // Start angle
                        , ea // Previous end angle
                        , eat = sat + a // End angle
                        , r = 1;


                this.g.lineWidth = this.lineWidth;

                this.o.cursor
                        && (sat = eat - 0.3)
                        && (eat = eat + 0.3);

                if (this.o.displayPrevious) {
                    ea = this.startAngle + this.angle(this.v);
                    this.o.cursor
                            && (sa = ea - 0.3)
                            && (ea = ea + 0.3);
                    this.g.beginPath();
                    this.g.strokeStyle = this.pColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
                    this.g.stroke();
                }

                this.g.beginPath();
                this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
                this.g.stroke();

                this.g.lineWidth = 2;
                this.g.beginPath();
                this.g.strokeStyle = this.o.fgColor;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                this.g.stroke();

                return false;
            }
        }
    });
    $("#planeKnob").css({'background': 'url(  \'/actions/RotatePlane.png\')'
        , 'background-repeat': 'no-repeat'
        , 'background-position': 'center center'
        , 'background-size': 'contain'});
    /*
     $("#rotate-plane").slider({
     min: -100 * Math.PI / 2,
     max: 100 * Math.PI / 2,
     step: 1,
     value: 0,
     slide: function(event, ui) {
     
     that.plane_rotation = parseInt(ui.value) / 100;
     var marker = {id: 45};
     marker.corners = [];
     marker.corners.push({x: 0, y: 0});
     marker.corners.push({x: Math.sin(ui.value / 100), y: Math.cos(ui.value / 100)});
     marker.corners.push({x: "Nan", y: "Nan"});
     marker.corners.push({x: "Nan", y: "Nan"});
     that.activeMarkers[45] = marker;
     that.needUpdate = true;
     $("label[for='Degrees-Plane']").empty( );
     $("label[for='Degrees-Plane']").append(Math.round(100 * (Math.round(ui.value) / 100) * 180 / Math.PI) / 100);
     }
     });
     $("#rotate-plane-less").click(function() {
     var val = $("#rotate-plane").slider("option", "value");
     val = val - 1;
     $("#rotate-plane").slider("value", val);
     that.plane_rotation = val / 100;
     var marker = {id: 45};
     marker.corners = [];
     marker.corners.push({x: 0, y: 0});
     marker.corners.push({x: Math.sin(val / 100), y: Math.cos(val / 100)});
     marker.corners.push({x: "Nan", y: "Nan"});
     marker.corners.push({x: "Nan", y: "Nan"});
     that.activeMarkers[45] = marker;
     that.needUpdate = true;
     $("label[for='Degrees-Plane']").empty( );
     $("label[for='Degrees-Plane']").append(Math.round(100 * (Math.round(val) / 100) * 180 / Math.PI) / 100);
     
     });
     $("#rotate-plane-plus").click(function() {
     var val = $("#rotate-plane").slider("option", "value");
     val = val + 1;
     $("#rotate-plane").slider("value", val);
     that.plane_rotation = val / 100;
     var marker = {id: 45};
     marker.corners = [];
     marker.corners.push({x: 0, y: 0});
     marker.corners.push({x: Math.sin(val / 100), y: Math.cos(val / 100)});
     marker.corners.push({x: "Nan", y: "Nan"});
     marker.corners.push({x: "Nan", y: "Nan"});
     that.activeMarkers[45] = marker;
     that.needUpdate = true;
     $("label[for='Degrees-Plane']").empty( );
     $("label[for='Degrees-Plane']").append(Math.round(100 * (Math.round(val) / 100) * 180 / Math.PI) / 100);
     
     });*/


    $("#move-plane").slider({
        min: Session.get('tools')[83]['extra_info']['minDistance'],
        max: Session.get('tools')[83]['extra_info']['maxDistance'],
        step: 1,
        value: (Session.get('tools')[83]['extra_info']['maxDistance'] +
                Session.get('tools')[83]['extra_info']['minDistance']) / 2,
        slide: function(event, ui) {
            var x = that.activeMarkers[38].corners[0].x;
            var y = that.activeMarkers[38].corners[0].y;
            var marker = {id: 39};
            marker.corners = [];
            marker.corners.push({x: x + ui.value, y: y});
            marker.corners.push({x: x + ui.value, y: y});
            marker.corners.push({x: "Nan", y: "Nan"});
            marker.corners.push({x: "Nan", y: "Nan"});
            that.activeMarkers[39] = marker;
            that.needUpdate = true;
            $("label[for='z-Plane']").empty( );
            $("label[for='z-Plane']").append(ui.value);
        }
    });

    var that = this;
    $("#show-on").click(function() {
        $('#show-off').removeClass('btn-primary');
        $('#show-on').addClass('btn-primary');
        that.plane_hidden = false;
        var marker = {id: 41, corners: []};
        marker.corners.push({x: that.sphereUp.position.x, y: that.sphereUp.position.y});
        marker.corners.push({x: that.sphereUp.position.x, y: that.sphereUp.position.y});
        marker.corners.push({x: that.sphereUp.position.x, y: that.sphereUp.position.y});
        marker.corners.push({x: that.sphereUp.position.x, y: that.sphereUp.position.y});
        that.activeMarkers['41'] = marker;
        that.needUpdate = true;
    })
    $("#show-off").click(function() {
        $('#show-on').removeClass('btn-primary');
        $('#show-off').addClass('btn-primary');
        delete that.activeMarkers[41];
        that.plane_hidden = true;
        that.needUpdate = true;

    })




    $("#cut").mousedown(function() {
        var status = $(this).attr("status");
//        console.log(status);
        if (status == "cut") {
            var marker = {id: 40};
            marker.corners = [];
            marker.corners.push({x: 0, y: 0});
            marker.corners.push({x: 0, y: 0});
            marker.corners.push({x: "Nan", y: "Nan"});
            marker.corners.push({x: "Nan", y: "Nan"});
            that.activeMarkers[40] = marker;
            that.needUpdate = true;
            $(this).attr("status", "restore");
        }
    })

    $("#cut").mouseup(function() {
        var marker = {id: 43};
        marker.corners = [];
        marker.corners.push({x: 0, y: 0});
        marker.corners.push({x: 0, y: 0});
        marker.corners.push({x: "Nan", y: "Nan"});
        marker.corners.push({x: "Nan", y: "Nan"});
        that.activeMarkers[43] = marker;
        delete that.activeMarkers[40];
        that.needUpdate = true;
        $(this).attr("status", "cut");

    })




}
/*Drag'n'Drop
 *   $("#rotate-plane-left").on('click', function() {
 plane_rotation += 0.05;
 var marker = {id: 45};
 marker.corners = [];
 marker.corners.push({x: 0, y: 0});
 marker.corners.push({x: Math.sin(plane_rotation), y: Math.cos(plane_rotation)});
 fakeMarkerDetector["activeMarkers"][45] = marker;
 markersUpdated = true;
 })
 $("#rotate-plane-right").on('click', function() {
 plane_rotation -= 0.05;
 var marker = {id: 45};
 marker.corners = [];
 marker.corners.push({x: 0, y: 0});
 marker.corners.push({x: Math.sin(plane_rotation), y: Math.cos(plane_rotation)});
 fakeMarkerDetector["activeMarkers"][45] = marker;
 markersUpdated = true;
 })*/
FakeMD_Mouse.prototype.onMouseDown = function(event) {
    if (!this.dragging) {
        var canvas = document.getElementById('perspective');
        var rect = canvas.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var y = (rect.height / 2 - event.clientY + rect.top) / (rect.height / 2);
        var camera = this.view.camera;
        var projector = new THREE.Projector();
        var vector = new THREE.Vector3(x, y,
                0.5);
        projector.unprojectVector(vector, camera);
        var vector_orig = vector.clone();
        var dir = vector.sub(camera.position).normalize();
        var distance = -camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));

        var raycaster = new THREE.Raycaster(camera.position, vector_orig.sub(camera.position).normalize());
        var brickManager = this.view.brickManager;
        for (var index in brickManager.bricks) {
            var intersect = raycaster.intersectObject(brickManager.bricks[index].faces, true);
            if (raycaster.intersectObject(brickManager.bricks[index].faces, true).length > 0) {
                this.dragging = true;
                this.dragObj = {obj: brickManager.bricks[index].faces, type: brickManager.bricks[index].id};
                break;
            }

        }
        if (raycaster.intersectObject(this.sphereUp, true).length > 0) {
            this.dragging = true;
            this.dragObj = {obj: this.sphereUp, type: 41};
        }
        if (raycaster.intersectObject(this.sphereDown, true).length > 0) {
            this.dragging = true;
            this.dragObj = {obj: this.sphereDown, type: 42};
        }
    }
    else {
        this.dragging = false;
    }




    /** Prevent default actions caused by mouse wheel.
     * That might be ugly, but we handle scrolls somehow
     * anyway, so don't bother here..
     */
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}
FakeMD_Mouse.prototype.onMouseMove = function(event) {
    if (this.dragging) {
        this.needUpdate = true;
        var canvas = document.getElementById('perspective');
        var rect = canvas.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var y = (rect.height / 2 - event.clientY + rect.top) / (rect.height / 2);
        var camera = this.view.camera;
        var projector = new THREE.Projector();
        var vector = new THREE.Vector3(x, y,
                0.5);
        projector.unprojectVector(vector, camera);
        var dir = vector.sub(camera.position).normalize();
        var distance = -camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        if (Math.abs(pos.x) < Config.WORKSPACE_DIMENSION.x / 2 && Math.abs(pos.y) < Config.WORKSPACE_DIMENSION.y / 2)
        {
            if (this.dragObj['type'] != 41 || (this.dragObj['type'] == 41 && !this.plane_hidden)) {
                var marker = {id: this.dragObj['type']};
                marker.corners = [];
                marker.corners.push({x: pos.x, y: pos.y});
                if (this.dragObj['type'] == 37) {
                    marker.corners.push({x: pos.x + Math.cos(this.brick_rotation), y: pos.y + Math.sin(this.brick_rotation)});
                }
                else {
                    marker.corners.push({x: pos.x, y: pos.y});
                }
                marker.corners.push({x: pos.x, y: pos.y});
                marker.corners.push({x: pos.x, y: pos.y});
                this.activeMarkers[this.dragObj['type']] = marker;

            }
            if (this.dragObj['type'] == 41 || this.dragObj['type'] == 42) {
                this.dragObj["obj"].position.x = pos.x;
                this.dragObj["obj"].position.y = pos.y;
            }
        }

    }




    /** Prevent default actions caused by mouse wheel.
     * That might be ugly, but we handle scrolls somehow
     * anyway, so don't bother here..
     */
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}
FakeMD_Mouse.prototype.onMouseUp = function(event) {

    this.dragging = false;





    /** Prevent default actions caused by mouse wheel.
     * That might be ugly, but we handle scrolls somehow
     * anyway, so don't bother here..
     */
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}

FakeMD_Mouse.prototype.stopTagDetection = function() {
    cancelAnimationFrame(this.animationId);
}
