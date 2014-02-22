ViewManager = function() {
    this.views = {};
}

ViewManager.prototype.setView = function(view) {
    this.views[view.name] = view;
};

ViewManager.prototype.init = function() {
    for (var i in this.views)
        this.views[i].init();
};

ViewManager.prototype.setTransparency = function(bool) {
    for (var i in this.views) {
        this.views[i].transparency = bool;
        this.views[i].brickManager.setTransparency(bool);
    }
};

ViewManager.prototype.selectEdgesRandomly = function(markerId, difficulty, name) {
    for (var i in this.views) {
        if (i == name)
            this.views[i].selectEdgesRandomly(markerId, difficulty);
        else
            this.views[i].removeSelectedEdges();
    }
};

ViewManager.prototype.addStandardDisplayOptions = function() {
    var that = this;
    $('#transparency-on').on('click', function() {
        Logger.postEvent("Trasparence On");
        $('#transparency-off').removeClass('btn-primary');
        $('#transparency-on').addClass('btn-primary');
        that.setTransparency(true);
        MarkersDetector.forceUpdate = true;
    });

    $('#transparency-off').on('click', function() {
        Logger.postEvent("Trasparence Off");

        $('#transparency-on').removeClass('btn-primary');
        $('#transparency-off').addClass('btn-primary');
        that.setTransparency(false);
        MarkersDetector.forceUpdate = true;
    });

    $('#axis-on').on('click', function() {
        Logger.postEvent("Axis On");
        $('#axis-off').removeClass('btn-primary');
        $('#axis-on').addClass('btn-primary');
        that.setAxis(true);
        MarkersDetector.forceUpdate = true;
    });

    $('#axis-off').on('click', function() {
        Logger.postEvent("Axis Off");
        $('#axis-on').removeClass('btn-primary');
        $('#axis-off').addClass('btn-primary');
        that.setAxis(false);
        MarkersDetector.forceUpdate = true;
    });

    $('#grid-on').on('click', function() {
        $('#grid-off').removeClass('btn-primary');
        $('#grid-on').addClass('btn-primary');
        that.setGrid(true);
        MarkersDetector.forceUpdate = true;
    });

    $('#grid-off').on('click', function() {
        Logger.postEvent("Grid Off");
        $('#grid-on').removeClass('btn-primary');
        $('#grid-off').addClass('btn-primary');
        that.setGrid(false);
        MarkersDetector.forceUpdate = true;
    });
}

ViewManager.prototype.addFeedbackDisplay = function() {
    $('#feedback-on').on('click', function() {
        Logger.postEvent("FeedBack On");

        $('#feedback-off').removeClass('btn-primary');
        $('#feedback-on').addClass('btn-primary');
        $('.feedback').parent().show();
    });

    $('#feedback-off').on('click', function() {
        Logger.postEvent("Feedback Off");

        $('#feedback-on').removeClass('btn-primary');
        $('#feedback-off').addClass('btn-primary');
        $('.feedback').parent().hide();
    });
}

ViewManager.prototype.findClickedView = function(click) {
    if (click.target && click.target.parentElement) {
        for (var i in this.views) {
            var currView = this.views[i];
            if (click.target.parentElement.id == currView.name && !(currView instanceof PerspectiveView)) {
                return this.views[i];
            }
        }
    }
}

ViewManager.prototype.setAxis = function(bool) {
    for (var i in this.views) {
        this.views[i].axis = bool;
    }
};

ViewManager.prototype.setGrid = function(bool) {
    for (var i in this.views)
        this.views[i].grid = bool;
};

ViewManager.prototype.render = function(markers) {
    for(var i in markers){
        Logger.postTag("Found Marker: "+markers[i].id+"corners-coordinates:("+
            markers[i].corners[0].x+","+markers[i].corners[0].y+"),"+
            "("+markers[i].corners[1].x+","+markers[i].corners[1].y+"),"+
            "("+markers[i].corners[2].x+","+markers[i].corners[2].y+"),"+
            "("+markers[i].corners[3].x+","+markers[i].corners[3].y+")"
            )
    }
    for (var i in this.views) 
        this.views[i].render(markers);
};

ViewManager.prototype.init_objects = function() {
    for (var i in this.views) {
        var view = this.views[i];
        if (!view.dynamic) {
            view.init_objects();
        }
    }
}

ViewManager.prototype.clearChoiceEdges = function() {
    for (var i in this.views) {
        this.views[i].edgesToSelect = [];
        this.views[i].levels = {};
    }
}

// shows the level when selection hits several superposed edges
ViewManager.prototype.showHelpOnSelect = function(click) {
    for (var i in this.views) {
        var currentView = this.views[i];
        if (currentView instanceof FrontView) {
            var helpingView, sideView;
            for (var j in this.views) {
                if (this.views[j] instanceof TopView) {
                    helpingView = this.views[j];
                }
                else if (this.views[j] instanceof SideView) {
                    sideView = this.views[j];
                }
            }

            if (click.target.parentElement.id == currentView.name) {
                currentView.levels = {};
                sideView.levels = {};
                sideView.edgesToSelect = [];
                helpingView.levels = {};
                helpingView.edgesToSelect = [];
            }
            helpingView.levels.y = {};
            for (var j in currentView.edgesToSelect) {
                helpingView.levels.y[j] = currentView.edgesToSelect[j];
            }
        }
        else if (currentView instanceof SideView) {
            var helpingView, frontView;
            for (var j in this.views) {
                if (this.views[j] instanceof TopView) {
                    helpingView = this.views[j];
                }
                else if (this.views[j] instanceof FrontView) {
                    frontView = this.views[j];
                }
            }

            if (click.target.parentElement.id == currentView.name) {
                currentView.levels = {};
                frontView.levels = {};
                frontView.edgesToSelect = [];
                helpingView.levels = {};
                helpingView.edgesToSelect = [];
            }
            helpingView.levels.x = {};
            for (var j in currentView.edgesToSelect) {
                helpingView.levels.x[j] = currentView.edgesToSelect[j];
            }
        }
        else if (currentView instanceof TopView) {
            var helpingView;
            for (var j in this.views) {
                if (click.target.parentElement.id == currentView.name) {
                    currentView.levels = {};
                    // currentView.changedLayout = true;
                    if (this.views[j] instanceof FrontView || this.views[j] instanceof SideView) {
                        helpingView = this.views[j];
                        helpingView.levels = {};
                        helpingView.edgesToSelect = [];
                        if (currentView.edgesToSelect.length > 0) {
                            var count = 1;
                            for (var j in currentView.edgesToSelect) {
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

ViewManager.prototype.destroy = function() {
    for (var i in this.views) {
        var view = this.views[i];
        view.clear();
        view.scene = null;
        view.renderer = null;
    }
};

ViewManager.prototype.saveBricks=function(){
    for(var i in this.views){
        this.views[i].saveBricks();
    }
}