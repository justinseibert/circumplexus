var Circumplexus = function(format,container){
	// "use strict";
	var cpx = this || {};
	cpx.x = 0,
	cpx.y = 1,
	cpx.a = 2,
	cpx.def = {
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
		'segment' : {},
	  'shape' : [],
		'bounds' : {
			'top'    : 0,
			'bottom' : 0,
			'left'   : 0,
			'right'  : 0,
		},
		'scaled'    : false,
	  'temple'    : 0,
	  'offset'    : 30,
		'image'     : '',
		'format'    : format,
		'container' : (container == undefined) ? 'results' : container,
	}
	cpx.update = function(segment, collection){
		cpx.def.shape.push(cpx.data(segment));
		var count = cpx.def.segment[collection];
		cpx.def.segment[collection] = (count == undefined) ? 1 : count+1;
	},
	cpx.data = function(coords){
		var data = {
			'x0'        : coords[0][cpx.x],
			'y0'        : coords[0][cpx.y],
			'x1'        : coords[1][cpx.x],
			'y1'        : coords[1][cpx.y],
			'distance'  : cpx.geom.distance(coords),
			'axis'      : cpx.geom.axis(coords),
			'angle'     : cpx.geom.angle(coords),
			'delta'     : cpx.geom.delta(coords),
			'direction' : cpx.geom.direction(coords),
			'midpoint'  : cpx.geom.midpoint(coords),
		};
		cpx.relate.bounds([data.x0, data.x1], [data.y0, data.y1]);
		return data;
	},
	cpx.process = {
		inputs: function(){
			var settings = {};
		  $('input.vector', $('#settings')).each(function() {
		    var name = $(this).prop('name');
		    var vect = $(this).prop('value') == '' ? 0 : $(this).prop('value');
		    settings[name] = vect;
		  });
			settings['bump'] = [];
			for (var i = 0; i < settings.grain; i++){
				settings.bump.push(100);
			}
			console.log(settings);
		  cpx.process.data(settings);
		},
	  data: function(settings){
	    var base = cpx.geom.radian(settings.base);
	    var grain = settings.grain;
	    var bump = settings.bump;
	    // cpx.def.image = settings.image;
	    cpx.def.temple = settings.temple;
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
				d.x = cpx.def.center + d.distance.radius * Math.cos(d.theta.origin)
				d.y = cpx.def.center + d.distance.radius * Math.sin(d.theta.origin);
			}

			for(var i in data){
				var current  = data[i];
				var previous = (i > 0) ? data[parseInt(i)-1] : data[data.length-1];
				current.distance.perimeter = cpx.geom.lawofcosines(current.distance.radius, current.theta.radius, previous.distance.radius);
				// determine the shorter side -> angle for law of sines
				if(current.distance.radius < previous.distance.radius){
					current.theta.advance = cpx.geom.lawofsines(current.distance.perimeter, current.theta.radius, current.distance.radius, false);
					current.theta.return = Math.PI - (current.theta.radius + current.theta.advance);
				} else {
					current.theta.return = cpx.geom.lawofsines(current.distance.perimeter, current.theta.radius, previous.distance.radius, false);
					current.theta.advance = Math.PI - (current.theta.radius + current.theta.return);
				}
			}

			for(var i in data){
				var current  = data[i];
				var next     = (parseInt(i) < data.length-1) ? data[parseInt(i)+1] : data[0];
				current.theta.across = current.theta.return + next.theta.advance;
				if( current.theta.across < cpx.geom.radian(cpx.def.reduce.min) || current.theta.across > cpx.geom.radian(cpx.def.reduce.max) || i == 0 || i == data.length-1){
					data_splice.push(data[i]);
				}
			}
	    cpx.def.offset = data_splice[0].distance.perimeter/2;
			cpx.process.starter(data_splice.reverse());
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
			// console.log('temple: ', cpx.def.temple, cpx.def.offset);
	    var distance = cpx.geom.maximum(points) - cpx.geom.minimum(points);
			// console.log(points, distance);
			// correction to prevent flattening on angle
			if( cpx.def.offset < distance ){
				cpx.def.temple = cpx.def.temple * cpx.geom.lawofsines(distance, cpx.geom.radian(90), cpx.def.offset, false);
			} else {
				cpx.def.temple = cpx.def.temple * cpx.geom.lawofsines(distance, cpx.geom.radian(90), distance*0.99, false);
			}
	    cpx.process.shape(starter)
		},
		shape: function(data){
			// console.log(data);
			var print_page = document.createElement('div');
			print_page.className = 'page-size';
			document.body.appendChild(print_page);
			cpx.def.inch = print_page.offsetWidth/8.5;

			for(var i = 0; i < data.length-3; i+=4) {
				var segment = [
					[ data[i],  data[i+1] ],
					[ data[i+2], data[i+3] ],
				];
				cpx.update(segment,'base');
			}
			cpx.relate.surround();
			cpx.relate.mirror('shape', 'vertical', 0, 'mirror');
			cpx.relate.connect();
			cpx.relate.tabs();
			cpx.relate.mirror('tabs', 'vertical', 0, 'tabs');

			if(cpx.def.format == 'wireframe'){
				cpx.draw.PNG(this);
			} else if(cpx.def.format == 'png'){
				var img = new Image();
				img.src = cpx.def.image;
				img.onload = function(){
					print_page.remove();
					cpx.draw.PNG(this);
				}
			} else {
				cpx.draw.SVG();
			}
		}
	},
	cpx.geom = {
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
			var c = cpx.geom.distance([ a[1],b[1] ]),
					a = cpx.geom.distance(a),
					b = cpx.geom.distance(b);
			// using the Law of Cosines:
			return Math.acos( (a*a + b*b - c*c) / (2*a*b) );
		},
		// GOOD
		hypotenuse: function(a,b){
			return Math.sqrt(a*a + b*b);
		},
		axis: function(coords){
			if( coords[0][cpx.x] != coords[1][cpx.x] && coords[0][cpx.y] == coords[1][cpx.y] ) {
				return cpx.x;
			} else if( coords[0][cpx.y] != coords[1][cpx.y] && coords[0][cpx.x] == coords[1][cpx.x] ) {
				return cpx.y;
			} else {
				return cpx.a;
			}
		},
		delta: function(a,b){
			if (!b) {
				return {
					'x' : a[1][cpx.x] - a[0][cpx.x],
					'y' : a[1][cpx.y] - a[0][cpx.y],
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
			var d = !b ? cpx.geom.delta(a) : cpx.geom.delta(a, b);
			return cpx.geom.hypotenuse(d.x,d.y);
		},
		angle: function(coords){
			var d = cpx.geom.delta(coords),
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
					d = cpx.geom.delta(coords),
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
			var mx = (coords[0][cpx.x] + coords[1][cpx.x])/2,
					my = (coords[0][cpx.y] + coords[1][cpx.y])/2;
			var segment = [
				[ coords[0][cpx.x], coords[0][cpx.y] ],
				[ mx, my ],
			];
			return {
				'x' : mx,
				'y' : my,
				'distance' : cpx.geom.distance(segment),
				'delta' : cpx.geom.delta(segment),
			};
		},
	},
	cpx.relate = {
		surround: function() {
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
	    for (var i = cpx.def.segment.base-1; i > 0; i--) {
	      // x1 minus x0 implies counterclockwise creation of base-shape
	      // angles in radians
	      var angle = {
	        'given' : cpx.def.temple,
	        'right' : Math.PI/2,
	        'found' : Math.PI/2 - cpx.def.temple,
	      }
	      var delta = {
	        'x' : cpx.def.shape[i].delta.x,
	        'y' : cpx.def.shape[i].delta.y,
	      }
	      var distance = {
	        'x': cpx.geom.lawofsines(delta.x, angle.right, false, angle.given),
	        'y': cpx.geom.hypotenuse(delta.y, cpx.geom.lawofsines(delta.x, angle.right, false, angle.found)),
	      }
	      // var point = (i < cpx.def.segment.base-1) ? surround : cpx.def.the_shape;
	      // var previous = point.length-1;
	      // var segment = [
	      //   [ point[previous][1][cpx.x], point[previous][1][cpx.y] ],
	      //   [ point[previous][1][cpx.x]+distance.x, point[previous][1][cpx.y]+distance.y ]
	      // ];
				if (i < cpx.def.segment.base-1){
					var point = surround;
					var previous = point.length-1;
					var segment = [
		        [ point[previous][1][cpx.x], point[previous][1][cpx.y] ],
		        [ point[previous][1][cpx.x]+distance.x, point[previous][1][cpx.y]+distance.y ]
		      ];
				} else {
					var point = cpx.def.segment.base-1;
					var segment = [
						[ cpx.def.shape[point].x1, cpx.def.shape[point].y1 ],
						[ cpx.def.shape[point].x1+distance.x, cpx.def.shape[point].y1+distance.y ]
					]
				}
	      surround.push(segment);
	    }
	    surround.reverse().forEach(function(segment){
	      cpx.update(segment,'surrounds');
	    });
	  },
	  mirror: function(coords,flip,origin,array){
	      /******
	          mirror over an axis,
	          axis must be determined then negated in transforms

	          the_axis + (the axis - the coord)
	      ******/
				var i = (coords == 'tabs') ? (cpx.def.shape.length - cpx.def.segment.tabs) : 0;
	      var complete = (coords == 'tabs') ? cpx.def.shape.length-3 : cpx.def.shape.length;
	      if (flip == 'vertical'){
	        var axis = cpx.def.shape[origin].x0 + cpx.def.offset;
	        while (i < complete) {
	          var segment = [
	            [ 2*axis - cpx.def.shape[i].x0, cpx.def.shape[i].y0 ],
	            [ 2*axis - cpx.def.shape[i].x1, cpx.def.shape[i].y1 ],
	          ];
	          cpx.update(segment,array);
	          i++;
	        }
	      }
	  },
	  connect: function(){
	    var connect = [];
	    var split = [];
	    var complete = cpx.def.shape.length/2;
	    for (var i = 0; i < complete; i++) {
	      var j = i+complete;
	      var segment = [
	          [ cpx.def.shape[i].x1, cpx.def.shape[i].y1 ],
	          [ cpx.def.shape[j].x1, cpx.def.shape[j].y1 ],
	      ];
	      connect.push(segment);
	      if (i == 0) {
	        var segment = [
	            [ cpx.def.shape[i].x0, cpx.def.shape[i].y0 ],
	            [ cpx.def.shape[j].x0, cpx.def.shape[j].y0 ],
	        ];
	        connect.push(segment);
	        split = connect.splice(0,connect.length);
	        i = cpx.def.segment.surrounds;
	      }
	    }
	    split.concat(connect.reverse()).reverse().forEach(function(segment){
	      cpx.update(segment,'connect');
	    });
	  },
	  tabs: function(){
	    var i = 1;
	    var j = (cpx.def.segment.base%2 > 0) ? true : false;
	    var k = cpx.def.shape.length-1;

	    while (i <= k){
	      var correlation = cpx.relate.correlation(i,j,k);
	      if (correlation.exists){
	        var tubes = cpx.relate.tubes(correlation.female,correlation.tube);
	        var theta = cpx.relate.theta(tubes.a,tubes.b,correlation.male.angle);
	        var distance = {
	          'a' : cpx.geom.distance(tubes.a),
	          'b' : cpx.geom.distance(tubes.b),
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
	          cpx.update(segment,'tabs');
	        }
	      }
	      i+=2;
	    }
	  },
	  bounds: function(xs, ys){
	    // must be called before new data is pushed to the_data
	    var bound = cpx.def.bounds;
	    if (cpx.def.shape.length < 1){
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
	  },
	  translation: function(){
	    var scale, x, y;
	    if (cpx.def.scaled == false) {
	      var bound_width  = Math.abs(cpx.def.bounds.left - cpx.def.bounds.right);
	      var bound_height = Math.abs(cpx.def.bounds.top - cpx.def.bounds.bottom);
	      if (bound_width/bound_height > 8.5/11){
	        scale = (cpx.def.inch*8.5)*(1/bound_width);
	      } else {
	        scale = (cpx.def.inch*11)*(1/bound_height);
	      }
	      cpx.def.scaled = true;
	    } else {
	      scale = 1;
	    }
	    // x = Math.abs(0 - cpx.def.bounds.left*scale);
	    // y = Math.abs(0 -cpx.def.bounds.top*scale);
	    var difference = {
	      'x' : (cpx.def.inch*8.5 - (cpx.def.bounds.right*scale - cpx.def.bounds.left*scale))/2,
	      'y' : (cpx.def.inch*11 - (cpx.def.bounds.bottom*scale - cpx.def.bounds.top*scale))/2,
	    }
	    x = Math.abs(0 - cpx.def.bounds.left*scale) + difference.x;
	    y = Math.abs(0 -cpx.def.bounds.top*scale) + difference.y;
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
	    if (i < cpx.def.segment.base) {
	      var male  = i, // 1
	          female  = i+cpx.def.segment.surrounds, // 4
	          tube_a = i-1+cpx.def.segment.mirror*2, // 14
	          tube_b = i+cpx.def.segment.mirror*2; // 15
	    } else if (i < cpx.def.segment.mirror) {
	      i = (j && (i+1 != cpx.def.segment.mirror)) ? i+1 : i;
	      var male  = i, // 5
	          female  = i-cpx.def.segment.surrounds, // 2
	          tube_b = i-cpx.def.segment.base; //
	          if (i-cpx.def.segment.base+2 < cpx.def.segment.base){
	            var tube_a = i-cpx.def.segment.base+2;
	          } else{
	            var tube_a = 0;
	          }
	    } else if (i+1 == cpx.def.segment.mirror*2) {
	      i+=1;
	      var male   = i,
	          female = i + cpx.def.segment.connect - 1,
	          tube_a  = 0,
	          tube_b  = i/2;
	    } else if (i == k && !j) {
	      var male   = i,
	          female = i - cpx.def.segment.connect + 1,
	          tube_a  = cpx.def.segment.mirror + cpx.def.segment.base,
	          tube_b  = cpx.def.segment.mirror - cpx.def.segment.surrounds;
	    } else {
	      exists = false;
	    }
	    return {
	      'male'   : cpx.def.shape[male],
	      'female' : cpx.def.shape[female],
	      'tube'   : {
	        'a' : cpx.def.shape[tube_a],
	        'b' : cpx.def.shape[tube_b],
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
	      'a' : cpx.geom.angle_between(a,m.a),
	      'b' : cpx.geom.angle_between(b,m.b),
	    }
	    return {
	      'a' : Math.PI - (Math.PI - male) - (Math.PI - theta.a) + taper,
	      'b' : male - theta.b - taper,
	    };
	  }
	},
	cpx.draw = {
		SVG: function() {
	    var scale = cpx.get.scale();
	    var draw = SVG('canvas').size(cpx.def.inch*8.5, cpx.def.inch*11).spof();
	    var groups = {
	      'obj'  : draw.group(),
	      'body' : draw.group(),
	      'fill' : draw.group(),
	      'tabs' : draw.group(),
	    }
	    for (i in cpx.def.shape){
	      cpx.def.shape[i].x0 = cpx.def.shape[i].x0*scale;
	      cpx.def.shape[i].y0 = cpx.def.shape[i].y0*scale;
	      cpx.def.shape[i].x1 = cpx.def.shape[i].x1*scale;
	      cpx.def.shape[i].y1 = cpx.def.shape[i].y1*scale;
	      var mode = cpx.def.strokeSVG[cpx.get.stroke(i)];
	      var line = draw.line( cpx.def.shape[i].x0, cpx.def.shape[i].y0, cpx.def.shape[i].x1, cpx.def.shape[i].y1 ).style( mode );
	      if(i < cpx.def.shape.length-cpx.def.segment.tabs){
	        groups.body.add(line);
	      } else {
	        groups.tabs.add(line);
	      }
	    }
	    var polygon = {
	      'initial' : {
	        'plot'    : cpx.get.fill('initial'),
	      },
	      'mirror'  : {
	        'plot'    : cpx.get.fill('mirror'),
	      },
	      'center'  : {
	        'plot'    : cpx.get.fill('center'),
	      }
	    }
	    var p = [];
	    for (var i in polygon){
	      for(var j in polygon[i].plot){
	        var instance = i+j;
	        p[instance] = draw
	          .polygon(polygon[i].plot[j])
	          .fill(cpx.def.image)
	          .stroke(cpx.def.strokeSVG.none)
	        ;
	        groups.fill.add( p[instance] );
	      }
	    }
	    groups.obj.add(groups.tabs);
	    groups.obj.add(groups.fill);
	    groups.obj.add(groups.body);
	    groups.obj.cx((cpx.def.inch*8.5)/2-groups.obj.bbox().x);
	    groups.obj.cy((cpx.def.inch*11) /2-groups.obj.bbox().y);
	  },
	  PNG: function(img){
			// console.log(cpx.def.shape);
	    var mode;
	    var translate = cpx.relate.translation();
	    for (i in cpx.def.shape){
	      cpx.def.shape[i].x0 = (cpx.def.shape[i].x0*translate.scale) + translate.x;
	      cpx.def.shape[i].y0 = (cpx.def.shape[i].y0*translate.scale) + translate.y;
	      cpx.def.shape[i].x1 = (cpx.def.shape[i].x1*translate.scale) + translate.x;
	      cpx.def.shape[i].y1 = (cpx.def.shape[i].y1*translate.scale) + translate.y;
	    }
	    var canvas = document.createElement('canvas');
	    canvas.width = cpx.def.inch*8.5;
	    canvas.height = cpx.def.inch*11.0;

	    var ctx = canvas.getContext('2d');
	    var fill = {
	      'initial' : cpx.draw.fillPNG('initial'),
	      'mirror'  : cpx.draw.fillPNG('mirror'),
	      'center'  : cpx.draw.fillPNG('center'),
	    }
	    ctx.lineCap = 'butt';
	    // TABS
	    ctx.fillStyle = '#FCFCFC';
	    ctx.strokeStyle = '#555555';
	    ctx.lineWidth = 1;
	    ctx.save();
	    for (var i = cpx.def.shape.length-cpx.def.segment.tabs; i < cpx.def.shape.length; i+=3){
	      // mode = cpx.def.strokePNG[cpx.draw.stroke(i)];
	      ctx.setLineDash(cpx.def.strokePNG.solid);
	      ctx.beginPath();
	      ctx.moveTo( cpx.def.shape[i].x0, cpx.def.shape[i].y0 );
	      ctx.lineTo( cpx.def.shape[i].x1, cpx.def.shape[i].y1 );
	      ctx.lineTo( cpx.def.shape[i+1].x1, cpx.def.shape[i+1].y1 );
	      ctx.lineTo( cpx.def.shape[i+2].x1, cpx.def.shape[i+2].y1 );
	      ctx.fill();
	      ctx.stroke();
	    }
	    ctx.restore();

	    // LEFT FILL (BASE)
	    // ctx.fillStyle = ctx.createPattern(img, 'repeat');
	    // ctx.strokeStyle = '#FFFFFF';
	    // ctx.lineWidth = 12;
	    // mode = cpx.def.strokePNG.solid;
	    // ctx.save();
	    // for (var point in fill.initial){
	    // 	var poly = fill.initial;
	    // 	if (point > 0){
	    // 		ctx.lineTo(poly[point][cpx.x], poly[point][cpx.y]);
	    // 	} else {
	    // 		ctx.beginPath();
	    // 		ctx.moveTo(fill.initial[0][cpx.x], fill.initial[0][cpx.y]);
	    // 	}
	    // }
	    // ctx.closePath();
	    // ctx.clip();
	    // ctx.fill();
	    // ctx.stroke();
	    // ctx.restore();
	    //
	    // // RIGHT FILL (MIRROR)
	    // ctx.save();
	    // for (point in fill.mirror){
	    // 	var poly = fill.mirror;
	    // 	if (point > 0){
	    // 		ctx.lineTo(poly[point][cpx.x], poly[point][cpx.y]);
	    // 	} else {
	    // 		ctx.beginPath();
	    // 		ctx.moveTo(poly[point][cpx.x], poly[point][cpx.y]);
	    // 	}
	    // }
	    // ctx.closePath();
	    // ctx.clip();
	    // ctx.fill();
	    // ctx.stroke();
	    // ctx.restore();
	    //
	    // // CENTER FILL
	    // ctx.save();
	    // for (var each in fill.center){
	    // 	for (var more in fill.center[each]){
	    // 		var poly = fill.center[each];
	    // 		for (point in poly){
	    // 			if (point > 0){
	    // 				ctx.lineTo(poly[point][cpx.x], poly[point][cpx.y]);
	    // 			} else {
	    // 				ctx.beginPath();
	    // 				ctx.moveTo(poly[point][cpx.x], poly[point][cpx.y]);
	    // 			}
	    // 		}
	    // 	}
	    // }
	    // ctx.closePath();
	    // ctx.clip();
	    // ctx.fill();
	    // ctx.stroke();
	    // ctx.restore();

	    // THE CONNECTS - WHITE
	    ctx.strokeStyle = '#FFFFFF';
	    ctx.lineWidth = 12;
	    mode = cpx.def.strokePNG.solid;
	    ctx.setLineDash(mode);
	    for (var i = cpx.def.shape.length-cpx.def.segment.tabs-cpx.def.segment.connect+1; i < cpx.def.shape.length-cpx.def.segment.tabs-1; i++){
	      ctx.beginPath();
	      ctx.moveTo( cpx.def.shape[i].x0, cpx.def.shape[i].y0 );
	      ctx.lineTo( cpx.def.shape[i].x1, cpx.def.shape[i].y1 );
	      ctx.stroke();
	    }

	    ctx.strokeStyle = '#FFF';
	    ctx.lineWidth = 1;
	    // LINES BEFORE TABS
	    for (var i = 0; i < cpx.def.shape.length-cpx.def.segment.tabs; i++){
	      mode = cpx.def.strokePNG[cpx.draw.stroke(i)];
	      ctx.setLineDash(mode);
	      ctx.beginPath();
	      ctx.moveTo( cpx.def.shape[i].x0, cpx.def.shape[i].y0 );
	      ctx.lineTo( cpx.def.shape[i].x1, cpx.def.shape[i].y1 );
	      ctx.stroke();
	    }

	    var export_shape = canvas.toDataURL();
	    var page = document.getElementById(cpx.def.container);

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
	  stroke: function(i){
	    var style = {
	      'even' : (cpx.def.segment.base%2 == 0) ? true : false,
	      'base' : {
	        'a' : cpx.def.segment.base,
	        'b' : cpx.def.segment.base + cpx.def.segment.mirror,
	      },
	      'mirror' : {
	        'a' : cpx.def.segment.mirror,
	        'b' : cpx.def.segment.mirror*2,
	      },
	      "tabs" : cpx.def.shape.length - cpx.def.segment.tabs - 1,
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
	      for (i = 0; i < cpx.def.segment.base; i++){
	        points.push( [cpx.def.shape[i].x0, cpx.def.shape[i].y0] );
	      }
	      poly.push(points);
	    } else if (type == 'mirror'){
	      for (i = cpx.def.segment.mirror; i < cpx.def.segment.mirror+cpx.def.segment.base; i++){
	        points.push( [cpx.def.shape[i].x0, cpx.def.shape[i].y0] );
	      }
	      poly.push(points);
	    } else if (type =='center'){
	      for(var i = cpx.def.segment.mirror*2; i < cpx.def.segment.mirror*2+cpx.def.segment.connect-1; i++){
	        poly.push([
	          [[cpx.def.shape[i].x0, cpx.def.shape[i].y0],[cpx.def.shape[i].x1, cpx.def.shape[i].y1]],
	          [[cpx.def.shape[i+1].x1, cpx.def.shape[i+1].y1],[cpx.def.shape[i+1].x0, cpx.def.shape[i+1].y0]],
	        ]);
	      }
	    }
	    return poly;
	  },
	  fillPNG: function(type){
	    var points = [];
	    var poly = [];

	    if (type == 'initial'){
	      for (i = 0; i < cpx.def.segment.base; i++){
	        poly.push( [cpx.def.shape[i].x0, cpx.def.shape[i].y0] );
	      }
	    } else if (type == 'mirror'){
	      for (i = cpx.def.segment.mirror; i < cpx.def.segment.mirror+cpx.def.segment.base; i++){
	        poly.push( [cpx.def.shape[i].x0, cpx.def.shape[i].y0] );
	      }
	    } else if (type =='center'){
	      for(var i = cpx.def.segment.mirror*2; i < cpx.def.segment.mirror*2+cpx.def.segment.connect; i++){
	        points.push([cpx.def.shape[i].x0, cpx.def.shape[i].y0]);
	        // points.push([cpx.def.shape[i].x1, cpx.def.shape[i].y1]);
	        poly.push(points);
	      }
	      for(var i = cpx.def.segment.mirror*2+cpx.def.segment.connect-1; i > cpx.def.segment.mirror*2-1; i--){
	        // points.push([cpx.def.shape[i].x0, cpx.def.shape[i].y0]);
	        points.push([cpx.def.shape[i].x1, cpx.def.shape[i].y1]);
	        poly.push(points);
	      }
	    } else if (type == 'all'){
	      // TODO
	      // 	for(i =cpx.def.shape.length-1; i > cpx.def.shape.length-cpx.def.segment.tabs-cpx.def.segment.mirror; i--){
	      // 		poly.push( [cpx.def.shape[i].x0, cpx.def.shape[i].y0] );
	      // 	}
	      // 	for(i = (cpx.def.segment.base-1)*2; i > cpx.def.segment.base-1; i--){
	      // 		poly.push( [cpx.def.shape[i].x0, cpx.def.shape[i].y0] );
	      // 	}
	      // 	var connect = cpx.def.shape.length-cpx.def.segment.tabs-cpx.def.segment.connect+1;
	      // 	poly.push( [cpx.def.shape[connect].x0, cpx.def.shape[connect].y0] )
	    }
	    return poly;
	  }
	}
}
