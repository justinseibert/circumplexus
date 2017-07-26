Circumplexus.prototype.geom = {
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
    var c = this.distance([ a[1],b[1] ]),
        a = this.distance(a),
        b = this.distance(b);
    // using the Law of Cosines:
    return Math.acos( (a*a + b*b - c*c) / (2*a*b) );
  },
  // GOOD
  hypotenuse: function(a,b){
    return Math.sqrt(a*a + b*b);
  },
  axis: function(coords){
    if( coords[0][this.x] != coords[1][this.x] && coords[0][this.y] == coords[1][this.y] ) {
      return this.x;
    } else if( coords[0][this.y] != coords[1][this.y] && coords[0][this.x] == coords[1][this.x] ) {
      return this.y;
    } else {
      return this.a;
    }
  },
  delta: function(a,b){
    if (!b) {
      return {
        'x' : a[1][this.x] - a[0][this.x],
        'y' : a[1][this.y] - a[0][this.y],
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
    var d = !b ? this.delta(a) : o.delta(a, b);
    return this.hypotenuse(d.x,d.y);
  },
  angle: function(coords){
    var d = this.delta(coords),
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
        d = this.delta(coords),
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
    var mx = (coords[0][this.x] + coords[1][this.x])/2,
        my = (coords[0][this.y] + coords[1][this.y])/2;
    var segment = [
      [ coords[0][this.x], coords[0][this.y] ],
      [ mx, my ],
    ];
    return {
      'x' : mx,
      'y' : my,
      'distance' : this.distance(segment),
      'delta' : this.delta(segment),
    };
  },
}
