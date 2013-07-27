/**
 * 获取设备列表数据类型js文件
 * 尚未完成，需要将读到的json字符串，转化成json对象才行，具体要怎么操作，可能需要研究 proxy 的实现方法才行
 */
Ext.require('Ext.util.Cookies');
Ext.require('zhiyuan.panel.PQTreePanel');

// 数据类型对象
var dataTypeObj = null;

// 数据对象
var dataObj = null;

// 菜单项
contextMenu = null;
contextPartMenu = null;

Ext.onReady(function () {

	var e = Ext.get("dataTypeViewIdDefault"); 
	var viewIdDefault = parseInt(e.getValue());
	
	//初始化菜单
	initMenu();
	
	//创建树列表
	initTree(viewIdDefault);
	
	var length = Ext.select(".tagsMenu .RTags").elements.length;

	//事件绑定 
	//给元素绑定click事件
	for(var i=0;i<length;i++)
	{
		var $this = Ext.get(Ext.select(".tagsMenu .RTags").elements[i]); 
		$this.on("click", tagsMenuClickHandler);
	}

});

/**
 * 初始化菜单
 */
function initMenu(){
	
	//右键菜单点击响应事件
	var clickHandler = function(item){
		var node = dataTypeObj.leftSelectNode;
    	if(node){
        	switch(item.text)
        	{
        		case "全选":
        			dataTypeObj.checkAll(node);
        			break;
        		case "反选":
        			dataTypeObj.checkInverse(node);
        			break;
        		case "取消选择":
        			dataTypeObj.unCheckAll(node);
        			break;
        	}
    	}
    	contextMenu.hide();
    	contextPartMenu.hide();
	}
	
	//新建菜单对象
	contextMenu = Ext.create('Ext.menu.Menu', {
        items: [
            {
            	text: '全选',
            	handler: clickHandler
            },
            {
            	text: '反选',
            	handler: clickHandler
            },
            {
            	text: '取消选择',
            	handler: clickHandler
            }
        ]
    });
    //部分菜单
	contextPartMenu = Ext.create('Ext.menu.Menu', {
        items: [
                {
                	text: '取消选择',
                	handler: clickHandler
                }
            ]
        });
}
/**
 * 初始化tree列表
 * @param {} viewId
 */
function initTree(viewId)
{
		//创建树列表
	dataTypeObj = Ext.create('zhiyuan.panel.PQTreePanel', {
		renderTo : 'treeCmp',
        height: 510,
        width: 218,
        border:0,
        scroll: "none", 
        viewConfig:
    	{
            autoScroll: true,
            forceFit:false,
            cls:"treeView-scorll",
//            width:1700,
			loadingText : "加载中...",
			listeners: {
                itemcontextmenu: showMenuHander
			}
    	},
    	listeners:{
    		load:loadRecordsHander
    	}
    	
	}, viewId);
}

/**
 * 导航栏切换事件监听响应函数
 * @param {} e
 * @param {} t
 * @param {} eOpts
 */
function  tagsMenuClickHandler( e, t, eOpts ) { 
		var $t = Ext.get(t);
		SetActivePage($t.id);
		var viewId = parseInt($t.getAttribute("value"));
		
		if(viewId != dataTypeObj.viewId)
		{
			Ext.destroy(dataTypeObj);
			initTree(viewId);
		}
		else{
			dataTypeObj.updateTree(viewId);//重新定义选择项
		}
		Ext.fly("dataTypeViewIdDefault").set({"value":viewId});
		//释放
		if(destroyDataView)
		{
			destroyDataView();
		}
	}; 

/**
 * 加载数据项load触发事件响应函数， 主要是读取Cookies中的节点选择更新到视图中
 * @param {} store 
 * @param {} records 所有记录项
 */
function loadRecordsHander(store, records){
	var viewId = store.proxy.extraParams.viewId;
	var cookiesIndex = Ext.util.Cookies.get(Ext.getDom("loginName").innerHTML+viewId);
	var cookiesIed = Ext.util.Cookies.get(Ext.getDom("loginName").innerHTML+viewId +  "IED");
	initForCookies(records, cookiesIndex, cookiesIed);	
}

/**
 * 显示菜单控制 树形控件右击出发时间
 * @param {} view 当前视图
 * @param {} rec 触发邮件菜单的记录对象
 * @param {} node 响应事件节点
 * @param {} index 响应事件节点的index
 * @param {} e 事件对象
 * @return {Boolean} 返回false可以阻止事件监听，可响应菜单弹出
 */
function showMenuHander (view, rec, node, index, e) {
		e.stopEvent();
		//设置当前选中节点
		view.select(rec);
		//只开启数据项节点的上层节点
		if(rec.childNodes.length>0&&rec.childNodes[0].data.leaf&&rec.childNodes[0].data.checked!=null){
			dataTypeObj.leftSelectNode = rec;
			contextMenu.showAt(e.getXY());
        	return false;
        }
        else  if(rec.childNodes.length>0){
        	dataTypeObj.leftSelectNode = rec;
        	contextPartMenu.showAt(e.getXY());
        	return false;
        }
        else
        {
        	return true;
        }
}

/**
 * @brief 释放销毁的图形对象
 */

function clearDataObj(){
	if ( dataObj ) {
		dataObj.myDestroy();
		Ext.destroy(dataObj);
		dataObj = null;
	}
}

/**
 * @brief 获取实时数据或历史数据页面中的对象或DOM元素
 */

function destroyDataView() {
	clearDataObj();

	// 实时数据或历史页面的自定义销毁操作
	myDestroy();
}

/**
 * @brief 获取选中项数据对象
 * @return 返回获取选中项数据对象
 */

function getChecked() {
	return dataTypeObj.getChecked();
}

/**
 * @brief 获取选中项数据对象，并转换成ExtJS数据模型数组返回
 * @return 返回获取选中项数据ExtJS数据模型数组
 */

function getCheckRecordAddCookies(wiewId) {
	var records = [];

	var checkItems = dataTypeObj.getChecked();
	var strRecords = ",";
	var strIed = ",";
	
	Ext.Array.each(checkItems, function(rec){
		var dataItem = Ext.create('zhiyuan.model.PQDataTypeModel', {
			text: rec.get('text'),
			dataItemNum: rec.get('dataItemNum'),
			dataIndex: rec.get('dataIndex'),
			parentName: rec.get('parentName'),
			ied: rec.get('ied'),
			unit: rec.get('unit')
		});
		
        records.push(dataItem);
        
        //保存到cookies中
		strRecords += rec.get('dataIndex')+",";
		if(strIed.match(","+ rec.get('ied')+",")==null)
		{
			strIed +=  rec.get('ied')+",";
		}
    });

	Ext.util.Cookies.set(Ext.getDom("loginName").innerHTML+wiewId, strRecords);
	Ext.util.Cookies.set(Ext.getDom("loginName").innerHTML+wiewId + "IED", strIed);

	return records;
}
/**
 * 检查数据个数和组个数是否满足要求
 * @param checkRecords 检测的数据项列表
 * @returns {Boolean} 满足要求否
 */
function checkData(checkRecords){
	if (checkRecords.length <= 0) {
		alert("请先在左边树形结构中选中数据项!");
		return false;
	}
	var keyArray = [], keyObject = {};
	var addKey = function (key) {
	    if (!keyObject[key]) {
	        keyObject[key] = 1;
	        keyArray[keyArray.length] = key;
	    }
	};
	Ext.Array.each(checkRecords, function(rec){
		addKey(rec.get('dataItemNum'));
	});
	if(keyArray.length>5)
	{
		alert("最大支持显示五组数据，请重新选择数据项！");
		return false;
	}
	return true;
}

/**
 * @brief 构造选中项的唯一ied列表
 * @return 唯一的ied列表
 */

function getCheckIedUnique() {
	var ieds = [];
	
	var checkItems = dataTypeObj.getChecked();

	Ext.Array.each(checkItems, function(rec){
		ieds.push(rec.get('ied'));
	});

	ieds = Ext.Array.unique(ieds);

	return ieds;
}

/**
 * @brief 构造特定请求参数列表。以ied为条件，所有ied下的请求项
 * @return 以 ied;ids 为数据单元的数组
 */

function getCheckIds() {
	var dataIds = [];
	
	var checkItems = dataTypeObj.getChecked();

	var curIed = "";
	var strParam = "";
	
	Ext.Array.each(checkItems, function(rec) {
		
		if (rec.get('ied') != curIed) {
			if (strParam != "") {
				dataIds.push(strParam);
			}			
			
			curIed = rec.get('ied');
			
			strParam = curIed;
			strParam += ";";
		}
		strParam += rec.get('dataIndex');
		strParam += ","
		
	});
	
	if (strParam != "") {
		dataIds.push(strParam);
	}
	
	// console.log(dataIds);

	return dataIds;
}

function initForCookies(records, cookiesIndex, cookiesIed)
{
	if(cookiesIed==null || cookiesIed=="" || cookiesIndex==null || cookiesIndex=="")
	{
		return;
	}
	var node = records.firstChild;
	while (node) {
		if(node.data.checked!=null && cookiesIed.match(","+node.data.ied+",")!=null && cookiesIndex.match(","+node.data.dataIndex+",")!=null) 
    	{
			node.data.checked = true;
    	}
		initForCookies(node,  cookiesIndex, cookiesIed);
		node = node.nextSibling;
	}
}