var DrawShape = function(format,container){
	// "use strict";
	var s = this || {};
	var init = {
		'strokeSVG'	: {
			'solid' : 'stroke:rgba(150,150,150,1);stroke-width:1;stroke-linecap:butt;stroke-dasharray:none;',
			'dash'  : 'stroke:rgba(150,150,150,1);stroke-width:1.5;stroke-linecap:butt;stroke-dasharray:5,5;',
	    'none'  : 'stroke:rgba(255,255,255,0);stroke-width:0;'
		},
		'strokePNG'	: {
			'solid' : [],
			'dash'  : [3,6],
		},
	  'center': 0,
		'reduce' : {
			'min' : 170,
			'mid' : 180,
			'max' : 190,
		},
	  'inch' : 96,
	  'the_shape'     : [],
	  'the_base'      : [],
	  'the_surrounds' : [],
	  'the_mirror'    : [],
	  'the_connect'   : [],
	  'the_tabs'      : [],
	  'the_data'      : [],
		'bounds'        : {
			'top'    : 0,
			'bottom' : 0,
			'left'   : 0,
			'right'  : 0,
		},
		'scaled'        : false,
	  'x'             : 0,
	  'y'             : 1,
	  'a'             : 2,
	  'temple'        : 0,
	  'offset'        : 30,
		'image'         : '/static/img/pattern/kw5.png',
		'format'        : format,
		'container'     : (container == undefined) ? 'results' : container,
	}

	s.geom = {
	  range: function(min, max, val){
	    return Math.round( (val/100)*(max-min)+min );
	  },
	  ratio: function(goal, winner, racer){
	    return (goal/winner)*racer;
	  },
	  percent: function(min, max, val){
	    return val/(max-min);
	  },
	  maximum: function(array){
	    return Math.max.apply( Math, array );
	  },
	  minimum: function(array){
	    return Math.min.apply( Math, array );
	  },
		// input b or B as false to determine side/angle disambiguation
		degree: function(radian){
			return radian * (180 / Math.PI);
		},
	  // GOOD
		radian: function(degree){
			return degree * (Math.PI / 180);
		},
	  // GOOD
		lawofsines: function(a,A,b,B){
			// where side a / sin(angle A) == side b / sin(angle B)
			if(b == false){
				var side = Math.sin(B) * (a / Math.sin(A));
				return side;
			} else if (B == false){
				// console.log(a,A,b);
				var angle = Math.asin( (Math.sin(A)/a) * b );
				return angle;
			} else {
				console.log('yo lawofsines is broke');
			}
		},
		lawofcosines: function(a,A,b){
			return Math.sqrt(b*b + a*a - (2*a*b)*Math.cos(A) );
		},
	  angle_between: function(a,b){
			var c = s.geom.distance([ a[1],b[1] ]),
					a = s.geom.distance(a),
					b = s.geom.distance(b);
			// using the Law of Cosines:
			return Math.acos( (a*a + b*b - c*c) / (2*a*b) );
		},
	  // GOOD
		hypotenuse: function(a,b){
			return Math.sqrt(a*a + b*b);
		},
	  axis: function(coords){
			if( coords[0][init.x] != coords[1][init.x] && coords[0][init.y] == coords[1][init.y] ) {
				return init.x;
			} else if( coords[0][init.y] != coords[1][init.y] && coords[0][init.x] == coords[1][init.x] ) {
				return init.y;
			} else {
				return init.a;
			}
		},
		delta: function(a,b){
	    if (!b) {
	      return {
					'x' : a[1][init.x] - a[0][init.x],
					'y' : a[1][init.y] - a[0][init.y],
	  		}
	    } else {
	      return {
					'x' : a.x - b.x,
					'y' : a.y - b.y,
	  		}
	    }
		},
	  // GOOD
		distance: function(a,b){
			var d = !b ? s.geom.delta(a) : o.geom.delta(a, b);
	    return s.geom.hypotenuse(d.x,d.y);
		},
	  angle: function(coords){
			var d = s.geom.delta(coords),
					angle = 0,
					dir = '',
					oa = Math.abs(d.y/d.x);
			if (d.x == 0 && d.y < 0){
				// north, pi/2, 90
				dir = 'n ';
				angle = Math.PI/2;
			} else if (d.x < 0 && d.y == 0){
				// west, pi, 180
				dir = 'w ';
				angle  = Math.PI;
			} else if (d.x == 0 && d.y > 0){
				// south, 3pi/2, 270
				dir = 's ';
				angle = Math.PI*1.5;
			} else if (d.x > 0 && d.y == 0){
				// east, 0 or 2pi
				dir = 'e ';
				angle = 0;
			} else if (d.x > 0 && d.y < 0){
				// northeast, from 0 or 2pi
				dir = 'ne';
				angle = Math.atan(oa);
			} else if (d.x < 0 && d.y < 0){
				// northwest, 180 - angle
				dir = 'nw';
				angle = Math.PI - Math.atan(oa);
			} else if (d.x < 0 && d.y > 0){
				// southwest, 180 + angle
				dir = 'sw';
				angle = Math.PI + Math.atan(oa);
			} else if (d.x > 0 && d.y > 0 ){
				// southeast, 360 - angle
				dir = 'se';
				angle = 2*Math.PI - Math.atan(oa);
			}

			return Math.abs(angle);
		},
	  direction: function(coords){
			var compass = '',
					d = s.geom.delta(coords),
					x = d.x / Math.abs(d.x) || 0,
					y = d.y / Math.abs(d.y) || 0;
			if (y > 0){
				compass += 'south';
			} else if (y < 0) {
				compass += 'north';
			}
			if (x > 0){
				compass += 'east';
			} else if (x < 0) {
				compass += 'west';
			}
			return {
				'compass' : compass,
				'x'       : x,
				'y'       : y,
			};
		},
	  midpoint: function(coords){
			var mx = (coords[0][init.x] + coords[1][init.x])/2,
					my = (coords[0][init.y] + coords[1][init.y])/2;
			var segment = [
				[ coords[0][init.x], coords[0][init.y] ],
				[ mx, my ],
			];
			return {
				'x' : mx,
				'y' : my,
				'distance' : s.geom.distance(segment),
				'delta' : s.geom.delta(segment),
			};
		},
	}

	s.util = {
	  push: function(segment, the_array){
			init[the_array].push(segment);
			init.the_shape.push(segment);
			init.the_data.push(s.get.data(segment));
		},
	}

	s.get = {
	  data:function(coords) {
			var data = {
				'x0'        : coords[0][init.x],
				'y0'        : coords[0][init.y],
				'x1'        : coords[1][init.x],
				'y1'        : coords[1][init.y],
				'distance'  : s.geom.distance(coords),
				'axis'      : s.geom.axis(coords),
				'angle'     : s.geom.angle(coords),
				'delta'     : s.geom.delta(coords),
				'direction' : s.geom.direction(coords),
				'midpoint'  : s.geom.midpoint(coords),
			};
			s.get.bounds([data.x0, data.x1], [data.y0, data.y1]);
			return data;
		},
		bounds: function(xs, ys){
			// must be called before new data is pushed to the_data
			var bound = init.bounds;
			if (init.the_data.length < 1){
				bound.left   = (xs[0] < xs[1]) ? xs[0] : xs[1];
				bound.right  = (xs[0] > xs[1]) ? xs[0] : xs[1];
				bound.top    = (ys[0] < ys[1]) ? ys[0] : ys[1];
				bound.bottom = (ys[0] > ys[1]) ? ys[0] : ys[1];
			} else {
				for (var x in xs){
					bound.left  = (xs[x] < bound.left)  ? xs[x] : bound.left;
					bound.right = (xs[x] > bound.right) ? xs[x] : bound.right;
				}
				for (var y in ys){
					bound.top    = (ys[y] < bound.top)    ? ys[y] : bound.top;
					bound.bottom = (ys[y] > bound.bottom) ? ys[y] : bound.bottom;
				}
			}
			// console.log(init.bounds);
		},
		translation: function(){
			var scale, x, y;
			if (init.scaled == false) {
				var bound_width  = Math.abs(init.bounds.left - init.bounds.right);
				var bound_height = Math.abs(init.bounds.top - init.bounds.bottom);
				if (bound_width/bound_height > 8.5/11){
					scale = (init.inch*8.5)*(1/bound_width);
				} else {
					scale = (init.inch*11)*(1/bound_height);
				}
				init.scaled = true;
			} else {
				scale = 1;
			}
			// x = Math.abs(0 - init.bounds.left*scale);
			// y = Math.abs(0 -init.bounds.top*scale);
			var difference = {
				'x' : (init.inch*8.5 - (init.bounds.right*scale - init.bounds.left*scale))/2,
				'y' : (init.inch*11 - (init.bounds.bottom*scale - init.bounds.top*scale))/2,
			}
			x = Math.abs(0 - init.bounds.left*scale) + difference.x;
			y = Math.abs(0 -init.bounds.top*scale) + difference.y;
			return {
				'scale' : scale,
				'x' : x,
				'y' : y,
			};
		},
	  correlation: function(i,j,k){
			//  in this step, the tubes must correlate to male counterpoints
			// these points are reversed because direction of surrounds
			// to get tube0 to point to prong0, start tube0 from female point 1
			var exists = true;
			if (i < init.the_base.length) {
				var male  = i, // 1
						female  = i+init.the_surrounds.length, // 4
						tube_a = i-1+init.the_mirror.length*2, // 14
						tube_b = i+init.the_mirror.length*2; // 15
			} else if (i < init.the_mirror.length) {
				i = (j && (i+1 != init.the_mirror.length)) ? i+1 : i;
				var male  = i, // 5
						female  = i-init.the_surrounds.length, // 2
						tube_b = i-init.the_base.length; //
						if (i-init.the_base.length+2 < init.the_base.length){
							var tube_a = i-init.the_base.length+2;
						} else{
							var tube_a = 0;
						}
			} else if (i+1 == init.the_mirror.length*2) {
				i+=1;
				var male   = i,
						female = i + init.the_connect.length - 1,
						tube_a  = 0,
						tube_b  = i/2;
			} else if (i == k && !j) {
				var male   = i,
						female = i - init.the_connect.length + 1,
						tube_a  = init.the_mirror.length + init.the_base.length,
						tube_b  = init.the_mirror.length - init.the_surrounds.length;
			} else {
				exists = false;
			}
			return {
				'male'   : init.the_data[male],
				'female' : init.the_data[female],
				'tube'   : {
					'a' : init.the_data[tube_a],
					'b' : init.the_data[tube_b],
				},
				'exists' : exists,
			}
		},
	  tubes: function(female,tube){
			var correction = {
				'a' : 1,
				'b' : 1,
			}
			var cross = {
				'af' : (tube.b.x1 - tube.a.x1)*(female.y1 - tube.a.y1) - (tube.b.y1 - tube.a.y1)*(female.x1 - tube.a.x1),
				'bf' : (tube.b.x0 - tube.a.x0)*(female.y0 - tube.a.y0) - (tube.b.y0 - tube.a.y0)*(female.x0 - tube.a.x0),
			}
			if ( (tube.a.x0 == female.x1 && tube.a.y0 == female.y1) && (tube.b.x1 == female.x0 && tube.b.y1 == female.y0) ){
				correction.a = 1;
				correction.b = -1;
				if( cross.af > 0 ) {
					correction.a = 0.01;
				} else if(cross.bf > 0) {
					correction.b = 0.01;
				} else {
				}
			}
			var prong_a = [
				[ female.x0, female.y0 ],
				[ female.x0 + tube.a.midpoint.delta.x * correction.a, female.y0 + tube.a.midpoint.delta.y * correction.a ],
			];
			var prong_b = [
				[ female.x1, female.y1 ],
				[ female.x1 + tube.b.midpoint.delta.x * correction.b, female.y1 + tube.b.midpoint.delta.y * correction.b ],
			];
			return {
				'a' : prong_a,
				'b' : prong_b,
			}
		},
	  theta: function(a,b,male){
			// tubes.a, tubes.b, correlation.male.angle
			var m = {
				'a': [ a[0], b[0]	],
				'b': [ b[0], a[0]	],
			}
			var taper = 0.0;
			var theta = {
				'a' : s.geom.angle_between(a,m.a),
				'b' : s.geom.angle_between(b,m.b),
			}
			return {
				'a' : Math.PI - (Math.PI - male) - (Math.PI - theta.a) + taper,
				'b' : male - theta.b - taper,
			};
		},
	  stroke: function(i){
			var style = {
				'even' : (init.the_base.length%2 == 0) ? true : false,
				'base' : {
					'a' : init.the_base.length,
					'b' : init.the_base.length + init.the_mirror.length,
				},
				'mirror' : {
					'a' : init.the_mirror.length,
					'b' : init.the_mirror.length*2,
				},
				"tabs" : init.the_data.length - init.the_tabs.length - 1,
			}
			var mode = 'solid';
			if(i < style.tabs){
				if(style.even){
					if(i < style.mirror.a){
						if(i == 0 || i%2 > 0){
							mode = 'dash';
						}
					} else if (i < style.mirror.b) {
						if(i == style.mirror.a || i%2 == 0){
							mode = 'dash';
						}
					} else {
						mode = 'dash';
					}
				} else {
					if(i < style.base.a){
						if(i == 0 || i%2 > 0){
							mode = 'dash';
						}
					} else if (i < style.base.b){
						if(i == style.mirror.a || i%2 == 0){
							mode = 'dash';
						}
					} else if (i < style.mirror.b){
						if(i%2 > 0){
							mode = 'dash';
						}
					} else {
						mode = 'dash';
					}
				}
			}
			return mode;
		},
		fill: function(type){
			var points = [];
			var poly = [];

			if (type == 'initial'){
				for (i = 0; i < init.the_base.length; i++){
					points.push( [init.the_data[i].x0, init.the_data[i].y0] );
				}
				poly.push(points);
			} else if (type == 'mirror'){
				for (i = init.the_mirror.length; i < init.the_mirror.length+init.the_base.length; i++){
					points.push( [init.the_data[i].x0, init.the_data[i].y0] );
				}
				poly.push(points);
			} else if (type =='center'){
				for(var i = init.the_mirror.length*2; i < init.the_mirror.length*2+init.the_connect.length-1; i++){
					poly.push([
						[[init.the_data[i].x0, init.the_data[i].y0],[init.the_data[i].x1, init.the_data[i].y1]],
						[[init.the_data[i+1].x1, init.the_data[i+1].y1],[init.the_data[i+1].x0, init.the_data[i+1].y0]],
					]);
				}
			}
			return poly;
		},
		fillPNG: function(type){
			var points = [];
			var poly = [];

			if (type == 'initial'){
				for (i = 0; i < init.the_base.length; i++){
					poly.push( [init.the_data[i].x0, init.the_data[i].y0] );
				}
			} else if (type == 'mirror'){
				for (i = init.the_mirror.length; i < init.the_mirror.length+init.the_base.length; i++){
					poly.push( [init.the_data[i].x0, init.the_data[i].y0] );
				}
			} else if (type =='center'){
				for(var i = init.the_mirror.length*2; i < init.the_mirror.length*2+init.the_connect.length; i++){
					points.push([init.the_data[i].x0, init.the_data[i].y0]);
					// points.push([init.the_data[i].x1, init.the_data[i].y1]);
					poly.push(points);
				}
				for(var i = init.the_mirror.length*2+init.the_connect.length-1; i > init.the_mirror.length*2-1; i--){
					// points.push([init.the_data[i].x0, init.the_data[i].y0]);
					points.push([init.the_data[i].x1, init.the_data[i].y1]);
					poly.push(points);
				}
			} else if (type == 'all'){
				// TODO
				// 	for(i =init.the_data.length-1; i > init.the_data.length-init.the_tabs.length-init.the_mirror.length; i--){
				// 		poly.push( [init.the_data[i].x0, init.the_data[i].y0] );
				// 	}
				// 	for(i = (init.the_base.length-1)*2; i > init.the_base.length-1; i--){
				// 		poly.push( [init.the_data[i].x0, init.the_data[i].y0] );
				// 	}
				// 	var connect = init.the_data.length-init.the_tabs.length-init.the_connect.length+1;
				// 	poly.push( [init.the_data[connect].x0, init.the_data[connect].y0] )
			}
			return poly;
		},
	}

	s.process = {
	  data: function(settings){
	    var base = s.geom.radian(settings.base);
	    var grain = settings.grain;
	    var bump = settings.bump;
	    init.image = settings.image;
	    init.temple = settings.temple;
	    var angle = (2*Math.PI - base)/(grain-1);

			var data = [];
			var data_splice = [];

			for (var i = 0; i < grain; i++){
				data[i] = {};
			}

			for (var i = 0; i < data.length; i++){
				data[i] = {
					'distance' : {
						'radius'    : 0,
						'perimeter' : 0,
					},
					'theta'  : {
						'origin'   : 0,
						'radius'   : 0,
						'return'   : 0,
						'advance'  : 0,
						'across'   : 0,
					},
					'x' : 0,
					'y' : 0,
				}
				var d = data[i];

				d.distance.radius = bump[i]
				d.theta.origin = base/2 + angle*i;
				d.theta.radius = (i == 0 || i == grain) ? base : angle;
				d.x = init.center + d.distance.radius * Math.cos(d.theta.origin)
				d.y = init.center + d.distance.radius * Math.sin(d.theta.origin);
			}

			for(var i in data){
				var current  = data[i];
				var previous = (i > 0) ? data[parseInt(i)-1] : data[data.length-1];
				current.distance.perimeter = s.geom.lawofcosines(current.distance.radius, current.theta.radius, previous.distance.radius);
				// determine the shorter side -> angle for law of sines
				if(current.distance.radius < previous.distance.radius){
					current.theta.advance = s.geom.lawofsines(current.distance.perimeter, current.theta.radius, current.distance.radius, false);
					current.theta.return = Math.PI - (current.theta.radius + current.theta.advance);
				} else {
					current.theta.return = s.geom.lawofsines(current.distance.perimeter, current.theta.radius, previous.distance.radius, false);
					current.theta.advance = Math.PI - (current.theta.radius + current.theta.return);
				}
			}

			for(var i in data){
				var current  = data[i];
				var next     = (parseInt(i) < data.length-1) ? data[parseInt(i)+1] : data[0];
				current.theta.across = current.theta.return + next.theta.advance;
				if( current.theta.across < s.geom.radian(init.reduce.min) || current.theta.across > s.geom.radian(init.reduce.max) || i == 0 || i == data.length-1){
					data_splice.push(data[i]);
				}
			}
	    init.offset = data_splice[0].distance.perimeter/2;
			s.process.starter(data_splice.reverse());
	  },

	  starter: function(data){
			var starter  = [];
			var points = [];
			for(var i in data){
	      var b = parseInt(i);
	      var a = (b > 0) ? b-1 : data.length-1;
	      starter.push(data[a].x,data[a].y,data[b].x,data[b].y);
	      points.push(data[i].x);
	    }
			// console.log('temple: ', init.temple, init.offset);
	    var distance = s.geom.maximum(points) - s.geom.minimum(points);
			// console.log(points, distance);
			// correction to prevent flattening on angle
			if( init.offset < distance ){
				init.temple = init.temple * s.geom.lawofsines(distance, s.geom.radian(90), init.offset, false);
			} else {
				init.temple = init.temple * s.geom.lawofsines(distance, s.geom.radian(90), distance*0.99, false);
			}
			// console.log(init.temple);
	    s.build.initialize(starter)
		}
	}

	s.build = {
	  initialize: function(data) {
			var print_page = document.createElement('div');
			print_page.className = 'page-size';
			document.body.appendChild(print_page);
			init.inch = print_page.offsetWidth/8.5;

			for(var i = 0; i < data.length-3; i+=4) {
				var segment = [
					[ data[i],  data[i+1] ],
					[ data[i+2], data[i+3] ],
				];
				s.util.push(segment,'the_base');
			}
			s.build.surround(init.the_shape);
			s.build.mirror(init.the_shape, 'vertical', 0, 'the_mirror');
			s.build.connect(init.the_shape);
			s.build.tabs();
			s.build.mirror(init.the_tabs, 'vertical', 0, 'the_tabs');

			if(init.format == 'png'){
				var img = new Image();
				img.src = init.image;
				img.onload = function(){
					print_page.remove();
					s.build.drawPNG(this);
				}
			} else {
				s.build.drawSVG();
			}
	  },
		drawSVG: function() {
			var scale = s.get.scale();
			var draw = SVG('canvas').size(init.inch*8.5, init.inch*11).spof();
			var groups = {
				'obj'  : draw.group(),
				'body' : draw.group(),
				'fill' : draw.group(),
				'tabs' : draw.group(),
			}
			for (i in init.the_data){
				init.the_data[i].x0 = init.the_data[i].x0*scale;
				init.the_data[i].y0 = init.the_data[i].y0*scale;
				init.the_data[i].x1 = init.the_data[i].x1*scale;
				init.the_data[i].y1 = init.the_data[i].y1*scale;
				var mode = init.strokeSVG[s.get.stroke(i)];
				var line = draw.line( init.the_data[i].x0, init.the_data[i].y0, init.the_data[i].x1, init.the_data[i].y1 ).style( mode );
				if(i < init.the_data.length-init.the_tabs.length){
					groups.body.add(line);
				} else {
					groups.tabs.add(line);
				}
			}
			var polygon = {
				'initial' : {
					'plot'    : s.get.fill('initial'),
				},
				'mirror'  : {
					'plot'    : s.get.fill('mirror'),
				},
				'center'  : {
					'plot'    : s.get.fill('center'),
				}
			}
			var p = [];
			for (var i in polygon){
				for(var j in polygon[i].plot){
					var instance = i+j;
					p[instance] = draw
						.polygon(polygon[i].plot[j])
						.fill(init.image)
						.stroke(init.strokeSVG.none)
					;
					groups.fill.add( p[instance] );
				}
			}
			groups.obj.add(groups.tabs);
			groups.obj.add(groups.fill);
			groups.obj.add(groups.body);
			groups.obj.cx((init.inch*8.5)/2-groups.obj.bbox().x);
			groups.obj.cy((init.inch*11) /2-groups.obj.bbox().y);
		},
		drawPNG: function(img){
			var mode;
			var translate = s.get.translation();
			for (i in init.the_data){
				init.the_data[i].x0 = (init.the_data[i].x0*translate.scale) + translate.x;
				init.the_data[i].y0 = (init.the_data[i].y0*translate.scale) + translate.y;
				init.the_data[i].x1 = (init.the_data[i].x1*translate.scale) + translate.x;
				init.the_data[i].y1 = (init.the_data[i].y1*translate.scale) + translate.y;
			}
			var canvas = document.createElement('canvas');
			canvas.width = init.inch*8.5;
			canvas.height = init.inch*11.0;

			var ctx = canvas.getContext('2d');
			var fill = {
				'initial' : s.get.fillPNG('initial'),
				'mirror'  : s.get.fillPNG('mirror'),
				'center'  : s.get.fillPNG('center'),
			}
			ctx.lineCap = 'butt';
			// TABS
			ctx.fillStyle = '#FCFCFC';
			ctx.strokeStyle = '#555555';
			ctx.lineWidth = 1;
			ctx.save();
			for (var i = init.the_data.length-init.the_tabs.length; i < init.the_data.length; i+=3){
				// mode = init.strokePNG[s.get.stroke(i)];
				ctx.setLineDash(init.strokePNG.solid);
				ctx.beginPath();
				ctx.moveTo( init.the_data[i].x0, init.the_data[i].y0 );
				ctx.lineTo( init.the_data[i].x1, init.the_data[i].y1 );
				ctx.lineTo( init.the_data[i+1].x1, init.the_data[i+1].y1 );
				ctx.lineTo( init.the_data[i+2].x1, init.the_data[i+2].y1 );
				ctx.fill();
				ctx.stroke();
			}
			ctx.restore();

			// LEFT FILL (BASE)
			ctx.fillStyle = ctx.createPattern(img, 'repeat');
			ctx.strokeStyle = '#FFFFFF';
			ctx.lineWidth = 12;
			mode = init.strokePNG.solid;
			ctx.save();
			for (var point in fill.initial){
				var poly = fill.initial;
				if (point > 0){
					ctx.lineTo(poly[point][init.x], poly[point][init.y]);
				} else {
					ctx.beginPath();
					ctx.moveTo(fill.initial[0][init.x], fill.initial[0][init.y]);
				}
			}
			ctx.closePath();
			ctx.clip();
			ctx.fill();
			ctx.stroke();
			ctx.restore();

			// RIGHT FILL (MIRROR)
			ctx.save();
			for (point in fill.mirror){
				var poly = fill.mirror;
				if (point > 0){
					ctx.lineTo(poly[point][init.x], poly[point][init.y]);
				} else {
					ctx.beginPath();
					ctx.moveTo(poly[point][init.x], poly[point][init.y]);
				}
			}
			ctx.closePath();
			ctx.clip();
			ctx.fill();
			ctx.stroke();
			ctx.restore();

			// CENTER FILL
			ctx.save();
			for (var each in fill.center){
				for (var more in fill.center[each]){
					var poly = fill.center[each];
					for (point in poly){
						if (point > 0){
							ctx.lineTo(poly[point][init.x], poly[point][init.y]);
						} else {
							ctx.beginPath();
							ctx.moveTo(poly[point][init.x], poly[point][init.y]);
						}
					}
				}
			}
			ctx.closePath();
			ctx.clip();
			ctx.fill();
			ctx.stroke();
			ctx.restore();

			// THE CONNECTS - WHITE
			ctx.strokeStyle = '#FFFFFF';
			ctx.lineWidth = 12;
			mode = init.strokePNG.solid;
			ctx.setLineDash(mode);
			for (var i = init.the_data.length-init.the_tabs.length-init.the_connect.length+1; i < init.the_data.length-init.the_tabs.length-1; i++){
				ctx.beginPath();
				ctx.moveTo( init.the_data[i].x0, init.the_data[i].y0 );
				ctx.lineTo( init.the_data[i].x1, init.the_data[i].y1 );
				ctx.stroke();
			}

			ctx.strokeStyle = '#555';
			ctx.lineWidth = 1;
			// LINES BEFORE TABS
			for (var i = 0; i < init.the_data.length-init.the_tabs.length; i++){
				mode = init.strokePNG[s.get.stroke(i)];
				ctx.setLineDash(mode);
				ctx.beginPath();
				ctx.moveTo( init.the_data[i].x0, init.the_data[i].y0 );
				ctx.lineTo( init.the_data[i].x1, init.the_data[i].y1 );
				ctx.stroke();
			}

			var export_shape = canvas.toDataURL();
			var page = document.getElementById(init.container);

			// var page = document.createElement('div');
			var anchor = document.createElement('a');
			var shape = document.createElement('img');

			page.className = 'page';
			shape.className = 'subpage';
			shape.setAttribute('src', export_shape);
			anchor.setAttribute('href',export_shape);
			anchor.setAttribute('target','_blank');
			anchor.appendChild(shape);
			page.appendChild(anchor);
			// result_container.appendChild(page);
		},
		surround: function(coords) {
			/******
			this steps takes the provided shape
			and calculates the surrounding (folded) edges.
			The calculations work backward (downward) from points
			i.e. --- 0->3, 3->2, 2->1 ---
			1->0 is ommitted because the edge already exists
			the shape is then flipped, to match up points in the correct direction
			******/
			var surround = [];
			// generate all calculations from previously solved points
			for (var i = init.the_base.length-1; i > 0; i--) {
				// x1 minus x0 implies counterclockwise creation of base-shape
				// angles in radians
				var angle = {
					'given' : init.temple,
					'right' : Math.PI/2,
					'found' : Math.PI/2 - init.temple,
				}
				var delta = {
					'x' : init.the_data[i].delta.x,
					'y' : init.the_data[i].delta.y,
				}
				var distance = {
					'x': s.geom.lawofsines(delta.x, angle.right, false, angle.given),
					'y': s.geom.hypotenuse( delta.y, s.geom.lawofsines(delta.x, angle.right, false, angle.found) ),
				}
				var point = (i < init.the_base.length-1) ? surround : init.the_shape;
				var previous = point.length-1;
				var segment = [
					[ point[previous][1][init.x], point[previous][1][init.y] ],
					[ point[previous][1][init.x]+distance.x, point[previous][1][init.y]+distance.y ]
				];
				surround.push(segment);
			}
			surround.reverse().forEach(function(segment){
				s.util.push(segment,'the_surrounds');
			});
		},
		mirror: function(coords,flip,origin,array){
				/******
						mirror over an axis,
						axis must be determined then negated in transforms

						the_axis + (the axis - the coord)
				******/
				var i = 0;
				var complete = (coords == init.the_tabs) ? coords.length-3 : coords.length;

				if (flip == 'vertical'){
					var axis = init.the_data[origin].x0 + init.offset;
					while (i < complete) {
						var segment = [
							[ axis + (axis - coords[i][0][init.x]), coords[i][0][init.y] ],
							[ axis + (axis - coords[i][1][init.x]), coords[i][1][init.y] ],
						];
						s.util.push(segment,array);
						i++;
					}
				}
		},
		connect: function(coords){
			var connect = [];
			var split = [];
			var complete = coords.length/2;
			for (var i = 0; i < complete; i++) {
				var j = i+complete;
				var segment = [
						[ init.the_data[i].x1, init.the_data[i].y1 ],
						[ init.the_data[j].x1, init.the_data[j].y1 ],
				];
				connect.push(segment);
				if (i == 0) {
					var segment = [
							[ init.the_data[i].x0, init.the_data[i].y0 ],
							[ init.the_data[j].x0, init.the_data[j].y0 ],
					];
					connect.push(segment);
					split = connect.splice(0,connect.length);
					i = init.the_surrounds.length;
				}
			}
			split.concat(connect.reverse()).reverse().forEach(function(segment){
				s.util.push(segment,'the_connect');
			});
		},
		tabs: function(){
			var i = 1;
			var j = (init.the_base.length%2 > 0) ? true : false;
			var k = init.the_shape.length-1;

			while (i <= k){
				var correlation = s.get.correlation(i,j,k);
				if (correlation.exists){
					var tubes = s.get.tubes(correlation.female,correlation.tube);
					var theta = s.get.theta(tubes.a,tubes.b,correlation.male.angle);
					var distance = {
						'a' : s.geom.distance(tubes.a),
						'b' : s.geom.distance(tubes.b),
					}

					// var correction = (i == k) ? Math.PI : 0;
					var correction = 0;
					var prongs = {
						'a' : {
							'x' : distance.a * Math.cos(theta.a + correction),
							'y' : distance.a * Math.sin(theta.a + correction),
						},
						'b' : {
							'x' : distance.b * Math.cos(theta.b + correction),
							'y' : distance.b * Math.sin(theta.b + correction),
						},
						'origin' : correlation.male,
					}
	        var tabs = [
	    			[prongs.origin.x0, prongs.origin.y0],
	    			[prongs.origin.x0 + prongs.a.x, prongs.origin.y0 - prongs.a.y],
	    			[prongs.origin.x1 + prongs.b.x, prongs.origin.y1 - prongs.b.y],
	    			[prongs.origin.x1, prongs.origin.y1],
	    		];
	    		for (var l = 0; l < tabs.length-1; l++){
	    			var segment = [
	    				tabs[l],
	    				tabs[l+1],
	    			];
	    			s.util.push(segment,'the_tabs');
	    		}
				}
				i+=2;
			}
		}
	}
}