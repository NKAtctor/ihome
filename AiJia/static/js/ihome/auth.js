function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$('#form-auth').submit(function(evt){
    evt.preventDefault();
    $.ajax({
        url: '/user/auth/',
        type: 'POST',
        dataType: 'json',
        data: {
            'id_name': $('#real-name').val(),
            'id_card': $('#id-card').val(),
        },
        success: function(data){
            if (data.code == 200){
                $('.popup p').text('保存成功！');
                showSuccessMsg();
                is_auth();
            }else{
                $('.popup p').text('提交失败');
                showSuccessMsg();
            }
        },
        error: function(data){
            $('.popup p').text('服务器异常！');
            showSuccessMsg();
        },
    });
});

is_auth();

function is_auth() {
    $.ajax({
        url: '/user/is_auth/',
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if (data.code == 200){
                $('.btn-success').css('display', 'none');
                $('#real-name').val(data.user.id_name);
                $('#id-card').val(data.user.id_card);
                $('#real-name').attr('disabled', 'disabled');
                $('#id-card').attr('disabled', 'disabled');
            }
        },
        error: function(data){
            $('.popup p').text('服务器异常！');
            showSuccessMsg();
        },
    });
}