/*
 * gloabl var
 */

/*
 * tree panel
 */
var treeLoader =new Ext.tree.TreeLoader({dataUrl: 'site-info-bk.js'});
var treePanel = {
	//xtype : "treepanel",
	xtype : "treepanel",
	title : "子站结构",
	ref : "treeSite",
	region : "west",
	split : true,
	width : 300,
	minSize : 200,
	maxSize : 400,
	autoScroll : true,
	enableDD : true,
	root : {
		iconCls : "datatype-region",
		text : "天河区车陂站",
		nodeType : 'async'
	},
	//loader: treeLoader,
	// auto create TreeLoader
	//dataUrl : 'site-info-bk.js',
	loader:treeLoader,
	listeners: {
        click: function(node) {
        	//点击事件监听 通过n的attributes进行获取数据
        	 if(!node){
        		 return;
        	 }
        	
        	switch(node.attributes.iconCls){
        	case "datatype-device-unresolved":
        		//地图中没有此设备
        		highlightSelectedFeature([]);
                GVar.targetDeviceInfo = node.attributes.objectInfo;
                drawControl.activate();
                setDeviceInfo(node.text, node.attributes.objectInfo);
        		break;
        	case "datatype-device-resolved":
        		//地图中有此设备
        		var ied = node.attributes.objectInfo.ied;
        		var features = GVar.vectorLayer.getFeaturesByAttribute('ied', ied);
        		highlightSelectedFeature(features);
        		setDeviceInfo(node.text, node.attributes.objectInfo);
        		break;
        	case "datatype-subregion":
        		//区域
        		setOtherInfo(node.text, node.attributes.objectInfo);
        		break;
        	case "datatype-busbar":
        		//母线
        		var busbar = node.attributes.objectInfo.name;
        		var busbarId = node.attributes.busbarId;
        		var childrens = node.childNodes;
        		var hightFeatures = [];
        		for ( var i = 0; i < node.childNodes.length; i++) {
					childNode = node.childNodes[i];
					var fs = GVar.vectorLayer.getFeaturesByAttribute('name', childNode.attributes.text);
					hightFeatures = hightFeatures.concat(fs);
				}
    			//高亮当前选中母线下挂载的设备
    			highlightSelectedFeature(hightFeatures);
    			
        		setOtherInfo(node.text, node.attributes.objectInfo);
        		break;
        	case "datatype-region":
        		//站点
        		setOtherInfo(node.text, node.attributes.objectInfo);
        		break;
        	}
        	 

        },
        afterlayout: function()
        {
        	//console.log("load layout.");
        },
        load: function()
        {
        	//console.log("load node.");
        }
	},
	bbar : [ {} ]
};

function requestMethod(){
	console.log("requestMethod.");
}

treeLoader.on("load",function(node,response){
	//alert("加载节点数据完成！");
	GVar.map.addLayer(GVar.vectorLayer);
});

function highlightSelectedFeature(features){
	for ( var i = 0; i < GVar.vectorLayer.features.length; i++) {
		//关闭前一次高亮显示
		var f = GVar.vectorLayer.features[i];
		if(!f.hasAlarm){
			GVar.highlightControl.unhighlight(f);
		}
	}
	for ( var i = 0; i < features.length; i++) {
		GVar.highlightControl.highlight(features[i]);
	}
}