new function() {
//var gProj = null;
var gMap = null;
var gPolygonLayer = null;
var gCenterPointFeature = null; 
var gMarkers = null;
var gZoomLevel = 1;
var gMapData = {
	commandLines : []
};
var gBeforePopup = null;

var gMapClasses = ["smallmap", "mediummap", "largemap"];
var gSelectControl = null;

var debug = {
	dontLoadMap : false
};

function onMapZoom() {
/*	$('#zoom_level').text("1:" + Math.round(gMap.getScale()));
	$('#zoom_levels option:selected').attr('selected', '');
	$('#zoom_levels option[value=\'' + gMap.getZoom() + '\']').
		attr('selected', 'selected');
*/
	gMapData['zoomLevel'] = gMap.getZoom();
}

function onMapMove() {
	var c = gMap.getCenter();
	var b = gMap.calculateBounds();
	$('#center_lonlat').text(c.lon + "," + c.lat);
	$('#bounds_lonlat').text(b.left + "," + b.bottom + "," + 
							 b.right + "," + b.top);
	$('#center_point').val(c.lon + " " + c.lat);

	gMapData['centerPoint'] = c.lon + " " + c.lat;
}

function clearShapesFromMap() {
	gPolygonLayer.removeAllFeatures();
}

function drawShapeOnMap(shape) {
	var wktParser = new OpenLayers.Format.WKT();
	var feature = null;

	if (! shape['_feature'] && ! shape['disabled']) {
		feature = wktParser.read(shape.wkt);
		feature.styleMap = highlightStyleMap;
		gPolygonLayer.addFeatures([feature]);
		shape['_feature'] = feature;
	}

	return feature;
}

function drawShapesOnMap(drawOnlyActiveShapes) {
	for (var i = 0; i < gMapData['commandLines'].length; i++) {
		var isDisabled = gMapData['commandLines'][i]['disabled'];
		var showOnLoad = gMapData['commandLines'][i]['show'];
		var feature = gMapData['commandLines'][i]['_feature']; // alredy drawn?

		if (false === isDisabled) {
			if ( ! drawOnlyActiveShapes || (drawOnlyActiveShapes && false != showOnLoad)) {
				// only draw this shape if not alreayd on map				
				if (! feature) {
					feature = drawShapeOnMap(gMapData['commandLines'][i]);
				}

				// store the popup text if present
				if (gMapData['commandLines'][i]['html']) {
					feature['_html'] = gMapData['commandLines'][i]['html'];
				}

				// Programatically select the feature
				if (showOnLoad) {
					gSelectControl.select(feature);
				}
			}
		}
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

	select = $('#map_size');
	for (i = 0; i < gMapClasses.length; i++) {
		var option = $("<option />").val(gMapClasses[i]).text(gMapClasses[i]);
		if ($('body').hasClass(gMapClasses[i])) { option.attr('selected', "selected"); }
		select.append(option);
	}
}

function eraseMarkersAndPopups() {
	var i;
	for (i = 0; i < gMarkers.markers.length; i++) {
		gMarkers.removeMarker(gMarkers.markers[i]);
	}
	
	for (i = 0; i < gMap.popups.length; i++) {
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

function panToCenter() {
	var parts = gMapData.centerPoint.match(/([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)/);
	var centerLL = new OpenLayers.LonLat(parts[1], parts[2]);

	gMap.setCenter(centerLL);
}

function drawCenterPoint() {
	// this obscure regexp is for catching floats
	var parts = gMapData.centerPoint.match(/([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)/);
	var centerLL = new OpenLayers.LonLat(parts[1], parts[2]);

	gMap.setCenter(centerLL);
	
	eraseMarkersAndPopups();
	drawMarkerAndPopup(centerLL, OpenLayers.Popup.FramedCloud, "center");
}


function initViewEventHandlers() {
	$('#draw_btn').click(
		function() {	
			loadMapData();
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
			gMapData['zoomLevel'] = $(this).val();
		}
	);

	$('#map_size').change(
		function() {
			$('body').removeClass(gMapClasses.join(" "));
			$('body').addClass($(this).val());
			panToCenter();
		}
	);
}

function loadMapData() {
	gMapData['centerPoint'] = $('#center_point').val();
	gMapData['zoomLevel'] = $('#zoom_levels').val();
	gMapData['drawCommands'] = $('#draw_cmds').val();

	var lines = gMapData['drawCommands'].split(/\n/);
	for (var i = 0; i < lines.length; i++) {
		var cmds = lines[i].split(/\|/);
		gMapData['commandLines'].push( 
			{wkt : cmds[0],
			 html : cmds[1],
			 show : (cmds[2] && cmds[2] != "0") ? true : false,
			 disabled : (cmds[3] && cmds[3] != "0") ? true : false
			} );
	}
}

function createMap() {
	var mapProjection = new OpenLayers.Projection("EPSG:32633");
   	var map = new OpenLayers.Map( 
		'map', {
			projection: mapProjection,
  			maxExtent: new OpenLayers.Bounds(-2500000.0,3500000.0,3045984.0,9045984.0),
   			units: "m",
   			maxResolution: 2708.0, // tilsvarer zoom level 3 (hele er 21664.0)
   			numZoomLevels: 15 // egentlig 21, men maxResolution tilsvarer zoom level 3 (f¿lgelig er 0-3 skrudd av)
		});
	
	map.events.on(
		{ 
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

	return map;
}

function createPolygonSelectFeature() {
	var selectControl = new OpenLayers.Control.SelectFeature(
		gPolygonLayer, 
		{
            clickout: true, toggle: false,
            multiple: false, hover: false,
            toggleKey: "ctrlKey", // ctrl key removes from selection
            multipleKey: "shiftKey" // shift key adds to selection
		}
	);
	gSelectControl = selectControl;

	gMap.addControl(selectControl);
	selectControl.activate();
	
	gPolygonLayer.events.on({
      featureselected: function(evt) {
		  var feature = evt.feature;
		  if (feature['_html']) {
			  createPopup(feature, feature['_html']);
		  }
      },
      "featureunselected": function(evt){
          var feature = evt.feature;
    	  if (feature.popup) {
        	  gMap.removePopup(feature.popup);
        	  feature.popup.destroy();
        	  feature.popup = null;
    	  }
		  gMap.panTo(gBeforePopup);

      }
    });
}

function createPopup(feature, html) {
	gBeforePopup = feature.geometry.getBounds().getCenterLonLat();

    function onPopupClose() {
		gMap.removePopup(this);
		this.feature.popup = null;
		gSelectControl.unselect(this.feature);
		this.destroy();
	}

	var popup = new OpenLayers.Popup.FramedCloud("PolygonPopup",
                   								 feature.geometry.getBounds().getCenterLonLat(),
												 null,
												 html + " " + new Date(),
												 null,
                   								 true, onPopupClose);
          
    popup.panMapIfOutOfView = true;
    popup.autoSize = true;
    popup.opacity = 0.8;
    
    feature.popup = popup;
    popup.feature = feature;
    gMap.addPopup(popup);
}

function loadMap(){ 
	loadMapData();

	gProj  = new OpenLayers.Projection("EPSG:4326"); //Lat,Lng from Geolocation API

	gMap = createMap();

	var topo2 = new OpenLayers.Layer.WMS(
	   "Topografisk norgeskart2","http://opencache.statkart.no/gatekeeper/gk/gk.open?",
	   {layers: 'topo2', 
		format: 'image/jpeg'},
		{attribution:'<a href="http://www.statkart.no">Statens kartverk</a>, <a href="http://www.statkart.no/nor/Land/Fagomrader/Geovekst/">Geovekst</a> og <a href="http://www.statkart.no/?module=Articles;action=Article.publicShow;ID=14194">kommuner</a>'});

	gPolygonLayer = new OpenLayers.Layer.Vector("PolygonLayer");

	gMarkers = new OpenLayers.Layer.Markers("Center point marker");
	gMarkers.displayInLayerSwitcher = false;
	
	// ADD LAYERS (overlay and map)
	gMap.addLayers([topo2, gPolygonLayer, gMarkers]);

	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
	
	// Add needed controls 
	//	gMap.addControl(new OpenLayers.Control.LayerSwitcher());
	gMap.addControl(new OpenLayers.Control.ZoomBox());
	gMap.addControl(new OpenLayers.Control.ScaleLine({maxWidth:150}));

	// Adding draw feature (not sure about second param, but polygon seems to work)
	gMap.addControl(new OpenLayers.Control.DrawFeature(gPolygonLayer, 
													   OpenLayers.Handler.Polygon));

   	gMap.zoomToMaxExtent();
	gMap.setCenter(new OpenLayers.LonLat(314289,7159862));
	
	createPolygonSelectFeature();
	drawShapesOnMap(true);
	
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
}();