(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/Knob/Knob.js                                                                                    //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/*                                                                                                          // 1
 * To change this template, choose Tools | Templates                                                        // 2
 * and open the template in the editor.                                                                     // 3
 */                                                                                                         // 4
/*!jQuery Knob*/                                                                                            // 5
/**                                                                                                         // 6
 * Downward compatible, touchable dial                                                                      // 7
 *                                                                                                          // 8
 * Version: 1.2.0 (15/07/2012)                                                                              // 9
 * Requires: jQuery v1.7+                                                                                   // 10
 *                                                                                                          // 11
 * Copyright (c) 2012 Anthony Terrien                                                                       // 12
 * Under MIT and GPL licenses:                                                                              // 13
 *  http://www.opensource.org/licenses/mit-license.php                                                      // 14
 *  http://www.gnu.org/licenses/gpl.html                                                                    // 15
 *                                                                                                          // 16
 * Thanks to vor, eskimoblood, spiffistan, FabrizioC                                                        // 17
 */                                                                                                         // 18
(function($) {                                                                                              // 19
                                                                                                            // 20
    /**                                                                                                     // 21
     * Kontrol library                                                                                      // 22
     */                                                                                                     // 23
    "use strict";                                                                                           // 24
    /**                                                                                                     // 25
     * Definition of globals and core                                                                       // 26
     */                                                                                                     // 27
    var k = {}, // kontrol                                                                                  // 28
            max = Math.max,                                                                                 // 29
            min = Math.min;                                                                                 // 30
    k.c = {};                                                                                               // 31
    k.c.d = $(document);                                                                                    // 32
    k.c.t = function(e) {                                                                                   // 33
        return e.originalEvent.touches.length - 1;                                                          // 34
    };                                                                                                      // 35
    /**                                                                                                     // 36
     * Kontrol Object                                                                                       // 37
     *                                                                                                      // 38
     * Definition of an abstract UI control                                                                 // 39
     *                                                                                                      // 40
     * Each concrete component must call this one.                                                          // 41
     * <code>                                                                                               // 42
     * k.o.call(this);                                                                                      // 43
     * </code>                                                                                              // 44
     */                                                                                                     // 45
    k.o = function() {                                                                                      // 46
        var s = this;                                                                                       // 47
        this.o = null; // array of options                                                                  // 48
        this.$ = null; // jQuery wrapped element                                                            // 49
        this.i = null; // mixed HTMLInputElement or array of HTMLInputElement                               // 50
        this.g = null; // deprecated 2D graphics context for 'pre-rendering'                                // 51
        this.v = null; // value ; mixed array or integer                                                    // 52
        this.cv = null; // change value ; not commited value                                                // 53
        this.x = 0; // canvas x position                                                                    // 54
        this.y = 0; // canvas y position                                                                    // 55
        this.w = 0; // canvas width                                                                         // 56
        this.h = 0; // canvas height                                                                        // 57
        this.$c = null; // jQuery canvas element                                                            // 58
        this.c = null; // rendered canvas context                                                           // 59
        this.t = 0; // touches index                                                                        // 60
        this.isInit = false;                                                                                // 61
        this.fgColor = null; // main color                                                                  // 62
        this.pColor = null; // previous color                                                               // 63
        this.dH = null; // draw hook                                                                        // 64
        this.cH = null; // change hook                                                                      // 65
        this.eH = null; // cancel hook                                                                      // 66
        this.rH = null; // release hook                                                                     // 67
        this.scale = 1; // scale factor                                                                     // 68
        this.relative = false;                                                                              // 69
        this.relativeWidth = false;                                                                         // 70
        this.relativeHeight = false;                                                                        // 71
        this.$div = null; // component div                                                                  // 72
                                                                                                            // 73
        this.run = function() {                                                                             // 74
            var cf = function(e, conf) {                                                                    // 75
                var k;                                                                                      // 76
                for (k in conf) {                                                                           // 77
                    s.o[k] = conf[k];                                                                       // 78
                }                                                                                           // 79
                s.init();                                                                                   // 80
                s._configure()                                                                              // 81
                        ._draw();                                                                           // 82
            };                                                                                              // 83
            if (this.$.data('kontroled'))                                                                   // 84
                return;                                                                                     // 85
            this.$.data('kontroled', true);                                                                 // 86
            this.extend();                                                                                  // 87
            this.o = $.extend(                                                                              // 88
                    {                                                                                       // 89
// Config                                                                                                   // 90
                        min: this.$.data('min') || 0,                                                       // 91
                        max: this.$.data('max') || 100,                                                     // 92
                        stopper: true,                                                                      // 93
                        readOnly: this.$.data('readonly') || (this.$.attr('readonly') == 'readonly'),       // 94
                        // UI                                                                               // 95
                        cursor: (this.$.data('cursor') === true && 30)                                      // 96
                                || this.$.data('cursor')                                                    // 97
                                || 0,                                                                       // 98
                        thickness: (                                                                        // 99
                                this.$.data('thickness')                                                    // 100
                                && Math.max(Math.min(this.$.data('thickness'), 1), 0.01)                    // 101
                                )                                                                           // 102
                                || 0.35,                                                                    // 103
                        lineCap: this.$.data('linecap') || 'butt',                                          // 104
                        width: this.$.data('width') || 200,                                                 // 105
                        height: this.$.data('height') || 200,                                               // 106
                        displayInput: this.$.data('displayinput') == null || this.$.data('displayinput'),   // 107
                        displayPrevious: this.$.data('displayprevious'),                                    // 108
                        fgColor: this.$.data('fgcolor') || '#87CEEB',                                       // 109
                        inputColor: this.$.data('inputcolor'),                                              // 110
                        font: this.$.data('font') || 'Arial',                                               // 111
                        fontWeight: this.$.data('font-weight') || 'bold',                                   // 112
                        inline: false,                                                                      // 113
                        step: this.$.data('step') || 1,                                                     // 114
                        // Hooks                                                                            // 115
                        draw: null, // function () {}                                                       // 116
                        change: null, // function (value) {}                                                // 117
                        cancel: null, // function () {}                                                     // 118
                        release: null, // function (value) {}                                               // 119
                        error: null // function () {}                                                       // 120
                    }, this.o                                                                               // 121
                    );                                                                                      // 122
            // finalize options                                                                             // 123
            if (!this.o.inputColor) {                                                                       // 124
                this.o.inputColor = this.o.fgColor;                                                         // 125
            }                                                                                               // 126
                                                                                                            // 127
// routing value                                                                                            // 128
            if (this.$.is('fieldset')) {                                                                    // 129
                                                                                                            // 130
// fieldset = array of integer                                                                              // 131
                this.v = {};                                                                                // 132
                this.i = this.$.find('input')                                                               // 133
                this.i.each(function(k) {                                                                   // 134
                    var $this = $(this);                                                                    // 135
                    s.i[k] = $this;                                                                         // 136
                    s.v[k] = $this.val();                                                                   // 137
                    $this.bind(                                                                             // 138
                            'change keyup'                                                                  // 139
                            , function() {                                                                  // 140
                        var val = {};                                                                       // 141
                        val[k] = $this.val();                                                               // 142
                        s.val(val);                                                                         // 143
                    }                                                                                       // 144
                    );                                                                                      // 145
                });                                                                                         // 146
                this.$.find('legend').remove();                                                             // 147
            } else {                                                                                        // 148
                                                                                                            // 149
// input = integer                                                                                          // 150
                this.i = this.$;                                                                            // 151
                this.v = this.$.val();                                                                      // 152
                (this.v == '') && (this.v = this.o.min);                                                    // 153
                this.$.bind(                                                                                // 154
                        'change keyup'                                                                      // 155
                        , function() {                                                                      // 156
                    s.val(s._validate(s.$.val()));                                                          // 157
                }                                                                                           // 158
                );                                                                                          // 159
            }                                                                                               // 160
                                                                                                            // 161
            (!this.o.displayInput) && this.$.hide();                                                        // 162
            // adds needed DOM elements (canvas, div)                                                       // 163
            this.$c = $(document.createElement('canvas'));                                                  // 164
            if (typeof G_vmlCanvasManager !== 'undefined') {                                                // 165
                G_vmlCanvasManager.initElement(this.$c[0]);                                                 // 166
            }                                                                                               // 167
            this.c = this.$c[0].getContext ? this.$c[0].getContext('2d') : null;                            // 168
            if (!this.c) {                                                                                  // 169
                this.o.error && this.o.error();                                                             // 170
                return;                                                                                     // 171
            }                                                                                               // 172
                                                                                                            // 173
// hdpi support                                                                                             // 174
            this.scale = (window.devicePixelRatio || 1) /                                                   // 175
                    (                                                                                       // 176
                            this.c.webkitBackingStorePixelRatio ||                                          // 177
                            this.c.mozBackingStorePixelRatio ||                                             // 178
                            this.c.msBackingStorePixelRatio ||                                              // 179
                            this.c.oBackingStorePixelRatio ||                                               // 180
                            this.c.backingStorePixelRatio || 1                                              // 181
                            );                                                                              // 182
            // detects relative width / height                                                              // 183
            this.relativeWidth = ((this.o.width % 1 !== 0)                                                  // 184
                    && this.o.width.indexOf('%'));                                                          // 185
            this.relativeHeight = ((this.o.height % 1 !== 0)                                                // 186
                    && this.o.height.indexOf('%'));                                                         // 187
            this.relative = (this.relativeWidth || this.relativeHeight);                                    // 188
            // wraps all elements in a div                                                                  // 189
            this.$div = $('<div style="'                                                                    // 190
                    + (this.o.inline ? 'display:inline;' : '')                                              // 191
                    + '"></div>');                                                                          // 192
            this.$.wrap(this.$div).before(this.$c);                                                         // 193
            this.$div = this.$.parent();                                                                    // 194
            // computes size and carves the component                                                       // 195
            this._carve();                                                                                  // 196
            // prepares props for transaction                                                               // 197
            if (this.v instanceof Object) {                                                                 // 198
                this.cv = {};                                                                               // 199
                this.copy(this.v, this.cv);                                                                 // 200
            } else {                                                                                        // 201
                this.cv = this.v;                                                                           // 202
            }                                                                                               // 203
                                                                                                            // 204
// binds configure event                                                                                    // 205
            this.$                                                                                          // 206
                    .bind("configure", cf)                                                                  // 207
                    .parent()                                                                               // 208
                    .bind("configure", cf);                                                                 // 209
            // finalize init                                                                                // 210
            this._listen()                                                                                  // 211
                    ._configure()                                                                           // 212
                    ._xy()                                                                                  // 213
                    .init();                                                                                // 214
            this.isInit = true;                                                                             // 215
            // the most important !                                                                         // 216
            this._draw();                                                                                   // 217
            return this;                                                                                    // 218
        };                                                                                                  // 219
        this._carve = function() {                                                                          // 220
            if (this.relative) {                                                                            // 221
                var w = this.relativeWidth                                                                  // 222
                        ? this.$div.parent().width()                                                        // 223
                        * parseInt(this.o.width) / 100                                                      // 224
                        : this.$div.parent().width(),                                                       // 225
                        h = this.relativeHeight                                                             // 226
                        ? this.$div.parent().height()                                                       // 227
                        * parseInt(this.o.height) / 100                                                     // 228
                        : this.$div.parent().height();                                                      // 229
                // apply relative                                                                           // 230
                this.w = this.h = Math.min(w, h);                                                           // 231
            } else {                                                                                        // 232
                this.w = this.o.width;                                                                      // 233
                this.h = this.o.height;                                                                     // 234
            }                                                                                               // 235
                                                                                                            // 236
// finalize div                                                                                             // 237
            this.$div.css({                                                                                 // 238
                'width': this.w + 'px',                                                                     // 239
                'height': this.h + 'px'                                                                     // 240
            });                                                                                             // 241
            // finalize canvas with computed width                                                          // 242
            this.$c.attr({                                                                                  // 243
                width: this.w,                                                                              // 244
                height: this.h                                                                              // 245
            });                                                                                             // 246
            // scaling                                                                                      // 247
            if (this.scale !== 1) {                                                                         // 248
                this.$c[0].width = this.$c[0].width * this.scale;                                           // 249
                this.$c[0].height = this.$c[0].height * this.scale;                                         // 250
                this.$c.width(this.w);                                                                      // 251
                this.$c.height(this.h);                                                                     // 252
            }                                                                                               // 253
                                                                                                            // 254
            return this;                                                                                    // 255
        }                                                                                                   // 256
                                                                                                            // 257
        this._draw = function() {                                                                           // 258
                                                                                                            // 259
// canvas pre-rendering                                                                                     // 260
            var d = true;                                                                                   // 261
            s.g = s.c;                                                                                      // 262
            s.clear();                                                                                      // 263
            s.dH                                                                                            // 264
                    && (d = s.dH());                                                                        // 265
            (d !== false) && s.draw();                                                                      // 266
        };                                                                                                  // 267
        this._touch = function(e) {                                                                         // 268
                                                                                                            // 269
            var touchMove = function(e) {                                                                   // 270
                                                                                                            // 271
                var v = s.xy2val(                                                                           // 272
                        e.originalEvent.touches[s.t].pageX,                                                 // 273
                        e.originalEvent.touches[s.t].pageY                                                  // 274
                        );                                                                                  // 275
                s.change(s._validate(v));                                                                   // 276
                s._draw();                                                                                  // 277
            };                                                                                              // 278
            // get touches index                                                                            // 279
            this.t = k.c.t(e);                                                                              // 280
            // First touch                                                                                  // 281
            touchMove(e);                                                                                   // 282
            // Touch events listeners                                                                       // 283
            k.c.d                                                                                           // 284
                    .bind("touchmove.k", touchMove)                                                         // 285
                    .bind(                                                                                  // 286
                    "touchend.k"                                                                            // 287
                    , function() {                                                                          // 288
                k.c.d.unbind('touchmove.k touchend.k');                                                     // 289
                if (                                                                                        // 290
                        s.rH                                                                                // 291
                        && (s.rH(s.cv) === false)                                                           // 292
                        )                                                                                   // 293
                    return;                                                                                 // 294
                s.val(s.cv);                                                                                // 295
            }                                                                                               // 296
            );                                                                                              // 297
            return this;                                                                                    // 298
        };                                                                                                  // 299
        this._mouse = function(e) {                                                                         // 300
                                                                                                            // 301
            var mouseMove = function(e) {                                                                   // 302
                var v = s.xy2val(e.pageX, e.pageY);                                                         // 303
                s.change(s._validate(v));                                                                   // 304
                s._draw();                                                                                  // 305
            };                                                                                              // 306
            // First click                                                                                  // 307
            mouseMove(e);                                                                                   // 308
            // Mouse events listeners                                                                       // 309
            k.c.d                                                                                           // 310
                    .bind("mousemove.k", mouseMove)                                                         // 311
                    .bind(                                                                                  // 312
                    // Escape key cancel current change                                                     // 313
                    "keyup.k"                                                                               // 314
                    , function(e) {                                                                         // 315
                if (e.keyCode === 27) {                                                                     // 316
                    k.c.d.unbind("mouseup.k mousemove.k keyup.k");                                          // 317
                    if (                                                                                    // 318
                            s.eH                                                                            // 319
                            && (s.eH() === false)                                                           // 320
                            )                                                                               // 321
                        return;                                                                             // 322
                    s.cancel();                                                                             // 323
                }                                                                                           // 324
            }                                                                                               // 325
            )                                                                                               // 326
                    .bind(                                                                                  // 327
                    "mouseup.k"                                                                             // 328
                    , function(e) {                                                                         // 329
                k.c.d.unbind('mousemove.k mouseup.k keyup.k');                                              // 330
                if (                                                                                        // 331
                        s.rH                                                                                // 332
                        && (s.rH(s.cv) === false)                                                           // 333
                        )                                                                                   // 334
                    return;                                                                                 // 335
                s.val(s.cv);                                                                                // 336
            }                                                                                               // 337
            );                                                                                              // 338
            return this;                                                                                    // 339
        };                                                                                                  // 340
        this._xy = function() {                                                                             // 341
            var o = this.$c.offset();                                                                       // 342
            this.x = o.left;                                                                                // 343
            this.y = o.top;                                                                                 // 344
            return this;                                                                                    // 345
        };                                                                                                  // 346
        this._listen = function() {                                                                         // 347
                                                                                                            // 348
            if (!this.o.readOnly) {                                                                         // 349
                this.$c                                                                                     // 350
                        .bind(                                                                              // 351
                        "mousedown"                                                                         // 352
                        , function(e) {                                                                     // 353
                    e.preventDefault();                                                                     // 354
                    s._xy()._mouse(e);                                                                      // 355
                }                                                                                           // 356
                )                                                                                           // 357
                        .bind(                                                                              // 358
                        "touchstart"                                                                        // 359
                        , function(e) {                                                                     // 360
                    e.preventDefault();                                                                     // 361
                    s._xy()._touch(e);                                                                      // 362
                }                                                                                           // 363
                );                                                                                          // 364
                this.listen();                                                                              // 365
            } else {                                                                                        // 366
                this.$.attr('readonly', 'readonly');                                                        // 367
            }                                                                                               // 368
                                                                                                            // 369
            if (this.relative) {                                                                            // 370
                $(window).resize(function() {                                                               // 371
                    s._carve()                                                                              // 372
                            .init();                                                                        // 373
                    s._draw();                                                                              // 374
                });                                                                                         // 375
            }                                                                                               // 376
                                                                                                            // 377
            return this;                                                                                    // 378
        };                                                                                                  // 379
        this._configure = function() {                                                                      // 380
                                                                                                            // 381
// Hooks                                                                                                    // 382
            if (this.o.draw)                                                                                // 383
                this.dH = this.o.draw;                                                                      // 384
            if (this.o.change)                                                                              // 385
                this.cH = this.o.change;                                                                    // 386
            if (this.o.cancel)                                                                              // 387
                this.eH = this.o.cancel;                                                                    // 388
            if (this.o.release)                                                                             // 389
                this.rH = this.o.release;                                                                   // 390
            if (this.o.displayPrevious) {                                                                   // 391
                this.pColor = this.h2rgba(this.o.fgColor, "0.4");                                           // 392
                this.fgColor = this.h2rgba(this.o.fgColor, "0.6");                                          // 393
            } else {                                                                                        // 394
                this.fgColor = this.o.fgColor;                                                              // 395
            }                                                                                               // 396
                                                                                                            // 397
            return this;                                                                                    // 398
        };                                                                                                  // 399
        this._clear = function() {                                                                          // 400
            this.$c[0].width = this.$c[0].width;                                                            // 401
        };                                                                                                  // 402
        this._validate = function(v) {                                                                      // 403
            return (~~(((v < 0) ? -0.5 : 0.5) + (v / this.o.step))) * this.o.step;                          // 404
        };                                                                                                  // 405
        // Abstract methods                                                                                 // 406
        this.listen = function() {                                                                          // 407
        }; // on start, one time                                                                            // 408
        this.extend = function() {                                                                          // 409
        }; // each time configure triggered                                                                 // 410
        this.init = function() {                                                                            // 411
        }; // each time configure triggered                                                                 // 412
        this.change = function(v) {                                                                         // 413
        }; // on change                                                                                     // 414
        this.val = function(v) {                                                                            // 415
        }; // on release                                                                                    // 416
        this.xy2val = function(x, y) {                                                                      // 417
        }; //                                                                                               // 418
        this.draw = function() {                                                                            // 419
        }; // on change / on release                                                                        // 420
        this.clear = function() {                                                                           // 421
            this._clear();                                                                                  // 422
        };                                                                                                  // 423
        // Utils                                                                                            // 424
        this.h2rgba = function(h, a) {                                                                      // 425
            var rgb;                                                                                        // 426
            h = h.substring(1, 7)                                                                           // 427
            rgb = [parseInt(h.substring(0, 2), 16)                                                          // 428
                        , parseInt(h.substring(2, 4), 16)                                                   // 429
                        , parseInt(h.substring(4, 6), 16)];                                                 // 430
            return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";                          // 431
        };                                                                                                  // 432
        this.copy = function(f, t) {                                                                        // 433
            for (var i in f) {                                                                              // 434
                t[i] = f[i];                                                                                // 435
            }                                                                                               // 436
        };                                                                                                  // 437
    };                                                                                                      // 438
    /**                                                                                                     // 439
     * k.Dial                                                                                               // 440
     */                                                                                                     // 441
    k.Dial = function() {                                                                                   // 442
        k.o.call(this);                                                                                     // 443
        this.startAngle = null;                                                                             // 444
        this.xy = null;                                                                                     // 445
        this.radius = null;                                                                                 // 446
        this.lineWidth = null;                                                                              // 447
        this.cursorExt = null;                                                                              // 448
        this.w2 = null;                                                                                     // 449
        this.PI2 = 2 * Math.PI;                                                                             // 450
        this.extend = function() {                                                                          // 451
            this.o = $.extend(                                                                              // 452
                    {                                                                                       // 453
                        bgColor: this.$.data('bgcolor') || '#EEEEEE',                                       // 454
                        angleOffset: this.$.data('angleoffset') || 0,                                       // 455
                        angleArc: this.$.data('anglearc') || 360,                                           // 456
                        inline: true                                                                        // 457
                    }, this.o                                                                               // 458
                    );                                                                                      // 459
        };                                                                                                  // 460
        this.val = function(v) {                                                                            // 461
            if (null != v) {                                                                                // 462
                var newValue = this.o.stopper ? max(min(v, this.o.max), this.o.min) : v;                    // 463
                if (                                                                                        // 464
                        newValue != this.cv // avoid double callback for same value                         // 465
                        && this.cH                                                                          // 466
                        && (this.cH(this.cv) === false)                                                     // 467
                        )                                                                                   // 468
                    return;                                                                                 // 469
                this.v = this.cv = newValue;                                                                // 470
                this.$.val(this.v);                                                                         // 471
                this._draw();                                                                               // 472
            } else {                                                                                        // 473
                return this.v;                                                                              // 474
            }                                                                                               // 475
        };                                                                                                  // 476
        this.xy2val = function(x, y) {                                                                      // 477
            var a, ret;                                                                                     // 478
            a = Math.atan2(                                                                                 // 479
                    x - (this.x + this.w2)                                                                  // 480
                    , -(y - this.y - this.w2)                                                               // 481
                    ) - this.angleOffset;                                                                   // 482
            if (this.angleArc != this.PI2 && (a < 0) && (a > -0.5)) {                                       // 483
// if isset angleArc option, set to min if .5 under min                                                     // 484
                a = 0;                                                                                      // 485
            } else if (a < 0) {                                                                             // 486
                a += this.PI2;                                                                              // 487
            }                                                                                               // 488
                                                                                                            // 489
            ret = ~~(0.5 + (a * (this.o.max - this.o.min) / this.angleArc))                                 // 490
                    + this.o.min;                                                                           // 491
            this.o.stopper                                                                                  // 492
                    && (ret = max(min(ret, this.o.max), this.o.min));                                       // 493
            return ret;                                                                                     // 494
        };                                                                                                  // 495
        this.listen = function() {                                                                          // 496
// bind MouseWheel                                                                                          // 497
            var s = this,                                                                                   // 498
                    mw = function(e) {                                                                      // 499
                e.preventDefault();                                                                         // 500
                var ori = e.originalEvent                                                                   // 501
                        , deltaX = ori.detail || ori.wheelDeltaX                                            // 502
                        , deltaY = ori.detail || ori.wheelDeltaY                                            // 503
                        , v = parseInt(s.$.val()) + (deltaX > 0 || deltaY > 0 ? s.o.step : deltaX < 0 || deltaY < 0 ? -s.o.step : 0);
                s.val(v);                                                                                   // 505
            }                                                                                               // 506
            , kval, to, m = 1, kv = {37: -s.o.step, 38: s.o.step, 39: s.o.step, 40: -s.o.step};             // 507
            this.$                                                                                          // 508
                    .bind(                                                                                  // 509
                    "keydown"                                                                               // 510
                    , function(e) {                                                                         // 511
                var kc = e.keyCode;                                                                         // 512
                // numpad support                                                                           // 513
                if (kc >= 96 && kc <= 105) {                                                                // 514
                    kc = e.keyCode = kc - 48;                                                               // 515
                }                                                                                           // 516
                                                                                                            // 517
                kval = parseInt(String.fromCharCode(kc));                                                   // 518
                if (isNaN(kval)) {                                                                          // 519
                                                                                                            // 520
                    (kc !== 13)         // enter                                                            // 521
                            && (kc !== 8)       // bs                                                       // 522
                            && (kc !== 9)       // tab                                                      // 523
                            && (kc !== 189)     // -                                                        // 524
                            && e.preventDefault();                                                          // 525
                    // arrows                                                                               // 526
                    if ($.inArray(kc, [37, 38, 39, 40]) > -1) {                                             // 527
                        e.preventDefault();                                                                 // 528
                        var v = parseInt(s.$.val()) + kv[kc] * m;                                           // 529
                        s.o.stopper                                                                         // 530
                                && (v = max(min(v, s.o.max), s.o.min));                                     // 531
                        s.change(v);                                                                        // 532
                        s._draw();                                                                          // 533
                        // long time keydown speed-up                                                       // 534
                        to = window.setTimeout(                                                             // 535
                                function() {                                                                // 536
                                    m *= 2;                                                                 // 537
                                }                                                                           // 538
                        , 30                                                                                // 539
                                );                                                                          // 540
                    }                                                                                       // 541
                }                                                                                           // 542
            }                                                                                               // 543
            )                                                                                               // 544
                    .bind(                                                                                  // 545
                    "keyup"                                                                                 // 546
                    , function(e) {                                                                         // 547
                if (isNaN(kval)) {                                                                          // 548
                    if (to) {                                                                               // 549
                        window.clearTimeout(to);                                                            // 550
                        to = null;                                                                          // 551
                        m = 1;                                                                              // 552
                        s.val(s.$.val());                                                                   // 553
                    }                                                                                       // 554
                } else {                                                                                    // 555
// kval postcond                                                                                            // 556
                    (s.$.val() > s.o.max && s.$.val(s.o.max))                                               // 557
                            || (s.$.val() < s.o.min && s.$.val(s.o.min));                                   // 558
                }                                                                                           // 559
                                                                                                            // 560
            }                                                                                               // 561
            );                                                                                              // 562
//            this.$c.bind("mousewheel DOMMouseScroll", mw);                                                // 563
//            this.$.bind("mousewheel DOMMouseScroll", mw)                                                  // 564
        };                                                                                                  // 565
        this.init = function() {                                                                            // 566
                                                                                                            // 567
            if (                                                                                            // 568
                    this.v < this.o.min                                                                     // 569
                    || this.v > this.o.max                                                                  // 570
                    )                                                                                       // 571
                this.v = this.o.min;                                                                        // 572
            this.$.val(this.v);                                                                             // 573
            this.w2 = this.w / 2;                                                                           // 574
            this.cursorExt = this.o.cursor / 100;                                                           // 575
            this.xy = this.w2 * this.scale;                                                                 // 576
            this.lineWidth = this.xy * this.o.thickness;                                                    // 577
            this.lineCap = this.o.lineCap;                                                                  // 578
            this.radius = this.xy - this.lineWidth / 2;                                                     // 579
            this.o.angleOffset                                                                              // 580
                    && (this.o.angleOffset = isNaN(this.o.angleOffset) ? 0 : this.o.angleOffset);           // 581
            this.o.angleArc                                                                                 // 582
                    && (this.o.angleArc = isNaN(this.o.angleArc) ? this.PI2 : this.o.angleArc);             // 583
            // deg to rad                                                                                   // 584
            this.angleOffset = this.o.angleOffset * Math.PI / 180;                                          // 585
            this.angleArc = this.o.angleArc * Math.PI / 180;                                                // 586
            // compute start and end angles                                                                 // 587
            this.startAngle = 1.5 * Math.PI + this.angleOffset;                                             // 588
            this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;                               // 589
            var s = max(                                                                                    // 590
                    String(Math.abs(this.o.max)).length                                                     // 591
                    , String(Math.abs(this.o.min)).length                                                   // 592
                    , 2                                                                                     // 593
                    ) + 2;                                                                                  // 594
            this.o.displayInput                                                                             // 595
                    && this.i.css({                                                                         // 596
                'width': ((this.w / 2 + 2) >> 0) + 'px'                                                     // 597
                        , 'height': ((this.w / 2) >> 0) + 'px'                                              // 598
                        , 'position': 'absolute'                                                            // 599
                        , 'vertical-align': 'middle'                                                        // 600
                        , 'margin-top': ((this.w / 4) >> 0) + 'px'                                          // 601
                        , 'margin-left': '-' + ((this.w * 3 / 4 + 2) >> 0) + 'px'                           // 602
                        , 'border': 0                                                                       // 603
                        , 'background' : 'none'                                                             // 604
                                                                                                            // 605
                , 'font': this.o.fontWeight + ' ' + 0 + 'px ' + this.o.font                                 // 606
                        , 'text-align': 'center'                                                            // 607
                        , 'color': this.o.inputColor || this.o.fgColor                                      // 608
                        , 'padding': '0px'                                                                  // 609
                        , '-webkit-appearance': 'none'                                                      // 610
            })                                                                                              // 611
                    || this.i.css({                                                                         // 612
                'width': '0px'                                                                              // 613
                        , 'visibility': 'hidden'                                                            // 614
            });                                                                                             // 615
        };                                                                                                  // 616
        this.change = function(v) {                                                                         // 617
            if (v == this.cv)                                                                               // 618
                return;                                                                                     // 619
            this.cv = v;                                                                                    // 620
            if (                                                                                            // 621
                    this.cH                                                                                 // 622
                    && (this.cH(v) === false)                                                               // 623
                    )                                                                                       // 624
                return;                                                                                     // 625
        };                                                                                                  // 626
        this.angle = function(v) {                                                                          // 627
            return (v - this.o.min) * this.angleArc / (this.o.max - this.o.min);                            // 628
        };                                                                                                  // 629
        this.draw = function() {                                                                            // 630
                                                                                                            // 631
            var c = this.g, // context                                                                      // 632
                    a = this.angle(this.cv)    // Angle                                                     // 633
                    , sat = this.startAngle     // Start angle                                              // 634
                    , eat = sat + a             // End angle                                                // 635
                    , sa, ea                    // Previous angles                                          // 636
                    , r = 1;                                                                                // 637
            c.lineWidth = this.lineWidth;                                                                   // 638
            c.lineCap = this.lineCap;                                                                       // 639
            this.o.cursor                                                                                   // 640
                    && (sat = eat - this.cursorExt)                                                         // 641
                    && (eat = eat + this.cursorExt);                                                        // 642
            c.beginPath();                                                                                  // 643
            c.strokeStyle = this.o.bgColor;                                                                 // 644
            c.arc(this.xy, this.xy, this.radius, this.endAngle - 0.00001, this.startAngle + 0.00001, true); // 645
            c.stroke();                                                                                     // 646
            if (this.o.displayPrevious) {                                                                   // 647
                ea = this.startAngle + this.angle(this.v);                                                  // 648
                sa = this.startAngle;                                                                       // 649
                this.o.cursor                                                                               // 650
                        && (sa = ea - this.cursorExt)                                                       // 651
                        && (ea = ea + this.cursorExt);                                                      // 652
                c.beginPath();                                                                              // 653
                c.strokeStyle = this.pColor;                                                                // 654
                c.arc(this.xy, this.xy, this.radius, sa - 0.00001, ea + 0.00001, false);                    // 655
                c.stroke();                                                                                 // 656
                r = (this.cv == this.v);                                                                    // 657
            }                                                                                               // 658
                                                                                                            // 659
            c.beginPath();                                                                                  // 660
            c.strokeStyle = r ? this.o.fgColor : this.fgColor;                                              // 661
            c.arc(this.xy, this.xy, this.radius, sat - 0.00001, eat + 0.00001, false);                      // 662
            c.stroke();                                                                                     // 663
        };                                                                                                  // 664
        this.cancel = function() {                                                                          // 665
            this.val(this.v);                                                                               // 666
        };                                                                                                  // 667
    };                                                                                                      // 668
    $.fn.dial = $.fn.knob = function(o) {                                                                   // 669
        return this.each(                                                                                   // 670
                function() {                                                                                // 671
                    var d = new k.Dial();                                                                   // 672
                    d.o = o;                                                                                // 673
                    d.$ = $(this);                                                                          // 674
                    d.run();                                                                                // 675
                }                                                                                           // 676
        ).parent();                                                                                         // 677
    };                                                                                                      // 678
})(jQuery);                                                                                                 // 679
                                                                                                            // 680
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
