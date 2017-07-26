Circumplexus.prototype.draw = {
  SVG: function() {
    var scale = cpx.get.scale();
    var draw = SVG('canvas').size(cpx.def.inch*8.5, cpx.def.inch*11).spof();
    var groups = {
      'obj'  : draw.group(),
      'body' : draw.group(),
      'fill' : draw.group(),
      'tabs' : draw.group(),
    }
    for (i in cpx.def.the_data){
      cpx.def.the_data[i].x0 = cpx.def.the_data[i].x0*scale;
      cpx.def.the_data[i].y0 = cpx.def.the_data[i].y0*scale;
      cpx.def.the_data[i].x1 = cpx.def.the_data[i].x1*scale;
      cpx.def.the_data[i].y1 = cpx.def.the_data[i].y1*scale;
      var mode = cpx.def.strokeSVG[cpx.get.stroke(i)];
      var line = draw.line( cpx.def.the_data[i].x0, cpx.def.the_data[i].y0, cpx.def.the_data[i].x1, cpx.def.the_data[i].y1 ).style( mode );
      if(i < cpx.def.the_data.length-cpx.def.the_tabs.length){
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
    var mode;
    var translate = cpx.relate.translation();
    for (i in cpx.def.the_data){
      cpx.def.the_data[i].x0 = (cpx.def.the_data[i].x0*translate.scale) + translate.x;
      cpx.def.the_data[i].y0 = (cpx.def.the_data[i].y0*translate.scale) + translate.y;
      cpx.def.the_data[i].x1 = (cpx.def.the_data[i].x1*translate.scale) + translate.x;
      cpx.def.the_data[i].y1 = (cpx.def.the_data[i].y1*translate.scale) + translate.y;
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
    for (var i = cpx.def.the_data.length-cpx.def.the_tabs.length; i < cpx.def.the_data.length; i+=3){
      // mode = cpx.def.strokePNG[cpx.draw.stroke(i)];
      ctx.setLineDash(cpx.def.strokePNG.solid);
      ctx.beginPath();
      ctx.moveTo( cpx.def.the_data[i].x0, cpx.def.the_data[i].y0 );
      ctx.lineTo( cpx.def.the_data[i].x1, cpx.def.the_data[i].y1 );
      ctx.lineTo( cpx.def.the_data[i+1].x1, cpx.def.the_data[i+1].y1 );
      ctx.lineTo( cpx.def.the_data[i+2].x1, cpx.def.the_data[i+2].y1 );
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
    // 		ctx.lineTo(poly[point][cpx.def.x], poly[point][cpx.def.y]);
    // 	} else {
    // 		ctx.beginPath();
    // 		ctx.moveTo(fill.initial[0][cpx.def.x], fill.initial[0][cpx.def.y]);
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
    // 		ctx.lineTo(poly[point][cpx.def.x], poly[point][cpx.def.y]);
    // 	} else {
    // 		ctx.beginPath();
    // 		ctx.moveTo(poly[point][cpx.def.x], poly[point][cpx.def.y]);
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
    // 				ctx.lineTo(poly[point][cpx.def.x], poly[point][cpx.def.y]);
    // 			} else {
    // 				ctx.beginPath();
    // 				ctx.moveTo(poly[point][cpx.def.x], poly[point][cpx.def.y]);
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
    for (var i = cpx.def.the_data.length-cpx.def.the_tabs.length-cpx.def.the_connect.length+1; i < cpx.def.the_data.length-cpx.def.the_tabs.length-1; i++){
      ctx.beginPath();
      ctx.moveTo( cpx.def.the_data[i].x0, cpx.def.the_data[i].y0 );
      ctx.lineTo( cpx.def.the_data[i].x1, cpx.def.the_data[i].y1 );
      ctx.stroke();
    }

    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    // LINES BEFORE TABS
    for (var i = 0; i < cpx.def.the_data.length-cpx.def.the_tabs.length; i++){
      mode = cpx.def.strokePNG[cpx.draw.stroke(i)];
      ctx.setLineDash(mode);
      ctx.beginPath();
      ctx.moveTo( cpx.def.the_data[i].x0, cpx.def.the_data[i].y0 );
      ctx.lineTo( cpx.def.the_data[i].x1, cpx.def.the_data[i].y1 );
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
      'even' : (cpx.def.the_base.length%2 == 0) ? true : false,
      'base' : {
        'a' : cpx.def.the_base.length,
        'b' : cpx.def.the_base.length + cpx.def.the_mirror.length,
      },
      'mirror' : {
        'a' : cpx.def.the_mirror.length,
        'b' : cpx.def.the_mirror.length*2,
      },
      "tabs" : cpx.def.the_data.length - cpx.def.the_tabs.length - 1,
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
      for (i = 0; i < cpx.def.the_base.length; i++){
        points.push( [cpx.def.the_data[i].x0, cpx.def.the_data[i].y0] );
      }
      poly.push(points);
    } else if (type == 'mirror'){
      for (i = cpx.def.the_mirror.length; i < cpx.def.the_mirror.length+cpx.def.the_base.length; i++){
        points.push( [cpx.def.the_data[i].x0, cpx.def.the_data[i].y0] );
      }
      poly.push(points);
    } else if (type =='center'){
      for(var i = cpx.def.the_mirror.length*2; i < cpx.def.the_mirror.length*2+cpx.def.the_connect.length-1; i++){
        poly.push([
          [[cpx.def.the_data[i].x0, cpx.def.the_data[i].y0],[cpx.def.the_data[i].x1, cpx.def.the_data[i].y1]],
          [[cpx.def.the_data[i+1].x1, cpx.def.the_data[i+1].y1],[cpx.def.the_data[i+1].x0, cpx.def.the_data[i+1].y0]],
        ]);
      }
    }
    return poly;
  },
  fillPNG: function(type){
    var points = [];
    var poly = [];

    if (type == 'initial'){
      for (i = 0; i < cpx.def.the_base.length; i++){
        poly.push( [cpx.def.the_data[i].x0, cpx.def.the_data[i].y0] );
      }
    } else if (type == 'mirror'){
      for (i = cpx.def.the_mirror.length; i < cpx.def.the_mirror.length+cpx.def.the_base.length; i++){
        poly.push( [cpx.def.the_data[i].x0, cpx.def.the_data[i].y0] );
      }
    } else if (type =='center'){
      for(var i = cpx.def.the_mirror.length*2; i < cpx.def.the_mirror.length*2+cpx.def.the_connect.length; i++){
        points.push([cpx.def.the_data[i].x0, cpx.def.the_data[i].y0]);
        // points.push([cpx.def.the_data[i].x1, cpx.def.the_data[i].y1]);
        poly.push(points);
      }
      for(var i = cpx.def.the_mirror.length*2+cpx.def.the_connect.length-1; i > cpx.def.the_mirror.length*2-1; i--){
        // points.push([cpx.def.the_data[i].x0, cpx.def.the_data[i].y0]);
        points.push([cpx.def.the_data[i].x1, cpx.def.the_data[i].y1]);
        poly.push(points);
      }
    } else if (type == 'all'){
      // TODO
      // 	for(i =cpx.def.the_data.length-1; i > cpx.def.the_data.length-cpx.def.the_tabs.length-cpx.def.the_mirror.length; i--){
      // 		poly.push( [cpx.def.the_data[i].x0, cpx.def.the_data[i].y0] );
      // 	}
      // 	for(i = (cpx.def.the_base.length-1)*2; i > cpx.def.the_base.length-1; i--){
      // 		poly.push( [cpx.def.the_data[i].x0, cpx.def.the_data[i].y0] );
      // 	}
      // 	var connect = cpx.def.the_data.length-cpx.def.the_tabs.length-cpx.def.the_connect.length+1;
      // 	poly.push( [cpx.def.the_data[connect].x0, cpx.def.the_data[connect].y0] )
    }
    return poly;
  }
}
