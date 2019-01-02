
function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

var imageCodeId = "";

function generateUUID() {
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


function sendSMSCode() {
    $(".phonecode-a").removeAttr("onclick");
    var mobile = $("#mobile").val();
    if (!mobile) {
        $("#mobile-err span").html("请填写正确的手机号！");
        $("#mobile-err").show();
        $(".phonecode-a").attr("onclick", "sendSMSCode();");
        return;
    } 
    var imageCode = $("#imagecode").val();
    if (!imageCode) {
        $("#image-code-err span").html("请填写验证码！");
        $("#image-code-err").show();
        $(".phonecode-a").attr("onclick", "sendSMSCode();");
        return;
    }
    $.get("/user/register/", {mobile:mobile, code:imageCode, codeId:imageCodeId}, 
        function(data){
            if (0 != data.errno) {
                $("#image-code-err span").html(data.errmsg); 
                $("#image-code-err").show();
                if (2 == data.errno || 3 == data.errno) {
                    generateImageCode();
                }
                $(".phonecode-a").attr("onclick", "sendSMSCode();");
            }   
            else {
                var $time = $(".phonecode-a");
                var duration = 60;
                var intervalid = setInterval(function(){
                    $time.html(duration + "秒"); 
                    if(duration === 1){
                        clearInterval(intervalid);
                        $time.html('获取验证码'); 
                        $(".phonecode-a").attr("onclick", "sendSMSCode();");
                    }
                    duration = duration - 1;
                }, 1000, 60); 
            }
    }, 'json'); 
}

$(document).ready(function() {

    $("#mobile").focus(function(){
        $("#mobile-err").hide();
    });
    $("#imagecode").focus(function(){
        $("#image-code-err").hide();
    });
    $("#phonecode").focus(function(){
        $("#phone-code-err").hide();
    });
    $("#password").focus(function(){
        $("#password-err").hide();
        $("#password2-err").hide();
    });
    $("#password2").focus(function(){
        $("#password2-err").hide();
    });
	
    $(".form-register").submit(function(e){
        e.preventDefault();
        mobile = $("#mobile").val();
        vcode = $('#imagecode').val();
        phoneCode = $("#phonecode").val();
        passwd = $("#password").val();
        passwd2 = $("#password2").val();
		flag = true
        if (!mobile) {
            $("#mobile-err span").html("请填写正确的手机号！");
            $("#mobile-err").show();
			flag = false
            return;
        }
        if (!phoneCode) {
            $("#phone-code-err span").html("请填写短信验证码！");
            $("#phone-code-err").show();
			flag = false
            return;
        }
        if (!passwd) {
            $("#password-err span").html("请填写密码!");
            $("#password-err").show();
			flag = false
            return;
        }
        if (passwd != passwd2) {
            $("#password2-err span").html("两次密码不一致!");
            $("#password2-err").show();
			flag = false
            return;
        }

		if (flag){
			$.ajax({
				url: '/user/register/',
				type: 'POST',
				dataType: 'json',
				data: {
					'mobile': mobile,
					'phonecode': phoneCode,
					'vcode': vcode,
					'password': passwd,
					'password2': passwd2
				},
				success: function(data){
					if (data.code == 200){
						location.href = '/user/login/'
					}else if (data.code == 10001){
						$('#mobile-err').text(data.msg)
						$('#mobile-err').css('display', 'inline');
					}else if (data.code == 10005){
						$('#image-code-err').text(data.msg)
						$('#image-code-err').css('display', 'inline');
						get_code();
					}else if (data.code == 10006){
						$('#password-err').text(data.msg)
						$('#password-err').css('display', 'inline');
					}else{}
				},
				error: function(data){
					$('#password2-err').text('注册失败！')
					$('#password2-err').css('display', 'inline');
				}
				
			});
		}
    });
});

get_code();

function get_code(){
	$.ajax({
		url: '/user/get_code/',
		type: 'GET',
		dataType: 'json',
		success: function(data){
            console.log(data)
			if (data.code == 200){
				$('#vcode').text(data.results.code);
			}else{
				$('#vcode').text('失败');
			}
		},
		error: function(data){
			$('#vcode').text('失败');
		}
	});
}


