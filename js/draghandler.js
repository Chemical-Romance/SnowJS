Snow.draghandler = function (o, options) {
    var myOptions = {
        target: null,
        onStart: null,
        onDraging: null,
        onEnd: null,
        disableX: false,
        disableY: false
    };

    myOptions.extend(options);

    var $o = find(o);
    var $target = find(myOptions.target);
    var lastClient, lastOffset, speed, targetPos;
    //var lastClientX, lastOffsetX, speedX;
    var $document = document.documentElement;

    $o.bind('mousedown,touchstart', onDragStart);
    function onDragStart(e) {
        //bind event
        
        $o.bind('mousemove,touchmove', onDraging);
        $o.bind('mouseup,touchend', onDragEnd);
        $document.bind('mousemove', onDraging);
        $document.bind('mouseup', onDragEnd)
        $document.addClass('unselect');

        //calculate
        var myEvent = getDragEvent(e);
        lastClient = { x:myEvent.clientX, y:myEvent.clientY };
        lastOffset = { x:0, y: 0};
        speed = { x:0, y:0 };

        //save the target position
        if($target){
            targetPos = $target.position();
        }

        //trigger
        if (myOptions.onStart) {
            myOptions.onStart(myEvent);
        }
        if (!document.createTouch)
            return false;
    }
    function onDraging(e) {
        //calculate
        var myEvent = getDragEvent(e);
        var offset = { x: myEvent.clientX - lastClient.x, y: myEvent.clientY - lastClient.y };
        speed = { x: offset.x - lastOffset.x, y: offset.y - lastOffset.y };
        lastOffset = offset;

        //set the target position
        if($target){
            if(!myOptions.disableX){
                $target.css('left', (targetPos.left + offset.x) + 'px');
            }
            if(!myOptions.disableY){
                $target.css('top', (targetPos.top + offset.y) + 'px');
            }
        }

        //trigger
        if (myOptions.onDraging) {
            myOptions.onDraging(myEvent, offset, speed);
        }
        if (!document.createTouch)
            return false;
    }
    function onDragEnd(e) {
        $o.unbind('mousemove,touchmove', onDraging);
        $o.unbind('mouseup,touchend', onDragEnd);
        $document.unbind('mousemove', onDraging);
        $document.unbind('mouseup', onDragEnd);
        $document.removeClass('unselect');

        if (myOptions.onEnd) {
            myOptions.onEnd(getDragEvent(e), lastOffset, speed);
        }
        //return false;
    }
    function getDragEvent(e) {
        return e.touches ? e.touches[0] : e;
    }
}