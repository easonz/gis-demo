/**
 * 	用户管理页面js
 */
Ext.require('zhiyuan.panel.PQUserPanel');

var userGrid = null;	//用户列表

var updateTask;		//更新用户信息定时器

Ext.onReady(function () {
	var del = Ext.getDom("delUser");
	var delFlag = true;	//是否显示删除列
	if (del == null)
		delFlag = false;

	//设置当前导航栏
	SetActivePage("userMgrPage");
	
	userGrid = Ext.create('zhiyuan.panel.PQUserPanel',
			{renderTo : 'userViewCmp',
			minWidth: 185,
			delFlag : delFlag}
	);
	
	if (userGrid != null)
		updateUserList();
	getAllRole();
	
	updateTask = {
		 run : function() {
			 updateUserList();
		 },
		 interval : 2000	 // 2 second
	}
	Ext.TaskManager.start(updateTask);
//	
	var ret = userGrid.addCustomListener('itemclick', itemclick);
	
});

function itemclick(view, record, item, index, e){
	var name = record.get("name");
	Ext.Ajax.request({
		url : "getUserByName.action",
		params : {"userInfo.name" : name},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			checkSysUser(jsonObj.name,"#userDiv input,#userDiv select");
			Ext.getDom("userDiv").style.display = "";
			Ext.getDom("addUser")&&(Ext.getDom("addUser").style.display = "none");
			Ext.getDom("username").value = jsonObj.name;
			Ext.getDom("username").disabled = "disabled";
			Ext.getDom("mobile").value = jsonObj.mobile;
			Ext.getDom("phone").value = jsonObj.phone;
			Ext.getDom("email").value = jsonObj.email;
			Ext.getDom("address").value = jsonObj.address;
			Ext.getDom("role").value = jsonObj.role;
			Ext.getDom("pwd").value = "";
			Ext.getDom("repwd").value = "";	
		}
	});
}

function onInit(){
	userGrid = Ext.create('zhiyuan.panel.PQUserPanel',
			{renderTo : 'userViewCmp',
			count: 100});
}

function checkSysUser(name,domStr)
{
	//如果具有修改权限
	if(Ext.getDom("modUser"))
	{
		if(name=="admin")
		{
			Ext.select(domStr).each(function(el)
			{
				el.dom.disabled = "disabled";
			});
			Ext.getDom("modUser").style.display = "none";
		}
		else
		{
				Ext.select(domStr).each(function(el)
				{
					el.dom.removeAttribute("disabled");
				});
				Ext.getDom("modUser").style.display = "";
	
		}
	}
}

/*
function getAllUser(){
	Ext.Ajax.request({
		url : 'getUser.action',
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			userGrid.addData(jsonObj.userList);
		}
	});
}
*/
function getAllRole(){
	Ext.Ajax.request({
		url : "getRole.action",
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
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
				for (var i=0; i<jsonObj.roleList.length; i++){
					var roleName = jsonObj.roleList[i].name;
					var item = new Option(roleName, roleName);      
					Ext.getDom("role").options.add(item);
				}
			}
		}
	});
}

function modifyUser(){
	var pwd = Ext.getDom("pwd").value;
	var repwd = Ext.getDom("repwd").value;
	if (pwd != repwd){
		alert("两次密码输入不一致，请重新输入");
		Ext.getDom("pwd").focus();
		return;
	}
	Ext.Ajax.request({
		url : "modifyUser.action",
		params : {
			"userInfo.name" : Ext.getDom("username").value,
			"userInfo.password" : pwd,
			"userInfo.mobile" : Ext.getDom("mobile").value,
			"userInfo.phone" : Ext.getDom("phone").value,
			"userInfo.email" : Ext.getDom("email").value,
			"userInfo.address" : Ext.getDom("address").value,
			"userInfo.role" : Ext.getDom("role").value
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (jsonObj.result == 0)
				alert("修改用户成功");
			else
				alert("修改用户失败");
		}
	});
}

function add(){
	//恢复可编辑状态
	checkSysUser("","#userDiv input,#userDiv select");
	Ext.getDom("userDiv").style.display = "";
	Ext.getDom("modUser").style.display = "none";
	Ext.getDom("addUser").style.display = "";
	Ext.getDom("username").value = "";
	Ext.getDom("username").disabled = "";
	Ext.getDom("mobile").value = "";
	Ext.getDom("phone").value = "";
	Ext.getDom("email").value = "";
	Ext.getDom("address").value = "";
	Ext.getDom("pwd").value = "";
	Ext.getDom("repwd").value = "";
}

function addUser(){
	var pwd = Ext.getDom("pwd").value;
	var repwd = Ext.getDom("repwd").value;
	if (pwd != repwd){
		alert("两次密码输入不一致，请重新输入");
		Ext.getDom("pwd").focus();
		return;
	}
	Ext.Ajax.request({
		url : "addUser.action",
		params : {
			"userInfo.name" : Ext.getDom("username").value,
			"userInfo.password" : pwd,
			"userInfo.mobile" : Ext.getDom("mobile").value,
			"userInfo.phone" : Ext.getDom("phone").value,
			"userInfo.email" : Ext.getDom("email").value,
			"userInfo.address" : Ext.getDom("address").value,
			"userInfo.role" : Ext.getDom("role").value
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (jsonObj.result == 0)
				alert("增加用户成功");
			else
				alert("增加用户失败");
		}
	});
}

function delUser(name){
//	if (userGrid.getSelectionModel().getSelection().length > 0){
//		var name = userGrid.getSelectionModel().getSelection()[0].get('name');
		if (confirm("确定删除"+name) == 1){
			Ext.Ajax.request({
				url : "delUser.action",
				params : {
					"userInfo.name" : name
				},
				success : function(response) {
					var jsonObj = Ext.JSON.decode(response.responseText);
					if (jsonObj.result == 0)
						alert("删除用户成功");
					else
						alert("删除用户失败");
				}
			});
		}
//	}
}

var userJson = "";
function updateUserList(){
	Ext.Ajax.request({
		url : 'getUser.action',
		success : function(response) {
			var text = response.responseText;
			if (text != userJson){
				userJson = text;
				var jsonObj = Ext.JSON.decode(text);
				userGrid.addData(jsonObj.userList);			
			}
		}
	});
}


