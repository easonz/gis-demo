//设置当前页面 导航栏
function SetActivePage(pageID){
	var $this = Ext.get(pageID);
	//向前寻找选中导航栏
	var next = $this.up("li").next(".activ");
	if(next!=null) next.removeCls("activ");
	//向后寻找选中导航栏
	var prev = $this.up("li").prev(".activ");
	if(prev!=null) prev.removeCls("activ");
	$this.up("li").addCls("activ");
}
/**    
 * 对Date的扩展，将 Date 转化为指定格式的String    
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符    
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)    
 * eg:    
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423    
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04    
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04    
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04    
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18    
 */     
Date.prototype.pattern=function(fmt) {      
    var o = {      
    "M+" : this.getMonth()+1, //月份      
    "d+" : this.getDate(), //日      
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时      
    "H+" : this.getHours(), //小时      
    "m+" : this.getMinutes(), //分      
    "s+" : this.getSeconds(), //秒      
    "q+" : Math.floor((this.getMonth()+3)/3), //季度      
    "S" : this.getMilliseconds() //毫秒      
    };      
    var week = {      
    "0" : "/u65e5",      
    "1" : "/u4e00",      
    "2" : "/u4e8c",      
    "3" : "/u4e09",      
    "4" : "/u56db",      
    "5" : "/u4e94",      
    "6" : "/u516d"     
    };      
    if(/(y+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));      
    }      
    if(/(E+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);      
    }      
    for(var k in o){      
        if(new RegExp("("+ k +")").test(fmt)){      
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));      
        }      
    }      
    return fmt;      
}    

//打印log
//function Log(msg){
//	if(!+[1,]){}
//	else{
//		console.log(msg);
//	}
//}

//关于我们 联系我们
Ext.require("Ext.window.MessageBox");

Ext.onReady(function(){
	Ext.window.MessageBox.prototype.buttonText={ 
			yes:' yes', 
			no:'否', 
			ok:'确定', 
			cancel:'取消' 
			};
	Ext.MessageBox = Ext.Msg = new Ext.window.MessageBox();
	Ext.fly("productAbout").on("click",function(){
		Ext.Msg.show({
		     title:'关于我们',
		     msg: '电能质量分析软件(PQS-II)&nbsp; 版本1.0.0.30603<br/>版权所有&nbsp;&nbsp;&copy;&nbsp;&nbsp;2013&nbsp;&nbsp;广州致远电子股份有限公司',
		     buttons: Ext.Msg.OK,
		     cls: "about",
		     icon: "logo"
		});
	});
	Ext.fly("productContact").on("click",function(){
		Ext.Msg.show({
		     title:'联系我们',
		     msg: '服务热线:&nbsp;&nbsp;400-800-4005<br/>[周一到周五&nbsp;&nbsp;8:00到18:00]',
		     buttons:  Ext.Msg.OK,
		     cls: "contact",
		     icon: "logo"
		});
	});
	
});