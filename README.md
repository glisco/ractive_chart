# ractive_chart
A basic reactive cartesian chart, in the form of a Ractive.js component.
Data can be added to the active dataset by clicking on the chart canvas, double clicking on a point deletes the point,
dragging a point moves the point.  Datasets are dynamically sorted in respect to the x value.

See html/example.html (also here: http://svg.soon.it/ractive-chart/html/example.html) to see how to interact with datasets.

The following simply creates a clickable only chart with 2 datasets:
```html	
<div id="rtarget"></div>
<script id="rtemplate" type="text/ractivejs">
	<chart size='{x: 760.0, y: 220.0}' xaxis='{{xaxis}}'
		   yaxis='{{yaxis}}' datasets='{{datasets}}' activedataset='{{activedataset}}' />
</script>

<script src="../js/sugar.min.js"></script>
<script src="../js/ractive.min.js"></script>
<script src='../src/ractive_chart.js'></script>

<script>
var ractive = new Ractive({
	   	el: '#rtarget',
	   template: '#rtemplate',
	   data: {
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
			datasets: [{
					name: '0',
			  		type: 'circle',
			  		radius: '4',
			  		pointcolor: 'rgb(255,0,0)',
			  		snap: true,
			  		points: Array(),
				},
				{
					name: '1',
			  		type: 'circle',
			  		radius: '4',
			  		pointcolor: 'green',
			  		snap: true,
			  		points: Array(),
				},],
		 	activedataset: 0,
		 },
	   components: {
		 chart: ractive_chart.Chart,
	   },
	 });
</script>
```
