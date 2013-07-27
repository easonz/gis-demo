
Ext.require('zhiyuan.model.PQDataTypeModel');
Ext.require('zhiyuan.chart.PQChartManager');
Ext.require('zhiyuan.panel.PQGridManager');
Ext.require('zhiyuan.panel.PQGridDataPanel');

Ext.onReady(function () {
	SetActivePage("RealDataViewPage");
	if(dataObj) dataObj.myDestroy();
});

function startDraw(curDateDomId, timeCountDomId) {
	// doStop();

	var elemUncompleted = Ext.get('uncompleted');
	elemUncompleted.setDisplayed(false);
	
	var realDataTypeElem = Ext.fly('dataTypeViewIdDefault');
	var realDataType = parseInt(realDataTypeElem.getValue());

	// 调用DataType中的销毁数据面板中的对象和元素
	destroyDataView();

	var timeCountElem = Ext.fly(timeCountDomId);	
	var timeCount = timeCountElem.getValue();

	var checkRecords = getCheckRecordAddCookies(realDataType);

	//检查数据个数和组个数是否满足要求
	if(!checkData(checkRecords))
	{
		return;
	}
	
	switch (realDataType) {
	case 1:
		
		dataObj = Ext.create('zhiyuan.chart.PQChartManager', {
			renderTo : 'realDataViewCmp',
			chartType: 'zhiyuan.chart.PQTrendChart',
			width: 921,
			height: 330, 
			count: timeCount
		}, checkRecords, 'curDate');

		break;

	case 2:
		
		dataObj = Ext.create('zhiyuan.chart.PQChartManager', {
			renderTo: 'realDataViewCmp',
			chartType: 'zhiyuan.chart.PQHarmonicChart',
			width: 921,
			height: 330 
		}, checkRecords, 'curDate');

		// // 显示当前尚未实现
		// elemUncompleted.setDisplayed(true);
		
		break;
		
	case 4:
		dataObj = Ext.create('zhiyuan.panel.PQGridManager', {
			renderTo : 'realDataViewCmp',
			width: 921,
			height: 330, 
			count: timeCount
		}, checkRecords, 'curDate');
		
		break;

	default:
		break;
	}

	doStart();
}

function doStart() {
	if (dataObj != null) {
		dataObj.registerRealTimeData();
	}
}

function doStop() {
	if (dataObj != null) {
		dataObj.unregisterRealTimeData();
	}
}

// 可以添加自定义的销毁操作
function myDestroy() {
	var elemUncompleted = Ext.get('uncompleted');
	elemUncompleted.setDisplayed(false);
}
