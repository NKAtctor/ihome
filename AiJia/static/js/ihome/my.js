

//退出
$('#logout').on('click', function(evt){
   evt.preventDefault();
   $.ajax({
        url: '/user/logout/',
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if (data.code == 200) {
                console.log('退出成功！');
                location.reload();
            }else{
                console.log('退出失败！')
            }
        },
        error: function(data){
            console.log('服务器异常！')
        }
   });
})



$(document).ready(function(){
})

$(function(){
	var username = $('.menu-text #user-name');
	var mobile = $('.menu-text #user-mobile');
	$.ajax({
		url: '/user/getinfo/',
		type: 'GET',
		dataType: 'json',
		success: function(data){
			if (data.code == 200){
				username.text(data.results.name);
				mobile.text(data.results.phone)
			}
		},
		error: function(data){
			username.text('加载失败');
			mobile.text('加载失败')
		}
	});
});







