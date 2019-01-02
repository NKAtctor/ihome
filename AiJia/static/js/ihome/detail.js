function hrefBack() {
    history.go(-1);
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

$(document).ready(function(){

    function start(){
        var mySwiper = new Swiper ('.swiper-container', {
            loop: true,
            autoplay: 2000,
            autoplayDisableOnInteraction: false,
            pagination: '.swiper-pagination',
            paginationType: 'fraction'
        })
    }

    $(".book-house").show();

     // 获取房屋信息
     // <li class="swiper-slide"><img src="/static/images/home01.jpg"></li>
    $.ajax({
        url: '/house/detail/' + GetQueryString(location.href),
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if (data.code == 200) {
                // 轮播图片（房屋图片）
                $.each(data.result.images, function(index, elem){
                    $('.swiper-wrapper').append(
                        $('<li>').attr('class', 'swiper-slide').append(
                            $('<img>').attr('src', '/static/media/' + elem)
                        )
                    )
                });
                start();

                 //判断是否显示预约按钮
                console.log(data)
                if (data.is_self){
                    $('.book-house').hide();
                }

                $('.house-price span').text(data.result.price);
                $('.house-title').text(data.result.title);
                $('.landlord-pic img').attr('src' ,'/static/media/' + data.result.user_avatar);
                $('.landlord-name span').text(data.result.user_name);
                $('.text-center li').text(data.result.address);
                $('.icon-text #room_count').text(data.result.room_count);
                $('.icon-text #ace').text(data.result.acreage);
                $('.icon-text #unit').text(data.result.unit);
                $('.icon-text #capacity').text(data.result.capacity);
                $('.icon-text #beds').text(data.result.beds);
                $('.house-info-list #deposit').text(data.result.deposit);
                $('.house-info-list #min_days').text(data.result.min_days);
                $('.house-info-list #max_days').text(data.result.max_days ? data.result.max_days : '无限制');
                // <li><span class="wirelessnetwork-ico"></span>无线网络</li>
                $.each(data.result.facilities, function(index, elem){
                    $('.house-facility .house-facility-list').append(
                        $('<li>').append(
                            $('<span>').attr('class', elem.css)
                        ).append(elem.name)
                    )
                });
                // 设置房间id用于下单
                 $('.book-house').attr('href', '/order/booking/?h=' + data.result.id);

            }else{
                console.log('失败！')
            }
        },
        error: function(data) {
            console.log('服务器异常！');
        },

    });
})

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


















