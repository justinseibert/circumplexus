Circumplexus.prototype.relate = {
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
    for (var i = cpx.def.the_base.length-1; i > 0; i--) {
      // x1 minus x0 implies counterclockwise creation of base-shape
      // angles in radians
      var angle = {
        'given' : cpx.def.temple,
        'right' : Math.PI/2,
        'found' : Math.PI/2 - cpx.def.temple,
      }
      var delta = {
        'x' : cpx.def.the_data[i].delta.x,
        'y' : cpx.def.the_data[i].delta.y,
      }
      var distance = {
        'x': cpx.geom.lawofsines(delta.x, angle.right, false, angle.given),
        'y': cpx.geom.hypotenuse(delta.y, cpx.geom.lawofsines(delta.x, angle.right, false, angle.found)),
      }
      var point = (i < cpx.def.the_base.length-1) ? surround : cpx.def.the_shape;
      var previous = point.length-1;
      var segment = [
        [ point[previous][1][cpx.def.x], point[previous][1][cpx.def.y] ],
        [ point[previous][1][cpx.def.x]+distance.x, point[previous][1][cpx.def.y]+distance.y ]
      ];
      surround.push(segment);
    }
    surround.reverse().forEach(function(segment){
      cpx.update(segment,'the_surrounds');
    });
  },
  mirror: function(coords,flip,origin,array){
      /******
          mirror over an axis,
          axis must be determined then negated in transforms

          the_axis + (the axis - the coord)
      ******/
      var i = 0;
      var complete = (coords == cpx.def.the_tabs) ? coords.length-3 : coords.length;

      if (flip == 'vertical'){
        var axis = cpx.def.the_data[origin].x0 + cpx.def.offset;
        while (i < complete) {
          var segment = [
            [ axis + (axis - coords[i][0][cpx.def.x]), coords[i][0][cpx.def.y] ],
            [ axis + (axis - coords[i][1][cpx.def.x]), coords[i][1][cpx.def.y] ],
          ];
          cpx.update(segment,array);
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
          [ cpx.def.the_data[i].x1, cpx.def.the_data[i].y1 ],
          [ cpx.def.the_data[j].x1, cpx.def.the_data[j].y1 ],
      ];
      connect.push(segment);
      if (i == 0) {
        var segment = [
            [ cpx.def.the_data[i].x0, cpx.def.the_data[i].y0 ],
            [ cpx.def.the_data[j].x0, cpx.def.the_data[j].y0 ],
        ];
        connect.push(segment);
        split = connect.splice(0,connect.length);
        i = cpx.def.the_surrounds.length;
      }
    }
    split.concat(connect.reverse()).reverse().forEach(function(segment){
      cpx.update(segment,'the_connect');
    });
  },
  tabs: function(){
    var i = 1;
    var j = (cpx.def.the_base.length%2 > 0) ? true : false;
    var k = cpx.def.the_shape.length-1;

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
          cpx.update(segment,'the_tabs');
        }
      }
      i+=2;
    }
  },
  bounds: function(xs, ys){
    // must be called before new data is pushed to the_data
    var bound = cpx.def.bounds;
    if (cpx.def.the_data.length < 1){
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
    if (i < cpx.def.the_base.length) {
      var male  = i, // 1
          female  = i+cpx.def.the_surrounds.length, // 4
          tube_a = i-1+cpx.def.the_mirror.length*2, // 14
          tube_b = i+cpx.def.the_mirror.length*2; // 15
    } else if (i < cpx.def.the_mirror.length) {
      i = (j && (i+1 != cpx.def.the_mirror.length)) ? i+1 : i;
      var male  = i, // 5
          female  = i-cpx.def.the_surrounds.length, // 2
          tube_b = i-cpx.def.the_base.length; //
          if (i-cpx.def.the_base.length+2 < cpx.def.the_base.length){
            var tube_a = i-cpx.def.the_base.length+2;
          } else{
            var tube_a = 0;
          }
    } else if (i+1 == cpx.def.the_mirror.length*2) {
      i+=1;
      var male   = i,
          female = i + cpx.def.the_connect.length - 1,
          tube_a  = 0,
          tube_b  = i/2;
    } else if (i == k && !j) {
      var male   = i,
          female = i - cpx.def.the_connect.length + 1,
          tube_a  = cpx.def.the_mirror.length + cpx.def.the_base.length,
          tube_b  = cpx.def.the_mirror.length - cpx.def.the_surrounds.length;
    } else {
      exists = false;
    }
    return {
      'male'   : cpx.def.the_data[male],
      'female' : cpx.def.the_data[female],
      'tube'   : {
        'a' : cpx.def.the_data[tube_a],
        'b' : cpx.def.the_data[tube_b],
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
}
