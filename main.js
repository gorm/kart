var gProj = null;
var gMap = null;
var gPolygonLayer = null;
var gCenterPointFeature = null; 
var gMarkers = null;
var gZoomLevel = 1;

var debug = {
	dontLoadMap : false
};

function onMapZoom() {
	$('#zoom_level').text("1:" + Math.round(gMap.getScale()));
	$('#zoom_levels option:selected').attr('selected', '');
	$('#zoom_levels option[value=\'' + gMap.getZoom() + '\']').
		attr('selected', 'selected');
}

function onMapMove() {
	var c = gMap.getCenter();
	var b = gMap.calculateBounds();
	$('#center_lonlat').text(c.lon + "," + c.lat);
	$('#bounds_lonlat').text(b.left + "," + b.bottom + "," + 
							 b.right + "," + b.top);
	$('#center_point').val(c.lon + " " + c.lat);
}

function clearShapesFromMap() {
	gPolygonLayer.removeAllFeatures();
}

function drawShapesOnMap() {
	var t = $('#draw_cmds').val();
	var wktParser = new OpenLayers.Format.WKT();

	if (t) {
		var wkts = t.split(/\s*\n+\s*/);
		wkts.forEach(
			function(wkt) {
				if (wkt) {
					// TODO: throw error if wrong syntax
					var feature = wktParser.read(wkt);
					feature.styleMap = highlightStyleMap;
					// TODO: is on map?
					gPolygonLayer.addFeatures([feature]);
				}
			});
	}
}

function populateView(currentZoomLevel) {
	// zoom select
	var select = $('#zoom_levels');
	for (var i = 0; i < gMap.numZoomLevels; i++) {
		var option = $("<option />").val(i).text(i);
		if (currentZoomLevel == i) { option.attr('selected', "selected"); } 
		select.append(option);
	}
}

function eraseMarkersAndPopups() {
	for (var i = 0; i < gMarkers.markers.length; i++) {
		gMarkers.removeMarker(gMarkers.markers[i]);
	}
	
	for (var i = 0; i < gMap.popups.length; i++) {
		gMap.removePopup(gMap.popups[i]);
	}
}

function drawMarkerAndPopup(lonLat, type, content) {
	var f = new OpenLayers.Feature(gMarkers, lonLat);
	f.closeBox = true;
	f.popupClass = type;
	f.data.popupContentHTML = content;
	f.data.overflow = "hidden";
	
	//Set marker icon
	var size = new OpenLayers.Size(21,25);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
	f.data.icon = icon;

	var m = f.createMarker();
	gMarkers.addMarker(m);

	// cheat
	var popup = new type("poppy", lonLat, null, content, icon, true, function() {
							 eraseMarkersAndPopups();
						 });

	popup.marker = m;
	gMap.addPopup(popup);
	popup.show();

}

function drawCenterPoint() {
	// this obscure regexp is for catching floats
	var parts = $('#center_point').val().match(/([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)/);
	var centerLL = new OpenLayers.LonLat(parts[1], parts[2]);

	gMap.setCenter(centerLL);
	
	eraseMarkersAndPopups();
	drawMarkerAndPopup(centerLL, OpenLayers.Popup.FramedCloud, "center");
}

function initViewEventHandlers() {
	$('#draw_btn').click(
		function() {
			drawShapesOnMap();
		});

	$('#clear_btn').click(
		function() {
			clearShapesFromMap();
		}
	);

	$('#center_btn').click(
		function() {
			drawCenterPoint();
		}
	);

	$('#zoom_levels').change( 
		function() {
			gMap.zoomTo($(this).val());
		}
	);
}


function loadMap() {
	gProj  = new OpenLayers.Projection("EPSG:4326"); //Lat,Lng from Geolocation API

	var mapProjection = new OpenLayers.Projection("EPSG:32633");
   	gMap = new OpenLayers.Map( 'map', {
  		projection: mapProjection,
  		maxExtent: new OpenLayers.Bounds(-2500000.0,3500000.0,3045984.0,9045984.0),
   		units: "m",
   		maxResolution: 2708.0, // tilsvarer zoom level 3 (hele er 21664.0)
   		numZoomLevels: 15 // egentlig 21, men maxResolution tilsvarer zoom level 3 (f¿lgelig er 0-3 skrudd av)
	});
	gMap.events.on({
		zoomend: function() {
			onMapZoom();
		},
		moveend: function() {
			onMapMove();
		},
		removelayer: function(layer) {
			//console.log("Layer removed");
		},
		changelayer: function(event) {
			//console.log("Layer changed");
		}
	});

	var topo2 = new OpenLayers.Layer.WMS(
	   "Topografisk norgeskart2","http://opencache.statkart.no/gatekeeper/gk/gk.open?",
	   {layers: 'topo2', 
		format: 'image/jpeg'},
		{attribution:'<a href="http://www.statkart.no">Statens kartverk</a>, <a href="http://www.statkart.no/nor/Land/Fagomrader/Geovekst/">Geovekst</a> og <a href="http://www.statkart.no/?module=Articles;action=Article.publicShow;ID=14194">kommuner</a>'});

	var polygonLayer = new OpenLayers.Layer.Vector("PolygonLayer");
	gPolygonLayer = polygonLayer;

	gMarkers = new OpenLayers.Layer.Markers("Center point marker");
	gMarkers.displayInLayerSwitcher = false;
	
	// ADD LAYERS (overlay and map)
	gMap.addLayers([topo2, polygonLayer, gMarkers]);

	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
	
	// Add needed controls 
	gMap.addControl(new OpenLayers.Control.LayerSwitcher());
	gMap.addControl(new OpenLayers.Control.ZoomBox());

	// Adding draw feature
	gMap.addControl(new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon));

   	gMap.zoomToMaxExtent();
	gMap.setCenter(new OpenLayers.LonLat(314289,7159862));

	// Reset debug data
	onMapZoom();
	onMapMove();
}

function main() {
	if (!debug || debug && !debug.dontLoadMap) loadMap();
	populateView(gMap.getZoom());
	initViewEventHandlers();
}

$(main);