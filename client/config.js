Config = {}


Meteor.startup(function () {
//      Session.set("tagTrackerLib", 'chilitags');
    Session.set("tagTrackerLib", 'artoolkit'); // uncomment to swtich back to artoolkit
    
	Config = {
		MAX_OBJECT_HEIGHT : 60, 
		CAMERA_RESOLUTION : { x : 640, y : 480},
		WORKSPACE_DIMENSION : {x : 360, y : 280},
		VIEW_DIMENSION : {x: 360, y: 280},
		Activity1 : {
			MAX_DIFFICULTY : 3
		},
        Activity2 : {
            MAX_DIFFICULTY : 3
        }
        
	}
});
