
var order_id = 0;

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

    // 接单
    $(".order-accept").on("click", function(evt){
        order_id = $(evt.target).attr('order_id');
        var orderId = $(this).parents("li").attr("order-id");
        $(".modal-accept").attr("order-id", orderId);
    });

    $(".modal-footer .modal-accept").on("click", function(evt){
       $.ajax({
            url: '/order/lorder/' + parseInt(order_id),
            type: 'POST',
            dataType: 'json',
            data: {},
            success: function(data){
                if (data.code == 200){
                    $('.modal-body p').text('提交成功！')
                    $('.modal-content .modal-footer .modal-accept').attr('disabled', 'disabled');
                }
            },
            error: function(data){
                console.log('服务器异常！')
            }
       });
    });

    // 拒绝接单
    $(".order-reject").on("click", function(evt){
        order_id = $(evt.target).attr('order_id');
        var orderId = $(this).parents("li").attr("order-id");
        $(".modal-reject").attr("order-id", orderId);
    });


    $(".modal-footer .modal-reject").on("click", function(){
       var reason = $('#reject-reason').val();
       if (!reason){
            $('.modal-footer .modal-reject').attr('disabled', 'disabled');
            $('#reject-reason').on('focus', function(){
                $('.modal-footer .modal-reject').attr('disabled', false);
            })
       }else{
            $.ajax({
                url: '/order/reject/' + parseInt(order_id),
                type: 'POST',
                dataType: 'json',
                data: {
                    'reason': reason,
                },
                success: function(data){
                    if (data.code == 200){
                        $('#reject-reason').hide();
                        $('#reject-modal .modal-body').append(
                            $('<p>').text('已成功拒单！')
                        )
                        $('#reject-modal .modal-footer .modal-reject').attr('disabled', 'disabled');
                        $('#reject-modal .modal-footer .btn-default').on('click', function(){
                            location.reload();
                        });
                    }
                },
                error: function(data){
                    console.log('服务器异常！')
                }
           });
       }
    });
});