ViewManager = function(){
    this.views = {};
}

ViewManager.prototype.addView = function(view){
    // view.init();
    this.views[view.name] = view;
};

ViewManager.prototype.init = function(){
    for (var i in this.views){
        this.views[i].init(); 
    }
};

ViewManager.prototype.setTransparency = function(bool){
    for (var i in this.views){
        this.views[i].transparency = bool;
        this.views[i].brickManager.setTransparency(bool); 
    }
};

ViewManager.prototype.edgeToSelect = function(markerId, difficulty, name){
    for (var i in this.views){
        if (i == name){
            this.views[i].edgeToSelect(markerId, difficulty);
        }
        else{
            this.views[i].removeSelectedEdges();
        }
    }
};

ViewManager.prototype.addStandardDisplayOptions = function() {
    var that = this;
	$('#transparency-on').on('click', function () {
		$('#transparency-off').removeClass('btn-primary');
		$('#transparency-on').addClass('btn-primary');
		that.setTransparency(true);
	});

	$('#transparency-off').on('click', function () {
		$('#transparency-on').removeClass('btn-primary');
		$('#transparency-off').addClass('btn-primary');
		that.setTransparency(false);
	});

	$('#axis-on').on('click', function () {
		$('#axis-off').removeClass('btn-primary');
		$('#axis-on').addClass('btn-primary');
		that.setAxis(true);
	});

	$('#axis-off').on('click', function () {
		$('#axis-on').removeClass('btn-primary');
		$('#axis-off').addClass('btn-primary');
		that.setAxis(false);
	});
}

ViewManager.prototype.addFeedbackDisplay = function() {
	$('#feedback-on').on('click', function () {
		$('#feedback-off').removeClass('btn-primary');
		$('#feedback-on').addClass('btn-primary');
		$('.feedback').parent().show();
	});

	$('#feedback-off').on('click', function () {
		$('#feedback-on').removeClass('btn-primary');
		$('#feedback-off').addClass('btn-primary');
		$('.feedback').parent().hide();
	});
}

ViewManager.prototype.findClickedView = function(click){
    if(click.target && click.target.parentElement){
    	for (var i in this.views){
    		var currView = this.views[i];
    		if (click.target.parentElement.id == currView.name && !(currView instanceof PerspectiveView)){
    			return this.views[i];
    		}
    	}
    }
}

ViewManager.prototype.setAxis = function(bool){
    for (var i in this.views){
        this.views[i].axis = bool; 
    }
};

ViewManager.prototype.setClick = function(click){
    for (var i in this.views){
        this.views[i].click = click; 
    }
};

ViewManager.prototype.render = function(markers){
    for (var i in this.views){
        this.views[i].render(markers);
    }
};

ViewManager.prototype.init_objects = function(){

    for (var i in this.views){
        var view = this.views[i];
        if (!view.dynamic){
            view.init_objects();
        }
    }
}

ViewManager.prototype.clearChoiceEdges = function(){
    for(var i in this.views){
        this.views[i].edgesToSelect = [];
        this.views[i].levels = {};
    }
}

// shows the level when selection hits several superposed edges
ViewManager.prototype.showHelpOnSelect = function(click){
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
                sideView.levels = {};
                sideView.edgesToSelect = [];
                helpingView.levels = {};
                helpingView.edgesToSelect = [];
            }
            helpingView.levels.y = {};
            for (var j in currentView.edgesToSelect){
                helpingView.levels.y[j] = currentView.edgesToSelect[j];
            }
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
                frontView.levels = {};
                frontView.edgesToSelect = [];
                helpingView.levels = {};
                helpingView.edgesToSelect = [];
            }
            helpingView.levels.x = {};
            for (var j in currentView.edgesToSelect){
                helpingView.levels.x[j] = currentView.edgesToSelect[j];
            }
        }
        else if (currentView instanceof TopView){
            var helpingView;
            for (var j in this.views){
                if (click.target.parentElement.id == currentView.name){
                    currentView.levels = {};
                    // currentView.changedLayout = true;
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
                        // helpingView.changedLayout = true;
                    }
                }
            }
        }
    }
}

ViewManager.prototype.destroy = function(){
    for (var i in this.views){
        var view = this.views[i];
        view.clear();
        view.scene = null;
        view.renderer = null;
    }
}