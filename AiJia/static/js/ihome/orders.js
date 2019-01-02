

function hrefBack() {
    history.go(-1);
}

//模态框居中的控制
function centerModals(){
    $('.modal').each(function(i){   //遍历每一个模态框
        var $clone = $(this).clone().css('display', 'block').appendTo('body');    
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top-30);  //修正原先已经有的30个像素
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);
    $(".order-comment").on("click", function(){
        var orderId = $(this).parents("li").attr("order-id");
        $(".modal-comment").attr("order-id", orderId);
    });

    // 获取订单信息展示
    $.ajax({
        url: '/order/list_orders/',
        type: 'GET',
        dataType: 'json',
        success: function(data){

            if (data.code == 200){
                $.each(data.result, function(index, elem){
                    $('.orders-list').append(
                        $('<li>').attr('order-id', '').append(
                            $('<div>').attr('class', 'order-title').append(
                                $('<h3>').text('订单号：').append($('<span>').text((parseInt(index)+1))),
                                $('<div>').attr('class', 'fr order-operate').append(
                                    $('<button>').attr({
                                        "type": 'button',
                                        'class': 'btn btn-success order-comment',
                                        'data-toggle': 'modal',
                                        'data-target': '#comment-modal'
                                    }).append('发表评论')
                                )
                            ),
                            $('<div>').attr('class', 'order-content').append(
                                $('<img>').attr('src', '/static/media/' + elem.image),
                                $('<div>').attr('class', 'order-text').append(
                                    $('<h3>').text('订单'),
                                    $('<ul>').append(
                                        $('<li>').text('创建时间：').append($('<span>').text(elem.create_date)),
                                        $('<li>').text('入住日期：').append($('<span>').text(elem.begin_date)),
                                        $('<li>').text('离开日期：').append($('<span>').text(elem.end_date)),
                                        $('<li>').text('合计金额：').append($('<span>').text(elem.amount)),
                                        $('<li>').text('订单状态：').append($('<span>').text(elem.status)),
                                        $('<li>').text('我的评价：').append($('<span>').text(elem.comment ? elem.comment : '暂无评价')),
                                        $('<li>').text('拒单原因：').append($('<span>').text(elem.reason ? elem.reason : '没有原因')),
                                    )
                                )

                            )

                        )

                    )
                })
            }else{
                console.log('没有数据！');
            }

        },
        error: function(data){
            console.log('服务器异常！');
        }
    });

});