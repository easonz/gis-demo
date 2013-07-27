/*
 * global vars
 */

Ext.BLANK_IMAGE_URL = "ext/resources/images/default/s.gif";
OpenLayers.ProxyHost = "/PQWebGIS/cgi-bin/proxy.cgi?url=";
 
	var app, items = [],  selectedFeature;
	
	var ctrl, toolbarItems = [], action, actions = {};
	
	items.push(centerPanel);
	items.push(treePanel);
	items.push(infoPanel);

	Ext.onReady(function() {
		app = new Ext.Viewport({
			layout : "border",
		items : items
	});
	map = app.centerPanel.mapPanel.map;
	GVar.app = app;
	GVar.map = map;
	
	map.events.on({
		changebaselayer : function(){
			console.log("changebaselayer.");
		}
	});
	
	//map.setMaxExtent(new OpenLayers.Bounds(112.677, 22.677, 113.817, 23.400));
	//map.setExtent(OpenLayers.Bounds.fromArray([ 112.8, 22.8, 113.6, 23.2 ]));

	map.setCenter(new OpenLayers.LonLat(113.2, 23.0).transform(
		new OpenLayers.Projection("EPSG:4326"), 
		map.getProjectionObject()), 11);

	app.treeSite.getRootNode().expand(true);
	
	var tbar = app.centerPanel.mapPanel.getTopToolbar();

	var navigation = new OpenLayers.Control.Navigation();
	var navigationAction = new GeoExt.Action({
		text : "导航",
		control : navigation,
		enableToggle : false,
		tooltip : "",
		group : "draw",
		map : map,
		toggleGroup : "draw"
	})
	var createAction = new GeoExt.Action({
		text : "新建",
		control : drawControl,
		enableToggle : true,
		tooltip : "创建新的设备节点",
		group : "draw",
		map : map,
		toggleGroup : "draw"
	})
	var moveAction = new GeoExt.Action({
		text : "移动",
		control : dragControl,
		enableToggle : true,
		tooltip : "修改设备节点",
		group : "draw",
		map : map,
		toggleGroup : "draw"
	})
	var deleteAction = new GeoExt.Action({
		text : "删除",
		control : deleteControl,
		enableToggle : true,
		tooltip : "删除设备节点",
		group : "draw",
		map : map,
		toggleGroup : "draw"
	});
	var saveAction = new GeoExt.Action({
		text : "保存",
		handler : function() {

			for ( var i = 0; i < vectorLayer.features.length; i++) {
				var feature = vectorLayer.features[i];
				console.log("id : " + feature.id + "  status : "
						+ feature.state);
			}
			
			saveStrategy.save();
			
			/*
			var response = vectorLayer.protocol.commit(
					vectorLayer.features, {
						callback : function() {
							vectorLayer.redraw(true);
							//vectorLayer.reload();
						}
					});

			console.log(response);
			*/
			//vectorLayer.redraw();
			//vectorLayer.refresh();
			refreshStrategy.refresh();
		}
	})
	
	//toolbarItems.push(navigationAction);
	//toolbarItems.push("-");
	//toolbarItems.push(createAction);
	toolbarItems.push(moveAction);
	toolbarItems.push(deleteAction);
	toolbarItems.push("-");
	toolbarItems.push(saveAction);
	tbar.add(toolbarItems);

});