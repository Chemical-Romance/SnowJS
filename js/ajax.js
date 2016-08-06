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
    ajaxRequest.open(myOptions.type, myOptions.url, myOptions.async);

    //prepare the data
    var data;
    if(jsonRequest && typeof (myOptions.data) == "object"){
        data = JSON.stringify(myOptions.data)
    }
    else{
        data = myOptions.data;
    }
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
        ajaxRequest.send(null);
    }
    else{
        //ajaxRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        ajaxRequest.setRequestHeader("Content-Type", myOptions.contentType);

        //send data
        ajaxRequest.send(data);
    }

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