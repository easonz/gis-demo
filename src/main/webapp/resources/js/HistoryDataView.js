Ext.require('Ext.util.Cookies');

Ext.onReady(function () {
	SetActivePage("HistoryDataViewPage");
	
	Ext.create('Ext.ux.form.DateTimeFieldBetween', {
		renderTo: 'dateTimePicker'
	});

	initElemStatus();
});

function initElemStatus() {
	var elemUncompleted = Ext.get('uncompleted');
	elemUncompleted.setDisplayed(false);
}


function beginToAnalyze() {

	var startdtCmp = Ext.getCmp("startdt").getValue();
	var enddtCmp = Ext.getCmp("enddt").getValue();

	var startdt = new Date(startdtCmp);
	var enddt = new Date(enddtCmp);
	
	var startdtFormat = Ext.Date.format(startdt, 'Y-m-d H:i:s'); 
	var enddtFormat = Ext.Date.format(enddt, 'Y-m-d H:i:s'); 

	var timeCount = (enddt.getTime() - startdt.getTime()) / 1000; 

	if (timeCount <= 0) {
		alert("结束时间必须大于起始时间!");
		return ;
	}

	var dataTypeElem = Ext.fly('dataTypeViewIdDefault');
	var dataType = parseInt(dataTypeElem.getValue());
// 屏蔽统计方式
//	var statisticsTypeElem = Ext.fly('statisticsType');
//	var statisticsType = parseInt(statisticsTypeElem.getValue());

	// console.log(startdtFormat + ", " + enddtFormat);
	// console.log(timeCount);
	
	var checkRecords = getCheckRecordAddCookies(dataType);

	//检查数据个数和组个数是否满足要求
	if(!checkData(checkRecords))
	{
		return;
	}

	// 调用DataType中的销毁数据面板中的对象和元素
	destroyDataView();
	
	switch (dataType) {
	case 0:
		// 获取报表下载列表
		
		initReportDownloadDom();
		
		var timeRange = {};
		timeRange.start = startdt.getTime();
		timeRange.end = enddt.getTime();
		
		
		dataObj = Ext.create('zhiyuan.panel.PQGridManager', {
			renderTo : 'historyDataViewCmp',
			gridType: 'zhiyuan.panel.PQReportFilePanel',
			type: 'reportFile',
			historyStart: startdt,
			historyStop: enddt,
			width: 921,
			height: 380, 
			count: 10
		}, checkRecords);
		
		//var elemContent = Ext.get('transientListContent');
		for(var i=0,l=checkRecords.length;i<l;i++)
		{
			var ied = checkRecords[i].get('ied');
			initReportFileEvent(ied);
			var deviceContent = Ext.get('gridChild_' + ied);
			var fileNames = deviceContent.select('td.x-grid-cell-first');
			// console.log(fileNames);
		}
		
		
		break;
	case 8:
		
		dataObj = Ext.create('zhiyuan.chart.PQChartManager', {
			renderTo : 'historyDataViewCmp',
			chartType: 'zhiyuan.chart.PQTrendChart',
			historyStart: startdt,
			historyCount: timeCount,
			width: 921,
			height: 330,
			//statisticsType: statisticsType,
			count: timeCount,
			zoomable: true,
			saveable: true
		}, checkRecords, 'curDate');

		dataObj.getHistoryData();
		
		break;
		
	case 16:

		dataObj = Ext.create('zhiyuan.panel.PQGridManager', {
			renderTo : 'historyDataViewCmp',
			type: 'trend',
			historyStart: startdt,
			historyCount: timeCount,
			width: 921,
			height: 380, 
			//statisticsType: statisticsType,
			count: 10
		}, checkRecords);
				
		break;

	case 32:
		// 暂态事件

		initTransientDom();

		var timeRange = {};
		timeRange.start = startdt.getTime();
		timeRange.end = enddt.getTime();
		
		showTransientFileList(checkRecords, timeRange);

		break;
		
	case 64:

		dataObj = Ext.create('zhiyuan.panel.PQGridManager', {
			renderTo : 'historyDataViewCmp',
			type: 'summary',
			historyStart: startdt,
			historyCount: timeCount,
			width: 921,
			height: 380, 
			//statisticsType: statisticsType,
			count: 10
		}, checkRecords);

		break;
		
	case 128:

		dataObj = Ext.create('zhiyuan.panel.PQGridManager', {
			renderTo : 'historyDataViewCmp',
			type: 'events',
			historyStart: startdt,
			historyCount: timeCount,
			width: 921,
			height: 380, 
			count: 10
		}, checkRecords);

		break;
		
	default:

		// 显示当前尚未实现
		elemUncompleted.setDisplayed(true);

		break;
	}
}

/**
 * @brief 初始化暂态事件所需要的DOM元素
 */

function initTransientDom() {
	var container = Ext.get('historyDataViewCmp');

	var divText = "";

	// 插入消息元素
	divText = "<div id='transientMessage' style='display:none;'></div>";
	var elemMessage = container.insertHtml(
		'beforeEnd',
		divText,
		true
	);
	elemMessage.setDisplayed(false);

	// 插入控制按钮
	divText = "<div id='transientControl'><input style='width:100px; height:30px;' type='button' value='返回列表' onclick='returnTransientFileList(true);'></div>";	
	var elemControl = container.insertHtml(
		'beforeEnd',
		divText,
		true
	);
	elemControl.setDisplayed(false);

	// 插入暂态列表
	divText = "<div id='transientList'></div>";
	container.insertHtml(
		'beforeEnd',
		divText
	);

	// 插入暂态事件图形容器
	divText = "<div id='transientCmp'></div>";
	container.insertHtml(
		'beforeEnd',
		divText
	);	
}

/**
 * @brief 初始报表下载所需要的DOM元素
 */
function initReportDownloadDom() {
	var container = Ext.get('historyDataViewCmp');

	var divText = "";

	// 插入消息元素
	divText = "<div id='reportFileMessage' style='display:none;'></div>";
	var elemMessage = container.insertHtml(
		'beforeEnd',
		divText,
		true
	);
	elemMessage.setDisplayed(false);

	// 插入控制按钮
	divText = "<div id='reportFileControl'><input style='width:100px; height:30px;' type='button' value='返回列表' onclick='returnTransientFileList(true);'></div>";	
	var elemControl = container.insertHtml(
		'beforeEnd',
		divText,
		true
	);
	elemControl.setDisplayed(false);

	// 插入列表
	divText = "<div id='reportFileList'></div>";
	container.insertHtml(
		'beforeEnd',
		divText
	);

	// 插入图形容器
	divText = "<div id='reportFileCmp'></div>";
	container.insertHtml(
		'beforeEnd',
		divText
	);	
}

/**
 * @brief 销毁创建的暂态事件DOM元素
 */

function destroyTransientDom() {
	var elem = null;

	elem = Ext.fly('transientMessage');
	if (elem != null) {
		elem.remove();
	}

	elem = Ext.fly('transientControl');
	if (elem != null) {
		elem.remove();
	}

	elem = Ext.fly('transientList');
	if (elem != null) {
		elem.remove();
	}

	elem = Ext.fly('transientCmp');
	if (elem != null) {
		elem.remove();
	}
}

/**
 * @brief 创建新的暂态事件列表内容元素
 */

function createTransientListContent() {
	var elemFileList = Ext.get('transientList');

	var elemContent = Ext.get('transientListContent');
	if (elemContent) {
		elemContent.remove();
	}

	var divText = "<div id='transientListContent'  class='numList'></div>"
	elemFileList.insertHtml(
		'beforeEnd',
		divText
	);
}

function getIedIds(ied, checkRecords) {
	var ids = [];

	Ext.Array.each(checkRecords, function(rec){
		if (rec.get('ied') == ied) {
			ids.push(rec.get('dataIndex'));
		}
	});
		
	return ids;
}

function showTransientFileList(checkRecords, timeRange) {

	createTransientListContent();

	var ieds = [];
	Ext.Array.each(checkRecords, function(rec){
		ieds.push(rec.get('ied'));
	});

	ieds = Ext.Array.unique(ieds);
	
	// var ieds = getCheckIedUnique();
	for (var i = 0; i < ieds.length; i++) {
		var ids = getIedIds(ieds[i], checkRecords);
		
		getDeviceTransientFileList(
			ieds[i],
			ids,
			timeRange
		);
	}
}

/**
 * 初始化报表文件下载链接
 * @param ied
 */
function initReportFileEvent(ied)
{
	//TODO:
}

function getDeviceTransientFileList(ied, ids, timeRange) {

	Ext.Ajax.request({
		url : 'getNameListTransient.action',
		async: false,
		params: {
			ied: ied,
			dataIds: ids,
			startTime: timeRange.start,
			endTime: timeRange.end
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);

			if (jsonObj.status) {
				appendDeviceTransientFileList(ied, jsonObj.listData);
			} else {

				var elemMessage = Ext.fly('transientMessage');
				elemMessage.set({"class":"error"});
				elemMessage.update(jsonObj.message);
				elemMessage.show(true);
			}
		}
	});
}

function appendDeviceTransientFileList(ied, listFile) {
	var elemContent = Ext.get('transientListContent');
	
	var title = "<h3>" + ied + "</h3>";
	elemContent.insertHtml(
		'beforeEnd',
		title
	);
	
	var content = "<ol>";
	for (var i = 0; i < listFile.length; i++) {

		var link = "<li><a href='#' onclick=\"getTransientData('";
		link += ied;
		link += "', '";
		link += listFile[i];
		link += "');\">";
		link += listFile[i];
		link += "</a>";
		
		content += link;
		content += "</li>";
	}
	content += "</ol>";
	
	elemContent.insertHtml(
		'beforeEnd',
		content
	);
}

function getTransientData(ied, fileName) {

	// 隐藏事件文件列表
	var elemTransientList = Ext.get('transientList');
	elemTransientList.setDisplayed(false);

	var elemMessage = Ext.get('transientMessage');
	elemMessage.set({"class":"info"});
	elemMessage.update("正在获取暂态数据，请稍等...");
	elemMessage.show(true);
	
	Ext.Ajax.request({
		url : 'getDataListTransient.action',
		params: {
			ied: ied,
			fileName: fileName
		},
		success : function(response) {
			
			var jsonObj = Ext.JSON.decode(response.responseText);

			if (jsonObj.status) {
				elemMessage.setDisplayed(false);
				
				returnTransientFileList(false);

				showTransientChart(jsonObj.listData[0]);
			} else {

				elemMessage.update(jsonObj.message);
				elemMessage.show(true);
			}
		},
		failure: function(response) {
			elemMessage.update("获取暂态事件数据失败!");
			elemMessage.show(true);			
		}
	});
	
}

function showTransientChart(data) {

	clearDataObj();
	
	dataObj = Ext.create('zhiyuan.chart.PQTransientManager', {
		renderTo: 'transientCmp'
	}, data);
}

function returnTransientFileList(status) {
	var elemTransientList = Ext.get('transientList');
	elemTransientList.setDisplayed(status);
	
	var elemControl = Ext.get('transientControl');
	elemControl.setDisplayed(!status);

	if (status) {
		clearDataObj();
	}
}

function myDestroy() {
	destroyTransientDom();

	var elemUncompleted = Ext.get('uncompleted');
	elemUncompleted.setDisplayed(false);
}