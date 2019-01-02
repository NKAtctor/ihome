$(document).ready(function(){

    // 判断是否实名认证
        $.ajax({
            url: '/user/is_auth/',
            type: 'GET',
            dataType: 'json',
            success: function(data){
                if (data.code == 200){
                    $('.auth-warn .house-title').css('display', 'none');
                    $('.auth-warn .house-content').css('display', 'none');
                }else if (data.code == 10010){
                    $(".auth-warn").show();
                    $("#houses-list").hide();
                }
            },
            error: function(data){
                $('.popup p').text('服务器异常！');
                showSuccessMsg();
            },
        });


//    <li>
//        <a href="/detail.html">
//            <div class="house-title">
//                <h3>房屋ID:1 —— 房屋标题1</h3>
//            </div>
//            <div class="house-content">
//                <img src="/static/images/home01.jpg">
//                <div class="house-text">
//                    <ul>
//                        <li>位于：西城区</li>
//                        <li>价格：￥200/晚</li>
//                        <li>发布时间：2016-11-11 20:00:00</li>
//                    </ul>
//                </div>
//            </div>
//        </a>
//    </li>

    // 获取当前用户发布的房源信息
    $.ajax({
        url: '/house/get_house_info/',
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if (data.code == 200){
                $.each(data.result, function(index, elem){
                    $('#houses-list').append(
                        $('<li>').append(
                            $('<a>').attr('href', '/house/detail/?h=' + elem.id).append(
                                $('<div>').attr('class', 'house-title').append(
                                    $('<h3>').text('房屋ID: ' + (parseInt(index) + 1))
                                ),
                                $('<div>').attr('class', 'house-content').append(
                                    $('<img>').attr('src', '/static/media/' + elem.image)
                                ).append(
                                    $('<div>').attr('class', 'house-text').append(
                                        $('<ul>').append(
                                            $('<li>').text('位于：' + elem.address),
                                            $('<li>').text('价格：' + elem.price),
                                            $('<li>').text('发布时间：' + elem.create_time),
                                        )
                                    )
                                )
                            )
                        )
                    )
                });

            }else if (data.code == 1009){
                console.log('加载失败')
            }
        },
        error: function(data){
            console.log('加载失败')
        },
    });


})

