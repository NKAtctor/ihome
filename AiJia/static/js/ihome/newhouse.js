function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){});
        },1000)
    });
}

// 提交新房源
$('#form-house-info').submit(function(evt) {
        evt.preventDefault();
        $(this).ajaxSubmit({
            url: '/house/newhouse/',
            type: 'POST',
            dataType: 'json',
            success: function(data){
                if (data.code == 200) {
                    $('#form-house-info').hide();
                    $('#form-house-image').show();
                }else{
                    console.log('加载失败！')
                }
            },

            error: function(data) {
                console.log('服务器异常！')
            },
    });

});

// 上传房屋图片
$('#form-house-image').submit(function(evt){
    evt.preventDefault();
    $(this).ajaxSubmit({
        url: '/house/upload_house_image/',
        type: 'POST',
        dataType: 'json',
        success: function(data){
            if (data.code == 200) {
                $('.popup p').text('保存成功！');
                $('.house-image-cons').append(
                    $('<img>').attr('src', '/static/media/' + data.result).css({
                        'width': '30%',
                        'height': '160px',
                        'margin-right': '20px',
                        'margin-left': '10px',
                    })
                );
                showSuccessMsg();
            }else{
                $('.popup p').text('保存失败！');
                showSuccessMsg();
                console.log('加载失败！')
            }
        },
        error: function(data) {
            console.log('服务器异常！')
        },
    })
});

//<li>
//    <div class="checkbox">
//         <label>
//              <input type="checkbox" name="facility" value="1">无线网络
//         </label>
//    </div>
//</li>

$(function(){
    // 获取房间设施
    $.ajax({
        url: '/house/get_facility/',
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if (data.code == 200) {
              $.each(data.result, function(index, elem){
                  $('.house-facility-list').append(
                    $('<li>').attr('class', 'checkbox').append(
                        $('<label>').append(
                            $('<input>').attr({
                                'type': 'checkbox',
                                'name': 'facility',
                                'value': index,
                            })
                        ).append(elem)
                    )
                );
              })
            }else{
                $('.house-facility-list').append(
                    $('<p>').text('没有任何数据！')
                )
            }
        },
        error: function(data) {
            console.log('服务器异常！')
        },
    });


//    <option value="1">东城区</option>
    // 获取地区
    $.ajax({
        url: '/house/get_area/',
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if (data.code == 200) {
              $.each(data.result, function(index, elem){
                  $('#area-id').append(
                    $('<option>').attr('value', index).text(elem)
                  )
              })
            }else{
               $('#area-id').text('没有任何数据')

            }
        },
        error: function(data) {
            console.log('服务器异常！')
        },
    });

});

