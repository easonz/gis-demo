/**
 * 设备管理页面脚本
 */

Ext.require('zhiyuan.panel.PQTreePanel');

var devTree = null;			//设备树形列表
//var treeStore = null;		//设备树数据源
var updateTask;				//更新设备列表信息定时器

Ext.onReady(function () {
	SetActivePage("deviceMgrPage");
//	treeStore = Ext.create('Ext.data.TreeStore', {
//			model: 'zhiyuan.model.PQDataTypeModel',
//	        proxy: {
//				type : 'ajax',
////				url : 'getDevTree.action',
//				extraParams : {
//					viewId : 1
//				}
//	        }
//	});
		
	devTree = Ext.create('Ext.tree.Panel', {
			renderTo : 'devtree', 
//			viewConfig: {
//	            plugins: {
//	                ptype: 'treeviewdragdrop'
//	            },
//				listeners:{  
//			        beforedrop:function(node,data,overModel,dropPosition,dropFunction){  
//			        	var srcText = data.records[0].get('text');
//			        	var srcIcon = data.records[0].get('iconCls');
//			        	var destText = overModel.get("text");
//			        	var destIcon = overModel.get("iconCls")
//			        	if (destIcon != 'pqdev-none' && destIcon != ""){ //如果目标节点不是区域，不能移动
//			        		return false;
//			        	}
//			        	if (destIcon == ""){
//			        		destText = "";
//			        	}
//			        	if (srcIcon == 'pqdev-none'){ //如果是移动区域节点
//			        		changeRegionParent(srcText, destText);
//			        	}
//			        	else{ //如果是移动设备节点
//			        		changeDevParent(srcText, destText);
//			        	}
//			        	return false;
//			        }  
//			    }  
//	        },
	        rootVisible : true,
	        border:0,
	        root: {
	            text: "Root",
	            expanded: true
	        },
//			store : treeStore,
			height: 510,
	        width: 218
	});
	
	updateTask = {
		 run : function() {
			 updateDevTree();
		 },
		 interval : 5000	 // 2 second
	}
	Ext.TaskManager.start(updateTask);
	
	var ret = devTree.addListener('itemclick', itemclick);

});

var devTreeJson = "";
function updateDevTree(){
	Ext.Ajax.request({
		url : "getDevTree.action",
		success : function(response) {
			if (devTreeJson != response.responseText){
				devTreeJson = response.responseText;
				var jsonObj = Ext.JSON.decode(devTreeJson);
				if(jsonObj.message)
				{
					Ext.TaskManager.stop(updateTask);
					Ext.Msg.show({
					     title:'提示',
					     msg: jsonObj.message,
					     buttons: Ext.Msg.OK,
					     icon: Ext.Msg.ERROR
					});
				}
				else{
					devTree.setRootNode({
					    text: 'Root',
					    expanded: true,
					    iconCls: 'datatype-region',
					    children: jsonObj
					});
				}
			}
		}
	});
}

function itemclick(view, record, item, index, e, eOpts){
	var icon = record.get("iconCls");
	var text = record.get("text");
	switch(icon)
	{
		case "datatype-none":
			//设备查看
			devclick(text);
			break;
		case "pqdev-none":
		case "datatype-subregion":
		case "datatype-region":
			//区域查看
			regionclick(text);
			break;
		case "datatype-busbar":
			//母线查看
			busbarclick(text);
			break;
		case "datatype-busbarboard":
			//板卡查看
			//获取设备信息
			var deviceName = record.parentNode&&record.parentNode.get("text");
			busbarboardclick(deviceName,text);
			break;
		default:
			showDisplayDiv("regiondiv");
			setDomDisplay("addRegionBtn","");
			setDomDisplay("modregion","none");
			setDomDisplay("delregion","none");
			Ext.getDom("regionname").value="";
			Ext.getDom("modregname").value="";
			break;
	}
}

function regionclick(name){
	showDisplayDiv("regiondiv");
	setDomDisplay("addRegionBtn","");
	setDomDisplay("modregion","");
	setDomDisplay("delregion","");
	Ext.getDom("regionname").value = name;
	Ext.getDom("modregname").value = name;
}

function setDomDisplay(domID, value)
{
	var dom = Ext.getDom(domID);
	dom && (dom.style.display = value);
}

function setDomValue(domID, value)
{
	if(value==undefined) return;
	var dom = Ext.getDom(domID);
	dom && (dom.value = value);
}

function devclick(ied){
	Ext.Ajax.request({
		url : "getDevice.action",
		params : {
			"device.ied" : ied
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			showDisplayDiv("devdiv");
			Ext.getDom("ied").value = jsonObj.ied;
			Ext.getDom("ip").value = jsonObj.ip;
			Ext.getDom("devtype").value = jsonObj.type;
			
			//显示隐藏版本信息
			verHideAndShoew("hardver", jsonObj.hardver);
			verHideAndShoew("softver", jsonObj.softver);
			verHideAndShoew("firmver", jsonObj.firmver);
		}
	});
}

function verHideAndShoew(name, value)
{
	if(value==null || value=="")
	{
		Ext.get(Ext.get(name).dom.parentNode).hide()
	}
	else
	{
		Ext.getDom(name).value = value;
	}
}

function busbarclick(name)
{
	Ext.Ajax.request({
		url : "getBusbar.action",
		params : {
			"busbar.name" : name
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			showDisplayDiv("busbardiv");
			setDomValue("busbarname",jsonObj.name);
			setDomValue("busbarvoltage",jsonObj.voltage);
			setDomValue("busbarremark",jsonObj.remark);
		}
	});
}

function busbarboardclick(deviceName, text)
{
	Ext.Ajax.request({
		url : "getBusbarBoard.action",
		params : {
			"deviceName" : deviceName,
			"boardIndex": text
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			showDisplayDiv("busbarboarddiv");
			setDomValue("boardIndex",jsonObj.boardIndex);
			setDomValue("boardType",jsonObj.strBoardType);
			setDomValue("boardpos",jsonObj.pos);
		}
	});
}

function showDisplayDiv(divName)
{
	setDomDisplay("busbardiv","none");
	setDomDisplay("devdiv","none");
	setDomDisplay("busbarboarddiv","none");
	setDomDisplay("regiondiv","none");
	setDomDisplay(divName,"");
}

function modifyRegion(){
	var oldname = Ext.getDom("regionname").value;
	var newname = Ext.getDom("modregname").value;
	if (newname == ""){
		alert("区域名不能为空");
		return;
	}
	Ext.Ajax.request({
		url : "modRegion.action",
		isUpload : true,
		form : "regionform",
		params : {
			regionName : oldname,
			"region.name" : newname
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (0 == jsonObj.result)
				alert("修改区域信息成功");
			else
				alert("修改区域信息失败");
		}
	});
}

function changeRegionParent(region, parent){
	Ext.Ajax.request({
		url : "changeRegionParent.action",
		params : {
			regionName : region,
			"region.father" : parent
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (0 == jsonObj.result)
				alert("修改区域父节点成功");
			else
				alert("修改区域父节点失败");
		}
	});
}

function changeDevParent(dev, parent){
	Ext.Ajax.request({
		url : "changeDevRegion.action",
		params : {
			ied : dev,
			"device.region" : parent
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (0 == jsonObj.result)
				alert("修改设备所属区域成功");
			else
				alert("修改设备所属区域失败");
		}
	});
}

function deleteRegion(){
	var regionName = Ext.getDom("regionname").value;
	var root = devTree.getRootNode();
	var regionNode = getRegionByName(root, regionName);
	if (regionNode == null){
		alert("不存在对应区域节点");
		return;
	}
	if (regionNode.hasChildNodes()){
		alert("区域下存在子区域或设备，不能删除");
		return;
	}
	if (confirm("确定删除区域"+regionName) == 1){
		Ext.Ajax.request({
			url : "delRegion.action",
			params : {
				regionName : regionName
			},
			success : function(response) {
				var jsonObj = Ext.JSON.decode(response.responseText);
				if (0 == jsonObj.result)
					alert("删除区域成功");
				else
					alert("删除区域失败");
			}
		});
	}
}

function getRegionByName(treeNode, name){
	if (treeNode.data.iconCls == 'pqdev-none' && treeNode.data.text == name)
		return treeNode;
	var children = treeNode.childNodes;
	for (var i=0; i<children.length; i++) {
        var node = getRegionByName(children[i], name);
        if (node != null)
        	return node;
    }
	return null;
}

function addRegion(){
	var parent = Ext.getDom("regionname").value;
	var regionname = Ext.getDom("modregname").value;
	if (regionname == ""){
		alert("区域名不能为空");
		return;
	}
	Ext.Ajax.request({
		url : "addRegion.action",
		isUpload : true,
		form : "regionform",
		params : {
			"region.name" : regionname,
			"region.father" : parent
		},
		success : function(response) {
			//alert(response.responseText);
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (0 == jsonObj.result)
				alert("增加区域成功");
			else
				alert("增加区域失败");
		}
	});
}

