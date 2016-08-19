Snow.ajax = function(options){
    var myOptions = {
        type: 'GET',
        url: '',
        async: true,
        contentType: 'application/x-www-form-urlencoded',
        dataType: null,
        //cache: true,
        data: null,
        success: undefined,
        complete: undefined,
        error: undefined,
        timeout: 0
    }

    //extend the options
    myOptions.extend(options);

    //post data
    var postData;

    //set the dataType
    var jsonRequest = myOptions.contentType.indexOf('application/json') > -1;
    if(!myOptions.dataType){
        if(jsonRequest){
            myOptions.dataType = 'json';
        }
        else {
            myOptions.dataType = 'text';
        }
    }

    //create the http request
    var ajaxRequest = Snow.ajax.createXMLHttpRequest(myOptions.timeout);

    if (myOptions.async) {
        ajaxRequest.onreadystatechange = function(){
            if (ajaxRequest.readyState == 4) {
                if (ajaxRequest.status == 200) {
                    if (myOptions.success) {
                        myOptions.success(Snow.ajax.parseData(myOptions.dataType, ajaxRequest));
                    }
                }
                else{
                    //system error
                    if(myOptions.error){
                        myOptions.error(ajaxRequest);
                    }
                }
                if(myOptions.complete){
                    myOptions.complete(ajaxRequest);
                }
            }
        };
    }

    if(myOptions.type == 'GET' || myOptions.type=='get'){
        //parse the get parameter
        var str;
        if(!myOptions.data){
            str = '';
        }
        else if(typeof(myOptions.data) == 'object'){
            var items = [];
            myOptions.data.each(function(value, key){
                items.push(key + '=' + encodeURIComponent(value));
            });
            str = items.join('&');
        }
        else{
            str = myOptions.data;
        }

        //check the url
        if(str) {
            if (myOptions.url.indexOf('?') > -1) {
                myOptions.url += '&' + str;
            }
            else {
                myOptions.url += '?' + str;
            }
        }
    }
    else{

        //prepare the data
        if(jsonRequest && typeof (myOptions.data) == "object"){
            postData = JSON.stringify(myOptions.data)
        }
        else{
            postData = myOptions.data;
        }

    }

    //open request
    ajaxRequest.open(myOptions.type, myOptions.url, myOptions.async);

    //set content type
    ajaxRequest.setRequestHeader("Content-Type", myOptions.contentType);

    //send data
    ajaxRequest.send(postData);

    if (!myOptions.async)
        return Snow.ajax.parseData(myOptions.dataType, ajaxRequest);
    return ajaxRequest;
};
Snow.ajax.createXMLHttpRequest = function(timeout) {
    if (window.XMLHttpRequest) {// IE 7.0+
        xmlHttpReq = new XMLHttpRequest();
    } else {// IE 6.0-
        try {
            xmlHttpReq = new ActiveXObject("MSXML2.XMLHTTP");
        }catch (e) {
            try {
                xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
            }catch (e) {}
        }
    }
    if (!xmlHttpReq) {
        alert("Browser does not support!");
        return null;
    }
    //xmlHttpReq.timeout = timeout;
    return xmlHttpReq;
};
Snow.ajax.parseData = function(dataType, ajaxRequest){
    if(dataType == 'JSON' || dataType == 'json'){
        return JSON.parse(ajaxRequest.responseText);
    }
    else if(dataType == 'XML' || dataType == 'xml'){
        return ajaxRequest.responseXML;
    }
    return ajaxRequest.responseText;
}