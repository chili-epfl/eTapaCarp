/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

Logger = {
    logTag: null,
    logEvent: null,
    logBrick: null,
    images: [],
    userId: null,
    postTag: function(text) {
        /*Date.now not on IE*/
        text = Date.now() + ";" + text + "\n";
        this.logTag.insert({text: text});
    },
    postEvent: function(text) {
        /*Date.now not on IE*/
        text = Date.now() + ";" + text + "\n";
        this.logEvent.insert({text: text});
    },
    postBrick: function(text) {
        /*Date.now not on IE*/
        text = Date.now() + ";" + text + "\n";
        this.logBrick.insert({text: text});
    },
    saveTag: function() {
        var s = "";
        var cursor = this.logTag.find({}).fetch();
        cursor.forEach(function(post) {
            s = s + post.text;
        });
        var blob = new Blob([s],
                {type: "text/csv;charset=utf-8"});
        saveAs(blob, this.userId + "-Tags.csv");
    },
    saveEvent: function() {
        var s = "";
        var cursor = this.logEvent.find({}).fetch();
        cursor.forEach(function(post) {
            s = s + post.text;
        });
        var blob = new Blob([s],
                {type: "text/csv;charset=utf-8"});
        saveAs(blob, this.userId + "-Events.csv");
    },
    saveBrick: function() {
        var s = "";
        var cursor = this.logBrick.find({}).fetch();
        cursor.forEach(function(post) {
            s = s + post.text;
        });
        var blob = new Blob([s],
                {type: "text/csv;charset=utf-8"});
        saveAs(blob, this.userId + "-Bricks.csv");
    },
     saveImage: function(blob) {
            saveAs(blob, this.userId + "-Image.png");
    }
//    ,
//    saveImages: function() {
//        for (var i = 0; i < this.images.length; i++)
//            saveAs(this.images[i], this.userId + "-Cut:" + i + ".png");
//    },
//    storeImage: function(blob) {
//        this.images.push(blob);
//    }
}
