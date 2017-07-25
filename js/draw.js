Circumplexus.prototype.draw = {
  SVG: function() {
    var scale = s.get.scale();
    var draw = SVG('canvas').size(s.init.inch*8.5, s.init.inch*11).spof();
    var groups = {
      'obj'  : draw.group(),
      'body' : draw.group(),
      'fill' : draw.group(),
      'tabs' : draw.group(),
    }
    for (i in s.init.the_data){
      s.init.the_data[i].x0 = s.init.the_data[i].x0*scale;
      s.init.the_data[i].y0 = s.init.the_data[i].y0*scale;
      s.init.the_data[i].x1 = s.init.the_data[i].x1*scale;
      s.init.the_data[i].y1 = s.init.the_data[i].y1*scale;
      var mode = s.init.strokeSVG[s.get.stroke(i)];
      var line = draw.line( s.init.the_data[i].x0, s.init.the_data[i].y0, s.init.the_data[i].x1, s.init.the_data[i].y1 ).style( mode );
      if(i < s.init.the_data.length-s.init.the_tabs.length){
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
          .fill(s.init.image)
          .stroke(s.init.strokeSVG.none)
        ;
        groups.fill.add( p[instance] );
      }
    }
    groups.obj.add(groups.tabs);
    groups.obj.add(groups.fill);
    groups.obj.add(groups.body);
    groups.obj.cx((s.init.inch*8.5)/2-groups.obj.bbox().x);
    groups.obj.cy((s.init.inch*11) /2-groups.obj.bbox().y);
  },
  PNG: function(img){
    var mode;
    var translate = s.relate.translation();
    for (i in s.init.the_data){
      s.init.the_data[i].x0 = (s.init.the_data[i].x0*translate.scale) + translate.x;
      s.init.the_data[i].y0 = (s.init.the_data[i].y0*translate.scale) + translate.y;
      s.init.the_data[i].x1 = (s.init.the_data[i].x1*translate.scale) + translate.x;
      s.init.the_data[i].y1 = (s.init.the_data[i].y1*translate.scale) + translate.y;
    }
    var canvas = document.createElement('canvas');
    canvas.width = s.init.inch*8.5;
    canvas.height = s.init.inch*11.0;

    var ctx = canvas.getContext('2d');
    var fill = {
      'initial' : s.draw.fillPNG('initial'),
      'mirror'  : s.draw.fillPNG('mirror'),
      'center'  : s.draw.fillPNG('center'),
    }
    ctx.lineCap = 'butt';
    // TABS
    ctx.fillStyle = '#FCFCFC';
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.save();
    for (var i = s.init.the_data.length-s.init.the_tabs.length; i < s.init.the_data.length; i+=3){
      // mode = s.init.strokePNG[s.draw.stroke(i)];
      ctx.setLineDash(s.init.strokePNG.solid);
      ctx.beginPath();
      ctx.moveTo( s.init.the_data[i].x0, s.init.the_data[i].y0 );
      ctx.lineTo( s.init.the_data[i].x1, s.init.the_data[i].y1 );
      ctx.lineTo( s.init.the_data[i+1].x1, s.init.the_data[i+1].y1 );
      ctx.lineTo( s.init.the_data[i+2].x1, s.init.the_data[i+2].y1 );
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // LEFT FILL (BASE)
    // ctx.fillStyle = ctx.createPattern(img, 'repeat');
    // ctx.strokeStyle = '#FFFFFF';
    // ctx.lineWidth = 12;
    // mode = s.init.strokePNG.solid;
    // ctx.save();
    // for (var point in fill.initial){
    // 	var poly = fill.initial;
    // 	if (point > 0){
    // 		ctx.lineTo(poly[point][s.init.x], poly[point][s.init.y]);
    // 	} else {
    // 		ctx.beginPath();
    // 		ctx.moveTo(fill.initial[0][s.init.x], fill.initial[0][s.init.y]);
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
    // 		ctx.lineTo(poly[point][s.init.x], poly[point][s.init.y]);
    // 	} else {
    // 		ctx.beginPath();
    // 		ctx.moveTo(poly[point][s.init.x], poly[point][s.init.y]);
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
    // 				ctx.lineTo(poly[point][s.init.x], poly[point][s.init.y]);
    // 			} else {
    // 				ctx.beginPath();
    // 				ctx.moveTo(poly[point][s.init.x], poly[point][s.init.y]);
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
    mode = s.init.strokePNG.solid;
    ctx.setLineDash(mode);
    for (var i = s.init.the_data.length-s.init.the_tabs.length-s.init.the_connect.length+1; i < s.init.the_data.length-s.init.the_tabs.length-1; i++){
      ctx.beginPath();
      ctx.moveTo( s.init.the_data[i].x0, s.init.the_data[i].y0 );
      ctx.lineTo( s.init.the_data[i].x1, s.init.the_data[i].y1 );
      ctx.stroke();
    }

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    // LINES BEFORE TABS
    for (var i = 0; i < s.init.the_data.length-s.init.the_tabs.length; i++){
      mode = s.init.strokePNG[s.draw.stroke(i)];
      ctx.setLineDash(mode);
      ctx.beginPath();
      ctx.moveTo( s.init.the_data[i].x0, s.init.the_data[i].y0 );
      ctx.lineTo( s.init.the_data[i].x1, s.init.the_data[i].y1 );
      ctx.stroke();
    }

    var export_shape = canvas.toDataURL();
    var page = document.getElementById(s.init.container);

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
      'even' : (s.init.the_base.length%2 == 0) ? true : false,
      'base' : {
        'a' : s.init.the_base.length,
        'b' : s.init.the_base.length + s.init.the_mirror.length,
      },
      'mirror' : {
        'a' : s.init.the_mirror.length,
        'b' : s.init.the_mirror.length*2,
      },
      "tabs" : s.init.the_data.length - s.init.the_tabs.length - 1,
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
      for (i = 0; i < s.init.the_base.length; i++){
        points.push( [s.init.the_data[i].x0, s.init.the_data[i].y0] );
      }
      poly.push(points);
    } else if (type == 'mirror'){
      for (i = s.init.the_mirror.length; i < s.init.the_mirror.length+s.init.the_base.length; i++){
        points.push( [s.init.the_data[i].x0, s.init.the_data[i].y0] );
      }
      poly.push(points);
    } else if (type =='center'){
      for(var i = s.init.the_mirror.length*2; i < s.init.the_mirror.length*2+s.init.the_connect.length-1; i++){
        poly.push([
          [[s.init.the_data[i].x0, s.init.the_data[i].y0],[s.init.the_data[i].x1, s.init.the_data[i].y1]],
          [[s.init.the_data[i+1].x1, s.init.the_data[i+1].y1],[s.init.the_data[i+1].x0, s.init.the_data[i+1].y0]],
        ]);
      }
    }
    return poly;
  },
  fillPNG: function(type){
    var points = [];
    var poly = [];

    if (type == 'initial'){
      for (i = 0; i < s.init.the_base.length; i++){
        poly.push( [s.init.the_data[i].x0, s.init.the_data[i].y0] );
      }
    } else if (type == 'mirror'){
      for (i = s.init.the_mirror.length; i < s.init.the_mirror.length+s.init.the_base.length; i++){
        poly.push( [s.init.the_data[i].x0, s.init.the_data[i].y0] );
      }
    } else if (type =='center'){
      for(var i = s.init.the_mirror.length*2; i < s.init.the_mirror.length*2+s.init.the_connect.length; i++){
        points.push([s.init.the_data[i].x0, s.init.the_data[i].y0]);
        // points.push([s.init.the_data[i].x1, s.init.the_data[i].y1]);
        poly.push(points);
      }
      for(var i = s.init.the_mirror.length*2+s.init.the_connect.length-1; i > s.init.the_mirror.length*2-1; i--){
        // points.push([s.init.the_data[i].x0, s.init.the_data[i].y0]);
        points.push([s.init.the_data[i].x1, s.init.the_data[i].y1]);
        poly.push(points);
      }
    } else if (type == 'all'){
      // TODO
      // 	for(i =s.init.the_data.length-1; i > s.init.the_data.length-s.init.the_tabs.length-s.init.the_mirror.length; i--){
      // 		poly.push( [s.init.the_data[i].x0, s.init.the_data[i].y0] );
      // 	}
      // 	for(i = (s.init.the_base.length-1)*2; i > s.init.the_base.length-1; i--){
      // 		poly.push( [s.init.the_data[i].x0, s.init.the_data[i].y0] );
      // 	}
      // 	var connect = s.init.the_data.length-s.init.the_tabs.length-s.init.the_connect.length+1;
      // 	poly.push( [s.init.the_data[connect].x0, s.init.the_data[connect].y0] )
    }
    return poly;
  }
}
