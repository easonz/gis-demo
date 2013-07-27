/**
 * 	角色管理页面js
 */

Ext.require('zhiyuan.panel.PQRolePanel');

var roleGrid = null;		//角色列表

var updateTask;				//更新角色信息定时器

Ext.onReady(function () {
	var del = Ext.getDom("delRole");
	var hasDel = true;
	if (null == del)
		hasDel = false;
	
	//设置当前导航栏
	SetActivePage("roleMgrPage");
	
	roleGrid = Ext.create('zhiyuan.panel.PQRolePanel',
			{renderTo : 'roleViewCmp',
			hasDel : hasDel}
	);
	if (roleGrid != null)
		updateRoleList();
	
	getAllRights();
	
	updateTask = {
		 run : function() {
			 updateRoleList();
		 },
		 interval : 2000	 // 2 second
	}
	Ext.TaskManager.start(updateTask);
	
	var ret = roleGrid.addCustomListener('itemclick', itemdbclick);
});

var roleJson = null;
function updateRoleList(){
	Ext.Ajax.request({
		url : 'getRole.action',
		success : function(response) {
			var text = response.responseText;
			if (text != roleJson){
				roleJson = text;
				var jsonObj = Ext.JSON.decode(text);
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
					roleGrid.addData(jsonObj.roleList);
				}
			}
		}
	});
}

function getAllRights(){
	Ext.Ajax.request({
		url : 'getRight.action',
		success : function(response) {
			var text = response.responseText;
		}
	});
}

function itemdbclick(view, record, item, index, e){
	var roleName = record.get("name");
	//alert(roleName);
	Ext.Ajax.request({
		url : "getRoleByName.action",
		params : {
			"roleInfo.name" : roleName
		},
		success : function(response) {
			//alert(response.responseText);
			var jsonObj = Ext.JSON.decode(response.responseText);
			checkSysRole(jsonObj.name,"#roleDiv input");
			Ext.getDom("roleDiv").style.display = "";
			//Ext.getDom("modRole")&&(Ext.getDom("modRole").style.display = "");
			Ext.getDom("addRole")&&(Ext.getDom("addRole").style.display = "none");
			Ext.getDom("roleName").value = jsonObj.name;
			Ext.getDom("roleName").disabled = true;
			Ext.getDom("remark").value = jsonObj.remark;
			clearCheckbox();
			var rights = jsonObj.rights;
			var tempDom;
			for (var i=0; i<rights.length; i++){
				tempDom = Ext.getDom(rights[i])
				tempDom&&(tempDom.checked = true);
			}
		}
	});

}

function checkSysRole(name,domStr)
{
	//如果存在修改权限
	if(Ext.getDom("modRole"))
	{
		if(name=="管理员")
		{
			Ext.select(domStr).each(function(el)
			{
				el.dom.disabled = "disabled";
			});
			Ext.getDom("modRole").style.display = "none";
		}
		else
		{
			Ext.select(domStr).each(function(el)
			{
				el.dom.removeAttribute("disabled");
			});
			Ext.getDom("modRole").style.display = "";
			
		}
	}
}

function clearCheckbox(){
	var chks = Ext.query("input[type=checkbox]");
	for (var i=0; i<chks.length; i++){
		chks[i].checked = false;
	}
}

function modifyRole(){
	var rights = new Array();
	var chks = Ext.query("input[type=checkbox]");
	for (var i=0; i<chks.length; i++){
		if (chks[i].checked == true){
			rights.push(chks[i].value);
		}
	}
	Ext.Ajax.request({
		url : "modifyRole.action",
		params : {
			"roleInfo.name" : Ext.getDom("roleName").value,
			"roleInfo.remark" : Ext.getDom("remark").value,
			"roleInfo.rights" : rights
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (jsonObj.result == 0)
				alert("修改角色成功");
			else
				alert("修改角色失败");
		}
	});
}

function add(){
	checkSysRole("","#roleDiv input");
	Ext.getDom("roleDiv").style.display = "";
	Ext.getDom("modRole").style.display = "none";
	Ext.getDom("addRole").style.display = "";
	Ext.getDom("roleName").value = "";
	Ext.getDom("roleName").disabled = false;
	Ext.getDom("remark").value = "";
	clearCheckbox();
}

function addRole(){
	var rights = new Array();
	var chks = Ext.query("input[type=checkbox]");
	for (var i=0; i<chks.length; i++){
		if (chks[i].checked == true){
			rights.push(chks[i].name);
		}
	}
	Ext.Ajax.request({
		url : "addRole.action",
		params : {
			"roleInfo.name" : Ext.getDom("roleName").value,
			"roleInfo.remark" : Ext.getDom("remark").value,
			"roleInfo.rights" : rights
		},
		success : function(response) {
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (jsonObj.result == 0)
				alert("增加角色成功");
			else
				alert("增加角色失败");
		}
	});
}

function delRole(name){
//	if (roleGrid.getSelectionModel().getSelection().length > 0){
//		var name = roleGrid.getSelectionModel().getSelection()[0].get('name');
		if (confirm("确定删除"+name) == 1){
			Ext.Ajax.request({
				url : "deleteRole.action",
				params : {
					"roleInfo.name" : name
				},
				success : function(response) {
					var jsonObj = Ext.JSON.decode(response.responseText);
					if (jsonObj.result == 0)
						alert("删除角色成功");
					else
						alert("删除角色失败");
				}
			});
		}
//	}
}
