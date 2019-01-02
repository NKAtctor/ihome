function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

// 上传图片
$('#form-avatar').submit(function(evt){
    evt.preventDefault();
	var formData = new FormData(document.getElementById("form-avatar"));//表单id
//    $(this).ajaxSubmit({})

	$.ajax({
		url: '/user/pre_icon/',
		type: 'POST',
		dataType: 'json',
		data: formData,
		//ajax2.0可以不用设置请求头，但是jq帮我们自动设置了，这样的话需要我们自己取消掉
		contentType:false,
        //取消帮我们格式化数据，是什么就是什么
        processData:false,
		success: function(data){
		    console.log(data)
			if (data.code == 200){
				$('.popup p').text('上传成功！')
				showSuccessMsg();
				location.reload();
			}
		},
		error: function(data){
		    alert(data)
			$('.popup p').text('上传失败！')
			showSuccessMsg();
		}
	});
});

// 提交用户名
$('#form-name').submit(function(evt){
	evt.preventDefault();
	var username = $('#user-name').val();
	$.ajax({
		url: '/user/pre_usename/',
		type: 'POST',
		dataType: 'json',
		data: {
			'username': username,
		},
		success: function(data){
			if (data.code == 200){
			    $('.popup p').text('保存成功！')
				showSuccessMsg();
			}else{
				var a = $('.error-msg').css('display', 'block');
			}
		},
		error: function(data){
			$('.popup p').text('保存失败！')
		},
	});
});

get_icon();

function get_icon(){
    $.ajax({
		url: '/user/get_icon/',
		type: 'GET',
		dataType: 'json',
		success: function(data){
			if (data.code == 200){
                $('#user-avatar').attr('src', '/static/media/' + data.user.avatar).css('height', '200px').css('width', '200px');
			}else{
                $('#user-avatar').attr('src', '');
			}
		},
		error: function(data){
            $('#user-avatar').attr('src', '');
		},
	});
}

