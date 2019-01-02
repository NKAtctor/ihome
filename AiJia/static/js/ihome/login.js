function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function() {
    $("#mobile").focus(function(){
        $("#mobile-err").hide();
    });
    $("#password").focus(function(){
        $("#password-err").hide();
    });
    $(".form-login").submit(function(e){
        e.preventDefault();
        mobile = $("#mobile").val();
        passwd = $("#password").val();
		flag = true
        if (!mobile) {
            $("#mobile-err span").html("请填写正确的手机号！");
            $("#mobile-err").show();
			flag = false
            return;
        } 
        if (!passwd) {
            $("#password-err span").html("请填写密码!");
            $("#password-err").show();
			flag = false
            return;
        }
        if (flag){
		$.ajax({
			url: '/user/login/',
			type: 'POST',
			dataType: 'json',
			data: {
				'mobile': mobile,
				'password': passwd,
			},
			success: function(data){
				if (data.code == 200){
					location.href = '/house/index/';
				}else if (data.code == 10002){
					$('#mobile-err').text(data.msg)
					$('#mobile-err').css('display', 'inline');
				}else{
					('#password-err').text(data.msg)
					$('#password-err').css('display', 'inline');
				}
			},
			error: function(data){
				$('.error-msg').text('登录失败!')
				$('.error-msg').css('display', 'block').css('margin-top', '5px');
			}
		});
	}
    });

})



