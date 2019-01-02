function hrefBack() {
    history.go(-1);
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

function showErrorMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(document).ready(function(){
    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });

    $(".input-daterange #end-date").on("changeDate", function(){

            var startDate = $("#start-date").val();
            var endDate = $("#end-date").val();
            flag = true
            if (startDate && endDate && startDate > endDate) {
                showErrorMsg();
                flag = false
            }

        if (flag){
        // 修改居住时间和总金额
            $.ajax({
                url: '/order/get_price/' + GetQueryString(location.href),
                type: 'POST',
                dataType: 'json',
                data: {
                    'min_days': $('#start-date').val(),
                    'max_days': $('#end-date').val(),
                },
                success: function(data){
                    if (data.code == 200){
                        $(".order-amount>span").html(data.amount.toFixed(2) + "(共"+ data.day +"晚)");
                    }else{
                        showErrorMsg();
                    }
                },
                error: function(data){
                    $('.popup_con .popup p').text('服务器失败！');
                    showErrorMsg();
                }
            });
        }
    });

    // 获取房间信息
    $.ajax({
        url: '/house/detail/' + GetQueryString(location.href),
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if (data.code == 200){
                $('.house-info img').attr('src', '/static/media/' + data.result.index_image_url);
                $('.house-text h3').text(data.result.title);
                $('.house-text p span').text(data.result.price);
            }else{
                $('.popup_con .popup p').text('房间信息加载失败！');
                showErrorMsg();
            }
        },
        error: function(data){
             $('.popup_con .popup p').text('服务器异常！');
             showErrorMsg();
        },
    });
})

// 提交订单
$('.submit-order .submit-btn').on('click', function(evt){
    $.ajax({
        url: '/order/booking/' + GetQueryString(location.href),
        type: 'POST',
        dataType: 'json',
        data: {},
        success: function(data){
            if (data.code == 200){
                $('.popup_con .popup p').text('提交成功, 正在等待房东处理.....');

                showErrorMsg();
                history.go(-1);
            }else{
                $('.popup_con .popup p').text('提交失败！');
                showErrorMsg();
            }
        },
        error: function(data){
            $('.popup_con .popup p').text('服务器失败！');
            showErrorMsg();
        }
    });
});







//获取ID
function GetQueryString(name) {
    id = name.split('=')[1];
    var re = /^[0-9]+.?[0-9]*$/
    if (!re.test(id)){
        id = ''
    }else{
        id = parseInt(id)
    }
    return id
}

