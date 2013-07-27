Ext.require('Ext.Ajax');

function modifyCurUser(){
	var newpwd = Ext.getDom("userInfo.password").value;
	if (newpwd != ""){
		var oldpwd = Ext.getDom("oldpwd").value;
		var repwd = Ext.getDom("repwd").value;
		if (oldpwd == ""){
			alert("原密码不能为空");
			Ext.getDom("oldpwd").focus();
			return;
		}
		if (newpwd != repwd){
			alert("两次密码输入不一致，请重新输入");
			Ext.getDom("repwd").focus();
			return;
		}
	}
	
	Ext.Ajax.request({
		url : "modifyCurUser.action",
		params : {
			"userInfo.name" : Ext.getDom("userInfo.name").value,
			"userInfo.password" : newpwd,
			"userInfo.mobile" : Ext.getDom("userInfo.mobile").value,
			"userInfo.phone" : Ext.getDom("userInfo.phone").value,
			"userInfo.email" : Ext.getDom("userInfo.email").value,
			"userInfo.address" : Ext.getDom("userInfo.address").value,
			"userInfo.role" : Ext.getDom("userInfo.role").value,
			"password" : oldpwd
		},
		success : function(response){
			var jsonObj = Ext.JSON.decode(response.responseText);
			if (jsonObj.result == 0){
				alert("修改个人信息成功");
			}
			else if(jsonObj.result == 2){
				alert("原密码输入错误");
				Ext.getDom("newpwd").focus();
			}
			else{
				alert("修改个人信息失败");
			}
		}
	});
	
}