/**
 * for lee..
 * 时间控件，from...to类型的
 *
 * @author yangjie
 * @date 2013-03-12
 * 强制设定起始时间控件id
 * 设定起始时间和结束时间为当前时间
 *
 */
Ext.define('Ext.ux.form.DateTimeFieldBetween', {
	extend: 'Ext.container.Container',
    alias: ['widget.datetimefieldbetween'],
    layout: 'hbox',
    format: 'Y-m-d H:i:s',
    defaultType: 'datetimefield',
    initComponent: function() {
    	var oThis = this;

    	this.items = [
    	    {
    	    	fieldLabel : '开始时间:',
				labelSeparator: '',
				labelWidth : 100,
				labelStyle: 'margin-right:0px;',
				cls:'dt',
				margin: '0 10 0 0',
                name: 'startdt',
                id: 'startdt',
				xtype: 'datetimefield',
				format: 'Y-m-d H:i:s',
				//value: new Date(2013,2,8,11,0,0)
				// value: new Date(2013, 4, 20, 11, 0, 0)
				// value: new Date(new Date().getTime() - 60000)
				// value: new Date(new Date().getTime() - 900000) // 1小时
				value: new Date(new Date().getTime() - 86400000)//1天
				// value: new Date()
    	    },
    	    {
    	    	fieldLabel : '结束时间:',
				labelWidth : 100,
				labelStyle: 'margin-right:0px;',
				labelSeparator: '',
                name: 'enddt',
                id: 'enddt',
				xtype : 'datetimefield',
				format : 'Y-m-d H:i:s',
				value: new Date()
				// value: new Date(2013, 4, 20, 12, 0, 0)
				// value: new Date(2013,4,9,13,0,0)
				// value: new Date(new Date().getTime() + 5000)
    	    }
    	];
    	
    	this.callParent(arguments);
    }
});