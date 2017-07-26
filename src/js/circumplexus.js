var Circumplexus = function(format,container){
	// "use strict";
	var cpx = this || {};
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
		'image'         : '',
		'format'        : format,
		'container'     : (container == undefined) ? 'results' : container,
	}
	cpx.update = function(segment, collection){
		cpx.def[collection].push(segment);
		cpx.def.the_shape.push(segment);
		cpx.def.the_data.push(cpx.data(segment));
	},
	cpx.data = function(coords){
		var data = {
			'x0'        : coords[0][cpx.def.x],
			'y0'        : coords[0][cpx.def.y],
			'x1'        : coords[1][cpx.def.x],
			'y1'        : coords[1][cpx.def.y],
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
			console.log(data);
			var print_page = document.createElement('div');
			print_page.className = 'page-size';
			document.body.appendChild(print_page);
			cpx.def.inch = print_page.offsetWidth/8.5;

			for(var i = 0; i < data.length-3; i+=4) {
				var segment = [
					[ data[i],  data[i+1] ],
					[ data[i+2], data[i+3] ],
				];
				cpx.update(segment,'the_base');
			}
			cpx.relate.surround(cpx.def.the_shape);
			cpx.relate.mirror(cpx.def.the_shape, 'vertical', 0, 'the_mirror');
			cpx.relate.connect(cpx.def.the_shape);
			cpx.relate.tabs();
			cpx.relate.mirror(cpx.def.the_tabs, 'vertical', 0, 'the_tabs');

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
	}
}
