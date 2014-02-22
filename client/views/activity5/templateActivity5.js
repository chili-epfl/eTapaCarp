var rendered = false;
var animationId = null;
var lang, isPractice;
var viewManager = new ViewManager();
var markersDetector;
var activity;
var shape;
Template.activity5Difficulty.events({
    'click a[id^="shape"]': function(e, tmpl) {
        shape = e.target.id.split('shape')[1];
        Meteor.Router.to('/activity5/practice/ready');
    }
});

Template.activity5.lang = function(e) {
    lang = Session.get('lang');
    return lang;
}

Template.activity5.isPractice = function() {
    isPractice = Session.get('isPractice')
    return isPractice;
}

Template.activity5.rendered = function() {
    if (!Utils.areModelsLoaded()) {
        return;
    }

    if (!rendered) {



        console.log("Rendering");
        var name = "Activity5-" + Meteor.user().emails[0].address + "Shape:" + shape;
        Logger.logTag = new Meteor.Collection(null);
        Logger.logEvent = new Meteor.Collection(null);
        Logger.logBrick = new Meteor.Collection(null);

        Logger.userId = name;
        Logger.postTag("Activity5 started;Shape:" + shape);
        Logger.postEvent("Activity5 started;Shape:" + shape);
        Logger.postBrick("Activity5 started;Shape:" + shape);

//        $("#accordion").accordion({
//                collapsible: true
//            });


        //prevent to do the initialization twice
        rendered = true;

        $("#End").click(function() {
            Logger.saveTag();
            Logger.saveEvent();
            viewManager.saveBricks();
            Logger.saveBrick()
        });

        CalibStatic.needCalibrationCallback = null;
        if (typeof (activity) == 'undefined') {
            activity = new Activity5();
        }
        activity.setRenderingCallback(viewManager, viewManager.render);
        activity.template = Template.activity5;
        activity.evaluationMode = !isPractice;

        var view = new PerspectiveView('perspective');
        view.click = false;
        view.virtual = true;
        viewManager.addView(view);
        viewManager.setAxis(true);
        viewManager.setGrid(true);
        viewManager.init();
        view.setCameraWidth($(document.getElementById('perspective')).width());
        viewManager.addStandardDisplayOptions();
        viewManager.addFeedbackDisplay();


        document.addEventListener('DOMMouseScroll', onMouseWheel, false);

//        createNewChallengeHandler();
//        createDifficultyHandler();
//        createNextActivityHandler();

        viewManager.render({});

        markersDetector = new FakeMD_Mouse(view, activity);
        markersDetector.init();
        markersDetector.Start();


    }
    //$("#difficulty" + activity.difficulty).addClass("btn-primary");
}

Template.activity5.updateTime = function() {
    if (timer) {
        var endTime = (new Date().getTime() - startTime) / 1000.0;
        $('#time').text(endTime);
        timer = setTimeout(Template.activity5.updateTime, 100);
    }
}

Template.activity5.activityFinished = function() {
    if (!isPractice) {
        timer = null;
        var stopTime = new Date().getTime();
        endTime = (stopTime - startTime) / 1000.0;
        Score.update({'_id': scoreId}, {$set: {time: endTime}});
        $('#time').text(endTime);
    }
    $("#activityFinish").modal('show');
}


function initActivity() {
    if (isPractice) {
        viewManager.edgeToSelect(activity.objectId, activity.difficulty, 'perspective');
        var result = activity.checkSolution(viewManager.views)
        updateFeedback(result);
    }
    else {
        startTime = null;
        stopTime = null;
        timerStarted = false;
        timer = null;
        scoreId = null;
        activity.isFinished = false;
        activity.lastActiveMarkers = null;
        activity.objectDetected = false;
        activity.evaluationStarted = false;
    }
}

function createNextActivityHandler() {
    $("#nextActivityButton").on('click', function() {
        console.log('next activity')
        newDiff = Math.min(activity.difficulty + 1, Config.Activity5.MAX_DIFFICULTY);
        newChallenge(newDiff);
    });
}

function createNewChallengeHandler() {
    $('#newChallenge').on('click', function() {
        var count = 0;
        var id = null;
        for (var i in markersDetector.activeMarkers) {
            id = i;
            count++;
        }
        if (count == 1) {
            activity.objectId = id;
            newChallenge(activity.difficulty);
        }
    });
}

function newChallenge(difficulty) {
    activity.difficulty = difficulty;
    $('#difficulty' + ((difficulty + 1) % 3 || 3)).removeClass("btn-primary");
    $('#difficulty' + ((difficulty + 2) % 3 || 3)).removeClass("btn-primary");
    $('#difficulty' + difficulty).addClass("btn-primary");

    initActivity();
}



function createDifficultyHandler() {
    $('button[id^="difficulty"]').on('click', function() {
        var that = this;
        var level = $(this).attr('id')[$(this).attr('id').length - 1];

        var count = 0;
        var id = null;
        for (var i in markersDetector.activeMarkers) {
            id = i;
            count++
        }
        if (count == 1) {
            if (!$(that).hasClass('btn-primary')) {
                activity.objectId = id;
                newChallenge(level);
            }
        }
        console.log('updating diff')
        activity.update(markersDetector);
    });
}

function onDocumentMouseDown(event) {
//    if (event.which == 1) {
//        var clickedView = viewManager.findClickedView(event);
//        if (clickedView !== undefined) {
//            console.log(activity.objectId)
//            clickedView.selectEdge(event);
//            var correction = activity.checkSolution(viewManager.views);
//            updateFeedback(correction);
//            viewManager.showHelpOnSelect(event);
//            activity.update(markersDetector)
//        }
//    }
}
;

function updateFeedback(correction) {
    for (var i in correction[0]) {
        if (i == 'top') {
            $('#' + i + 'Correct').text(correction[0][i] + correction[2] + "/" + activity.difficulty);
            if (correction[1][i] > 0) {
                $('#' + i + 'Error').text(', ' + correction[1][i] + ' ' + lang.Errors);
            }
            else {
                $('#' + i + 'Error').text('');
            }
            if (correction[0][i] == activity.difficulty - correction[2] && correction[1][i] == 0) {
                $('#' + i + 'Correct').parent().removeClass('btn-danger').addClass('btn-success');
                $('#' + i + 'Error').append('<i class="icon-ok icon-white"></i>');
            }
            else {
                $('#' + i + 'Correct').parent().removeClass('btn-success').addClass('btn-danger');
            }
        }
        else {
            $('#' + i + 'Correct').text(correction[0][i] + "/" + activity.difficulty);
            if (correction[1][i] > 0) {
                $('#' + i + 'Error').text(', ' + correction[1][i] + ' ' + lang.Errors);
            }
            else {
                $('#' + i + 'Error').text('');
            }
            if (correction[0][i] == activity.difficulty && correction[1][i] == 0) {
                $('#' + i + 'Correct').parent().removeClass('btn-danger').addClass('btn-success');
                $('#' + i + 'Error').append('<i class="icon-ok icon-white"></i>');
            }
            else {
                $('#' + i + 'Correct').parent().removeClass('btn-success').addClass('btn-danger');
            }
        }
    }
}

Template.activity5.startActivity = function(markerId) {
    viewManager.edgeToSelect(markerId, activity.difficulty, 'perspective');
    startTime = new Date().getTime();
    scoreId = Score.insert({time: null, activity: "activity5", userId: Meteor.userId(), date: new Date(), difficulty: activity.difficulty, shape: markerId});
    timerStarted = true;
    timer = setTimeout(Template.activity5.updateTime, 100);
    activity.update(markersDetector);
}

Template.activity5.destroyed = function() {
    console.log("Destroyed")
    viewManager.destroy();
    markersDetector.stopTagDetection();
    rendered = false;
    startTime = null;
    stopTime = null;
    scoreId = null;
    timer = null;
    activity.isFinished = false;
}

function onMouseWheel(event) {
    var divTarget = event.target.parentElement.id;
    if (divTarget != 'perspective')
        return;
    else {
        var delta = 0;
        if (!event) /* For IE. */
            event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
            delta = event.wheelDelta / 120;
        } else if (event.detail) { /** Mozilla case. */
            /** In Mozilla, sign of delta is different than in IE.
             * Also, delta is multiple of 3.
             */
            delta = -event.detail / 3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta) {
            if (delta > 0) {
                viewManager.views['perspective'].zoomIn();
                Logger.postEvent("Zooming In");
            }
            else {
                viewManager.views['perspective'].zoomOut();
                Logger.postEvent("Zooming Out");


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

}



