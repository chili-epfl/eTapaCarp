(function () {

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/Logger/Logger.js                                              //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
/*                                                                        // 1
 * To change this template, choose Tools | Templates                      // 2
 * and open the template in the editor.                                   // 3
 */                                                                       // 4
                                                                          // 5
Logger = {                                                                // 6
    logTag: null,                                                         // 7
    logEvent: null,                                                       // 8
    logBrick: null,                                                       // 9
    images: [],                                                           // 10
    userId: null,                                                         // 11
    postTag: function(text) {                                             // 12
        /*Date.now not on IE*/                                            // 13
        text = Date.now() + ";" + text + "\n";                            // 14
        this.logTag.insert({text: text});                                 // 15
    },                                                                    // 16
    postEvent: function(text) {                                           // 17
        /*Date.now not on IE*/                                            // 18
        text = Date.now() + ";" + text + "\n";                            // 19
        this.logEvent.insert({text: text});                               // 20
    },                                                                    // 21
    postBrick: function(text) {                                           // 22
        /*Date.now not on IE*/                                            // 23
        text = Date.now() + ";" + text + "\n";                            // 24
        this.logBrick.insert({text: text});                               // 25
    },                                                                    // 26
    saveTag: function() {                                                 // 27
        var s = "";                                                       // 28
        var cursor = this.logTag.find({}).fetch();                        // 29
        cursor.forEach(function(post) {                                   // 30
            s = s + post.text;                                            // 31
        });                                                               // 32
        var blob = new Blob([s],                                          // 33
                {type: "text/csv;charset=utf-8"});                        // 34
        saveAs(blob, this.userId + "-Tags.csv");                          // 35
    },                                                                    // 36
    saveEvent: function() {                                               // 37
        var s = "";                                                       // 38
        var cursor = this.logEvent.find({}).fetch();                      // 39
        cursor.forEach(function(post) {                                   // 40
            s = s + post.text;                                            // 41
        });                                                               // 42
        var blob = new Blob([s],                                          // 43
                {type: "text/csv;charset=utf-8"});                        // 44
        saveAs(blob, this.userId + "-Events.csv");                        // 45
    },                                                                    // 46
    saveBrick: function() {                                               // 47
        var s = "";                                                       // 48
        var cursor = this.logBrick.find({}).fetch();                      // 49
        cursor.forEach(function(post) {                                   // 50
            s = s + post.text;                                            // 51
        });                                                               // 52
        var blob = new Blob([s],                                          // 53
                {type: "text/csv;charset=utf-8"});                        // 54
        saveAs(blob, this.userId + "-Bricks.csv");                        // 55
    },                                                                    // 56
     saveImage: function(blob) {                                          // 57
            saveAs(blob, this.userId + "-Image.png");                     // 58
    }                                                                     // 59
//    ,                                                                   // 60
//    saveImages: function() {                                            // 61
//        for (var i = 0; i < this.images.length; i++)                    // 62
//            saveAs(this.images[i], this.userId + "-Cut:" + i + ".png"); // 63
//    },                                                                  // 64
//    storeImage: function(blob) {                                        // 65
//        this.images.push(blob);                                         // 66
//    }                                                                   // 67
}                                                                         // 68
                                                                          // 69
////////////////////////////////////////////////////////////////////////////

}).call(this);
