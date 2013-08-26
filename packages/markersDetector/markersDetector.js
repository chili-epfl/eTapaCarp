MarkersDetector = function(video, canvas){
    this.stream = null;
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
    this.activeMarkersBefore = {};
    this.change_count = 0;
    this.countFrames = 0;
    this.countTags = 0;
    this.activeMarkers = {};
}

MarkersDetector.prototype.accessCamera = function(){
    var that = this;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (navigator.getUserMedia){

        function successCallback(stream){
            that.stream = stream;
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

MarkersDetector.prototype.stopCamera = function(){
    if (this.stream){
        this.stream.stop();
    }
};

MarkersDetector.prototype.checkSizeRedRectangle = function(){
    var bottomLeftPoint = mm2pixel(-180, -140, 60);
    var bottomRightPoint = mm2pixel(180, -140, 60);
    var topLeftPoint = mm2pixel(-180, 140, 60);
    var topRightPoint = mm2pixel(180, 140, 60);
    var d = Math.sqrt(Math.pow(bottomLeftPoint.x-topRightPoint.x,2)+Math.pow(bottomLeftPoint.y-topRightPoint.y,2));
    var D = Math.sqrt(Math.pow(topLeftPoint.x-bottomRightPoint.x,2)+Math.pow(topLeftPoint.y-bottomRightPoint.y,2));
    var top = Math.sqrt(Math.pow(bottomLeftPoint.x-bottomRightPoint.x,2)+Math.pow(bottomLeftPoint.y-bottomRightPoint.y,2));
    var bottom = Math.sqrt(Math.pow(topLeftPoint.x-topRightPoint.x,2)+Math.pow(topLeftPoint.y-topRightPoint.y,2));
    if (D*d/2 - 640*480/2.5 >= 0){
        if (bottom > 640 || top > 640){
            return false;
        }
        else{
            return true;
        }
    }
    else{
        return false;
    }
}

MarkersDetector.prototype.checkRedRectangle = function(){
    var bottomLeftPoint = mm2pixel(-180, -140, 60);
    var bottomRightPoint = mm2pixel(180, -140, 60);
    var topLeftPoint = mm2pixel(-180, 140, 60);
    var topRightPoint = mm2pixel(180, 140, 60);
    var maxXValue = Math.max(bottomLeftPoint.x,bottomRightPoint.x,topLeftPoint.x,topRightPoint.x);
    var maxYValue = Math.max(bottomLeftPoint.y,bottomRightPoint.y,topLeftPoint.y,topRightPoint.y);
    var minXValue = Math.min(bottomLeftPoint.x,bottomRightPoint.x,topLeftPoint.x,topRightPoint.x);
    var minYValue = Math.min(bottomLeftPoint.y,bottomRightPoint.y,topLeftPoint.y,topRightPoint.y);
    if (maxXValue > 640 || maxYValue > 480 || minXValue < 0 || minYValue < 0){
        return false;
    }
    else{
        return true;
    }
}

MarkersDetector.prototype.checkBlueRectangle = function(){
    var bottomLeftPoint = mm2pixel(-180, -140, 0);
    var bottomRightPoint = mm2pixel(180, -140, 0);
    var topLeftPoint = mm2pixel(-180, 140, 0);
    var topRightPoint = mm2pixel(180, 140, 0);
    var maxXValue = Math.max(bottomLeftPoint.x,bottomRightPoint.x,topLeftPoint.x,topRightPoint.x);
    var maxYValue = Math.max(bottomLeftPoint.y,bottomRightPoint.y,topLeftPoint.y,topRightPoint.y);
    var minXValue = Math.min(bottomLeftPoint.x,bottomRightPoint.x,topLeftPoint.x,topRightPoint.x);
    var minYValue = Math.min(bottomLeftPoint.y,bottomRightPoint.y,topLeftPoint.y,topRightPoint.y);
    if (maxXValue > 640 || maxYValue > 480 || minXValue < 0 || minYValue < 0){
        return false;
    }
    else{
        return true;
    }
}

MarkersDetector.prototype.checkCameraAngle = function(){
    var bottomLeftPoint = mm2pixel(-180, -140, 0);
    var bottomRightPoint = mm2pixel(180, -140, 0);
    var topLeftPoint = mm2pixel(-180, 140, 0);
    var topRightPoint = mm2pixel(180, 140, 0);
    var left = Math.sqrt(Math.pow(bottomLeftPoint.x-topLeftPoint.x,2)+Math.pow(bottomLeftPoint.y-topLeftPoint.y,2));
    var right = Math.sqrt(Math.pow(topRightPoint.x-bottomRightPoint.x,2)+Math.pow(topRightPoint.y-bottomRightPoint.y,2));
    var top = Math.sqrt(Math.pow(topRightPoint.x-topLeftPoint.x,2)+Math.pow(topRightPoint.y-topLeftPoint.y,2));
    var bottom = Math.sqrt(Math.pow(bottomLeftPoint.x-bottomRightPoint.x,2)+Math.pow(bottomLeftPoint.y-bottomRightPoint.y,2));
    var ratioTopBottom;
    if (top > bottom){
        ratioTopBottom = bottom/top;
    }
    else{
        ratioTopBottom = top/bottom;
    }
    var ratioLeftRight
    if (left > right){
        ratioLeftRight = right/left;
    }
    else{
        ratioLeftRight = left/right;
    }
    var smallerRatio = Math.min(ratioLeftRight,ratioTopBottom);
    if (smallerRatio >= 0.75){
        return true;
    }
    else{
        return false;
    }

}

MarkersDetector.prototype.changeStatus = function(){
    var sizeOK = this.checkSizeRedRectangle();
    var angleOK = this.checkCameraAngle();
    var redRectangleOK = this.checkRedRectangle();
    var blueRectangleOK = this.checkBlueRectangle();
    var lastVisibility = Math.floor(this.countTags/(this.countFrames*4)*100);
    this.countFrames++;
    this.countTags += this.corners.length;
    if (this.countFrames == 100){
        this.countFrames = 0;
        this.countTags = 0;
    }
    var tagVisibility = Math.floor(this.countTags/(this.countFrames*4)*100);
    if (isNaN(tagVisibility) && lastVisibility >= 90){
        tagVisibility = lastVisibility;
    }
    if (sizeOK){
        $('#sizeOK').parent().removeClass('alert alert-error');
        $('#sizeOK').find('.icon-ok').show();
        $('#sizeOK').find('.icon-remove').hide();
    }
    else{
        $('#sizeOK').parent().addClass('alert alert-error');
        $('#sizeOK').find('.icon-ok').hide();
        $('#sizeOK').find('.icon-remove').show();
    }
    if (angleOK){
        $('#angleOK').parent().removeClass('alert alert-error');
        $('#angleOK').find('.icon-ok').show();
        $('#angleOK').find('.icon-remove').hide();
    }
    else{
        $('#angleOK').parent().addClass('alert alert-error');
        $('#angleOK').find('.icon-ok').hide();
        $('#angleOK').find('.icon-remove').show();
    }
    if (redRectangleOK){
        $('#redRectangleOK').parent().removeClass('alert alert-error');
        $('#redRectangleOK').find('.icon-ok').show();
        $('#redRectangleOK').find('.icon-remove').hide();
    }
    else{
        $('#redRectangleOK').parent().addClass('alert alert-error');
        $('#redRectangleOK').find('.icon-ok').hide();
        $('#redRectangleOK').find('.icon-remove').show();
    }
    if (blueRectangleOK){
        $('#blueRectangleOK').parent().removeClass('alert alert-error');
        $('#blueRectangleOK').find('.icon-ok').show();
        $('#blueRectangleOK').find('.icon-remove').hide();
    }
    else{
        $('#blueRectangleOK').parent().addClass('alert alert-error');
        $('#blueRectangleOK').find('.icon-ok').hide();
        $('#blueRectangleOK').find('.icon-remove').show();
    }
    if (tagVisibility >= 90){
        $('#tagVisibility1').parent().removeClass('alert alert-error');
        $('#tagVisibility2').parent().removeClass('progress-danger').addClass('progress-success');
        $('#tagVisibility2').width(tagVisibility+"%");
    }
    else{
        $('#tagVisibility1').parent().addClass('alert alert-error');
        $('#tagVisibility2').parent().removeClass('progress-success').addClass('progress-danger');
        $('#tagVisibility2').width(tagVisibility+"%");
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
        this.markers = {};
        this.corners = {};
        for (var i = 0; i < markerCount; i++){
            var id = this.detector._callback.result_stack._items[i].arcode_id;
            var marker = {id: id, corners: this.detector._callback.result_stack._items[i].vertex};
            if (marker.id < 5){
                if (!(marker.id in this.corners)){
                    this.corners[marker.id] = marker;
                }
            }
            else{
                if (!(marker.id in this.markers)){
                    this.markers[marker.id] = marker;
                }
            }
        }
        for (var i in this.markers){
            var currentMarker = this.markers[i];
            currentMarker.active = 10;
            this.activeMarkers[currentMarker.id] = currentMarker;
        }
        for (var i in this.activeMarkers){
            var currentMarker = this.activeMarkers[i];
            currentMarker.active--;
            if (currentMarker.active == 0){
                delete this.activeMarkers[currentMarker.id];
                console.log('delete')
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
    for (var i in this.activeMarkers){
        var distance = 0;
        var marker = this.activeMarkers[i];
        var marker_before;
        if (marker.id in this.activeMarkersBefore){
            marker_before = this.activeMarkersBefore[marker.id];
        }
        else{
            break;
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
    var activeMarkers_length = 0;
    var activeMarkersBefore_length = 0;
    for (var i in this.activeMarkers){
        activeMarkers_length++;
    }
    for (var i in this.activeMarkersBefore){
        activeMarkersBefore_length++;
    }
    if (activeMarkers_length != activeMarkersBefore_length){
        this.change_count++;
    }
    else{
        if (this.distanceBetweenMarkers(this.activeMarkers) > 5){
            this.change_count++;
        }
    }
};

MarkersDetector.prototype.notJittering = function(){
    this.markersDifference();
    if (this.change_count > 0){
        this.change_count = 0;
        this.activeMarkersBefore = jQuery.extend(true, {}, this.activeMarkers);
        return true;
    }
    else{
        this.change_count = 0;
        return false;
    }
};