CalibStatic = {
 	showPopup : function(markersDetector) {
 		markersDetector.updateDisplayInfo();
 		markersDetector.calibrationContext.drawImage(markersDetector.video, 0, 0, markersDetector.calibrationCanvas.width, markersDetector.calibrationCanvas.height);
 		if (markersDetector.corners){
 			if (localStorage.getItem('rotationMatrix') &&
 			localStorage.getItem('translationMatrix') &&
 			localStorage.getItem('intrinsicMatrix')){
 				markersDetector.drawContour([[-180,-140,0],[-180,140,0],[180,140,0],[180,-140,0]],markersDetector.calibrationContext,"blue");
 				markersDetector.drawContour([[-180,-140,60],[-180,140,60],[180,140,60],[180,-140,60]],markersDetector.calibrationContext,"red");
 			}
 			markersDetector.drawCorners(markersDetector.corners,markersDetector.calibrationContext);
 			markersDetector.drawCorners(markersDetector.markers,markersDetector.calibrationContext);
 		}
 	},
 	popupOpened: function(){
 		return $('#calibration').hasClass("in");
 	},
 	needCalibration : true,

 	setNeedCalibrationCallback: function(context, callback){
 		CalibStatic.needCalibrationCallback = function(param) {
			callback.call(context, param);
		}
 	}	
	
	//TODO put the calibration functions of the MarkerDetector package here
}

