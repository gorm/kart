// Samme stiler som er brukt på norgeskart.no
// style for drawing point, line, polygon
var measureSketchSymbolizers = {
    "Point": {
        pointRadius: 4,
        graphicName: "square",
        fillColor: "white",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#333333"
    },
    "Line": {
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeColor: "#666666",
        strokeDashstyle: "dash"
    },
    "Polygon": {
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeColor: "#666666",
        fillColor: "white",
        fillOpacity: 0.3
    }
};
var measureStyle = new OpenLayers.Style();
measureStyle.addRules([
						  new OpenLayers.Rule({symbolizer: measureSketchSymbolizers})
					  ]);
var measureStyleMap = new OpenLayers.StyleMap({"default": measureStyle});
//************************************

// style for highlight point, line, polygon
var highlightSymbolizers = {
    "Point": {
        pointRadius: 9,
        fillColor: "#FF9933",
        fillOpacity: 0.4,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#FF9933"
    },
    "Line": {
        strokeColor: "#FF9933",
        strokeOpacity: 0.4,
        strokeWidth: 8,
        strokeLinecap: "round"
    },
    "Polygon": {
        strokeWidth: 3,
        strokeOpacity: 0.8,
        strokeColor: "#FF9933",
        fillColor: "#FF9933",
        fillOpacity: 0.5
    }
};
var highlightStyle = new OpenLayers.Style();
highlightStyle.addRules([
							new OpenLayers.Rule({symbolizer: highlightSymbolizers})
						]);
var highlightStyleMap = new OpenLayers.StyleMap({"default": highlightStyle});
//************************************

// style for selecting point, line, polygon
var selectSymbolizers = {
    "Point": {
        pointRadius: 9,
        fillColor: "#333333",
        fillOpacity: 0.4,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#333333"
    },
    "Line": {
        strokeColor: "#666666",
            strokeOpacity: 0.4,
        strokeWidth: 8,
        strokeLinecap: "round"
    },
    "Polygon": {
        strokeWidth: 3,
        strokeOpacity: 0.8,
        strokeColor: "#666666",
        fillColor: "#666666",
        fillOpacity: 0.5
        }
};
var selectStyle = new OpenLayers.Style();
selectStyle.addRules([
						 new OpenLayers.Rule({symbolizer: selectSymbolizers})
					 ]);
var selectStyleMap = new OpenLayers.StyleMap({"default": selectStyle});   
//************************************


    // style for drawing point, line, polygon
var measureSketchSymbolizers = {
    "Point": {
        pointRadius: 4,
        graphicName: "square",
        fillColor: "white",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
            strokeColor: "#333333"
    },
    "Line": {
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeColor: "#666666",
        strokeDashstyle: "dash"
    },
    "Polygon": {
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeColor: "#666666",
        fillColor: "white",
        fillOpacity: 0.3
    }
};
var measureStyle = new OpenLayers.Style();
measureStyle.addRules([
						  new OpenLayers.Rule({symbolizer: measureSketchSymbolizers})
					  ]);
var measureStyleMap = new OpenLayers.StyleMap({"default": measureStyle});
