(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/ThreeCSG/ThreeCSG.js                                                                                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
//'use strict';                                                                                                  // 1
//                                                                                                               // 2
//		EPSILON = 1e-5,                                                                                              // 3
//		COPLANAR = 0,                                                                                                // 4
//		FRONT = 1,                                                                                                   // 5
//		BACK = 2,                                                                                                    // 6
//		SPANNING = 3;                                                                                                // 7
//	                                                                                                              // 8
//	ThreeBSP = function( geometry ) {                                                                             // 9
//		// Convert THREE.Geometry to ThreeBSP                                                                        // 10
//		var i, _length_i,                                                                                            // 11
//			face, vertex, faceVertexUvs,                                                                                // 12
//			polygon,                                                                                                    // 13
//			polygons = [],                                                                                              // 14
//			tree;                                                                                                       // 15
//	                                                                                                              // 16
//		if ( geometry instanceof THREE.Geometry ) {                                                                  // 17
//			this.matrix = new THREE.Matrix4;                                                                            // 18
//		} else if ( geometry instanceof THREE.Mesh ) {                                                               // 19
//			// #todo: add hierarchy support                                                                             // 20
//			geometry.updateMatrix();                                                                                    // 21
//			this.matrix = geometry.matrix.clone();                                                                      // 22
//			geometry = geometry.geometry;                                                                               // 23
//		} else if ( geometry instanceof ThreeBSP.Node ) {                                                            // 24
//			this.tree = geometry;                                                                                       // 25
//			this.matrix = new THREE.Matrix4;                                                                            // 26
//			return this;                                                                                                // 27
//		} else {                                                                                                     // 28
//			throw 'ThreeBSP: Given geometry is unsupported';                                                            // 29
//		}                                                                                                            // 30
//	                                                                                                              // 31
//		for ( i = 0, _length_i = geometry.faces.length; i < _length_i; i++ ) {                                       // 32
//			face = geometry.faces[i];                                                                                   // 33
//			faceVertexUvs = geometry.faceVertexUvs[0][i];                                                               // 34
//			polygon = new ThreeBSP.Polygon;                                                                             // 35
//			                                                                                                            // 36
//			if ( face instanceof THREE.Face3 ) {                                                                        // 37
//				vertex = geometry.vertices[ face.a ];                                                                      // 38
//				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[0]);//, new THREE.Vector2( faceVertexUvs[0].x, faceVertexUvs[0].y ) );
//				vertex.applyMatrix4(this.matrix);                                                                          // 40
//				polygon.vertices.push( vertex );                                                                           // 41
//				                                                                                                           // 42
//				vertex = geometry.vertices[ face.b ];                                                                      // 43
//				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[1]);//, new THREE.Vector2( faceVertexUvs[1].x, faceVertexUvs[1].y ) );
//				vertex.applyMatrix4(this.matrix);                                                                          // 45
//				polygon.vertices.push( vertex );                                                                           // 46
//				                                                                                                           // 47
//				vertex = geometry.vertices[ face.c ];                                                                      // 48
//				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[2]);//, new THREE.Vector2( faceVertexUvs[2].x, faceVertexUvs[2].y ) );
//				vertex.applyMatrix4(this.matrix);                                                                          // 50
//				polygon.vertices.push( vertex );                                                                           // 51
//			} else if ( typeof THREE.Face4 ) {                                                                          // 52
//				vertex = geometry.vertices[ face.a ];                                                                      // 53
//				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[0]);//, new THREE.Vector2( faceVertexUvs[0].x, faceVertexUvs[0].y ) );
//				vertex.applyMatrix4(this.matrix);                                                                          // 55
//				polygon.vertices.push( vertex );                                                                           // 56
//				                                                                                                           // 57
//				vertex = geometry.vertices[ face.b ];                                                                      // 58
//				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z,face.vertexNormals[1]);//, new THREE.Vector2( faceVertexUvs[1].x, faceVertexUvs[1].y ) );
//				vertex.applyMatrix4(this.matrix);                                                                          // 60
//				polygon.vertices.push( vertex );                                                                           // 61
//				                                                                                                           // 62
//				vertex = geometry.vertices[ face.c ];                                                                      // 63
//				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[2]);//, new THREE.Vector2( faceVertexUvs[2].x, faceVertexUvs[2].y ) );
//				vertex.applyMatrix4(this.matrix);                                                                          // 65
//				polygon.vertices.push( vertex );                                                                           // 66
//				                                                                                                           // 67
//				vertex = geometry.vertices[ face.d ];                                                                      // 68
//				vertex = new ThreeBSP.Vertex( vertex.x, vertex.y, vertex.z, face.vertexNormals[3]);//, new THREE.Vector2( faceVertexUvs[3].x, faceVertexUvs[3].y ) );
//				vertex.applyMatrix4(this.matrix);                                                                          // 70
//				polygon.vertices.push( vertex );                                                                           // 71
//			} else {                                                                                                    // 72
//				throw 'Invalid face type at index ' + i;                                                                   // 73
//			}                                                                                                           // 74
//			                                                                                                            // 75
//			polygon.calculateProperties();                                                                              // 76
//			polygons.push( polygon );                                                                                   // 77
//		};                                                                                                           // 78
//	                                                                                                              // 79
//		this.tree = new ThreeBSP.Node( polygons );                                                                   // 80
//	};                                                                                                            // 81
//	ThreeBSP.prototype.subtract = function( other_tree ) {                                                        // 82
//		var a = this.tree.clone(),                                                                                   // 83
//			b = other_tree.tree.clone();                                                                                // 84
//		                                                                                                             // 85
//		a.invert();                                                                                                  // 86
//		a.clipTo( b );                                                                                               // 87
//		b.clipTo( a );                                                                                               // 88
//		b.invert();                                                                                                  // 89
//		b.clipTo( a );                                                                                               // 90
//		b.invert();                                                                                                  // 91
//		a.build( b.allPolygons() );                                                                                  // 92
//		a.invert();                                                                                                  // 93
//		a = new ThreeBSP( a );                                                                                       // 94
//		a.matrix = this.matrix;                                                                                      // 95
//		return a;                                                                                                    // 96
//	};                                                                                                            // 97
//	ThreeBSP.prototype.union = function( other_tree ) {                                                           // 98
//		var a = this.tree.clone(),                                                                                   // 99
//			b = other_tree.tree.clone();                                                                                // 100
//		                                                                                                             // 101
//		a.clipTo( b );                                                                                               // 102
//		b.clipTo( a );                                                                                               // 103
//		b.invert();                                                                                                  // 104
//		b.clipTo( a );                                                                                               // 105
//		b.invert();                                                                                                  // 106
//		a.build( b.allPolygons() );                                                                                  // 107
//		a = new ThreeBSP( a );                                                                                       // 108
//		a.matrix = this.matrix;                                                                                      // 109
//		return a;                                                                                                    // 110
//	};                                                                                                            // 111
//	ThreeBSP.prototype.intersect = function( other_tree ) {                                                       // 112
//		var a = this.tree.clone(),                                                                                   // 113
//			b = other_tree.tree.clone();                                                                                // 114
//		                                                                                                             // 115
//		a.invert();                                                                                                  // 116
//		b.clipTo( a );                                                                                               // 117
//		b.invert();                                                                                                  // 118
//		a.clipTo( b );                                                                                               // 119
//		b.clipTo( a );                                                                                               // 120
//		a.build( b.allPolygons() );                                                                                  // 121
//		a.invert();                                                                                                  // 122
//		a = new ThreeBSP( a );                                                                                       // 123
//		a.matrix = this.matrix;                                                                                      // 124
//		return a;                                                                                                    // 125
//	};                                                                                                            // 126
//	ThreeBSP.prototype.toGeometry = function() {                                                                  // 127
//		var i, j,                                                                                                    // 128
//			matrix = new THREE.Matrix4().getInverse( this.matrix ),                                                     // 129
//			geometry = new THREE.Geometry(),                                                                            // 130
//			polygons = this.tree.allPolygons(),                                                                         // 131
//			polygon_count = polygons.length,                                                                            // 132
//			polygon, polygon_vertice_count,                                                                             // 133
//			vertice_dict = {},                                                                                          // 134
//			vertex_idx_a, vertex_idx_b, vertex_idx_c,                                                                   // 135
//			vertex, face,                                                                                               // 136
//			verticeUvs;                                                                                                 // 137
//	                                                                                                              // 138
//		for ( i = 0; i < polygon_count; i++ ) {                                                                      // 139
//			polygon = polygons[i];                                                                                      // 140
//			polygon_vertice_count = polygon.vertices.length;                                                            // 141
//			                                                                                                            // 142
//			for ( j = 2; j < polygon_vertice_count; j++ ) {                                                             // 143
//				verticeUvs = [];                                                                                           // 144
//				                                                                                                           // 145
//				vertex = polygon.vertices[0];                                                                              // 146
//				verticeUvs.push( new THREE.Vector2( vertex.uv.x, vertex.uv.y ) );                                          // 147
//				vertex = new THREE.Vector3( vertex.x, vertex.y, vertex.z );                                                // 148
//				vertex.applyMatrix4(matrix);                                                                               // 149
//				                                                                                                           // 150
//				if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' ) {                 // 151
//					vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];                                // 152
//				} else {                                                                                                   // 153
//					geometry.vertices.push( vertex );                                                                         // 154
//					vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1; // 155
//				}                                                                                                          // 156
//				                                                                                                           // 157
//				vertex = polygon.vertices[j-1];                                                                            // 158
//				verticeUvs.push( new THREE.Vector2( vertex.uv.x, vertex.uv.y ) );                                          // 159
//				vertex = new THREE.Vector3( vertex.x, vertex.y, vertex.z );                                                // 160
//				vertex.applyMatrix4(matrix);                                                                               // 161
//				if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' ) {                 // 162
//					vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];                                // 163
//				} else {                                                                                                   // 164
//					geometry.vertices.push( vertex );                                                                         // 165
//					vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1; // 166
//				}                                                                                                          // 167
//				                                                                                                           // 168
//				vertex = polygon.vertices[j];                                                                              // 169
//				verticeUvs.push( new THREE.Vector2( vertex.uv.x, vertex.uv.y ) );                                          // 170
//				vertex = new THREE.Vector3( vertex.x, vertex.y, vertex.z );                                                // 171
//				vertex.applyMatrix4(matrix);                                                                               // 172
//				if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' ) {                 // 173
//					vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];                                // 174
//				} else {                                                                                                   // 175
//					geometry.vertices.push( vertex );                                                                         // 176
//					vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1; // 177
//				}                                                                                                          // 178
//				                                                                                                           // 179
//				face = new THREE.Face3(                                                                                    // 180
//					vertex_idx_a,                                                                                             // 181
//					vertex_idx_b,                                                                                             // 182
//					vertex_idx_c,                                                                                             // 183
//					new THREE.Vector3( polygon.normal.x, polygon.normal.y, polygon.normal.z )                                 // 184
//				);                                                                                                         // 185
//				                                                                                                           // 186
//				geometry.faces.push( face );                                                                               // 187
//				geometry.faceVertexUvs[0].push( verticeUvs );                                                              // 188
//			}                                                                                                           // 189
//			                                                                                                            // 190
//		}                                                                                                            // 191
//		return geometry;                                                                                             // 192
//	};                                                                                                            // 193
//	ThreeBSP.prototype.toMesh = function( material ) {                                                            // 194
//		var geometry = this.toGeometry(),                                                                            // 195
//		mesh = new THREE.Mesh( geometry, material );                                                                 // 196
//		                                                                                                             // 197
////		mesh.position.getPositionFromMatrix( this.matrix );                                                        // 198
////		var euler=new THREE.Euler(0,0,0);                                                                          // 199
////		euler.setFromRotationMatrix(this.matrix);                                                                  // 200
////		mesh.rotation=euler;                                                                                       // 201
//		mesh.applyMatrix(this.matrix);                                                                               // 202
//                                                                                                               // 203
//		return mesh;                                                                                                 // 204
//	};                                                                                                            // 205
//		                                                                                                             // 206
//	ThreeBSP.Polygon = function( vertices, normal, w ) {                                                          // 207
//		if ( !( vertices instanceof Array ) ) {                                                                      // 208
//			vertices = [];                                                                                              // 209
//		}                                                                                                            // 210
//		                                                                                                             // 211
//		this.vertices = vertices;                                                                                    // 212
//		if ( vertices.length > 0 ) {                                                                                 // 213
//			this.calculateProperties();                                                                                 // 214
//		} else {                                                                                                     // 215
//			this.normal = this.w = undefined;                                                                           // 216
//		}                                                                                                            // 217
//	};                                                                                                            // 218
//	ThreeBSP.Polygon.prototype.calculateProperties = function() {                                                 // 219
//		var a = this.vertices[0],                                                                                    // 220
//			b = this.vertices[1],                                                                                       // 221
//			c = this.vertices[2];                                                                                       // 222
//			                                                                                                            // 223
//		this.normal = b.clone().subtract( a ).cross(                                                                 // 224
//			c.clone().subtract( a )                                                                                     // 225
//		).normalize();                                                                                               // 226
//		                                                                                                             // 227
//		this.w = this.normal.clone().dot( a );                                                                       // 228
//		                                                                                                             // 229
//		return this;                                                                                                 // 230
//	};                                                                                                            // 231
//	ThreeBSP.Polygon.prototype.clone = function() {                                                               // 232
//		var i, vertice_count,                                                                                        // 233
//			polygon = new ThreeBSP.Polygon;                                                                             // 234
//		                                                                                                             // 235
//		for ( i = 0, vertice_count = this.vertices.length; i < vertice_count; i++ ) {                                // 236
//			polygon.vertices.push( this.vertices[i].clone() );                                                          // 237
//		};                                                                                                           // 238
//		polygon.calculateProperties();                                                                               // 239
//		                                                                                                             // 240
//		return polygon;                                                                                              // 241
//	};                                                                                                            // 242
//	                                                                                                              // 243
//	ThreeBSP.Polygon.prototype.flip = function() {                                                                // 244
//		var i, vertices = [];                                                                                        // 245
//		                                                                                                             // 246
//		this.normal.multiplyScalar( -1 );                                                                            // 247
//		this.w *= -1;                                                                                                // 248
//		                                                                                                             // 249
//		for ( i = this.vertices.length - 1; i >= 0; i-- ) {                                                          // 250
//			vertices.push( this.vertices[i] );                                                                          // 251
//		};                                                                                                           // 252
//		this.vertices = vertices;                                                                                    // 253
//		                                                                                                             // 254
//		return this;                                                                                                 // 255
//	};                                                                                                            // 256
//	ThreeBSP.Polygon.prototype.classifyVertex = function( vertex ) {                                              // 257
//		var side_value = this.normal.dot( vertex ) - this.w;                                                         // 258
//		                                                                                                             // 259
//		if ( side_value < -EPSILON ) {                                                                               // 260
//			return BACK;                                                                                                // 261
//		} else if ( side_value > EPSILON ) {                                                                         // 262
//			return FRONT;                                                                                               // 263
//		} else {                                                                                                     // 264
//			return COPLANAR;                                                                                            // 265
//		}                                                                                                            // 266
//	};                                                                                                            // 267
//	ThreeBSP.Polygon.prototype.classifySide = function( polygon ) {                                               // 268
//		var i, vertex, classification,                                                                               // 269
//			num_positive = 0,                                                                                           // 270
//			num_negative = 0,                                                                                           // 271
//			vertice_count = polygon.vertices.length;                                                                    // 272
//		                                                                                                             // 273
//		for ( i = 0; i < vertice_count; i++ ) {                                                                      // 274
//			vertex = polygon.vertices[i];                                                                               // 275
//			classification = this.classifyVertex( vertex );                                                             // 276
//			if ( classification === FRONT ) {                                                                           // 277
//				num_positive++;                                                                                            // 278
//			} else if ( classification === BACK ) {                                                                     // 279
//				num_negative++;                                                                                            // 280
//			}                                                                                                           // 281
//		}                                                                                                            // 282
//		                                                                                                             // 283
//		if ( num_positive > 0 && num_negative === 0 ) {                                                              // 284
//			return FRONT;                                                                                               // 285
//		} else if ( num_positive === 0 && num_negative > 0 ) {                                                       // 286
//			return BACK;                                                                                                // 287
//		} else if ( num_positive === 0 && num_negative === 0 ) {                                                     // 288
//			return COPLANAR;                                                                                            // 289
//		} else {                                                                                                     // 290
//			return SPANNING;                                                                                            // 291
//		}                                                                                                            // 292
//	};                                                                                                            // 293
//	ThreeBSP.Polygon.prototype.splitPolygon = function( polygon, coplanar_front, coplanar_back, front, back ) {   // 294
//		var classification = this.classifySide( polygon );                                                           // 295
//		                                                                                                             // 296
//		if ( classification === COPLANAR ) {                                                                         // 297
//			                                                                                                            // 298
//			( this.normal.dot( polygon.normal ) > 0 ? coplanar_front : coplanar_back ).push( polygon );                 // 299
//			                                                                                                            // 300
//		} else if ( classification === FRONT ) {                                                                     // 301
//			                                                                                                            // 302
//			front.push( polygon );                                                                                      // 303
//			                                                                                                            // 304
//		} else if ( classification === BACK ) {                                                                      // 305
//			                                                                                                            // 306
//			back.push( polygon );                                                                                       // 307
//			                                                                                                            // 308
//		} else {                                                                                                     // 309
//			                                                                                                            // 310
//			var vertice_count,                                                                                          // 311
//				i, j, ti, tj, vi, vj,                                                                                      // 312
//				t, v,                                                                                                      // 313
//				f = [],                                                                                                    // 314
//				b = [];                                                                                                    // 315
//			                                                                                                            // 316
//			for ( i = 0, vertice_count = polygon.vertices.length; i < vertice_count; i++ ) {                            // 317
//				                                                                                                           // 318
//				j = (i + 1) % vertice_count;                                                                               // 319
//				vi = polygon.vertices[i];                                                                                  // 320
//				vj = polygon.vertices[j];                                                                                  // 321
//				ti = this.classifyVertex( vi );                                                                            // 322
//				tj = this.classifyVertex( vj );                                                                            // 323
//				                                                                                                           // 324
//				if ( ti != BACK ) f.push( vi );                                                                            // 325
//				if ( ti != FRONT ) b.push( vi );                                                                           // 326
//				if ( (ti | tj) === SPANNING ) {                                                                            // 327
//					t = ( this.w - this.normal.dot( vi ) ) / this.normal.dot( vj.clone().subtract( vi ) );                    // 328
//					v = vi.interpolate( vj, t );                                                                              // 329
//					f.push( v );                                                                                              // 330
//					b.push( v );                                                                                              // 331
//				}                                                                                                          // 332
//			}                                                                                                           // 333
//			                                                                                                            // 334
//			                                                                                                            // 335
//			if ( f.length >= 3 ) front.push( new ThreeBSP.Polygon( f ).calculateProperties() );                         // 336
//			if ( b.length >= 3 ) back.push( new ThreeBSP.Polygon( b ).calculateProperties() );                          // 337
//		}                                                                                                            // 338
//	};                                                                                                            // 339
//	                                                                                                              // 340
//	ThreeBSP.Vertex = function( x, y, z, normal, uv ) {                                                           // 341
//		this.x = x;                                                                                                  // 342
//		this.y = y;                                                                                                  // 343
//		this.z = z;                                                                                                  // 344
//		this.normal = normal || new THREE.Vector3;                                                                   // 345
//		this.uv = uv || new THREE.Vector2;                                                                           // 346
//	};                                                                                                            // 347
//	ThreeBSP.Vertex.prototype.clone = function() {                                                                // 348
//		return new ThreeBSP.Vertex( this.x, this.y, this.z, this.normal.clone(), this.uv.clone() );                  // 349
//	};                                                                                                            // 350
//	ThreeBSP.Vertex.prototype.add = function( vertex ) {                                                          // 351
//		this.x += vertex.x;                                                                                          // 352
//		this.y += vertex.y;                                                                                          // 353
//		this.z += vertex.z;                                                                                          // 354
//		return this;                                                                                                 // 355
//	};                                                                                                            // 356
//	ThreeBSP.Vertex.prototype.subtract = function( vertex ) {                                                     // 357
//		this.x -= vertex.x;                                                                                          // 358
//		this.y -= vertex.y;                                                                                          // 359
//		this.z -= vertex.z;                                                                                          // 360
//		return this;                                                                                                 // 361
//	};                                                                                                            // 362
//	ThreeBSP.Vertex.prototype.multiplyScalar = function( scalar ) {                                               // 363
//		this.x *= scalar;                                                                                            // 364
//		this.y *= scalar;                                                                                            // 365
//		this.z *= scalar;                                                                                            // 366
//		return this;                                                                                                 // 367
//	};                                                                                                            // 368
//	ThreeBSP.Vertex.prototype.cross = function( vertex ) {                                                        // 369
//		var x = this.x,                                                                                              // 370
//			y = this.y,                                                                                                 // 371
//			z = this.z;                                                                                                 // 372
//                                                                                                               // 373
//		this.x = y * vertex.z - z * vertex.y;                                                                        // 374
//		this.y = z * vertex.x - x * vertex.z;                                                                        // 375
//		this.z = x * vertex.y - y * vertex.x;                                                                        // 376
//		                                                                                                             // 377
//		return this;                                                                                                 // 378
//	};                                                                                                            // 379
//	ThreeBSP.Vertex.prototype.normalize = function() {                                                            // 380
//		var length = Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );                               // 381
//		                                                                                                             // 382
//		this.x /= length;                                                                                            // 383
//		this.y /= length;                                                                                            // 384
//		this.z /= length;                                                                                            // 385
//		                                                                                                             // 386
//		return this;                                                                                                 // 387
//	};                                                                                                            // 388
//	ThreeBSP.Vertex.prototype.dot = function( vertex ) {                                                          // 389
//		return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;                                            // 390
//	};                                                                                                            // 391
//	ThreeBSP.Vertex.prototype.lerp = function( a, t ) {                                                           // 392
//		this.add(                                                                                                    // 393
//			a.clone().subtract( this ).multiplyScalar( t )                                                              // 394
//		);                                                                                                           // 395
//		                                                                                                             // 396
//		this.normal.add(                                                                                             // 397
//			a.normal.clone().sub( this.normal ).multiplyScalar( t )                                                     // 398
//		);                                                                                                           // 399
//		                                                                                                             // 400
//		this.uv.add(                                                                                                 // 401
//			a.uv.clone().sub( this.uv ).multiplyScalar( t )                                                             // 402
//		);                                                                                                           // 403
//		                                                                                                             // 404
//		return this;                                                                                                 // 405
//	};                                                                                                            // 406
//	ThreeBSP.Vertex.prototype.interpolate = function( other, t ) {                                                // 407
//		return this.clone().lerp( other, t );                                                                        // 408
//	};                                                                                                            // 409
//	ThreeBSP.Vertex.prototype.applyMatrix4 = function ( m ) {                                                     // 410
//                                                                                                               // 411
//		// input: THREE.Matrix4 affine matrix                                                                        // 412
//                                                                                                               // 413
//		var x = this.x, y = this.y, z = this.z;                                                                      // 414
//                                                                                                               // 415
//		var e = m.elements;                                                                                          // 416
//                                                                                                               // 417
//		this.x = e[0] * x + e[4] * y + e[8]  * z + e[12];                                                            // 418
//		this.y = e[1] * x + e[5] * y + e[9]  * z + e[13];                                                            // 419
//		this.z = e[2] * x + e[6] * y + e[10] * z + e[14];                                                            // 420
//                                                                                                               // 421
//		return this;                                                                                                 // 422
//                                                                                                               // 423
//	}                                                                                                             // 424
//	                                                                                                              // 425
//	                                                                                                              // 426
//	ThreeBSP.Node = function( polygons ) {                                                                        // 427
//		var i, polygon_count,                                                                                        // 428
//			front = [],                                                                                                 // 429
//			back = [];                                                                                                  // 430
//                                                                                                               // 431
//		this.polygons = [];                                                                                          // 432
//		this.front = this.back = undefined;                                                                          // 433
//		                                                                                                             // 434
//		if ( !(polygons instanceof Array) || polygons.length === 0 ) return;                                         // 435
//                                                                                                               // 436
//		this.divider = polygons[0].clone();                                                                          // 437
//		                                                                                                             // 438
//		for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {                                     // 439
//			this.divider.splitPolygon( polygons[i], this.polygons, this.polygons, front, back );                        // 440
//		}                                                                                                            // 441
//		                                                                                                             // 442
//		if ( front.length > 0 ) {                                                                                    // 443
//			this.front = new ThreeBSP.Node( front );                                                                    // 444
//		}                                                                                                            // 445
//		                                                                                                             // 446
//		if ( back.length > 0 ) {                                                                                     // 447
//			this.back = new ThreeBSP.Node( back );                                                                      // 448
//		}                                                                                                            // 449
//	};                                                                                                            // 450
//	ThreeBSP.Node.isConvex = function( polygons ) {                                                               // 451
//		var i, j;                                                                                                    // 452
//		for ( i = 0; i < polygons.length; i++ ) {                                                                    // 453
//			for ( j = 0; j < polygons.length; j++ ) {                                                                   // 454
//				if ( i !== j && polygons[i].classifySide( polygons[j] ) !== BACK ) {                                       // 455
//					return false;                                                                                             // 456
//				}                                                                                                          // 457
//			}                                                                                                           // 458
//		}                                                                                                            // 459
//		return true;                                                                                                 // 460
//	};                                                                                                            // 461
//	ThreeBSP.Node.prototype.build = function( polygons ) {                                                        // 462
//		var i, polygon_count,                                                                                        // 463
//			front = [],                                                                                                 // 464
//			back = [];                                                                                                  // 465
//		                                                                                                             // 466
//		if ( !this.divider ) {                                                                                       // 467
//			this.divider = polygons[0].clone();                                                                         // 468
//		}                                                                                                            // 469
//                                                                                                               // 470
//		for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {                                     // 471
//			this.divider.splitPolygon( polygons[i], this.polygons, this.polygons, front, back );                        // 472
//		}                                                                                                            // 473
//		                                                                                                             // 474
//		if ( front.length > 0 ) {                                                                                    // 475
//			if ( !this.front ) this.front = new ThreeBSP.Node();                                                        // 476
//			this.front.build( front );                                                                                  // 477
//		}                                                                                                            // 478
//		                                                                                                             // 479
//		if ( back.length > 0 ) {                                                                                     // 480
//			if ( !this.back ) this.back = new ThreeBSP.Node();                                                          // 481
//			this.back.build( back );                                                                                    // 482
//		}                                                                                                            // 483
//	};                                                                                                            // 484
//	ThreeBSP.Node.prototype.allPolygons = function() {                                                            // 485
//		var polygons = this.polygons.slice();                                                                        // 486
//		if ( this.front ) polygons = polygons.concat( this.front.allPolygons() );                                    // 487
//		if ( this.back ) polygons = polygons.concat( this.back.allPolygons() );                                      // 488
//		return polygons;                                                                                             // 489
//	};                                                                                                            // 490
//	ThreeBSP.Node.prototype.clone = function() {                                                                  // 491
//		var node = new ThreeBSP.Node();                                                                              // 492
//		                                                                                                             // 493
//		node.divider = this.divider.clone();                                                                         // 494
//		node.polygons = this.polygons.map( function( polygon ) { return polygon.clone(); } );                        // 495
//		node.front = this.front && this.front.clone();                                                               // 496
//		node.back = this.back && this.back.clone();                                                                  // 497
//		                                                                                                             // 498
//		return node;                                                                                                 // 499
//	};                                                                                                            // 500
//	ThreeBSP.Node.prototype.invert = function() {                                                                 // 501
//		var i, polygon_count, temp;                                                                                  // 502
//		                                                                                                             // 503
//		for ( i = 0, polygon_count = this.polygons.length; i < polygon_count; i++ ) {                                // 504
//			this.polygons[i].flip();                                                                                    // 505
//		}                                                                                                            // 506
//		                                                                                                             // 507
//		this.divider.flip();                                                                                         // 508
//		if ( this.front ) this.front.invert();                                                                       // 509
//		if ( this.back ) this.back.invert();                                                                         // 510
//		                                                                                                             // 511
//		temp = this.front;                                                                                           // 512
//		this.front = this.back;                                                                                      // 513
//		this.back = temp;                                                                                            // 514
//		                                                                                                             // 515
//		return this;                                                                                                 // 516
//	};                                                                                                            // 517
//	ThreeBSP.Node.prototype.clipPolygons = function( polygons ) {                                                 // 518
//		var i, polygon_count,                                                                                        // 519
//			front, back;                                                                                                // 520
//                                                                                                               // 521
//		if ( !this.divider ) return polygons.slice();                                                                // 522
//		                                                                                                             // 523
//		front = [], back = [];                                                                                       // 524
//		                                                                                                             // 525
//		for ( i = 0, polygon_count = polygons.length; i < polygon_count; i++ ) {                                     // 526
//			this.divider.splitPolygon( polygons[i], front, back, front, back );                                         // 527
//		}                                                                                                            // 528
//                                                                                                               // 529
//		if ( this.front ) front = this.front.clipPolygons( front );                                                  // 530
//		if ( this.back ) back = this.back.clipPolygons( back );                                                      // 531
//		else back = [];                                                                                              // 532
//                                                                                                               // 533
//		return front.concat( back );                                                                                 // 534
//	};                                                                                                            // 535
//	                                                                                                              // 536
//	ThreeBSP.Node.prototype.clipTo = function( node ) {                                                           // 537
//		this.polygons = node.clipPolygons( this.polygons );                                                          // 538
//		if ( this.front ) this.front.clipTo( node );                                                                 // 539
//		if ( this.back ) this.back.clipTo( node );                                                                   // 540
//	};                                                                                                            // 541
//	                                                                                                              // 542
//	                                                                                                              // 543
                                                                                                                 // 544
                                                                                                                 // 545
'use strict';                                                                                                    // 546
EPSILON = 1e-5,                                                                                                  // 547
COPLANAR = 0,                                                                                                    // 548
FRONT = 1,                                                                                                       // 549
BACK = 2,                                                                                                        // 550
SPANNING = 3;                                                                                                    // 551
                                                                                                                 // 552
ThreeBSP = function(geometry) {                                                                                  // 553
    // Convert THREE.Geometry to ThreeBSP                                                                        // 554
    var i, _length_i,                                                                                            // 555
            face, vertex, faceVertexUvs,                                                                         // 556
            polygon,                                                                                             // 557
            polygons = [],                                                                                       // 558
            tree;                                                                                                // 559
                                                                                                                 // 560
    if (geometry instanceof THREE.Geometry) {                                                                    // 561
        this.matrix = new THREE.Matrix4;                                                                         // 562
    } else if (geometry instanceof THREE.Mesh) {                                                                 // 563
        // #todo: add hierarchy support                                                                          // 564
        geometry.updateMatrix();                                                                                 // 565
        this.matrix = geometry.matrix.clone();                                                                   // 566
        geometry = geometry.geometry;                                                                            // 567
    } else if (geometry instanceof ThreeBSP.Node) {                                                              // 568
        this.tree = geometry;                                                                                    // 569
        this.matrix = new THREE.Matrix4;                                                                         // 570
        return this;                                                                                             // 571
    } else {                                                                                                     // 572
        throw 'ThreeBSP: Given geometry is unsupported';                                                         // 573
    }                                                                                                            // 574
                                                                                                                 // 575
    for (i = 0, _length_i = geometry.faces.length; i < _length_i; i++) {                                         // 576
        face = geometry.faces[i];                                                                                // 577
        faceVertexUvs = geometry.faceVertexUvs[0][i];                                                            // 578
        polygon = new ThreeBSP.Polygon;                                                                          // 579
                                                                                                                 // 580
        if (face instanceof THREE.Face3) {                                                                       // 581
            vertex = geometry.vertices[ face.a ];                                                                // 582
            vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0]);//, new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y));
            vertex.applyMatrix4(this.matrix);                                                                    // 584
            polygon.vertices.push(vertex);                                                                       // 585
                                                                                                                 // 586
            vertex = geometry.vertices[ face.b ];                                                                // 587
            vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1]);//, new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y));
            vertex.applyMatrix4(this.matrix);                                                                    // 589
            polygon.vertices.push(vertex);                                                                       // 590
                                                                                                                 // 591
            vertex = geometry.vertices[ face.c ];                                                                // 592
            vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2]);//, new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y));
            vertex.applyMatrix4(this.matrix);                                                                    // 594
            polygon.vertices.push(vertex);                                                                       // 595
        } else if (typeof THREE.Face4) {                                                                         // 596
            vertex = geometry.vertices[ face.a ];                                                                // 597
            vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0]);//, new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y));
            vertex.applyMatrix4(this.matrix);                                                                    // 599
            polygon.vertices.push(vertex);                                                                       // 600
                                                                                                                 // 601
            vertex = geometry.vertices[ face.b ];                                                                // 602
            vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1]);//, new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y));
            vertex.applyMatrix4(this.matrix);                                                                    // 604
            polygon.vertices.push(vertex);                                                                       // 605
                                                                                                                 // 606
            vertex = geometry.vertices[ face.c ];                                                                // 607
            vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2]);//, new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y));
            vertex.applyMatrix4(this.matrix);                                                                    // 609
            polygon.vertices.push(vertex);                                                                       // 610
                                                                                                                 // 611
            vertex = geometry.vertices[ face.d ];                                                                // 612
            vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[3]);//, new THREE.Vector2(faceVertexUvs[3].x, faceVertexUvs[3].y));
            vertex.applyMatrix4(this.matrix);                                                                    // 614
            polygon.vertices.push(vertex);                                                                       // 615
        } else {                                                                                                 // 616
            throw 'Invalid face type at index ' + i;                                                             // 617
        }                                                                                                        // 618
                                                                                                                 // 619
        polygon.calculateProperties();                                                                           // 620
        polygons.push(polygon);                                                                                  // 621
    }                                                                                                            // 622
    ;                                                                                                            // 623
                                                                                                                 // 624
    this.tree = new ThreeBSP.Node(polygons);                                                                     // 625
};                                                                                                               // 626
ThreeBSP.prototype.subtract = function(other_tree) {                                                             // 627
    var a = this.tree.clone(),                                                                                   // 628
            b = other_tree.tree.clone();                                                                         // 629
                                                                                                                 // 630
    a.invert();                                                                                                  // 631
    a.clipTo(b);                                                                                                 // 632
    b.clipTo(a);                                                                                                 // 633
    b.invert();                                                                                                  // 634
    b.clipTo(a);                                                                                                 // 635
    b.invert();                                                                                                  // 636
    a.build(b.allPolygons());                                                                                    // 637
    a.invert();                                                                                                  // 638
    a = new ThreeBSP(a);                                                                                         // 639
    a.matrix = this.matrix;                                                                                      // 640
    return a;                                                                                                    // 641
};                                                                                                               // 642
ThreeBSP.prototype.union = function(other_tree) {                                                                // 643
    var a = this.tree.clone(),                                                                                   // 644
            b = other_tree.tree.clone();                                                                         // 645
                                                                                                                 // 646
    a.clipTo(b);                                                                                                 // 647
    b.clipTo(a);                                                                                                 // 648
    b.invert();                                                                                                  // 649
    b.clipTo(a);                                                                                                 // 650
    b.invert();                                                                                                  // 651
    a.build(b.allPolygons());                                                                                    // 652
    a = new ThreeBSP(a);                                                                                         // 653
    a.matrix = this.matrix;                                                                                      // 654
    return a;                                                                                                    // 655
};                                                                                                               // 656
ThreeBSP.prototype.intersect = function(other_tree) {                                                            // 657
    var a = this.tree.clone(),                                                                                   // 658
            b = other_tree.tree.clone();                                                                         // 659
                                                                                                                 // 660
    a.invert();                                                                                                  // 661
    b.clipTo(a);                                                                                                 // 662
    b.invert();                                                                                                  // 663
    a.clipTo(b);                                                                                                 // 664
    b.clipTo(a);                                                                                                 // 665
    a.build(b.allPolygons());                                                                                    // 666
    a.invert();                                                                                                  // 667
    a = new ThreeBSP(a);                                                                                         // 668
    a.matrix = this.matrix;                                                                                      // 669
    return a;                                                                                                    // 670
};                                                                                                               // 671
ThreeBSP.prototype.toGeometry = function() {                                                                     // 672
    var i, j,                                                                                                    // 673
            matrix = new THREE.Matrix4().getInverse(this.matrix),                                                // 674
            geometry = new THREE.Geometry(),                                                                     // 675
            polygons = this.tree.allPolygons(),                                                                  // 676
            polygon_count = polygons.length,                                                                     // 677
            polygon, polygon_vertice_count,                                                                      // 678
            vertice_dict = {},                                                                                   // 679
            vertex_idx_a, vertex_idx_b, vertex_idx_c,                                                            // 680
            vertex, face,                                                                                        // 681
            verticeUvs;                                                                                          // 682
                                                                                                                 // 683
    for (i = 0; i < polygon_count; i++) {                                                                        // 684
        polygon = polygons[i];                                                                                   // 685
        polygon_vertice_count = polygon.vertices.length;                                                         // 686
                                                                                                                 // 687
        for (j = 2; j < polygon_vertice_count; j++) {                                                            // 688
            verticeUvs = [];                                                                                     // 689
                                                                                                                 // 690
            vertex = polygon.vertices[0];                                                                        // 691
            verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));                                        // 692
            vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);                                            // 693
            vertex.applyMatrix4(matrix);                                                                         // 694
                                                                                                                 // 695
            if (typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined') {             // 696
                vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];                       // 697
            } else {                                                                                             // 698
                geometry.vertices.push(vertex);                                                                  // 699
                vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
            }                                                                                                    // 701
                                                                                                                 // 702
            vertex = polygon.vertices[j - 1];                                                                    // 703
            verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));                                        // 704
            vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);                                            // 705
            vertex.applyMatrix4(matrix);                                                                         // 706
            if (typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined') {             // 707
                vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];                       // 708
            } else {                                                                                             // 709
                geometry.vertices.push(vertex);                                                                  // 710
                vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
            }                                                                                                    // 712
                                                                                                                 // 713
            vertex = polygon.vertices[j];                                                                        // 714
            verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));                                        // 715
            vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);                                            // 716
            vertex.applyMatrix4(matrix);                                                                         // 717
            if (typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined') {             // 718
                vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];                       // 719
            } else {                                                                                             // 720
                geometry.vertices.push(vertex);                                                                  // 721
                vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
            }                                                                                                    // 723
                                                                                                                 // 724
            face = new THREE.Face3(                                                                              // 725
                    vertex_idx_a,                                                                                // 726
                    vertex_idx_b,                                                                                // 727
                    vertex_idx_c,                                                                                // 728
                    new THREE.Vector3(polygon.normal.x, polygon.normal.y, polygon.normal.z)                      // 729
                    );                                                                                           // 730
                                                                                                                 // 731
            geometry.faces.push(face);                                                                           // 732
            geometry.faceVertexUvs[0].push(verticeUvs);                                                          // 733
        }                                                                                                        // 734
                                                                                                                 // 735
    }                                                                                                            // 736
    return geometry;                                                                                             // 737
};                                                                                                               // 738
ThreeBSP.prototype.toMesh = function(material) {                                                                 // 739
    var geometry = this.toGeometry(),                                                                            // 740
            mesh = new THREE.Mesh(geometry, material);                                                           // 741
    mesh.applyMatrix(this.matrix);                                                                               // 742
    //mesh.position.getPositionFromMatrix(this.matrix);                                                          // 743
    //mesh.rotation.setEulerFromRotationMatrix(this.matrix);                                                     // 744
                                                                                                                 // 745
    return mesh;                                                                                                 // 746
};                                                                                                               // 747
                                                                                                                 // 748
                                                                                                                 // 749
ThreeBSP.Polygon = function(vertices, normal, w) {                                                               // 750
    if (!(vertices instanceof Array)) {                                                                          // 751
        vertices = [];                                                                                           // 752
    }                                                                                                            // 753
                                                                                                                 // 754
    this.vertices = vertices;                                                                                    // 755
    if (vertices.length > 0) {                                                                                   // 756
        this.calculateProperties();                                                                              // 757
    } else {                                                                                                     // 758
        this.normal = this.w = undefined;                                                                        // 759
    }                                                                                                            // 760
};                                                                                                               // 761
ThreeBSP.Polygon.prototype.calculateProperties = function() {                                                    // 762
    var a = this.vertices[0],                                                                                    // 763
            b = this.vertices[1],                                                                                // 764
            c = this.vertices[2];                                                                                // 765
                                                                                                                 // 766
    this.normal = b.clone().subtract(a).cross(                                                                   // 767
            c.clone().subtract(a)                                                                                // 768
            ).normalize();                                                                                       // 769
                                                                                                                 // 770
    this.w = this.normal.clone().dot(a);                                                                         // 771
                                                                                                                 // 772
    return this;                                                                                                 // 773
};                                                                                                               // 774
ThreeBSP.Polygon.prototype.clone = function() {                                                                  // 775
    var i, vertice_count,                                                                                        // 776
            polygon = new ThreeBSP.Polygon;                                                                      // 777
                                                                                                                 // 778
    for (i = 0, vertice_count = this.vertices.length; i < vertice_count; i++) {                                  // 779
        polygon.vertices.push(this.vertices[i].clone());                                                         // 780
    }                                                                                                            // 781
    ;                                                                                                            // 782
    polygon.calculateProperties();                                                                               // 783
                                                                                                                 // 784
    return polygon;                                                                                              // 785
};                                                                                                               // 786
                                                                                                                 // 787
ThreeBSP.Polygon.prototype.flip = function() {                                                                   // 788
    var i, vertices = [];                                                                                        // 789
                                                                                                                 // 790
    this.normal.multiplyScalar(-1);                                                                              // 791
    this.w *= -1;                                                                                                // 792
                                                                                                                 // 793
    for (i = this.vertices.length - 1; i >= 0; i--) {                                                            // 794
        vertices.push(this.vertices[i]);                                                                         // 795
    }                                                                                                            // 796
    ;                                                                                                            // 797
    this.vertices = vertices;                                                                                    // 798
                                                                                                                 // 799
    return this;                                                                                                 // 800
};                                                                                                               // 801
ThreeBSP.Polygon.prototype.classifyVertex = function(vertex) {                                                   // 802
    var side_value = this.normal.dot(vertex) - this.w;                                                           // 803
                                                                                                                 // 804
    if (side_value < -EPSILON) {                                                                                 // 805
        return BACK;                                                                                             // 806
    } else if (side_value > EPSILON) {                                                                           // 807
        return FRONT;                                                                                            // 808
    } else {                                                                                                     // 809
        return COPLANAR;                                                                                         // 810
    }                                                                                                            // 811
};                                                                                                               // 812
ThreeBSP.Polygon.prototype.classifySide = function(polygon) {                                                    // 813
    var i, vertex, classification,                                                                               // 814
            num_positive = 0,                                                                                    // 815
            num_negative = 0,                                                                                    // 816
            vertice_count = polygon.vertices.length;                                                             // 817
                                                                                                                 // 818
    for (i = 0; i < vertice_count; i++) {                                                                        // 819
        vertex = polygon.vertices[i];                                                                            // 820
        classification = this.classifyVertex(vertex);                                                            // 821
        if (classification === FRONT) {                                                                          // 822
            num_positive++;                                                                                      // 823
        } else if (classification === BACK) {                                                                    // 824
            num_negative++;                                                                                      // 825
        }                                                                                                        // 826
    }                                                                                                            // 827
                                                                                                                 // 828
    if (num_positive > 0 && num_negative === 0) {                                                                // 829
        return FRONT;                                                                                            // 830
    } else if (num_positive === 0 && num_negative > 0) {                                                         // 831
        return BACK;                                                                                             // 832
    } else if (num_positive === 0 && num_negative === 0) {                                                       // 833
        return COPLANAR;                                                                                         // 834
    } else {                                                                                                     // 835
        return SPANNING;                                                                                         // 836
    }                                                                                                            // 837
};                                                                                                               // 838
ThreeBSP.Polygon.prototype.splitPolygon = function(polygon, coplanar_front, coplanar_back, front, back) {        // 839
    var classification = this.classifySide(polygon);                                                             // 840
                                                                                                                 // 841
    if (classification === COPLANAR) {                                                                           // 842
                                                                                                                 // 843
        (this.normal.dot(polygon.normal) > 0 ? coplanar_front : coplanar_back).push(polygon);                    // 844
                                                                                                                 // 845
    } else if (classification === FRONT) {                                                                       // 846
                                                                                                                 // 847
        front.push(polygon);                                                                                     // 848
                                                                                                                 // 849
    } else if (classification === BACK) {                                                                        // 850
                                                                                                                 // 851
        back.push(polygon);                                                                                      // 852
                                                                                                                 // 853
    } else {                                                                                                     // 854
                                                                                                                 // 855
        var vertice_count,                                                                                       // 856
                i, j, ti, tj, vi, vj,                                                                            // 857
                t, v,                                                                                            // 858
                f = [],                                                                                          // 859
                b = [];                                                                                          // 860
                                                                                                                 // 861
        for (i = 0, vertice_count = polygon.vertices.length; i < vertice_count; i++) {                           // 862
                                                                                                                 // 863
            j = (i + 1) % vertice_count;                                                                         // 864
            vi = polygon.vertices[i];                                                                            // 865
            vj = polygon.vertices[j];                                                                            // 866
            ti = this.classifyVertex(vi);                                                                        // 867
            tj = this.classifyVertex(vj);                                                                        // 868
                                                                                                                 // 869
            if (ti != BACK)                                                                                      // 870
                f.push(vi);                                                                                      // 871
            if (ti != FRONT)                                                                                     // 872
                b.push(vi);                                                                                      // 873
            if ((ti | tj) === SPANNING) {                                                                        // 874
                t = (this.w - this.normal.dot(vi)) / this.normal.dot(vj.clone().subtract(vi));                   // 875
                v = vi.interpolate(vj, t);                                                                       // 876
                f.push(v);                                                                                       // 877
                b.push(v);                                                                                       // 878
            }                                                                                                    // 879
        }                                                                                                        // 880
                                                                                                                 // 881
                                                                                                                 // 882
        if (f.length >= 3)                                                                                       // 883
            front.push(new ThreeBSP.Polygon(f).calculateProperties());                                           // 884
        if (b.length >= 3)                                                                                       // 885
            back.push(new ThreeBSP.Polygon(b).calculateProperties());                                            // 886
    }                                                                                                            // 887
};                                                                                                               // 888
                                                                                                                 // 889
ThreeBSP.Vertex = function(x, y, z, normal, uv) {                                                                // 890
    this.x = x;                                                                                                  // 891
    this.y = y;                                                                                                  // 892
    this.z = z;                                                                                                  // 893
    this.normal = normal || new THREE.Vector3;                                                                   // 894
    this.uv = uv || new THREE.Vector2;                                                                           // 895
};                                                                                                               // 896
ThreeBSP.Vertex.prototype.clone = function() {                                                                   // 897
    return new ThreeBSP.Vertex(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());                    // 898
};                                                                                                               // 899
ThreeBSP.Vertex.prototype.add = function(vertex) {                                                               // 900
    this.x += vertex.x;                                                                                          // 901
    this.y += vertex.y;                                                                                          // 902
    this.z += vertex.z;                                                                                          // 903
    return this;                                                                                                 // 904
};                                                                                                               // 905
ThreeBSP.Vertex.prototype.subtract = function(vertex) {                                                          // 906
    this.x -= vertex.x;                                                                                          // 907
    this.y -= vertex.y;                                                                                          // 908
    this.z -= vertex.z;                                                                                          // 909
    return this;                                                                                                 // 910
};                                                                                                               // 911
ThreeBSP.Vertex.prototype.multiplyScalar = function(scalar) {                                                    // 912
    this.x *= scalar;                                                                                            // 913
    this.y *= scalar;                                                                                            // 914
    this.z *= scalar;                                                                                            // 915
    return this;                                                                                                 // 916
};                                                                                                               // 917
ThreeBSP.Vertex.prototype.cross = function(vertex) {                                                             // 918
    var x = this.x,                                                                                              // 919
            y = this.y,                                                                                          // 920
            z = this.z;                                                                                          // 921
                                                                                                                 // 922
    this.x = y * vertex.z - z * vertex.y;                                                                        // 923
    this.y = z * vertex.x - x * vertex.z;                                                                        // 924
    this.z = x * vertex.y - y * vertex.x;                                                                        // 925
                                                                                                                 // 926
    return this;                                                                                                 // 927
};                                                                                                               // 928
ThreeBSP.Vertex.prototype.normalize = function() {                                                               // 929
    var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);                                 // 930
                                                                                                                 // 931
    this.x /= length;                                                                                            // 932
    this.y /= length;                                                                                            // 933
    this.z /= length;                                                                                            // 934
                                                                                                                 // 935
    return this;                                                                                                 // 936
};                                                                                                               // 937
ThreeBSP.Vertex.prototype.dot = function(vertex) {                                                               // 938
    return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;                                            // 939
};                                                                                                               // 940
ThreeBSP.Vertex.prototype.lerp = function(a, t) {                                                                // 941
    this.add(                                                                                                    // 942
            a.clone().subtract(this).multiplyScalar(t)                                                           // 943
            );                                                                                                   // 944
                                                                                                                 // 945
    this.normal.add(                                                                                             // 946
            a.normal.clone().sub(this.normal).multiplyScalar(t)                                                  // 947
            );                                                                                                   // 948
                                                                                                                 // 949
    this.uv.add(                                                                                                 // 950
            a.uv.clone().sub(this.uv).multiplyScalar(t)                                                          // 951
            );                                                                                                   // 952
                                                                                                                 // 953
    return this;                                                                                                 // 954
};                                                                                                               // 955
ThreeBSP.Vertex.prototype.interpolate = function(other, t) {                                                     // 956
    return this.clone().lerp(other, t);                                                                          // 957
};                                                                                                               // 958
ThreeBSP.Vertex.prototype.applyMatrix4 = function(m) {                                                           // 959
                                                                                                                 // 960
    // input: THREE.Matrix4 affine matrix                                                                        // 961
                                                                                                                 // 962
    var x = this.x, y = this.y, z = this.z;                                                                      // 963
                                                                                                                 // 964
    var e = m.elements;                                                                                          // 965
                                                                                                                 // 966
    this.x = e[0] * x + e[4] * y + e[8] * z + e[12];                                                             // 967
    this.y = e[1] * x + e[5] * y + e[9] * z + e[13];                                                             // 968
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14];                                                            // 969
                                                                                                                 // 970
    return this;                                                                                                 // 971
                                                                                                                 // 972
}                                                                                                                // 973
                                                                                                                 // 974
                                                                                                                 // 975
ThreeBSP.Node = function(polygons) {                                                                             // 976
    var i, polygon_count,                                                                                        // 977
            front = [],                                                                                          // 978
            back = [];                                                                                           // 979
                                                                                                                 // 980
    this.polygons = [];                                                                                          // 981
    this.front = this.back = undefined;                                                                          // 982
                                                                                                                 // 983
    if (!(polygons instanceof Array) || polygons.length === 0)                                                   // 984
        return;                                                                                                  // 985
                                                                                                                 // 986
    this.divider = polygons[0].clone();                                                                          // 987
                                                                                                                 // 988
    for (i = 0, polygon_count = polygons.length; i < polygon_count; i++) {                                       // 989
        this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);                       // 990
    }                                                                                                            // 991
                                                                                                                 // 992
    if (front.length > 0) {                                                                                      // 993
        this.front = new ThreeBSP.Node(front);                                                                   // 994
    }                                                                                                            // 995
                                                                                                                 // 996
    if (back.length > 0) {                                                                                       // 997
        this.back = new ThreeBSP.Node(back);                                                                     // 998
    }                                                                                                            // 999
};                                                                                                               // 1000
ThreeBSP.Node.isConvex = function(polygons) {                                                                    // 1001
    var i, j;                                                                                                    // 1002
    for (i = 0; i < polygons.length; i++) {                                                                      // 1003
        for (j = 0; j < polygons.length; j++) {                                                                  // 1004
            if (i !== j && polygons[i].classifySide(polygons[j]) !== BACK) {                                     // 1005
                return false;                                                                                    // 1006
            }                                                                                                    // 1007
        }                                                                                                        // 1008
    }                                                                                                            // 1009
    return true;                                                                                                 // 1010
};                                                                                                               // 1011
ThreeBSP.Node.prototype.build = function(polygons) {                                                             // 1012
    var i, polygon_count,                                                                                        // 1013
            front = [],                                                                                          // 1014
            back = [];                                                                                           // 1015
                                                                                                                 // 1016
    if (!this.divider) {                                                                                         // 1017
        this.divider = polygons[0].clone();                                                                      // 1018
    }                                                                                                            // 1019
                                                                                                                 // 1020
    for (i = 0, polygon_count = polygons.length; i < polygon_count; i++) {                                       // 1021
        this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);                       // 1022
    }                                                                                                            // 1023
                                                                                                                 // 1024
    if (front.length > 0) {                                                                                      // 1025
        if (!this.front)                                                                                         // 1026
            this.front = new ThreeBSP.Node();                                                                    // 1027
        this.front.build(front);                                                                                 // 1028
    }                                                                                                            // 1029
                                                                                                                 // 1030
    if (back.length > 0) {                                                                                       // 1031
        if (!this.back)                                                                                          // 1032
            this.back = new ThreeBSP.Node();                                                                     // 1033
        this.back.build(back);                                                                                   // 1034
    }                                                                                                            // 1035
};                                                                                                               // 1036
ThreeBSP.Node.prototype.allPolygons = function() {                                                               // 1037
    var polygons = this.polygons.slice();                                                                        // 1038
    if (this.front)                                                                                              // 1039
        polygons = polygons.concat(this.front.allPolygons());                                                    // 1040
    if (this.back)                                                                                               // 1041
        polygons = polygons.concat(this.back.allPolygons());                                                     // 1042
    return polygons;                                                                                             // 1043
};                                                                                                               // 1044
ThreeBSP.Node.prototype.clone = function() {                                                                     // 1045
    var node = new ThreeBSP.Node();                                                                              // 1046
                                                                                                                 // 1047
    node.divider = this.divider.clone();                                                                         // 1048
    node.polygons = this.polygons.map(function(polygon) {                                                        // 1049
        return polygon.clone();                                                                                  // 1050
    });                                                                                                          // 1051
    node.front = this.front && this.front.clone();                                                               // 1052
    node.back = this.back && this.back.clone();                                                                  // 1053
                                                                                                                 // 1054
    return node;                                                                                                 // 1055
};                                                                                                               // 1056
ThreeBSP.Node.prototype.invert = function() {                                                                    // 1057
    var i, polygon_count, temp;                                                                                  // 1058
                                                                                                                 // 1059
    for (i = 0, polygon_count = this.polygons.length; i < polygon_count; i++) {                                  // 1060
        this.polygons[i].flip();                                                                                 // 1061
    }                                                                                                            // 1062
                                                                                                                 // 1063
    this.divider.flip();                                                                                         // 1064
    if (this.front)                                                                                              // 1065
        this.front.invert();                                                                                     // 1066
    if (this.back)                                                                                               // 1067
        this.back.invert();                                                                                      // 1068
                                                                                                                 // 1069
    temp = this.front;                                                                                           // 1070
    this.front = this.back;                                                                                      // 1071
    this.back = temp;                                                                                            // 1072
                                                                                                                 // 1073
    return this;                                                                                                 // 1074
};                                                                                                               // 1075
ThreeBSP.Node.prototype.clipPolygons = function(polygons) {                                                      // 1076
    var i, polygon_count,                                                                                        // 1077
            front, back;                                                                                         // 1078
                                                                                                                 // 1079
    if (!this.divider)                                                                                           // 1080
        return polygons.slice();                                                                                 // 1081
                                                                                                                 // 1082
    front = [], back = [];                                                                                       // 1083
                                                                                                                 // 1084
    for (i = 0, polygon_count = polygons.length; i < polygon_count; i++) {                                       // 1085
        this.divider.splitPolygon(polygons[i], front, back, front, back);                                        // 1086
    }                                                                                                            // 1087
                                                                                                                 // 1088
    if (this.front)                                                                                              // 1089
        front = this.front.clipPolygons(front);                                                                  // 1090
    if (this.back)                                                                                               // 1091
        back = this.back.clipPolygons(back);                                                                     // 1092
    else                                                                                                         // 1093
        back = [];                                                                                               // 1094
                                                                                                                 // 1095
    return front.concat(back);                                                                                   // 1096
};                                                                                                               // 1097
                                                                                                                 // 1098
ThreeBSP.Node.prototype.clipTo = function(node) {                                                                // 1099
    this.polygons = node.clipPolygons(this.polygons);                                                            // 1100
    if (this.front)                                                                                              // 1101
        this.front.clipTo(node);                                                                                 // 1102
    if (this.back)                                                                                               // 1103
        this.back.clipTo(node);                                                                                  // 1104
};                                                                                                               // 1105
                                                                                                                 // 1106
                                                                                                                 // 1107
                                                                                                                 // 1108
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
