/*
 * global var
 */

/*
 * global functions
 */
function setDeviceInfo(title, map) {
	var prop = app.eastPanel.commonPropertyGrid;
	var linkPanel = app.eastPanel.linkPanel;
	linkPanel.show();
	prop.updateData(title, map);
}

function setOtherInfo(title, map) {
	var prop = app.eastPanel.commonPropertyGrid;
	var linkPanel = app.eastPanel.linkPanel;
	linkPanel.hide();
	prop.updateData(title, map);
}

/*
 * info show panel
 */

var propertyPanel ={
		xtype : "propertygrid",
		title : "设备信息",
		ref : "commonPropertyGrid",
		region : "center",
		height: 500,
		autoHeight: true,
		autoScroll : true,
		padding : 0,
		source : {
			" " : " "
		},
		listeners:{
			beforeedit :function(e){
				 e.cancel= true;
				  return false;
			},
			mouseover : function(e ) 
			{
				var ii=0;
			}
		},
		updateData: function(title, source)
		{
			var me = this;
			me.setTitle(title);
			me.setSource(source);
		}
    };
var serverPanel = {
		title : '其他信息',
		html : '<div><ul class="deviceLink ma">'
			+ '<li><a href="PQWebServer/HistoryDataView.jsp">历史数据</a></li>'
			+ '<li><a href="PQWebServer/RealDataView.jsp">实时数据</a></li>'
			+ '<li><a href="PQWebServer/DeviceManager.jsp">设备管理</a></li>'
			+ '</ul></div>',
		ref: 'linkPanel',
        region: 'south',
        flex: 1,
        minWidth: 80,
        height: 400,
        split: true,
        collapsible: true,
		updateData: function(title, html)
		{
			var me = this;
			me.setTitle(title);
			me.body.update(html);
		}
    };

var infoPanel = {
		region: 'east',
        //collapsible: true,
    	ref : "eastPanel",
        split: true,
        width: 300,
        //title: 'South',
        layout: {
            type: 'border',
            padding: 5
        },
        items: [ propertyPanel, serverPanel],
    	bbar : [ {} ]
	};
