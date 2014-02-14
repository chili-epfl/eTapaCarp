(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ToolManager/Tool.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
ToolFactory = function() {                                                                                             // 1
    this.createTool = function(id, brickManager, markers) {                                                            // 2
        if (id == 83)                                                                                                  // 3
            return new PlaneCutter(id, brickManager, markers);                                                         // 4
    }                                                                                                                  // 5
}                                                                                                                      // 6
Tool = function(id, brickManager, markers) {                                                                           // 7
    this.id = id;                                                                                                      // 8
    this.brickManager = brickManager;                                                                                  // 9
    this.geometry;                                                                                                     // 10
    this.mesh;                                                                                                         // 11
    this.visibility;                                                                                                   // 12
    //this.init(markers);                                                                                              // 13
}                                                                                                                      // 14
                                                                                                                       // 15
Tool.prototype.changeVisibility = function(visibility) {                                                               // 16
    Logger.postEvent("Tool:" + this.id + ";visibility:" + visibility);                                                 // 17
    this.visibility = visibility;                                                                                      // 18
    this.mesh.visible = visibility;                                                                                    // 19
                                                                                                                       // 20
}                                                                                                                      // 21
Tool.prototype.init = function(markers) {                                                                              // 22
                                                                                                                       // 23
}                                                                                                                      // 24
Tool.prototype.computeNewPosition = function(markers) {                                                                // 25
}                                                                                                                      // 26
Tool.prototype.computeNewStatus = function(markers) {                                                                  // 27
}                                                                                                                      // 28
Tool.prototype.reset = function() {                                                                                    // 29
};                                                                                                                     // 30
                                                                                                                       // 31
PlaneCutter = function(id, brickManager, markers) {                                                                    // 32
    Tool.call(this, id, brickManager, markers);                                                                        // 33
    this.minDistance;                                                                                                  // 34
    this.maxDistance;                                                                                                  // 35
    this.rotationMarkerZ;                                                                                              // 36
    this.cutAvailable = true;                                                                                          // 37
    this.horizMesh = null;                                                                                             // 38
    this.SimLineDashMaterial = new THREE.LineDashedMaterial({color: 0xff1919, gapSize: 4, dashSize: 4, linewidth: 3, depthTest: false});
    this.SimMeshMaterial = new THREE.MeshBasicMaterial({color: 0xffec45, depthWrite: false, depthTest: false, transparent: true, opacity: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2});
    this.lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, depthTest: true, linewidth: 2});                 // 41
                                                                                                                       // 42
    this.selection = null;                                                                                             // 43
    this.floorLine;                                                                                                    // 44
    this.init(markers);                                                                                                // 45
    this.lastInclination = 0;                                                                                          // 46
    this.lastZ = this.mesh.position.z;                                                                                 // 47
                                                                                                                       // 48
    this.testOldRot = null;                                                                                            // 49
                                                                                                                       // 50
    this.colors = [                                                                                                    // 51
        '#ffd070',                                                                                                     // 52
        '#e6ff6f',                                                                                                     // 53
        '#ff886f',                                                                                                     // 54
        '#6f9eff',                                                                                                     // 55
        '#80ff00',                                                                                                     // 56
        '#00ff8e',                                                                                                     // 57
        '#00b6ae',                                                                                                     // 58
        '#e08e66',                                                                                                     // 59
        '#0082a5'                                                                                                      // 60
    ]                                                                                                                  // 61
                                                                                                                       // 62
};                                                                                                                     // 63
PlaneCutter.prototype = new Tool();                                                                                    // 64
PlaneCutter.prototype.constructor = PlaneCutter;                                                                       // 65
PlaneCutter.prototype.changeVisibility = function(visibility) {                                                        // 66
    Tool.prototype.changeVisibility.call(this, visibility);                                                            // 67
    if (this.selection != null) {                                                                                      // 68
        this.selection.visible = visibility;                                                                           // 69
        for (var i in this.selection.children) {                                                                       // 70
            this.selection.children[i].visible = visibility;                                                           // 71
                                                                                                                       // 72
        }                                                                                                              // 73
    }                                                                                                                  // 74
    this.floorLine.visible = visibility;                                                                               // 75
    this.horizMesh.visible = false;                                                                                    // 76
                                                                                                                       // 77
}                                                                                                                      // 78
PlaneCutter.prototype.init = function(markers) {                                                                       // 79
    this.minDistance = Session.get('tools')[this.id]['extra_info']['minDistance'];                                     // 80
    this.maxDistance = Session.get('tools')[this.id]['extra_info']['maxDistance'];                                     // 81
    this.rotationMarkerZ = Session.get('tools')[this.id]['extra_info']['rotationMarkerZ'];                             // 82
                                                                                                                       // 83
    var mUp, mDown;                                                                                                    // 84
    mUp = markers[41];                                                                                                 // 85
    mDown = markers[42];                                                                                               // 86
    //Take the 2 opposite corners of the marker and compute the center                                                 // 87
    var mUp_position = [mUp.corners[0].x, mUp.corners[0].y, 1];                                                        // 88
    var mUp_position2 = [mUp.corners[2].x, mUp.corners[2].y, 1];                                                       // 89
    var position, position2;                                                                                           // 90
    if (Session.get('virtual') == true) {                                                                              // 91
        position = {x: mUp_position[0], y: mUp_position[1]};                                                           // 92
        position2 = {x: mUp_position2[0], y: mUp_position2[1]}                                                         // 93
                                                                                                                       // 94
    }                                                                                                                  // 95
    else {                                                                                                             // 96
        position = pixel2mm(mUp_position[0], mUp_position[1], 1);                                                      // 97
        position2 = pixel2mm(mUp_position2[0], mUp_position2[1], 1);                                                   // 98
    }                                                                                                                  // 99
    var centerUpX = (position.x + position2.x) / 2;                                                                    // 100
    var centerUpY = (position.y + position2.y) / 2;                                                                    // 101
    var mDown_position = [mDown.corners[0].x, mDown.corners[0].y, 1];                                                  // 102
    var mDown_position2 = [mDown.corners[2].x, mDown.corners[2].y, 1];                                                 // 103
                                                                                                                       // 104
    if (Session.get('virtual') == true) {                                                                              // 105
        position = {x: mDown_position[0], y: mDown_position[1]};                                                       // 106
        position2 = {x: mDown_position2[0], y: mDown_position2[1]}                                                     // 107
                                                                                                                       // 108
    }                                                                                                                  // 109
    else {                                                                                                             // 110
        position = pixel2mm(mDown_position[0], mDown_position[1], 1);                                                  // 111
        position2 = pixel2mm(mDown_position2[0], mDown_position2[1], 1);                                               // 112
    }                                                                                                                  // 113
                                                                                                                       // 114
    var centerDownX = (position.x + position2.x) / 2;                                                                  // 115
    var centerDownY = (position.y + position2.y) / 2;                                                                  // 116
    var distance = Math.sqrt(Math.pow(centerDownX - centerUpX, 2) + Math.pow(centerUpY - centerDownY, 2));             // 117
                                                                                                                       // 118
    //this.geometry = new THREE.PlaneGeometry(distance / 2, distance);                                                 // 119
    var horizGeometry = new THREE.PlaneGeometry(200, 400);                                                             // 120
                                                                                                                       // 121
                                                                                                                       // 122
    this.geometry = new THREE.Geometry();                                                                              // 123
    this.geometry.vertices.push(new THREE.Vector3(0, 200, 0));                                                         // 124
    this.geometry.vertices.push(new THREE.Vector3(0, -200, 0));                                                        // 125
    this.geometry.vertices.push(new THREE.Vector3(-200, -200, 0));                                                     // 126
    this.geometry.vertices.push(new THREE.Vector3(-200, 200, 0));                                                      // 127
                                                                                                                       // 128
    this.geometry.faces.push(new THREE.Face3(0, 1, 2));                                                                // 129
    this.geometry.faces.push(new THREE.Face3(0, 2, 3));                                                                // 130
                                                                                                                       // 131
    var floorLineGeometry = new THREE.Geometry();                                                                      // 132
    floorLineGeometry.vertices.push(new THREE.Vector3(0, -200, 0));                                                    // 133
    floorLineGeometry.vertices.push(new THREE.Vector3(0, 200, 0));                                                     // 134
    floorLineGeometry.computeLineDistances();                                                                          // 135
    this.floorLine = new THREE.Line(floorLineGeometry, this.SimLineDashMaterial);                                      // 136
    this.floorLine.renderDepth = 9007199254740992;                                                                     // 137
                                                                                                                       // 138
    var material = new THREE.MeshBasicMaterial({color: 0xffec45, side: THREE.DoubleSide, transparent: true, opacity: 0.4, depthWrite: false, depthTest: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1})
    var material2 = new THREE.MeshBasicMaterial({color: 0xC1FFC1, side: THREE.DoubleSide, transparent: true, opacity: 0.4, depthWrite: false, depthTest: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1})
                                                                                                                       // 141
                                                                                                                       // 142
    this.mesh = new THREE.Mesh(this.geometry, material);                                                               // 143
    Logger.postEvent("Plane-Cutter-Created;TopMarker:(" +                                                              // 144
            centerUpX + "," + centerUpY + ");BottomMarker:(" +                                                         // 145
            centerDownX + "," + centerDownY + ");RotationRad:" + 0+";RotationDeg:"+ 0                                  // 146
            +";Height:" + 0                                                                                            // 147
            )                                                                                                          // 148
    this.horizMesh = new THREE.Mesh(horizGeometry, material2)                                                          // 149
    this.mesh.add(this.horizMesh);                                                                                     // 150
    this.horizMesh.visible = false;                                                                                    // 151
                                                                                                                       // 152
    this.reset();                                                                                                      // 153
};                                                                                                                     // 154
                                                                                                                       // 155
PlaneCutter.prototype.reset = function() {                                                                             // 156
    this.mesh.rotation.x = 0;                                                                                          // 157
    this.mesh.rotation.y = 0;                                                                                          // 158
    this.mesh.rotation.z = 0;                                                                                          // 159
    this.mesh.position.x = 0;                                                                                          // 160
    this.mesh.position.y = 0;                                                                                          // 161
    this.mesh.position.z = 0;                                                                                          // 162
    this.mesh.rotateY(Math.PI / 2);                                                                                    // 163
    this.floorLine.rotation.x = 0;                                                                                     // 164
    this.floorLine.rotation.y = 0;                                                                                     // 165
    this.floorLine.rotation.z = 0;                                                                                     // 166
    this.floorLine.position.x = 0;                                                                                     // 167
    this.floorLine.position.y = 0;                                                                                     // 168
    this.floorLine.position.z = 0;                                                                                     // 169
    this.horizMesh.visible = false;                                                                                    // 170
                                                                                                                       // 171
                                                                                                                       // 172
}                                                                                                                      // 173
                                                                                                                       // 174
PlaneCutter.prototype.computeNewPosition = function(markers) {                                                         // 175
    this.reset();                                                                                                      // 176
    var mUp, mDown,text;                                                                                               // 177
    mUp = markers[41];                                                                                                 // 178
    mDown = markers[42];                                                                                               // 179
    //Take the 2 opposite corners of the marker and compute the center                                                 // 180
    var mUp_position = [mUp.corners[0].x, mUp.corners[0].y, 1];                                                        // 181
    var mUp_position2 = [mUp.corners[2].x, mUp.corners[2].y, 1];                                                       // 182
    var position, position2;                                                                                           // 183
    if (Session.get('virtual') == true) {                                                                              // 184
        position = {x: mUp_position[0], y: mUp_position[1]};                                                           // 185
        position2 = {x: mUp_position2[0], y: mUp_position2[1]}                                                         // 186
                                                                                                                       // 187
    }                                                                                                                  // 188
    else {                                                                                                             // 189
        //Hard Coding Height                                                                                           // 190
        position = pixel2mm(mUp_position[0], mUp_position[1], 5);                                                      // 191
        position2 = pixel2mm(mUp_position2[0], mUp_position2[1], 5);                                                   // 192
    }                                                                                                                  // 193
    var centerUpX = (position.x + position2.x) / 2;                                                                    // 194
    var centerUpY = (position.y + position2.y) / 2;                                                                    // 195
    var mDown_position = [mDown.corners[0].x, mDown.corners[0].y, 1];                                                  // 196
    var mDown_position2 = [mDown.corners[2].x, mDown.corners[2].y, 1];                                                 // 197
    if (Session.get('virtual') == true) {                                                                              // 198
        position = {x: mDown_position[0], y: mDown_position[1]};                                                       // 199
        position2 = {x: mDown_position2[0], y: mDown_position2[1]}                                                     // 200
                                                                                                                       // 201
    }                                                                                                                  // 202
    else {                                                                                                             // 203
        //Hard Coding Height                                                                                           // 204
                                                                                                                       // 205
        position = pixel2mm(mDown_position[0], mDown_position[1], 5);                                                  // 206
        position2 = pixel2mm(mDown_position2[0], mDown_position2[1], 5);                                               // 207
    }                                                                                                                  // 208
    var centerDownX = (position.x + position2.x) / 2;                                                                  // 209
    var centerDownY = (position.y + position2.y) / 2;                                                                  // 210
                                                                                                                       // 211
                                                                                                                       // 212
    var planeCenterX = (centerUpX + centerDownX) / 2;                                                                  // 213
    var planeCenterY = (centerUpY + centerDownY) / 2;                                                                  // 214
                                                                                                                       // 215
                                                                                                                       // 216
    this.mesh.position.x = planeCenterX;                                                                               // 217
    this.mesh.position.y = planeCenterY;                                                                               // 218
                                                                                                                       // 219
    this.floorLine.position.x = planeCenterX;                                                                          // 220
    this.floorLine.position.y = planeCenterY;                                                                          // 221
    var rotation;                                                                                                      // 222
                                                                                                                       // 223
    var diffx = (centerUpX - centerDownX);                                                                             // 224
    var diffy = (centerUpY - centerDownY);                                                                             // 225
    rotation = Math.atan2(diffx, diffy);                                                                               // 226
                                                                                                                       // 227
    this.mesh.rotateX(rotation);                                                                                       // 228
    this.floorLine.rotateZ(-rotation);                                                                                 // 229
                                                                                                                       // 230
                                                                                                                       // 231
    if (markers.hasOwnProperty(45)) {                                                                                  // 232
        //Rotation                                                                                                     // 233
        var marker = markers[45];                                                                                      // 234
        var marker_position = [marker.corners[0].x, marker.corners[0].y, 1];                                           // 235
        var marker_position2 = [marker.corners[1].x, marker.corners[1].y, 1];                                          // 236
        var real_position, real_position2;                                                                             // 237
        if (Session.get('virtual') == true) {                                                                          // 238
            real_position = {x: marker_position[0], y: marker_position[1]};                                            // 239
            real_position2 = {x: marker_position2[0], y: marker_position2[1]}                                          // 240
                                                                                                                       // 241
        } else {                                                                                                       // 242
            real_position = pixel2mm(marker_position[0], marker_position[1], this.rotationMarkerZ);                    // 243
            real_position2 = pixel2mm(marker_position2[0], marker_position2[1], this.rotationMarkerZ);                 // 244
        }                                                                                                              // 245
                                                                                                                       // 246
        diffx = (real_position.x - real_position2.x);                                                                  // 247
        diffy = (real_position.y - real_position2.y);                                                                  // 248
        rotation = Math.atan2(diffy, diffx);                                                                           // 249
        if (this.testOldRot != null) {                                                                                 // 250
            if ((this.testOldRot >= 0 && rotation >= 0) || (this.testOldRot <= 0 && rotation <= 0))                    // 251
                rotation = rotation - this.testOldRot;                                                                 // 252
            else if (this.testOldRot > 0 && rotation < 0) {                                                            // 253
                //--                                                                                                   // 254
                if (this.testOldRot < Math.PI / 2 && rotation > -Math.PI / 2)                                          // 255
                    rotation = (-this.testOldRot + rotation);                                                          // 256
                //++                                                                                                   // 257
                if (this.testOldRot > Math.PI / 2 && rotation < -Math.PI / 2)                                          // 258
                    rotation = ((Math.PI - this.testOldRot) - (-Math.PI - rotation));                                  // 259
            }                                                                                                          // 260
            else if (this.testOldRot < 0 && rotation > 0) {                                                            // 261
                //--                                                                                                   // 262
                if (this.testOldRot < -Math.PI / 2 && rotation > Math.PI / 2)                                          // 263
                    rotation = ((-Math.PI - this.testOldRot) + (-Math.PI + rotation));                                 // 264
                //++                                                                                                   // 265
                if (this.testOldRot > -Math.PI / 2 && rotation < Math.PI / 2)                                          // 266
                    rotation = ((-this.testOldRot) + (rotation));                                                      // 267
            }                                                                                                          // 268
            if (rotation != 0)                                                                                         // 269
                rotation = Math.round(rotation / 0.03490);                                                             // 270
            var val = rotation * -0.0174532925;                                                                        // 271
            if (centerUpY < centerDownY) {                                                                             // 272
                val = val * -1;                                                                                        // 273
            }                                                                                                          // 274
                                                                                                                       // 275
            val = this.lastInclination + val;                                                                          // 276
            if (val < -Math.PI / 2)                                                                                    // 277
                val = -Math.PI / 2;                                                                                    // 278
            else if (val > Math.PI / 2)                                                                                // 279
                val = Math.PI / 2;                                                                                     // 280
                                                                                                                       // 281
            this.mesh.rotateY(val);                                                                                    // 282
            this.lastInclination = val;                                                                                // 283
                                                                                                                       // 284
            $("label[for='Degrees-Plane']").empty( );                                                                  // 285
            text = Math.round(val / -0.0174532925);                                                                    // 286
            $("label[for='Degrees-Plane']").append("Plane Inclination:<strong>" + text + "</strong>");                 // 287
        }                                                                                                              // 288
        else                                                                                                           // 289
            this.mesh.rotateY(this.lastInclination);                                                                   // 290
        this.testOldRot = Math.atan2(diffy, diffx);                                                                    // 291
                                                                                                                       // 292
//        if (rotation < 0)                                                                                            // 293
//            rotation = Math.PI + rotation;                                                                           // 294
//        if (rotation > Math.PI / 2)                                                                                  // 295
//            rotation = -(Math.PI - rotation);                                                                        // 296
//        this.mesh.rotateY(rotation);                                                                                 // 297
//        this.lastInclination = rotation;                                                                             // 298
//        console.log(this.lastInclination)                                                                            // 299
//        //Translantion && (rotation<Math.PI/2+0.44 && rotation>Math.PI/2-0.44)                                       // 300
                                                                                                                       // 301
    }                                                                                                                  // 302
    else {                                                                                                             // 303
        this.testOldRot = null;                                                                                        // 304
        this.mesh.rotateY(this.lastInclination);                                                                       // 305
        //this.mesh.position.z = this.lastZ;                                                                           // 306
    }                                                                                                                  // 307
    if (markers.hasOwnProperty(39) && markers.hasOwnProperty(38)) {                                                    // 308
        //39 moves                                                                                                     // 309
        var markerT1 = markers[38];                                                                                    // 310
        var markerT1_position = [markerT1.corners[0].x, markerT1.corners[0].y, 1];                                     // 311
        var markerT1_position2 = [markerT1.corners[1].x, markerT1.corners[1].y, 1];                                    // 312
        var T1real_position, T1real_position2;                                                                         // 313
        if (Session.get('virtual') == true) {                                                                          // 314
            T1real_position = {x: markerT1_position[0], y: markerT1_position[1]};                                      // 315
            T1real_position2 = {x: markerT1_position2[0], y: markerT1_position2[1]}                                    // 316
                                                                                                                       // 317
        } else {                                                                                                       // 318
            //Hard code                                                                                                // 319
            T1real_position = pixel2mm(markerT1_position[0], markerT1_position[1], 25);                                // 320
            T1real_position2 = pixel2mm(markerT1_position2[0], markerT1_position2[1], 25);                             // 321
        }                                                                                                              // 322
                                                                                                                       // 323
        var centroidUpX = (T1real_position.x + T1real_position2.x) / 2;                                                // 324
        var centroidUpY = (T1real_position.y + T1real_position2.y) / 2                                                 // 325
                                                                                                                       // 326
                                                                                                                       // 327
        var markerT = markers[39];                                                                                     // 328
        var markerT_position = [markerT.corners[0].x, markerT.corners[0].y, 1];                                        // 329
        var markerT_position2 = [markerT.corners[1].x, markerT.corners[1].y, 1];                                       // 330
        var Treal_position, Treal_position2;                                                                           // 331
        if (Session.get('virtual') == true) {                                                                          // 332
            Treal_position = {x: markerT_position[0], y: markerT_position[1]};                                         // 333
            Treal_position2 = {x: markerT_position2[0], y: markerT_position2[1]}                                       // 334
                                                                                                                       // 335
        } else {                                                                                                       // 336
            //Hard Code                                                                                                // 337
            Treal_position = pixel2mm(markerT_position[0], markerT_position[1], 50);                                   // 338
            Treal_position2 = pixel2mm(markerT_position2[0], markerT_position2[1], 50);                                // 339
        }                                                                                                              // 340
                                                                                                                       // 341
        var centroidDownX = (Treal_position.x + Treal_position2.x) / 2;                                                // 342
        var centroidDownY = (Treal_position.y + Treal_position2.y) / 2;                                                // 343
        var distance = Math.sqrt(Math.pow(centroidDownX - centroidUpX, 2) + Math.pow(centroidDownY - centroidUpY, 2)); // 344
        distance = Math.round(distance);                                                                               // 345
        //TODO:Set session variable                                                                                    // 346
        if (Session.get('maxBrickZ') == undefined) {                                                                   // 347
            distance = 95 * ((distance - this.minDistance) / (this.maxDistance - this.minDistance)) - 20;              // 348
        }                                                                                                              // 349
        else {                                                                                                         // 350
            distance = (Session.get('maxBrickZ') + Session.get('maxBrickZ') * 0.25) * ((distance - this.minDistance) / (this.maxDistance - this.minDistance)) - 20;
                                                                                                                       // 352
        }                                                                                                              // 353
        //console.log("Distance:"+distance)                                                                            // 354
        if(distance>0)                                                                                                 // 355
            this.lastZ = distance;                                                                                     // 356
        else                                                                                                           // 357
            this.lastZ = 0;                                                                                            // 358
    }                                                                                                                  // 359
    else {                                                                                                             // 360
//        this.mesh.position.z = this.lastZ;                                                                           // 361
    }                                                                                                                  // 362
//                                                                                                                     // 363
    if (this.lastInclination > 1.50 || this.lastInclination < -1.50) {                                                 // 364
        this.horizMesh.visible = true;                                                                                 // 365
        this.mesh.visible = false;                                                                                     // 366
        this.mesh.position.z = this.lastZ;                                                                             // 367
    }                                                                                                                  // 368
                                                                                                                       // 369
    Logger.postEvent("Plane-Cutter;TopMarker:(" +                                                                      // 370
            centerUpX + "," + centerUpY + ");BottomMarker:(" +                                                         // 371
            centerDownX + "," + centerDownY + ");RotationRad:" + this.lastInclination                                  // 372
            +";RotationDeg:"+ Math.round(this.lastInclination / -0.0174532925)                                         // 373
            +                                                                                                          // 374
            ";Height:" + this.lastZ                                                                                    // 375
            )                                                                                                          // 376
}                                                                                                                      // 377
                                                                                                                       // 378
PlaneCutter.prototype.computeNewStatus = function(markers, view) {                                                     // 379
    if (markers.hasOwnProperty(43) && !markers.hasOwnProperty(40)) {                                                   // 380
        if (this.cutAvailable == false)                                                                                // 381
            Logger.postEvent("Enabling the Cut...")                                                                    // 382
        this.cutAvailable = true;                                                                                      // 383
    }                                                                                                                  // 384
    /*Simulate a cut*/                                                                                                 // 385
    if (!markers.hasOwnProperty(40) || this.cutAvailable == false) {                                                   // 386
        view.scene.remove(this.selection);                                                                             // 387
        if (this.selection != null) {                                                                                  // 388
            this.selection.geometry.dispose();                                                                         // 389
            for (var i in this.selection.children) {                                                                   // 390
                this.selection.children[i].geometry.dispose();                                                         // 391
            }                                                                                                          // 392
        }                                                                                                              // 393
        this.selection = null;                                                                                         // 394
        var points = THREE.GeometryUtils.randomPointsInGeometry(this.mesh.geometry, 3);                                // 395
        points[0].applyMatrix4(this.mesh.matrix);                                                                      // 396
        points[1].applyMatrix4(this.mesh.matrix);                                                                      // 397
        points[2].applyMatrix4(this.mesh.matrix);                                                                      // 398
        var plane = new THREE.Plane();                                                                                 // 399
        plane.setFromCoplanarPoints(points[0], points[1], points[2]);                                                  // 400
        for (var brickIndex in this.brickManager.bricks) {                                                             // 401
            var brick = this.brickManager.bricks[brickIndex];                                                          // 402
            if (brick.visibility) {                                                                                    // 403
                brick.faces.updateMatrix();                                                                            // 404
                /*In thise way we avoid to take into account the new blocks :)*/                                       // 405
                for (var blockIndex = 0, numBlocks = brick.blocks.length; blockIndex < numBlocks; blockIndex++) {      // 406
                    var block = brick.blocks[blockIndex];                                                              // 407
                    var intersectionPoints = new Array();                                                              // 408
                    if (this.checkFaceCut2(brick, plane, false)) {                                                     // 409
                        continue;                                                                                      // 410
                    }                                                                                                  // 411
                                                                                                                       // 412
                                                                                                                       // 413
                    /*Find intersection point*/                                                                        // 414
                    for (var lineIndex = 0; lineIndex < block.lines.length; lineIndex++) {                             // 415
                        var line = block.lines[lineIndex];                                                             // 416
                        var line3 = new THREE.Line3(line.geometry.vertices[0].clone(), line.geometry.vertices[1].clone());
                        line3.applyMatrix4(line.matrix);                                                               // 418
                        if (plane.isIntersectionLine(line3)) {                                                         // 419
                            var point = plane.intersectLine(line3);                                                    // 420
                            intersectionPoints.push(point);                                                            // 421
                        }                                                                                              // 422
                                                                                                                       // 423
                    }                                                                                                  // 424
                    /*I've got the intersection points :) */                                                           // 425
                    if (intersectionPoints.length > 1) {                                                               // 426
                        intersectionPoints = this.sortVertices(intersectionPoints);                                    // 427
                        var geometry = new THREE.Geometry();                                                           // 428
                        for (var i in intersectionPoints) {                                                            // 429
                            geometry.vertices.push(intersectionPoints[i].clone());                                     // 430
                                                                                                                       // 431
                        }                                                                                              // 432
//                        for (var k = 0; k < geometry.vertices.length - 2; k++) {                                     // 433
//                            var newFace = new THREE.Face3(0, k + 1, k + 2);                                          // 434
//                            geometry.faces.push(newFace);                                                            // 435
//                        }                                                                                            // 436
//                                                                                                                     // 437
//                        var face = new THREE.Mesh(geometry, this.SimMeshMaterial);                                   // 438
//                        face.renderDepth = 9007199254740992;                                                         // 439
                        var lineGeometry = geometry.clone();                                                           // 440
                        /*Close the line*/                                                                             // 441
                        lineGeometry.vertices.push(lineGeometry.vertices[0]);                                          // 442
                        lineGeometry.computeLineDistances();                                                           // 443
                        var line = new THREE.Line(lineGeometry, this.SimLineDashMaterial);                             // 444
                        line.renderDepth = 9007199254740992;                                                           // 445
                                                                                                                       // 446
                        if (this.selection == null)                                                                    // 447
                            this.selection = line;                                                                     // 448
                        else                                                                                           // 449
                            this.selection.add(line);                                                                  // 450
                                                                                                                       // 451
                        // this.selection.add(line);                                                                   // 452
                    }                                                                                                  // 453
                }                                                                                                      // 454
                //view.renderer.clear();                                                                               // 455
                view.scene.add(this.selection);                                                                        // 456
//                if (Session.get("virtual") == true)                                                                  // 457
//                    MarkersDetector.forceUpdate = true;                                                              // 458
////                else {                                                                                             // 459
//                    view.renderer.clear();                                                                           // 460
//                    view.renderer.render(view.scene, view.camera);                                                   // 461
//                }                                                                                                    // 462
            }                                                                                                          // 463
        }                                                                                                              // 464
    }                                                                                                                  // 465
    //Cut the bricks                                                                                                   // 466
    if (markers.hasOwnProperty(40) && this.cutAvailable) {                                                             // 467
        Logger.postEvent("Cutting...")                                                                                 // 468
        console.log("Cutting");                                                                                        // 469
        this.cutAvailable = false;                                                                                     // 470
        var points = THREE.GeometryUtils.randomPointsInGeometry(this.mesh.geometry, 3);                                // 471
        points[0].applyMatrix4(this.mesh.matrix);                                                                      // 472
        points[1].applyMatrix4(this.mesh.matrix);                                                                      // 473
        points[2].applyMatrix4(this.mesh.matrix);                                                                      // 474
        var plane = new THREE.Plane();                                                                                 // 475
        plane.setFromCoplanarPoints(points[0], points[1], points[2]);                                                  // 476
        var cutDone = false;                                                                                           // 477
        /*TODO: gestire caso del piano che contiene la retta                                                           // 478
         **/                                                                                                           // 479
        for (var brickIndex in this.brickManager.bricks) {                                                             // 480
            var brick = this.brickManager.bricks[brickIndex];                                                          // 481
            if (brick.visibility) {                                                                                    // 482
                Logger.postEvent("Cutting-Brick:" + brick.id);                                                         // 483
                brick.faces.updateMatrix();                                                                            // 484
                var brickMatrix = brick.faces.matrix.clone();                                                          // 485
                if (this.checkFaceCut2(brick, plane, true)) {                                                          // 486
                    console.log("Invalid cut");                                                                        // 487
                    $("#anyError > #text").text("Cutting a face");                                                     // 488
                    $("#anyError").show(200, function() {                                                              // 489
                        $("#anyError").hide(5000);                                                                     // 490
                    });                                                                                                // 491
                    continue;                                                                                          // 492
                }                                                                                                      // 493
                                                                                                                       // 494
                                                                                                                       // 495
                view.removeBrickFromScene(brick);                                                                      // 496
                                                                                                                       // 497
                /*In thise way we avoid to take into account the new blocks :)*/                                       // 498
                for (var blockIndex = 0, numBlocks = brick.blocks.length; blockIndex < numBlocks; blockIndex++) {      // 499
                    var block = brick.blocks[blockIndex];                                                              // 500
                    //console.log("Checking Block:" + block.id)                                                        // 501
                    /*These arrays will contain the lines of the 2 new blocks */                                       // 502
                    var geometries1 = new Array();                                                                     // 503
                    var geometries2 = new Array();                                                                     // 504
                    var intersectionPoints = new Array();                                                              // 505
                    /*These arrays contain the lines which are not involved in the cut.                                // 506
                     * Obviously, they need to be put in the right side*/                                              // 507
                    var oldLines1 = new Array();                                                                       // 508
                    var oldLines2 = new Array();                                                                       // 509
                    /*Find intersection point*/                                                                        // 510
                    for (var lineIndex = 0; lineIndex < block.lines.length; lineIndex++) {                             // 511
                        var line = block.lines[lineIndex];                                                             // 512
                        var line3 = new THREE.Line3(line.geometry.vertices[0].clone(), line.geometry.vertices[1].clone());
                        line3.applyMatrix4(line.matrix);                                                               // 514
                        if (plane.isIntersectionLine(line3)                                                            // 515
                                ||                                                                                     // 516
                                plane.distanceToPoint(line3.start) == 0 ||                                             // 517
                                plane.distanceToPoint(line3.end) == 0                                                  // 518
                                )                                                                                      // 519
                        {                                                                                              // 520
                            var point = plane.intersectLine(line3);                                                    // 521
                            if (point != undefined) {                                                                  // 522
                                var inverseMatrix = line.matrix.clone();                                               // 523
                                inverseMatrix = inverseMatrix.getInverse(inverseMatrix);                               // 524
                                var pointN = point.applyMatrix4(inverseMatrix);                                        // 525
                                intersectionPoints.push([pointN, line]);                                               // 526
                            }                                                                                          // 527
                        }                                                                                              // 528
                        /*If the line is not involved in the cut i keep it*/                                           // 529
                        else {                                                                                         // 530
                            if (plane.distanceToPoint(line3.start) > 0) {                                              // 531
                                var oldLine = line.clone();                                                            // 532
                                oldLine.name = "";                                                                     // 533
                                oldLines1.push(oldLine);                                                               // 534
                            }                                                                                          // 535
                            else {                                                                                     // 536
                                var oldLine = line.clone();                                                            // 537
                                oldLine.name = "";                                                                     // 538
                                oldLines2.push(oldLine);                                                               // 539
                            }                                                                                          // 540
                        }                                                                                              // 541
                    }                                                                                                  // 542
                    //console.log("Intersections:" + intersectionPoints.length);                                       // 543
                    /*I've got the intersection points :) */                                                           // 544
                    if (intersectionPoints.length > 0) {                                                               // 545
                        if (this.checkFaceCut(block, intersectionPoints, plane)) {                                     // 546
                            console.log("Invalid cutting");                                                            // 547
                            Logger.postEvent("Cutting-a-Face-of-Block:" + block.id);                                   // 548
                            for (var i in intersectionPoints) {                                                        // 549
                                Logger.postEvent("Intersection-Point:(" +                                              // 550
                                        intersectionPoints[i][0].x + "," +                                             // 551
                                        intersectionPoints[i][0].y + "," +                                             // 552
                                        intersectionPoints[i][0].z + ");Local-Coordinates");                           // 553
                            }                                                                                          // 554
                            $("#anyError > #text").text("Cutting a face");                                             // 555
                            $("#anyError").show(200, function() {                                                      // 556
                                $("#anyError").hide(5000);                                                             // 557
                            })                                                                                         // 558
                            break;                                                                                     // 559
                        }                                                                                              // 560
                        if (this.checkDegenerateCut(intersectionPoints)) {                                             // 561
                            console.log("Invalid cutting");                                                            // 562
                            Logger.postEvent("Cutting-only-a-Point-of-Block:" + block.id);                             // 563
                            for (var i in intersectionPoints) {                                                        // 564
                                Logger.postEvent("Intersection-Point:(" +                                              // 565
                                        intersectionPoints[i][0].x + "," +                                             // 566
                                        intersectionPoints[i][0].y + "," +                                             // 567
                                        intersectionPoints[i][0].z + ");Local-Coordinates");                           // 568
                            }                                                                                          // 569
                            $("#anyError > #text").text("Cutting on only one Point");                                  // 570
                            $("#anyError").show(200, function() {                                                      // 571
                                $("#anyError").hide(5000);                                                             // 572
                            });                                                                                        // 573
                            break;                                                                                     // 574
                        }                                                                                              // 575
                        if (cutDone == false) {                                                                        // 576
                            cutDone = true;                                                                            // 577
                            var backUp = [];                                                                           // 578
                            backUp.push(brick.uniqueID.clone());                                                       // 579
                            for (var i in brick.blocks) {                                                              // 580
                                var bb = new Block(brick.blocks[i].id);                                                // 581
                                bb.faces = brick.blocks[i].faces;                                                      // 582
                                bb.lines = brick.blocks[i].lines;                                                      // 583
                                backUp.push(bb);                                                                       // 584
                            }                                                                                          // 585
                            brick.removedBlocks.push(backUp);                                                          // 586
                        }                                                                                              // 587
                        var newBlock = new Block(brick.uniqueID());                                                    // 588
                        var newId = newBlock.id;                                                                       // 589
                                                                                                                       // 590
                        Logger.postEvent("Create-new-Block:" + newBlock.id + ";from-Block:" + block.id);               // 591
                        for (var i in intersectionPoints) {                                                            // 592
                            Logger.postEvent("Intersection-Point:(" +                                                  // 593
                                    intersectionPoints[i][0].x + "," +                                                 // 594
                                    intersectionPoints[i][0].y + "," +                                                 // 595
                                    intersectionPoints[i][0].z + ");Local-Coordinates");                               // 596
                        }                                                                                              // 597
                                                                                                                       // 598
                                                                                                                       // 599
                        //$('#Shape' + brick.id + '>' + '#delete-shape').remove();                                     // 600
                        $('#Shape' + brick.id + "> #actions").before("<button id=\"Block" + newId + "\" class=\"btn btn-mini\"  style=\"margin-top:5px;\">" + newId + "</button>");
                        $('#Shape' + brick.id + '>' + '#Block' + newId).css({'background-image': 'none', 'background-color': (this.colors[newId % this.colors.length])});
                                                                                                                       // 603
                        (function(brick, newId, view) {                                                                // 604
                            $('#Shape' + brick.id + '>' + '#Block' + newId).on('click', $.proxy(function() {           // 605
                                if (brick.visibility) {                                                                // 606
                                    $('#Shape' + brick.id + '>' + "button[id*='Block']").removeClass('btn-primary');   // 607
                                    $('#Shape' + brick.id + '>' + "button[id*='All']").removeClass('btn-primary');     // 608
                                    $('#Shape' + brick.id + '>' + '#Block' + newId).addClass('btn-primary');           // 609
                                    //console.log(newId);                                                              // 610
                                    brick.highlightBlock();                                                            // 611
                                    //view.renderer.clear();                                                           // 612
//                                    if (Session.get("virtual") == true)                                              // 613
                                    MarkersDetector.forceUpdate = true;                                                // 614
//                                    else                                                                             // 615
//                                        view.renderer.render(view.scene, view.camera);                               // 616
                                }                                                                                      // 617
                            }, this));                                                                                 // 618
                        })(brick, newId, view);                                                                        // 619
                                                                                                                       // 620
                                                                                                                       // 621
//                    $('#Shape' + brick.id).append("<button id=\"delete-shape\" class=\"btn btn-mini\">Delete</button>");
//                    $('#Shape' + brick.id + '> #delete-shape').on('click', function() {                              // 623
//                        view.removeBrickFromScene(brick);                                                            // 624
//                        brick.deleteBlock();                                                                         // 625
//                        view.addBrickToScene(brick);                                                                 // 626
//                        view.renderer.render(view.scene, view.camera);                                               // 627
//                                                                                                                     // 628
//                    });                                                                                              // 629
                                                                                                                       // 630
                        brick.blocks.push(newBlock);                                                                   // 631
                                                                                                                       // 632
                        var oldFaces = block.faces;                                                                    // 633
                                                                                                                       // 634
                        /*For each face, the first array contains the points on the                                    // 635
                         * "right" side; the other for the left side                                                   // 636
                         *  */                                                                                         // 637
                        var blockPoints = new Array(oldFaces.length);                                                  // 638
                        var newBlockPoints = new Array(oldFaces.length);                                               // 639
                                                                                                                       // 640
                        block.lines = new Array();                                                                     // 641
                        block.faces = new Array();                                                                     // 642
                                                                                                                       // 643
                        for (var pointIndex = 0, length = intersectionPoints.length; pointIndex < length; pointIndex++) {
                            var geometry1 = new THREE.Geometry();                                                      // 645
                            var geometry2 = new THREE.Geometry();                                                      // 646
                            var point = intersectionPoints[pointIndex][0];                                             // 647
                            var startN = intersectionPoints[pointIndex][1].geometry.vertices[0].clone();               // 648
                            var start = startN.clone().applyMatrix4(intersectionPoints[pointIndex][1].matrix);         // 649
                            var endN = intersectionPoints[pointIndex][1].geometry.vertices[1].clone();                 // 650
                            var end = endN.clone().applyMatrix4(intersectionPoints[pointIndex][1].matrix);             // 651
                                                                                                                       // 652
                            if (plane.distanceToPoint(start) == 0 && plane.distanceToPoint(end) == 0) {                // 653
                                /*When the line is on the plane, the intersection point is the start.                  // 654
                                 * So we add the end as intersection point and                                         // 655
                                 * computeNewLinesAndFaces will think about                                            // 656
                                 * recreating the line*/                                                               // 657
                                if (point.distanceTo(start) < point.distanceTo(start))                                 // 658
                                    intersectionPoints.push([endN.clone(), intersectionPoints[pointIndex][1].clone()]);
                                else                                                                                   // 660
                                    intersectionPoints.push([startN.clone(), intersectionPoints[pointIndex][1].clone()]);
                                                                                                                       // 662
                            }                                                                                          // 663
                            else if (plane.distanceToPoint(start) == 0) {                                              // 664
                                if (plane.distanceToPoint(end) > 0) {                                                  // 665
                                    /*In this way we notify that start belongs                                         // 666
                                     * to the block 1.*/                                                               // 667
                                    intersectionPoints[pointIndex].push(1);                                            // 668
                                    geometry1.vertices.push(startN);                                                   // 669
                                    geometry1.vertices.push(endN);                                                     // 670
                                                                                                                       // 671
                                }                                                                                      // 672
                                else if (plane.distanceToPoint(end) < 0) {                                             // 673
                                    intersectionPoints[pointIndex].push(-1);                                           // 674
                                    geometry2.vertices.push(startN);                                                   // 675
                                    geometry2.vertices.push(endN);                                                     // 676
                                }                                                                                      // 677
                                                                                                                       // 678
                            }                                                                                          // 679
                            else if (plane.distanceToPoint(end) == 0) {                                                // 680
                                if (plane.distanceToPoint(start) > 0) {                                                // 681
                                    /*In this way we notify that start belongs                                         // 682
                                     * to the block 1.*/                                                               // 683
                                    intersectionPoints[pointIndex].push(1);                                            // 684
                                    geometry1.vertices.push(startN);                                                   // 685
                                    geometry1.vertices.push(endN);                                                     // 686
                                                                                                                       // 687
                                }                                                                                      // 688
                                else if (plane.distanceToPoint(start) < 0) {                                           // 689
                                    intersectionPoints[pointIndex].push(-1);                                           // 690
                                    geometry2.vertices.push(startN);                                                   // 691
                                    geometry2.vertices.push(endN);                                                     // 692
                                }                                                                                      // 693
                            }                                                                                          // 694
                            else if (plane.distanceToPoint(start) > 0) {                                               // 695
                                /*In this way we notify that start belongs                                             // 696
                                 * to the block 1.*/                                                                   // 697
                                intersectionPoints[pointIndex].push(1);                                                // 698
                                geometry1.vertices.push(startN);                                                       // 699
                                geometry1.vertices.push(point);                                                        // 700
                                geometry2.vertices.push(endN);                                                         // 701
                                geometry2.vertices.push(point);                                                        // 702
                                                                                                                       // 703
                            }                                                                                          // 704
                            else if (plane.distanceToPoint(start) < 0) {                                               // 705
                                intersectionPoints[pointIndex].push(-1);                                               // 706
                                geometry2.vertices.push(startN);                                                       // 707
                                geometry2.vertices.push(point);                                                        // 708
                                geometry1.vertices.push(endN);                                                         // 709
                                geometry1.vertices.push(point);                                                        // 710
                            }                                                                                          // 711
                                                                                                                       // 712
                            geometries1.push(geometry1);                                                               // 713
                            geometries2.push(geometry2);                                                               // 714
                                                                                                                       // 715
                        }                                                                                              // 716
                                                                                                                       // 717
                        for (var indexFace = 0; indexFace < oldFaces.length; indexFace++) {                            // 718
                            for (var indexPoint = 0; indexPoint < oldFaces[indexFace].length; indexPoint++) {          // 719
                                var pointN = oldFaces[indexFace][indexPoint].clone();                                  // 720
                                var point = pointN.clone().applyMatrix4(brickMatrix);                                  // 721
                                                                                                                       // 722
                                if (blockPoints[indexFace] === undefined) {                                            // 723
                                    blockPoints[indexFace] = new Array();                                              // 724
                                    newBlockPoints[indexFace] = new Array();                                           // 725
                                                                                                                       // 726
                                }                                                                                      // 727
                                if (plane.distanceToPoint(point) > 0) {                                                // 728
                                    blockPoints[indexFace].push(pointN);                                               // 729
                                }                                                                                      // 730
                                else if (plane.distanceToPoint(point) < 0) {                                           // 731
                                    newBlockPoints[indexFace].push(pointN);                                            // 732
                                }                                                                                      // 733
                                /*If the point is on the plane, it's an intersection                                   // 734
                                 * point, the computeNewLinesAndFaces will                                             // 735
                                 * deal with it*/                                                                      // 736
                            }                                                                                          // 737
                        }                                                                                              // 738
                                                                                                                       // 739
                        /*At this point we have the lines of the two sides.*/                                          // 740
                        for (var lineIndex = 0; lineIndex < geometries1.length; lineIndex++) {                         // 741
                            geometries1[lineIndex].computeLineDistances();                                             // 742
                            var newline = new THREE.Line(geometries1[lineIndex], this.lineMaterial);                   // 743
                            block.lines.push(newline);                                                                 // 744
                        }                                                                                              // 745
                        for (var lineIndex = 0; lineIndex < geometries2.length; lineIndex++) {                         // 746
                            geometries2[lineIndex].computeLineDistances();                                             // 747
                            var newline = new THREE.Line(geometries2[lineIndex], this.lineMaterial);                   // 748
                            newBlock.lines.push(newline);                                                              // 749
                        }                                                                                              // 750
                                                                                                                       // 751
                        var newElements = this.computeNewLinesAndFaces(oldFaces, intersectionPoints, oldLines1, blockPoints, newBlockPoints);
                        var newLines = newElements[0];                                                                 // 753
                        block.faces = newElements[1];                                                                  // 754
                        newBlock.faces = newElements[2];                                                               // 755
                        block.lines = block.lines.concat(oldLines1, newLines);                                         // 756
                        var newLines2 = new Array();                                                                   // 757
                        for (var g in newLines) {                                                                      // 758
                            newLines2.push(newLines[g].clone());                                                       // 759
                        }                                                                                              // 760
                        newBlock.lines = newBlock.lines.concat(oldLines2, newLines2);                                  // 761
                                                                                                                       // 762
                    }                                                                                                  // 763
                }                                                                                                      // 764
                                                                                                                       // 765
                //brick.removedBlocks = new Array();                                                                   // 766
                //$('#Shape' + brick.id + '> #restore-shape').text("Undo(0)");                                         // 767
                brick.recreateBrick();                                                                                 // 768
                view.addBrickToScene(brick);                                                                           // 769
//                if (Session.get("virtual") == true)                                                                  // 770
//                    MarkersDetector.forceUpdate = true;                                                              // 771
//                else                                                                                                 // 772
//                    view.renderer.render(view.scene, view.camera);                                                   // 773
            }                                                                                                          // 774
        }                                                                                                              // 775
        console.log("Cuttind end")                                                                                     // 776
    }                                                                                                                  // 777
                                                                                                                       // 778
}                                                                                                                      // 779
                                                                                                                       // 780
/*Check if a face is on the cutting plane*/                                                                            // 781
PlaneCutter.prototype.checkFaceCut = function(block, intersectionPoints, plane) {                                      // 782
    if (intersectionPoints.length <= 2)                                                                                // 783
        return true;                                                                                                   // 784
    //console.log("Checking face for block:" + block.id);                                                              // 785
    var newInterPoint = [];                                                                                            // 786
                                                                                                                       // 787
    for (var index = 0, indexMax = intersectionPoints.length; index < indexMax; index++) {                             // 788
        /*Adding intersection points when the line is coplanar*/                                                       // 789
        var line = intersectionPoints[index][1];                                                                       // 790
        var line3 = new THREE.Line3(line.geometry.vertices[0].clone(), line.geometry.vertices[1].clone());             // 791
        line3.applyMatrix4(line.matrix);                                                                               // 792
        newInterPoint.push(intersectionPoints[index]);                                                                 // 793
        if (plane.distanceToPoint(line3.start) == 0 && plane.distanceToPoint(line3.end) == 0) {                        // 794
            newInterPoint.push([line.geometry.vertices[1].clone(), line.clone()]);                                     // 795
        }                                                                                                              // 796
    }                                                                                                                  // 797
                                                                                                                       // 798
    intersectionPoints = newInterPoint;                                                                                // 799
    for (var indexFace = 0; indexFace < block.faces.length; indexFace++) {                                             // 800
        var face = block.faces[indexFace];                                                                             // 801
        var flag = 0;                                                                                                  // 802
        for (var indexPoint = 0; indexPoint < face.length; indexPoint++) {                                             // 803
            var minD = 1000;                                                                                           // 804
            for (var indexIntersect = 0; indexIntersect < intersectionPoints.length; indexIntersect++) {               // 805
                var facePoint = face[indexPoint].clone();                                                              // 806
                var cutPoint = intersectionPoints[indexIntersect][0].clone();                                          // 807
                var distance = facePoint.distanceTo(cutPoint);                                                         // 808
                if (distance < minD)                                                                                   // 809
                    minD = distance;                                                                                   // 810
                                                                                                                       // 811
            }                                                                                                          // 812
            if (minD < 0.5)                                                                                            // 813
                flag++;                                                                                                // 814
        }                                                                                                              // 815
        if (flag > 2)                                                                                                  // 816
            return true;                                                                                               // 817
                                                                                                                       // 818
    }                                                                                                                  // 819
    return false;                                                                                                      // 820
}                                                                                                                      // 821
PlaneCutter.prototype.checkFaceCut2 = function(brick, plane, postFlag) {                                               // 822
                                                                                                                       // 823
    for (var indexBlock = 0; indexBlock < brick.blocks.length; indexBlock++) {                                         // 824
        var block = brick.blocks[indexBlock];                                                                          // 825
        for (var indexFace = 0; indexFace < block.faces.length; indexFace++) {                                         // 826
            var flag = 0;                                                                                              // 827
            for (var indexPoint = 0; indexPoint < block.faces[indexFace].length; indexPoint++) {                       // 828
                var point = block.faces[indexFace][indexPoint].clone();                                                // 829
                point = point.applyMatrix4(brick.faces.matrix);                                                        // 830
                if (Math.abs(plane.distanceToPoint(point)) < 0.5) {                                                    // 831
                    flag++;                                                                                            // 832
                }                                                                                                      // 833
            }                                                                                                          // 834
            if (flag > 2) {                                                                                            // 835
                if (postFlag)                                                                                          // 836
                    Logger.postEvent("Cutting-a-Face;Brick:" + brick.id + ";Block:" + block.id + ";Face:" + indexFace);
                return true;                                                                                           // 838
            }                                                                                                          // 839
        }                                                                                                              // 840
    }                                                                                                                  // 841
    return false;                                                                                                      // 842
                                                                                                                       // 843
}                                                                                                                      // 844
                                                                                                                       // 845
PlaneCutter.prototype.computeNewLinesAndFaces = function(oldFaces, intersectionPoints, OldLines1, blockPoints, newBlockPoints) {
    /*Create new lines between intersection points and new faces*/                                                     // 847
    var newLines = new Array();                                                                                        // 848
    var newFaces1 = new Array();                                                                                       // 849
    var newFaces2 = new Array();                                                                                       // 850
                                                                                                                       // 851
    /*Initial creation of the faces. This puts the points of the old block                                             // 852
     * in the correct new block*/                                                                                      // 853
    for (var faceIndex = 0; faceIndex < oldFaces.length; faceIndex++) {                                                // 854
        newFaces1.push(blockPoints[faceIndex]);                                                                        // 855
        newFaces2.push(newBlockPoints[faceIndex]);                                                                     // 856
    }                                                                                                                  // 857
                                                                                                                       // 858
    for (var pointIndex1 = 0; pointIndex1 < intersectionPoints.length; pointIndex1++) {                                // 859
        var start = intersectionPoints[pointIndex1][1].geometry.vertices[0].clone();                                   // 860
        var end = intersectionPoints[pointIndex1][1].geometry.vertices[1].clone();                                     // 861
        for (var faceIndex = 0; faceIndex < oldFaces.length; faceIndex++) {                                            // 862
            var checkFlag = 0;                                                                                         // 863
            /*Find the face which contains the line*/                                                                  // 864
            for (var planePointIndex = 0; planePointIndex < oldFaces[faceIndex].length; planePointIndex++) {           // 865
                if (oldFaces[faceIndex][planePointIndex].equals(start) || oldFaces[faceIndex][planePointIndex].equals(end)) {
                    checkFlag++;                                                                                       // 867
                }                                                                                                      // 868
            }                                                                                                          // 869
            if (checkFlag == 2) {                                                                                      // 870
                /*Add the intersection point to the faces of the new blocks*/                                          // 871
                newFaces1[faceIndex].push(intersectionPoints[pointIndex1][0].clone());                                 // 872
                newFaces2[faceIndex].push(intersectionPoints[pointIndex1][0].clone());                                 // 873
                                                                                                                       // 874
                /*Look for another intersaction point on the same face to create                                       // 875
                 * a new line*/                                                                                        // 876
                for (var pointIndex2 = pointIndex1 + 1; pointIndex2 < intersectionPoints.length; pointIndex2++) {      // 877
                    var start2 = intersectionPoints[pointIndex2][1].geometry.vertices[0].clone();                      // 878
                    var end2 = intersectionPoints[pointIndex2][1].geometry.vertices[1].clone();                        // 879
                    var checkFlag2 = 0;                                                                                // 880
                                                                                                                       // 881
                    for (var planePointIndex = 0; planePointIndex < oldFaces[faceIndex].length; planePointIndex++) {   // 882
                        if (oldFaces[faceIndex][planePointIndex].equals(start2) || oldFaces[faceIndex][planePointIndex].equals(end2)) {
                            checkFlag2++;                                                                              // 884
                        }                                                                                              // 885
                    }                                                                                                  // 886
                    if (checkFlag2 == 2) {                                                                             // 887
                        //Add lines                                                                                    // 888
                        var geometry = new THREE.Geometry();                                                           // 889
                        geometry.vertices.push(intersectionPoints[pointIndex1][0].clone());                            // 890
                        geometry.vertices.push(intersectionPoints[pointIndex2][0].clone());                            // 891
                        var line = new THREE.Line(geometry, this.lineMaterial);                                        // 892
                        newLines.push(line);                                                                           // 893
                    }                                                                                                  // 894
                }                                                                                                      // 895
                                                                                                                       // 896
            }                                                                                                          // 897
                                                                                                                       // 898
        }                                                                                                              // 899
    }                                                                                                                  // 900
                                                                                                                       // 901
    /*Basically add the new faces made of the intersection points*/                                                    // 902
    var lastFace = new Array();                                                                                        // 903
    var lastFace2 = new Array();                                                                                       // 904
    for (var pointIndex1 = 0; pointIndex1 < intersectionPoints.length; pointIndex1++) {                                // 905
        lastFace.push(intersectionPoints[pointIndex1][0].clone());                                                     // 906
        lastFace2.push(intersectionPoints[pointIndex1][0].clone());                                                    // 907
    }                                                                                                                  // 908
    newFaces1.push(lastFace);                                                                                          // 909
    newFaces2.push(lastFace2);                                                                                         // 910
                                                                                                                       // 911
    /*Delete empty faces*/                                                                                             // 912
    for (var i = newFaces1.length - 1; i >= 0; i--) {                                                                  // 913
        if (newFaces1[i].length == 0) {                                                                                // 914
            newFaces1.splice(i, 1);                                                                                    // 915
        }                                                                                                              // 916
    }                                                                                                                  // 917
    for (var i = newFaces2.length - 1; i >= 0; i--) {                                                                  // 918
        if (newFaces2[i].length == 0) {                                                                                // 919
            newFaces2.splice(i, 1);                                                                                    // 920
        }                                                                                                              // 921
    }                                                                                                                  // 922
                                                                                                                       // 923
    /*Sort the vertices in the faces*/                                                                                 // 924
    for (var indexFace = 0; indexFace < newFaces1.length; indexFace++) {                                               // 925
        var face = newFaces1[indexFace];                                                                               // 926
        newFaces1[indexFace] = this.sortVertices(face);                                                                // 927
    }                                                                                                                  // 928
    for (var indexFace = 0; indexFace < newFaces2.length; indexFace++) {                                               // 929
        var face = newFaces2[indexFace];                                                                               // 930
        newFaces2[indexFace] = this.sortVertices(face);                                                                // 931
    }                                                                                                                  // 932
    return [newLines, newFaces1, newFaces2];                                                                           // 933
                                                                                                                       // 934
}                                                                                                                      // 935
                                                                                                                       // 936
PlaneCutter.prototype.sortVertices = function(face) {                                                                  // 937
    //console.log("Sorting Vertices:", face);                                                                          // 938
    /*Delete duplicates*/                                                                                              // 939
    var clean_face = new Array();                                                                                      // 940
    for (var indexPoint1 = 0; indexPoint1 < face.length; indexPoint1++) {                                              // 941
        var unique = true;                                                                                             // 942
        for (var indexPoint2 = indexPoint1 + 1; indexPoint2 < face.length; indexPoint2++) {                            // 943
            if (face[indexPoint1].equals(face[indexPoint2])) {                                                         // 944
                unique = false;                                                                                        // 945
                break;                                                                                                 // 946
            }                                                                                                          // 947
        }                                                                                                              // 948
        if (unique)                                                                                                    // 949
            clean_face.push(face[indexPoint1]);                                                                        // 950
    }                                                                                                                  // 951
    //console.log("Aftern Cleaning:", clean_face);                                                                     // 952
                                                                                                                       // 953
    //face =clean_face;                                                                                                // 954
                                                                                                                       // 955
                                                                                                                       // 956
    var plane = new THREE.Plane();                                                                                     // 957
    //inultile                                                                                                         // 958
                                                                                                                       // 959
    plane.setFromCoplanarPoints(clean_face[0], clean_face[1], clean_face[2]);                                          // 960
                                                                                                                       // 961
    //centroid                                                                                                         // 962
    var centroid = new THREE.Vector3(clean_face[0].x, clean_face[0].y, clean_face[0].z);                               // 963
    for (var indexPoint = 1; indexPoint < clean_face.length; indexPoint++) {                                           // 964
        centroid = centroid.add(clean_face[indexPoint]);                                                               // 965
    }                                                                                                                  // 966
    centroid = centroid.divideScalar(clean_face.length);                                                               // 967
    // console.log("Centroid:", centroid);                                                                             // 968
                                                                                                                       // 969
    var angles = new Array();                                                                                          // 970
                                                                                                                       // 971
    var z_axis = plane.normal;                                                                                         // 972
    z_axis = z_axis.normalize();                                                                                       // 973
    if (z_axis.equals(new THREE.Vector3(0, 0, 0))) {                                                                   // 974
        console.log("er");                                                                                             // 975
//        console.log(clean_face[0]);                                                                                  // 976
//        console.log(clean_face[1]);                                                                                  // 977
//        console.log(clean_face[2]);                                                                                  // 978
    }                                                                                                                  // 979
    var x_axis, y_axis;                                                                                                // 980
    if (z_axis.equals(new THREE.Vector3(0, 0, 1)) || z_axis.equals(new THREE.Vector3(0, 0, -1))) {                     // 981
        x_axis = new THREE.Vector3(1, 0, 0);                                                                           // 982
        y_axis = new THREE.Vector3(0, 1, 0);                                                                           // 983
    }                                                                                                                  // 984
    else {                                                                                                             // 985
        x_axis = z_axis.clone().cross(new THREE.Vector3(0, 0, 1));                                                     // 986
        y_axis = x_axis.clone().cross(z_axis);                                                                         // 987
    }                                                                                                                  // 988
    x_axis = x_axis.normalize();                                                                                       // 989
    y_axis = y_axis.normalize();                                                                                       // 990
    // console.log("Axis:", x_axis, y_axis, z_axis);                                                                   // 991
                                                                                                                       // 992
    var newIndexOrder = new Array();                                                                                   // 993
    for (var indexPoint = 0; indexPoint < clean_face.length; indexPoint++) {                                           // 994
        newIndexOrder.push(indexPoint);                                                                                // 995
        var point = clean_face[indexPoint].clone();                                                                    // 996
        point = point.sub(centroid);                                                                                   // 997
        angles[indexPoint] = Math.atan2(point.dot(y_axis), point.dot(x_axis));                                         // 998
    }                                                                                                                  // 999
                                                                                                                       // 1000
    var newFace = new Array(clean_face.length);                                                                        // 1001
    newIndexOrder.sort(function(a, b) {                                                                                // 1002
        return angles[a] - angles[b]                                                                                   // 1003
    });                                                                                                                // 1004
                                                                                                                       // 1005
                                                                                                                       // 1006
                                                                                                                       // 1007
                                                                                                                       // 1008
                                                                                                                       // 1009
    for (var i = 0; i < newIndexOrder.length; i++) {                                                                   // 1010
        newFace[i] = clean_face[newIndexOrder[i]];                                                                     // 1011
    }                                                                                                                  // 1012
    return newFace;                                                                                                    // 1013
}                                                                                                                      // 1014
                                                                                                                       // 1015
PlaneCutter.prototype.intersectionPlaneLine = function(plane, line) {                                                  // 1016
                                                                                                                       // 1017
    var startSign = plane.distanceToPoint(line.start);                                                                 // 1018
    var endSign = plane.distanceToPoint(line.end);                                                                     // 1019
                                                                                                                       // 1020
    if (Math.abs(startSign) < 0.5)                                                                                     // 1021
        startSign = 0;                                                                                                 // 1022
    if (Math.abs(endSign) < 0.5)                                                                                       // 1023
        endSign = 0;                                                                                                   // 1024
                                                                                                                       // 1025
    return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);                                           // 1026
}                                                                                                                      // 1027
                                                                                                                       // 1028
PlaneCutter.prototype.checkDegenerateCut = function(intersectionPoints) {                                              // 1029
    if (intersectionPoints.length == 1)                                                                                // 1030
        return true;                                                                                                   // 1031
                                                                                                                       // 1032
    return false;                                                                                                      // 1033
}                                                                                                                      // 1034
                                                                                                                       // 1035
                                                                                                                       // 1036
                                                                                                                       // 1037
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ToolManager/ToolManager.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
ToolManager = function(){                                                                                              // 1
	this.tools = {};                                                                                                      // 2
}                                                                                                                      // 3
                                                                                                                       // 4
ToolManager.prototype.addTool = function(tool){                                                                        // 5
    this.tools[tool.id] = tool;                                                                                        // 6
};                                                                                                                     // 7
                                                                                                                       // 8
/*BrickManager.getRotationAndPositionOfBrick = function(marker) {                                                      // 9
    var Z = Session.get('shapes')[marker.id].markerZ;                                                                  // 10
    var marker_position = [marker.corners[0].x, marker.corners[0].y, 1];                                               // 11
    var marker_position2 = [marker.corners[1].x, marker.corners[1].y, 1];                                              // 12
    var position = pixel2mm(marker_position[0], marker_position[1], Z);                                                // 13
    var position2 = pixel2mm(marker_position2[0], marker_position2[1], Z);                                             // 14
    var rotation;                                                                                                      // 15
    var diffx = position.x-position2.x;                                                                                // 16
    var diffy = position.y-position2.y;                                                                                // 17
    if (diffy == 0){  diffy = 1;    }                                                                                  // 18
    if ((diffx < 0 && diffy > 0) || (diffx > 0 && diffy > 0)) {                                                        // 19
        rotation = -Math.atan(diffx/diffy)+Math.PI/2;                                                                  // 20
    }                                                                                                                  // 21
    else{                                                                                                              // 22
        rotation = -Math.atan(diffx/diffy)-Math.PI/2;                                                                  // 23
    }                                                                                                                  // 24
	return {r : rotation, p: position};                                                                                   // 25
}*/                                                                                                                    // 26
                                                                                                                       // 27
                                                                                                                       // 28
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
