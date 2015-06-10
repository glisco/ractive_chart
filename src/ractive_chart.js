// Simple multi interactive dataset chart
// requires Ractive.js, Sugar.js
// Copyright (C) 2015: Michele Comitini <mcm@glisco.it>

var ractive_chart = {
	data: function () { return {
		activedataset: '0',
		canvas: {
			color: 'rgba(200, 150, 10, 0.1)',
		},
		yaxis: {
			labelsize: "0.5",
			min: -10,
			max: 10,
			ticks: 5,
	        resolution: 1,
	        digits: 2,
		},
		xaxis: {
			labelsize: "0.5",
			min: -20,
			max: 20,
			ticks: 5,
	        resolution: 1,
	        digits: 2,
		},
		datasets: [
			{ name: '0',
			  type: 'circle',
			  radius: '4',
			  pointcolor: 'rgb(255,0,0)',
			  snap: true,
			  points: Array(),
			},
			{ name: '1',
			  type: 'circle',
			  radius: '4',
			  pointcolor: 'yellow',
			  snap: true,
			  points: Array(),
			},
			{ name: '2',
			  type: 'circle',
			  radius: '4',
			  pointcolor: 'green',
			  snap: true,
			  points: Array(),
			},
			{ name: '3',
			  type: 'circle',
			  radius: '4',
			  pointcolor: 'orange',
			  snap: true,
			  points: Array(),
			},
			{ name: '4',
			  type: 'circle',
			  radius: '4',
			  pointcolor: 'violet',
			  snap: true,
			  points: Array(),
			},
		],
		size: { // size in user units (see docs SVG)
			x: '1000',
			y: '500'},
		cfill: [255, 0, 0],
		radius: '80',
		movingcircle: {circle: null,
					   idx: null},
	}},
};
ractive_chart.Chart = Ractive.extend({
	isolated: true,
	data: ractive_chart.data,
		computed: {
			xgridlines: function () {
				var xmin = this.get('xaxis.min');
				var xres = this.get('xaxis.resolution');
				var offx = xmin / xres - Math.round(xmin / xres);
				return Number.range(xmin - offx, this.get('xaxis.max') + offx).every(this.get('xaxis.resolution'));
			},
			ygridlines: function () {
				return Number.range(this.get('yaxis.min'), this.get('yaxis.max')).every(this.get('yaxis.resolution'));
	        },
			polypoints: function () {
				var datasets = Sugar.Object.extended(this.get('datasets'));
				var polystrings = Array();
				var context = this;
				datasets.each(function(k, v) {
					var points = context.get('datasets.' + k + '.points');
					polystrings.push({dataset: k,
									  points: points.reduce(function (s, p){ return s + (s==""?'':', ') + p[0] + ' ' + p[1]}, "")});
				});
				return polystrings;
			},
			dataset: function () {
				var datasets = this.get('datasets');
				var activedataset = this.get('activedataset');
				return datasets[activedataset];
			},
			scalefactor: function () {
				var yaxis = this.get('yaxis');
				var xaxis = this.get('xaxis');
				var size = this.get('size');
				return Math.sqrt((Math.pow(yaxis.max - yaxis.min, 2) + Math.pow(xaxis.max-xaxis.min,2))/(Math.pow(size.x, 2) + Math.pow(size.y, 2)));
			},
		},
	evCartesianCoords: function (ev, round) {
		var svg = this.find('svg#cartesianplane');
		//var loctm = svg.getTransformToElement(svg).inverse();
		var tm = svg.getScreenCTM().inverse();
		var gpoint = svg.createSVGPoint();
		gpoint.x = ev.original.clientX;
		gpoint.y = ev.original.clientY;
		var npoint = gpoint.matrixTransform(tm);
		var x = 0, y = 0;
	    if (round) {
	        var xround = this.get('xaxis.resolution'),
   	            yround = this.get('yaxis.resolution');
			xdecim = parseInt(xround.toExponential().split('e')[1]);
			ydecim = parseInt(yround.toExponential().split('e')[1]);
			x = Math.round(npoint.x/xround)*xround;
			x = (x).round(-xdecim + 1); 
			y = Math.round(npoint.y/yround)*yround;
			y = (y).round(-ydecim + 1); 
		}
		return [x, y];
	},

		template: '<svg version="1.1" baseProfile="full" width="{{size.x}}" height="{{size.y}}" viewBox="{{xaxis.min}} {{yaxis.min}} {{xaxis.max - xaxis.min + 5}} {{yaxis.max - yaxis.min + 5}}" xmlns="http://www.w3.org/2000/svg" > \
  <defs> \
    <filter id="blurred">\
<feGaussianBlur in="SourceGraphic" stdDeviation="{{scalefactor}}" />\
    </filter>\
    <filter id="dropShadow">\
      <feGaussianBlur in="SourceAlpha" stdDeviation="{{2*scalefactor}}" />\
<feOffset dx="{{2*scalefactor}}" dy="{{-2*scalefactor}}" />\
      <feMerge>\
        <feMergeNode />\
        <feMergeNode in="SourceGraphic" />\
      </feMerge>\
    </filter>\
	<line id="xgridline" x1="0" y1="{{yaxis.min}}" x2="0" y2="{{yaxis.max}}" \
		  stroke-width="0.05%" \
		  stroke-dasharray="0.3%" stroke="black" /> \
	<line id="ygridline" x1="{{xaxis.min}}" y1="0" x2="{{xaxis.max}}" y2="0"\
		  stroke-width="0.05%" stroke-dasharray="0.3%" stroke="black" /> \
	<line id="xtick" x1="0" y1="{{yaxis.min}}" x2="0" y2="{{yaxis.max}}" stroke-width="0.02%" stroke="black" /> \
	<line id="ytick" y1="0" x1="{{xaxis.min}}" y2="0" x2="{{xaxis.max}}" stroke-width="0.02%" stroke="black" /> \
  </defs>\
  <g id="grid_labels" transform="translate(2.5, {{2.5 + yaxis.min + yaxis.max}}) scale(1, -1)">\
	<rect x="{{xaxis.min - 2.5}}" y="{{yaxis.min -  2.5}}" width="100%" height="100%" fill="{{canvas.color}}" />\
	{{#xgridlines}}\
	  {{# {line_x: .}}}\
      {{#if (Math.round(line_x/xaxis.resolution) == 0)}}\
        <line id="xgridline" x1="0" y1="{{yaxis.min}}" x2="0" y2="{{yaxis.max}}" \
		   stroke-width="0.05%" stroke-dasharray="none" stroke="black" /> \
	    <text transform="scale(1,-1) translate(0, {{-(yaxis.min + yaxis.max)}})" x="{{line_x}}" fill="black" font-size="{{xaxis.labelsize*1.5*scalefactor*20}}" text-anchor="middle" y="{{yaxis.max + 1}}">{{line_x.toFixed(xaxis.digits)}}</text>\
	  {{elseif ((Math.round(line_x/xaxis.resolution) % xaxis.ticks) == 0)}}\
	    <use xlink:href="#xgridline" x="{{line_x}}"/>\
	    <text transform="scale(1,-1) translate(0, {{-(yaxis.min + yaxis.max)}})" x="{{line_x}}" fill="black" font-size="{{xaxis.labelsize*scalefactor*20}}" text-anchor="middle" y="{{yaxis.max + 1}}">{{line_x.toFixed(xaxis.digits)}}</text>\
	  {{else}}\
	    <use xlink:href="#xtick" x="{{line_x}}" />\
      {{/if}}\
      {{/}}\
	{{/xgridlines}}\
	{{#ygridlines}}\
	  {{# {line_y: .}}}\
      {{#if (Math.round(line_y/yaxis.resolution) == 0)}}\
    	<line  x1="{{xaxis.min}}" y1="0" x2="{{xaxis.max}}" y2="0"\
		  stroke-width="0.05%" stroke-dasharray="none" stroke="black" /> \
	    <text y="{{line_y}}" fill="black" font-size="{{yaxis.labelsize*1.5*scalefactor*20}}" text-anchor="end" x="{{xaxis.min - 1}}" transform="translate(0,{{line_y*2.0 - yaxis.labelsize/2}} ) scale(1,-1)">{{line_y.toFixed(yaxis.digits)}}</text>\
	  {{elseif ((Math.round(line_y/yaxis.resolution) % yaxis.ticks) == 0)}}\
	    <use xlink:href="#ygridline" y="{{line_y}}"/>\
	    <text y="{{line_y}}" fill="black" font-size="{{yaxis.labelsize*scalefactor*20}}" text-anchor="end" x="{{xaxis.min - 1}}" transform="translate(0,{{line_y*2.0 - yaxis.labelsize/2}} ) scale(1,-1)">{{line_y.toFixed(yaxis.digits)}}</text>\
	  {{else}}\
    	<use xlink:href="#ytick" y="{{line_y}}"/>\
     {{/if}}\
     {{/}}\
	{{/ygridlines}}\
  </g>\
  <g id="cartesianplane_container" transform="translate(2.5, {{2.5 + yaxis.max + yaxis.min}})  scale(1, -1)"   >\
	<svg id="cartesianplane" x="{{xaxis.min}}" y="{{yaxis.min}}" width="{{xaxis.max - xaxis.min}}" height="{{yaxis.max - yaxis.min}}" viewBox="{{xaxis.min}} {{yaxis.min}} {{xaxis.max - xaxis.min}} {{yaxis.max - yaxis.min}}" on-click="gridclick" on-dblclick="delcircle" on-mousemove="{{#movingcircle.circle}}movecircle{{/movingcircle.circle}}" on-mouseleave="{{#movingcircle.circle}}undomovecircle{{/movingcircle.circle}}" on-mouseup="{{#movingcircle.circle}}stopmovecircle{{/movingcircle.circle}}">\
	  <rect id="cartesianrect"  x="{{xaxis.min}}" y="{{yaxis.min}}" width="{{xaxis.max - xaxis.min}}" height="{{yaxis.max - yaxis.min}}" fill="none" pointer-events="all"  fill="none" filter="url(#dropShadow)"/>\
	  {{#datasets}}\
	  <g id="dataset-{{name}}">\
		<polyline filter="url(#dropShadow)" id="dataset-{{name}}-line" points="{{datasets[.name].points}}" fill="none"\
				  stroke="{{pointcolor}}" stroke-width="{{1*scalefactor}}" />\
		{{#points}}\
		  <circle  cx="{{this.0}}" cy="{{this.1}}" r="{{5*scalefactor}}" fill="{{pointcolor}}" on-mousedown="startmovecircle"  filter="url(#blurred)" />\
		{{/points}}\
	  </g>\
	  {{/datasets}}\
	</svg>\
  </g>\
</svg>',
		oninit: function() {
			var ractive = this;
			ractive.on('startmovecircle', function(ev) {
				var ds_g_id = 'dataset-' + ractive.get('activedataset');
				if (ev.node.parentElement.id != ds_g_id) {
					this.fire('stopmovecircle');
					return true;
				}
				var circle_index = ractive.findAll('#' + ds_g_id + ' circle').indexOf(ev.original.target);
				ractive.set('movingcircle.circle', ev.node);
				ractive.set('movingcircle.idx', circle_index);
				// save old point
				ractive.set('movingcircle.opoint', ractive.get('dataset.points.'+circle_index));
				return true;
			});
			ractive.on('undomovecircle', function (ev) {
				var idx = ractive.get('movingcircle.idx');
				var points = ractive.get('dataset.points');
				ractive.set('dataset.points.' + idx, ractive.get('movingcircle.opoint'));
				ractive.set('movingcircle.*', null);
				points.sort(function (a, b) {
					return a[0] - b[0];
				});
				return false;
			});
			ractive.on('movecircle', function(ev) {
				var circle = ractive.get('movingcircle.circle');
				var idx = ractive.get('movingcircle.idx');
				var ads = this.get('activedataset');
				var points = ractive.get('datasets.' + ads + '.points');
				var p = points[idx];
				var evCoords = this.evCartesianCoords(ev, 1);
				ractive.set('datasets.' + ads + '.points.'+idx, [evCoords[0], evCoords[1]]);
				return true;
			});
			ractive.on('stopmovecircle', function(ev) {
				var circle = ractive.get('movingcircle.circle');
				var idx = ractive.get('movingcircle.idx');
				var ads = this.get('activedataset');
				var points = ractive.get('datasets.' + ads + '.points');
				if (circle) {
					var p = this.evCartesianCoords(ev, 1);
					if (points.count(function (el) { return el[0] == p[0];}) <= 1) {
						ractive.set('movingcircle.*', null);
     					points.sort(function (a, b) {
							return a[0] - b[0];
						});
					} else {
						ractive.fire('undomovecircle');
						return true;
					}
				}
				return true;
			});
			// circle remove dblclick
			var circledblclick_handler = function (ev) {
				ev.original.stopPropagation();
				ev.original.preventDefault();
				var ads = this.get('activedataset');
				var points = ractive.get('datasets.' + ads + '.points');
				
				var ds_g_id = 'dataset-' + ractive.get('activedataset');
				if (ev.original.target.parentElement.id != ds_g_id) return false;
				var circle_index = ractive.findAll('#' + ds_g_id + ' circle').indexOf(ev.original.target);
				
				if (circle_index >= 0) {
					points.removeAt(circle_index);
				}
				return false;
			}
			// adding a point
			var gridclick_handler = function (ev) {
				var circle = ractive.get('movingcircle.circle');
				var circle_index = ractive.findAll('circle').indexOf(ev.original.target);
				if (circle_index >= 0) {
					return false;
				}
				if (circle != null)
					return false;
				var ads = this.get('activedataset');
				var points = ractive.get('datasets.' + ads + '.points');
				if (ev.original.target === ractive.find('#cartesianrect')) {
					// check duplicate x values
					var p = this.evCartesianCoords(ev, 1);
					if (points.none(function (el) { return el[0] == p[0];})) {
						points.push(p);
     					points.sort(function (a, b) {
							return a[0] - b[0];
						});
					}
					return false;
				}
				return false

				;
			}
			ractive.on('gridclick', gridclick_handler);
			ractive.on('delcircle', circledblclick_handler);
			ractive.observe('xaxis.min xaxis.max yaxis.min yaxis.max xaxis.resolution yaxis.resolution', function (newv, oldv, keyp) {
				ractive.set(keyp, parseFloat(newv));
				var xaxis = ractive.get('xaxis');
				var yaxis = ractive.get('yaxis');
				ractive.animate('size.y', ractive.get('size.x')*(yaxis.max - yaxis.min + 5)/(xaxis.max - xaxis.min + 5)); 
			});
		},
});
