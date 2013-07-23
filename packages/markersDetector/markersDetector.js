(function(root){

function MarkersDetector(video, canvas){
    this.video = document.getElementById(video);
    this.camcanvas = document.getElementById(canvas);
    this.context = this.camcanvas.getContext("2d");

    this.camcanvas.width = parseInt(this.camcanvas.style.width);
    this.camcanvas.height = parseInt(this.camcanvas.style.height);

    this.calibrationCanvas = document.getElementById("calibrationCanvas");
    this.calibrationContext = this.calibrationCanvas.getContext("2d");

    this.init_cam();

    this.raster = new NyARRgbRaster_Canvas2D(this.camcanvas);
    this.detectorParam = new FLARParam(640, 480);
    this.detector = new FLARMultiIdMarkerDetector(this.detectorParam, 100);
    this.detector.setContinueMode(true);
    this.markers = [];
    this.markers_before = [];
    this.change_count = 0;
}

MarkersDetector.prototype.accessCamera = function(){
    var that = this;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (navigator.getUserMedia){

        function successCallback(stream){
            if (navigator.getUserMedia == navigator.mozGetUserMedia){
                that.video.src = window.URL.createObjectURL(stream);
            }
            else if (window.webkitURL) {
                that.video.src = window.webkitURL.createObjectURL(stream);
            } else {
                that.video.src = stream;
            }
            that.video.play()
        }

        function errorCallback(error){
        }
        navigator.getUserMedia({video: true}, successCallback, errorCallback);
    }
};

MarkersDetector.prototype.init_cam = function(){
        var width = 520;
        this.calibrationCanvas.width = width;
        this.calibrationCanvas.height = Math.ceil(width/(640/480));
        this.calibrationContext.translate(this.calibrationCanvas.width, this.calibrationCanvas.height);
        this.calibrationContext.scale(-1, -1);
    }; 

MarkersDetector.prototype.snapshot = function(){
    this.context.drawImage(this.video, 0, 0, this.camcanvas.width, this.camcanvas.height);
    this.imageData = this.context.getImageData(0, 0, this.camcanvas.width, this.camcanvas.height);
    this.camcanvas.changed = true;
};

MarkersDetector.prototype.calibrate = function(){
    this.topRight = this.topLeft = this.bottomRight = this.bottomLeft = null;
    for (var i in this.corners){
        var marker = this.corners[i];
        switch(marker.id){
            case 4:
                this.bottomLeft = marker;
                break;
            case 3:
                this.topLeft = marker;
                break;
            case 1:
                this.topRight = marker;
                break;
            case 2:
                this.bottomRight = marker;
                break;
        }
    }
    if (this.topRight && this.bottomRight && this.bottomLeft && this.topLeft){
        localStorage.setItem('bottomLeft', JSON.stringify(this.bottomLeft));
        localStorage.setItem('topLeft', JSON.stringify(this.topLeft));
        localStorage.setItem('topRight', JSON.stringify(this.topRight));
        localStorage.setItem('bottomRight', JSON.stringify(this.bottomRight));


        $.getJSON("https://craftpc45.epfl.ch/rotAndTransMatrices.json?callback=?",
            {'x1':this.bottomLeft.corners[1].x,
                'y1':this.bottomLeft.corners[1].y,
                'x2':this.topLeft.corners[2].x,
                'y2':this.topLeft.corners[2].y,
                'x3':this.topRight.corners[3].x,
                'y3':this.topRight.corners[3].y,
                'x4':this.bottomRight.corners[0].x,
                'y4':this.bottomRight.corners[0].y},
            function(data) {
                localStorage.setItem('rotationMatrix', JSON.stringify(data.rotationMatrix));
                localStorage.setItem('translationMatrix', JSON.stringify(data.translationMatrix));
                localStorage.setItem('intrinsicMatrix', JSON.stringify(data.intrinsic_matrix));
                localStorage.setItem('angle', JSON.stringify(data.angle));
            }
        );
    }
};

MarkersDetector.prototype.distanceWithSavedTags = function(){
    var saved_bottomLeft = JSON.parse(localStorage.getItem('bottomLeft'));
    var saved_topLeft = JSON.parse(localStorage.getItem('topLeft'));
    var saved_topRight = JSON.parse(localStorage.getItem('topRight'));
    var saved_bottomRight = JSON.parse(localStorage.getItem('bottomRight'));
    var maxDistance = 0;
    for (var i in this.corners){
        var corner = this.corners[i];
        if (corner.id == 4){
            var distance = Math.sqrt(Math.pow(corner.corners[0].x-saved_bottomLeft.corners[0].x,2)+Math.pow(corner.corners[0].y-saved_bottomLeft.corners[0].y,2));
            if (distance > maxDistance){
                maxDistance = distance;
            }
        }
        else if (corner.id == 3){
            var distance = Math.sqrt(Math.pow(corner.corners[0].x-saved_topLeft.corners[0].x,2)+Math.pow(corner.corners[0].y-saved_topLeft.corners[0].y,2));
            if (distance > maxDistance){
                maxDistance = distance;
            }
        }
        else if (corner.id == 1){
            var distance = Math.sqrt(Math.pow(corner.corners[0].x-saved_topRight.corners[0].x,2)+Math.pow(corner.corners[0].y-saved_topRight.corners[0].y,2));
            if (distance > maxDistance){
                maxDistance = distance;
            }
        }
        else if (corner.id == 2){
            var distance = Math.sqrt(Math.pow(corner.corners[0].x-saved_bottomRight.corners[0].x,2)+Math.pow(corner.corners[0].y-saved_bottomRight.corners[0].y,2));
            if (distance > maxDistance){
                maxDistance = distance;
            }
        }
    }
    return maxDistance;
};

MarkersDetector.prototype.drawContour = function(points,thisContext,color){

    thisContext.lineWidth = 3;

    thisContext.strokeStyle = color;
    thisContext.beginPath();
    for (i = 0; i !== points.length; ++ i){
        var point = mm2pixel(points[i][0], points[i][1], points[i][2]);
        thisContext.moveTo(point.x/640.0*thisContext.canvas.width, point.y/480.0*thisContext.canvas.height);
        point = mm2pixel(points[(i+1) % points.length][0], points[(i+1) % points.length][1], points[(i+1) % points.length][2]);
        thisContext.lineTo(point.x/640.0*thisContext.canvas.width, point.y/480.0*thisContext.canvas.height);
    }
    thisContext.stroke();
    thisContext.closePath();
};

MarkersDetector.prototype.drawCorners = function(thisMarkers,thisContext){
    var thisCorners, thisCorner, i, j;

    thisContext.lineWidth = 3;

    for (i = 0; i !== thisMarkers.length; ++ i){
        thisCorners = thisMarkers[i].corners;

        thisContext.strokeStyle = "red";
        thisContext.beginPath();

        for (j = 0; j !== thisCorners.length; ++ j){
            var thisCorner = thisCorners[j];
            thisContext.moveTo(thisCorner.x/640*thisContext.canvas.width, thisCorner.y/480*thisContext.canvas.height);
            thisCorner = thisCorners[(j + 1) % thisCorners.length];
            thisContext.lineTo(thisCorner.x/640*thisContext.canvas.width, thisCorner.y/480*thisContext.canvas.height);
        }

        thisContext.stroke();
        thisContext.closePath();
    }
};

MarkersDetector.prototype.getMarkers = function(){

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA){
        this.snapshot();

        var markerCount = this.detector.detectMarkerLite(this.raster,110);
        this.markers = [];
        this.corners = [];
        for (var i = 0; i < markerCount; i++){
            var id = this.detector._callback.result_stack._items[i].arcode_id;
            var marker = {id: id, corners: this.detector._callback.result_stack._items[i].vertex};
            if (marker.id == 1 || marker.id == 2 || marker.id == 3 || marker.id == 4){
                var isIn = false;
                for (var j in this.corners){
                    var corner = this.corners[j];
                    if (corner.id == marker.id){
                        isIn = true;
                    }
                }
                if (!isIn){
                    this.corners.push(marker)
                }
            }
            else{
                var isIn = false;
                for (var j in this.markers){
                    var current_marker = this.markers[j];
                    if (current_marker.id == marker.id){
                        isIn = true;
                    }
                }
                if (!isIn){
                    this.markers.push(marker)
                }
            }
        }
        if (!(this.topRight && this.bottomRight && this.bottomLeft && this.topLeft) || this.corners.length == 0){

            $('#cameraMoved').show();
            this.calibrate();
        }
        else{
            if (this.distanceWithSavedTags() > 5){
                this.calibrate();
            }
            $('#cameraMoved').hide();
        }
    }
};

MarkersDetector.prototype.distanceBetweenMarkers = function(){
    var maxdistance = 0;
    for (var i=0; i < this.markers.length; i++){
        var distance = 0;
        var marker = this.markers[i];
        var marker_before;
        for (var j=0; j < this.markers_before.length; j++){
            if (this.markers_before[j].id == marker.id){
                marker_before = this.markers_before[j];
                break;
            }
        }
        distance += Math.sqrt(Math.pow(marker.corners[0].x-marker_before.corners[0].x,2)+Math.pow(marker.corners[0].y-marker_before.corners[0].y,2));
        distance += Math.sqrt(Math.pow(marker.corners[1].x-marker_before.corners[1].x,2)+Math.pow(marker.corners[1].y-marker_before.corners[1].y,2));
        distance += Math.sqrt(Math.pow(marker.corners[2].x-marker_before.corners[2].x,2)+Math.pow(marker.corners[2].y-marker_before.corners[2].y,2));
        distance += Math.sqrt(Math.pow(marker.corners[3].x-marker_before.corners[3].x,2)+Math.pow(marker.corners[3].y-marker_before.corners[3].y,2));
        if (distance > maxdistance){
            maxdistance = distance;
        }
    }
    return maxdistance;
};

MarkersDetector.prototype.markersDifference = function(){
    if (this.markers.length != this.markers_before.length){
        this.change_count++;
    }
    else{
        if (this.distanceBetweenMarkers(this.markers) > 5){
            this.change_count++;
        }
    }
};

MarkersDetector.prototype.notJittering = function(){
    this.markersDifference();
    if (this.change_count > 0){
        this.change_count = 0;
        this.markers_before = this.markers;
        return true;
    }
    else{
        this.change_count = 0;
        return false;
    }
};

root.MarkersDetector = MarkersDetector;

})(this);
