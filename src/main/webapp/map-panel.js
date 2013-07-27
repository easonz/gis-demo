/*
 * global var
 */
var vectorLayer, markerLayer;
var selectControl, deleteControl, highlightControl, hoverControl, alarmControl, dragControl, drawControl;

GVar.targetDeviceInfo = {};

/*
 * local functions
 */
function saveChangeSuccess(a,b,c){
	console.log("saveChangeSuccess");
}

function saveChangeFailure(){
	console.log("saveChangeFailure");
}

var DeleteFeature = OpenLayers.Class(OpenLayers.Control, {
	initialize : function(layer, options) {
		OpenLayers.Control.prototype.initialize.apply(this, [ options ]);
		this.layer = layer;
		this.handler = new OpenLayers.Handler.Feature(this, layer, {
			click : this.clickFeature
		});
	},
	clickFeature : function(feature) {
		
		//confirm("您确定要删除设备吗？");
		// if feature doesn't have a fid, destroy it
		
		//删除设备节点后更新树型结构的节点显示状态
		var node = GVar.app.treeSite.getNodeById(feature.attributes.ied);
		if(node){
			var imgHtmlEl = node.getUI().getIconEl(); 
			Ext.fly(imgHtmlEl).removeClass("datatype-device-resolved");
			Ext.fly(imgHtmlEl).addClass("datatype-device-unresolved");
			node.attributes.iconCls = "datatype-device-unresolved";
		}
		
		if (feature.fid == undefined) {
			this.layer.destroyFeatures([ feature ]);
		} else {
			feature.state = OpenLayers.State.DELETE;
			this.layer.events.triggerEvent("afterfeaturemodified", {
				feature : feature
			});
			//feature.renderIntent = "select";
			this.layer.drawFeature(feature);
			/*this.layer.removeFeatures([feature]);
            if (feature.state != OpenLayers.State.INSERT) {
                feature.state = OpenLayers.State.DELETE;
                this.layer.addFeatures([feature]);
                this.layer.drawFeature(feature);
            }*/
		}
		
	},
	setMap : function(map) {
		this.handler.setMap(map);
		OpenLayers.Control.prototype.setMap.apply(this, arguments);
	},
	CLASS_NAME : "OpenLayers.Control.DeleteFeature"
});

/*
 * maps
 */
var saveStrategy = new OpenLayers.Strategy.Save();
saveStrategy.events.register("success", '', saveChangeSuccess);
saveStrategy.events.register("failure", '', saveChangeFailure);

var refreshStrategy = new OpenLayers.Strategy.Refresh();

var checkAlarmtask = {
		run : function() {
			checkAlarm(GVar.app.centerPanel.alermEventGrid, 10);
		},
		interval: 3000
};
vectorLayer = new OpenLayers.Layer.Vector(
		"设备图层",
		{
			styleMap : new OpenLayers.StyleMap({
				"default" : new OpenLayers.Style(OpenLayers.Util.applyDefaults(
						{
							// strokeColor: "#00FF00",
							// strokeOpacity: 1,
							// strokeWidth: 3,
							// fillColor: "#FF5500",
							// fillOpacity: 0.5,
							// pointRadius: 6,
							// pointerEvents: "visiblePainted",
							// label with \n linebreaks
							//label : "name: ${name}",
							label : "${name}",
							// fontColor: "${favColor}",
							// fontSize: "12px",
							// fontFamily: "Courier New, monospace",
							// fontWeight: "bold",
							labelAlign : "left",
							labelXOffset : "-25",
							labelYOffset : "17",
							labelOutlineColor : "white",
							labelOutlineWidth : 3,
							externalGraphic : "img/marker-nomal.gif",
							graphicOpacity : 1,
							rotation : 0,
							pointRadius : 10
						}, OpenLayers.Feature.Vector.style["default"])),
				"select" : new OpenLayers.Style({
					externalGraphic : "img/marker-blue.png"
				}),
				"temporary" : new OpenLayers.Style({
					externalGraphic : "img/marker-gold.png"
				}),
				"newAdded" : new OpenLayers.Style({
					externalGraphic : "img/marker-nomal.gif"
				}),
				"unknow" : new OpenLayers.Style({
					externalGraphic : "img/marker-unknow.gif"
				}),
				"alarm" : new OpenLayers.Style({
					externalGraphic : "img/marker-warning.gif"
				})
			}),
			strategies : [ new OpenLayers.Strategy.BBOX(), saveStrategy ,refreshStrategy],
			reportError: true,
			visibility: true,
			protocol : new OpenLayers.Protocol.WFS(
					{
						version : "1.1.0",
						// loading data through localhost url path
						url : "http://192.168.27.145:8080/PQWebGIS/geoserver/wfs",
						featureNS : "http://www.zhiyuan.com/test_postgis",
						// layer name
						featureType : "pq_device",
						featurePrefix : "test_postgis",
						// geometry column name
						geometryName : "geom",
						srsName: "EPSG:900913",
						schema : "http://192.168.27.145:8080/PQWebGIS/geoserver/wfs/DescribeFeatureType?version=1.1.0&typename=test_postgis:pq_device"
					}),
			eventListeners : {
				added : function(e){
					GVar.map.addControl(highlightControl);
					highlightControl.activate();

					GVar.map.addControl(selectControl);
					selectControl.activate();
					
					Ext.TaskMgr.start(checkAlarmtask);
					console.log("vector layer added to map.");
				},
				removed : function(e){
					Ext.TaskMgr.stop(checkAlarmtask);
					
					highlightControl.deactivate();
					GVar.map.removeControl(highlightControl);

					selectControl.deactivate();
					GVar.map.removeControl(selectControl);
					
					console.log("vector layer removed from map.");
				},
				loadstart : function(e){
					console.log("vector layer load start.");
				},
				loadend : function(e){
					for ( var i = 0; i < e.object.features.length; i++) {
						var feature = e.object.features[i];
						if(feature.attributes.ied){
							var node = GVar.app.treeSite.getNodeById(feature.attributes.ied);
							if(node){
								//修改树形结构设备节点显示状态
								var imgHtmlEl = node.getUI().getIconEl(); 
								Ext.fly(imgHtmlEl).removeClass("datatype-device-unresolved");
								Ext.fly(imgHtmlEl).addClass("datatype-device-resolved");
								node.attributes.iconCls = "datatype-device-resolved";
								//标记地图中已经存在
								node.mapExist = true;
								//将设备信息存入地图节点中
								var deviceInfo = node.attributes.objectInfo;
								feature.attributes.name = deviceInfo.name;
								feature.attributes.ied = deviceInfo.ied;
								feature.data.deviceInfo = deviceInfo;
								continue;
							}
						}
						//未知的地图节点
						feature.attributes.name = "unknow." + i;
						feature.originRenderIntent = "unknow";
						feature.renderIntent = "unknow";
						feature.data.deviceInfo = null;
					}
					console.log("vector layer load end.");
					//初始化每一个feature的设备属性信息，然后redraw();
					vectorLayer.redraw();
					
					var rootNode = GVar.app.treeSite.getRootNode();
					//设置模拟的站点信息
					rootNode.attributes.objectInfo = {
							name : rootNode.text,
							mapX : 123.135,
							mapY : 23.523
					};
					setOtherInfo(rootNode.attributes.objectInfo.name, rootNode.attributes.objectInfo);
				},
				beforefeatureadded : function(e){
					var feature = e.feature;
					if(feature.state == OpenLayers.State.INSERT){
						feature.attributes.name = GVar.targetDeviceInfo.name;
						feature.attributes.ied = GVar.targetDeviceInfo.ied;
						feature.renderIntent = "newAdded";
						feature.data.deviceInfo = GVar.targetDeviceInfo;
					}
				},
				featureadded : function(e){
					var feature = e.feature;
					if(feature.state == OpenLayers.State.INSERT){
						
						drawControl.deactivate();
						
						var node = GVar.app.treeSite.getNodeById(feature.attributes.ied);
						var imgHtmlEl = node.getUI().getIconEl(); 
						Ext.fly(imgHtmlEl).removeClass("datatype-device-unresolved");
						Ext.fly(imgHtmlEl).addClass("datatype-device-resolved");
						node.attributes.iconCls = "datatype-device-resolved";
						
						node.mapExist = true;
						/*
						var size = new OpenLayers.Size(32,32);
						var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
						var icon_marker = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png',
								size, 
								offset);
						marker = new OpenLayers.Marker(feature.geometry
								.getBounds().getCenterLonLat(), icon_marker);
						

						marker.events.register('mousedown', marker, function(e) {
							alert(this.icon.url);
							OpenLayers.Event.stop(e);
						});
						

						marker.events.register('mouseover', marker, function() {
							var msg = booth.get('name') + ' - '
									+ booth.get('premises');
							var popup = new OpenLayers.Popup.FramedCloud(
									"Popup", position, null, '<div>' + msg
											+ '</div>', null, false);
							map.addPopup(popup);
							marker.events.register('mouseout', marker,
									setTimeout(function() {
										popup.destroy();
									}, 4000));
						}); 
						
						// here add mouseover event

						//here add mouseout event
						marker.events.register('mouseout', marker, function(e) {popup.hide();});
						
						feature.marker = marker;
						markerLayer.addMarker(marker);
						*/
					}
				}
			}
		});

vectorLayer.onFeatureInsert = function() {
	console.log("feature inserted...");
};

vectorLayer.events.on({
	featureselected : function(e) {
	},
	featureunselected : function(e) {
	},
	refresh : function(){
		console.log("vector layer refresh.");
	}
});
GVar.vectorLayer = vectorLayer;

/*
 * controns
 */
drawControl = new OpenLayers.Control.DrawFeature(vectorLayer,
		OpenLayers.Handler.Point);

dragControl = new OpenLayers.Control.DragFeature(vectorLayer, {
	onStart : function(feature, pixel) {
		console.log(feature.geometry.toString());
	},
	onComplete : function(feature, pixel) {
		console.log(feature.geometry.toString());
		//feature.state = OpenLayers.State.UPDATE;
		if (feature.state != OpenLayers.State.INSERT) {
			feature.state = OpenLayers.State.UPDATE;
		}
	}
});
deleteControl = new DeleteFeature(vectorLayer, {
	title : "Delete Feature"
});

highlightControl = new OpenLayers.Control.SelectFeature([ vectorLayer ], {
	hover : true,
	highlightOnly : true,
	//highlightOnly : false,
	renderIntent : "temporary",
	eventListeners : {
		beforefeaturehighlighted : function(e) {
			var feature = e.feature;
			if(feature.hasAlarm){
				//feature.originRenderIntent = "alarm";
				//feature.renderIntent = feature.originRenderIntent;
				//console.log("alarm feature : ", feature.attributes.ied);
				return false;
			}
			//console.log("height feature : ", feature.attributes.ied);
		},
		featureunhighlighted : function(e) {
			var feature = e.feature;
			if(feature.hasAlarm){
				
			}else{
				if(feature.originRenderIntent){
					feature.renderIntent = feature.originRenderIntent;
					feature.layer.redraw(feature);
				}
				//console.log("unheight feature : ", feature.attributes.ied);
			}
		}
	}
});
GVar.highlightControl = highlightControl;

/*alarmControl = new OpenLayers.Control.SelectFeature([ vectorLayer ], {
	clickout : false,
	toggle : false,
	multiple : true,
	hover : false,
	renderIntent: "alarm",
	onSelect : function(feature){
		feature.hasAlarm = true;
		feature.originRenderIntent = "alarm";
		//console.log("alarm feature : ", feature.attributes.ied);
	},
	onUnselect : function(feature){
		feature.hasAlarm = false;
		//console.log("unalarm feature : ", feature.attributes.ied);
	},
});*/
alarmControl = new OpenLayers.Control.SelectFeature([ vectorLayer ], {
	hover : true,
	highlightOnly : true,
	renderIntent : "alarm",
	eventListeners : {
		beforefeaturehighlighted : function(e) {
			var feature = e.feature;
			console.log("alarm feature : ", feature.attributes.ied);
			/*if(feature.hasAlarm){
				return false;
			}*/
		},
		featurehighlighted : function(e) {
		},
		featureunhighlighted : function(e) {
			var feature = e.feature;
			/*
			if(feature.originRenderIntent){
				feature.renderIntent = feature.originRenderIntent;
			}*/
			feature.layer.redraw(feature);
			console.log("unalarm feature : ", feature.attributes.ied);
		}
	}
});
GVar.alarmControl = alarmControl;

function buildPopupContent(alarmInfo){
	var content = "<div class=''><ul class = 'alarmList'>"
		+ "<li> 时间: " + feature.alarmInfo[1] + "</li>"
		+ "<li> 事件: " + feature.alarmInfo[2] + "</li>"
		+ "</ul></div>";
	return content;
}
selectControl = new OpenLayers.Control.SelectFeature([ vectorLayer ], {
	clickout : true,
	toggle : false,
	multiple : false,
	hover : false,
	toggleKey : "ctrlKey", // ctrl key removes from selection
	multipleKey : "shiftKey", // shift key adds to selection
	onSelect : function(feature) {
		selectedFeature = feature;
		console.log("select feature : ", feature.attributes.ied);
		if (feature.hasAlarm) {
			var popup = new OpenLayers.Popup.FramedCloud("alarmInfo",
					feature.geometry.getBounds().getCenterLonLat(), 
					null, //new OpenLayers.Size(500, 300),
					"<div style='font-size:.8em'><ul class = 'alarmList'>"
						+ "<li> 设备: " + feature.alarmInfo[0] + "</li>"
						+ "<li> 时间: " + feature.alarmInfo[1] + "</li>"
						+ "<li> 事件: " + feature.alarmInfo[2] + "</li>"
						+ "</ul></div>",
					null, 
					true, 
					function(e) {
						feature.popup.closeByHand = true;
						selectControl.unselect(feature);
					});
			feature.popup = popup;
			map.addPopup(popup);
			popup.setSize(new OpenLayers.Size(170,50));
		}
		setDeviceInfo(feature.data.name, feature.data.deviceInfo);
	},
	onUnselect : function(feature){
		//selectedFeature = null;
		console.log("unselect feature : ", feature.attributes.ied);
		if(feature.hasAlarm){
			map.removePopup(feature.popup);
			if(feature.popup.closeByHand){
				feature.hasAlarm = false;
			}else{
				feature.renderIntent = "alarm";
			}
			feature.popup.destroy();
			feature.popup = null;
		}else{
			if(feature.originRenderIntent){
				feature.renderIntent = feature.originRenderIntent;
			}
		}
		feature.layer.redraw(feature);
	},
});
GVar.selectControl = selectControl;

//base layers
var localWms = new OpenLayers.Layer.WMS("本地图层",
		"http://192.168.27.145:8080/PQWebGIS/geoserver/wms", {
			layers : "test_postgis:gaode_13070517394112"
		}, {
			isBaseLayer : true
		});
/*
var gphy = new OpenLayers.Layer.Google("Google Physical", {
	type : G_PHYSICAL_MAP
});
var gmap = new OpenLayers.Layer.Google("Google Streets", // the default
{
	numZoomLevels : 20
});
var ghyb = new OpenLayers.Layer.Google("Google Hybrid", {
	type : G_HYBRID_MAP,
	numZoomLevels : 20
});
var gsat = new OpenLayers.Layer.Google("Google Satellite", {
	type : G_SATELLITE_MAP,
	numZoomLevels : 22
});
*/

var ol_wms = new OpenLayers.Layer.WMS("OpenLayers WMS",
		"http://vmap0.tiles.osgeo.org/wms/vmap0", {
			layers : 'basic'
		});
var gwc = new OpenLayers.Layer.WMS("Global Imagery",
		"http://maps.opengeo.org/geowebcache/service/wms", {
			layers : "bluemarble"
		}, {
			tileOrigin : new OpenLayers.LonLat(-180, -90)
		});

var googleMercator = new OpenLayers.Projection("EPSG:900913");
var wgs84 = new OpenLayers.Projection("EPSG:4326");
var layerOptions = {
		//projection: new OpenLayers.Projection("EPSG:900913"),
		//displayProjection: new OpenLayers.Projection("EPSG:4326"),
		maxExtent : new OpenLayers.Bounds(112.677, 22.677, 113.817, 23.400).transform(wgs84, googleMercator),
		units:'m'
	};
var qq = new OpenLayers.Layer.QQMap("QQ地图", [
		"http://p0.map.soso.com/maptilesv2/",
		"http://p1.map.soso.com/maptilesv2/",
		"http://p2.map.soso.com/maptilesv2/",
		"http://p3.map.soso.com/maptilesv2/" ], null);

var mapPanel = {
	xtype : "gx_mappanel",
	ref : "mapPanel",
	title : "子站地图",
	region : "center",
	tbar : [],
	map : {
		numZoomLevels : 19,
		projection: googleMercator,
		displayProjection: wgs84,
		// 使用maxExtent会导致qq地图显示错乱，但是如果不使用可能会导致地图图层重新加载，这时之前对地图的修改就会丢失
		//maxExtent : new OpenLayers.Bounds(112.677, 22.677, 113.817, 23.400).transform(wgs84, googleMercator),
		controls : [ new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.Attribution(),
				new OpenLayers.Control.PanPanel(),
				new OpenLayers.Control.PanZoomBar(),
				new OpenLayers.Control.ScaleLine(),
				new OpenLayers.Control.MousePosition(),
				new OpenLayers.Control.LayerSwitcher() ],
		allOverlays : false
	},
	//extent : OpenLayers.Bounds.fromArray([ 112.8, 22.8, 113.6, 23.2 ]).transform(wgs84, googleMercator),
	layers : [ localWms, ol_wms, qq]
	
};

// ---------------------------------------------------------------------
var gridStore = new Ext.data.ArrayStore ({
	fields: ["ied", "date", "info"]
});
var alermEventGridPanel = {
	xtype : "grid",
	ref : "alermEventGrid",
	title : "设备告警事件",
	region : "south",
	split : true,
	collapsible : true,
	height : 250,
	minSize : 150,
	maxSize : 400,
	sm : new GeoExt.grid.FeatureSelectionModel(),
	/*
	store : new GeoExt.data.FeatureStore(
			{
				fields : [ {
					name : "fid",
					type : "string"
				}, {
					name : "date",
					type : "string"
				}, {
					name : "info",
					type : "string"
				} ],
				proxy : new GeoExt.data.ProtocolProxy(
						{
							protocol : new OpenLayers.Protocol.WFS(
									{
										version : "1.1.0",
										// loading data through localhost url path
										url : "http://192.168.27.145:8080/PQWebGIS/geoserver/wfs",
										featureNS : "http://www.census.gov",
										// layer name
										featureType : "poi",
										featurePrefix : "tiger",
										// geometry column name
										geometryName : "the_geom",
										schema : "http://192.168.27.145:8080/PQWebGIS/geoserver/wfs/DescribeFeatureType?version=1.1.0&typename=tiger:tiger_roads"
									})
						}),
				autoLoad : true
			}),
			*/
	store : gridStore,
	columns : [ {
		header : "设备ID",
		width : "150",
		dataIndex : "ied"
	}, {
		header : "产生时间",
		width : "250",
		dataIndex : "date"
	}, {
		header : "告警信息",
		width : "150",
		dataIndex : "info"
	} ],
	bbar : [{}]
	/*
	bbar : [ {
		text : "筛选",
		handler : function() {
		}
	}, {
		text : "清空",
		handler : function() {
		}
	} ]*/
};

function checkAlarm(grid, maxCount){
	Ext.Ajax.request({
		url : 'CheckAlarmServlet.do',
		// url : 'generateGetRealTimeData.action',
		success : function(response) {
			
			var alarmInfos = Ext.util.JSON.decode(response.responseText);
			
			if(!grid.myBuffer){
				grid.myBuffer = [];
			}
			grid.myBuffer = alarmInfos.concat(grid.myBuffer);
			if(grid.myBuffer.length > maxCount){
				grid.myBuffer = grid.myBuffer.slice(0, maxCount);
			}
			
			grid.store.loadData(grid.myBuffer);
			
			for ( var i = 0; i < alarmInfos.length; i++) {
				var info = alarmInfos[i];
				var features = GVar.vectorLayer.getFeaturesByAttribute('ied', info[0]);
				if(features.length > 0){
					var f = features[0];
					f.hasAlarm = true;
					f.alarmInfo = info;
					f.renderIntent = "alarm";
					GVar.vectorLayer.redraw(f);
					//alarmControl.highlight(f);
				}
			}
		}
	});	
}


var centerPanel = {
	region : "center",
	ref : "centerPanel",
	layout : 'border',
	//border: false,
	items : [ mapPanel, alermEventGridPanel ]
};