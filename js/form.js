//Snow Form
Snow.Form = function (dom, options) {
    var myOptions = {
        model: {},
        requestHandler: undefined, //function(model){ return param; }
        responseHandler: undefined, //function(response){ return data; }
        response: {},
        action: undefined,
        method: 'get',
        fn: {} //functions
    };
    myOptions.extend(options);

    var dom = find(dom);
    var model = myOptions.model;
    var response = myOptions.response;
    var self = this, lastModel, lastChangeModel, flag = 0,
        modelList = dom.findAll('[data-model]').toArray(),
        attrList = dom.findAll('[data-value], [data-class], [data-script]').toArray();
        templateList = [];
    var events = ['click', 'change', 'focus', 'blur', 'input', 'keydown', 'mouseover', 'mouseout', 'touchstart', 'touchend'],
        eventList = dom.findAll('[data-' + events.join('],[data-') + ']').toArray();
    var updateViewTimer;

    var myclass = {
        fn: myOptions.fn, //user functions
        getModel: function () {
            return model;
        },
        update: function (newModel) { //update model and view
            flag = 0;
            model.extend(newModel);
            prepare();
        },
        submit: function (callback) {
            var validList = dom.findAll('[data-validate]');
            for (var i = 0; i < validList.length; i++) {
                var o = validList[i];
                var valid = validate(o);
                if (!valid.success) {
                    //if (myOptions.verifyOnSubmit) {
                    //    myOptions.verifyOnSubmit(o, valid.message);
                    //}
                    //else {
                    //    alert(valid.message);
                    //}
                    alert(valid.message);
                    o.focus();
                    return;
                }
            }

            //send the form request
            if(myOptions.action){
                var param = myOptions.requestHandler ? myOptions.requestHandler(model) : model;
                Snow.ajax({
                    url: myOptions.action,
                    type: myOptions.method,
                    contentType: 'application/json',
                    dataType: 'json',
                    data: param,
                    success: function(ret){
                        var data = myOptions.responseHandler ? myOptions.responseHandler(ret) : ret;
                        response = data || {};
                        if(data !== undefined) {
                            if (callback && typeof(callback) == 'function') {
                                callback(model, response);
                            }
                        }
                        clearTimeout(updateViewTimer);
                        updateView();
                    }
                })
            }
            else{
                if(callback && typeof(callback) == 'function') {
                    callback(model, response);
                }
            }
        }
    };


    function init(){
        //extend submit fn
        myOptions.fn.submit = myclass.submit;

        //init templates
        init.templates();

        //append self
        if (dom.attr('data-model')) {
            modelList.splice(0, 0, dom);
        }
        if (dom.attr('data-value') || dom.attr('data-class') || dom.attr('data-script')) {
            attrList.splice(0, 0, dom);
        }
        for (var i = 0; i < events.length; i++) {
            if (dom.attr('data-' + events[i])) {
                eventList.splice(0, 0, dom);
                break;
            }
        }

        //init views
        init.views();

        //init model list
        modelList.each(function(o){
            //init elements
            init.type(o);

            //init model
            init.model(o);

            //bind event
            init.listen(o);
        });

        //init events
        init.events();

        //init the window resize event
        window.addEventListener('resize', myclass.update);

        //set lastModel
        lastModel = {}.extend(model);

        //init service call
        if(myOptions.action){
            myclass.submit();
        }

        prepare();
    }
    init.type = function(o){
        var validate = o.attr('data-validate');
        if(validate){
            if(validate.indexOf('int') > -1){
                o._type = 'int';
            }
            else if(validate.indexOf('float') > -1) {
                o._type = 'float';
            }
            //else if(validate.indexOf('bool') > -1){
            //    o._type = 'bool';
            //}
        }
    };
    init.model = function(o){
        var key = o.attr('data-model');
        if(model[key] == undefined){
            model[key] = unifyValue(o);
        }
    };
    init.listen = function(o){
        //init change event
        if(o.tagName=='INPUT'){
            if(o.type == 'checkbox' || o.type == 'radio'){
                o.bind('change', init.change);
            }
            else{
                o.bind('input', init.change);
            }
        }
        else if(o.tagName == 'SELECT'){
            o.bind('change', init.change);
        }
        else{
            o.bind('input', init.change);
        }
    };
    init.events = function(){
        //init user events
        eventList.each(function(o){
            events.each(function(e){
                var attr = 'data-' + e;
                if (o.attr(attr)) {
                    o.bind(e, function () {
                        script(this, attr);
                        myclass.update(model);
                    });
                }
                //var event = o.attr(attr);
                //if(event){
                //    if(event.indexOf('@') == 0){
                //        o.bind(e, function(){myclass.fn[event.substring(1)].call(this, model);});
                //    }
                //    else {
                //        o.bind(e, function () {
                //            script(this, attr);
                //            myclass.update(model);
                //        });
                //    }
                //}
            });
        });
    };
    init.views = function(){
        dom.findAll('[data-view]').each(function (o) {
            o.view = {}; //view instances
            o.attr('data-view').replace(/ /g, '').split(',').forEach(function (key) {
                var fn = Snow.Form.view[key];
                o.view[key] = fn.call(o, model);
            });
        });
    };
    init.change = function(){
        var value = getValue(this);
        var key = this.attr('data-model');
        if(this._type && value !== ''){
            if(!Snow.Validate[this._type](value)){
                //console.log('invalid value');
                setValue(this, model[key]);
                return;
            }
        }
        flag = 0;
        model[key] = unifyValue(this);
        prepare();
    };
    init.templates = function(){
        dom.findAll('[data-template]').each(function(o){
            var newDom = find('<div data-template="'+ o.attr('data-template')+'"></div>');
            var tempObj = {
                element: newDom,
                template: o.html().replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            }
            templateList.push(tempObj);
            o.replaceWith(newDom);
        });
    };


    function prepare(){
        //prepare the model
        modelList.each(function(o){
            var key = o.attr('data-model');
            if (o.attr('data-value')) {
                var value = script(o, 'data-value', true);
                model[key] = value;

                //reset the value
                if(getValue(o) != value){
                    setValue(o, value);
                }
            }
        });
        if(lastModel.diff(model)){
            lastModel = {}.extend(model);
            //console.log('rendering');
            if(flag >=100){
                console.log('Some code error');
            }
            prepare();
        }
        else{
            //console.log('complete');
            delayUpdateView();
        }
    }
    function delayUpdateView(){
        //delay to update the view
        clearTimeout(updateViewTimer);
        updateViewTimer = setTimeout(updateView, 100);
    }
    function updateTemplate(){
        //update template
        templateList.each(function(tempObj){
            var o = tempObj.element;
            var lastTempModel = tempObj.model;
            var curTempModel = script(o, 'data-template', true) || {};
            if(curTempModel.diff(lastTempModel)){
                //render the template
                var html = Snow.template(tempObj.template, curTempModel);
                o.html(html);
                tempObj.model = {}.extend(curTempModel);
            }
        });
    }
    function updateView(){

        console.log('update View');

        //update Template
        updateTemplate();

        //update data-model, data-value, data-script, data-class
        //if(!model.diff(lastChangeModel))
        //    return;

        //render model
        modelList.each(function(o){
            if(!o.attr('data-value'))
                setValue(o, model[o.attr('data-model')]);
        });

        //render attribute
        attrList.each(function(o){
            if(o.attr('data-value'))
                setValue(o, script(o, 'data-value', true));
            if (o.attr('data-class')) {
                delayRunScript(o, 'data-class', function(){
                    o.className = script(o, 'data-class', true);
                });
            }
            if (o.attr('data-script')) {
                delayRunScript(o, 'data-script', function(){
                    script(o, 'data-script');
                });
            }
        });

        //set the lastChangeModel
        lastChangeModel = {}.extend(model);
    }
    function script(o, attr, isReturn) {
        var func = o.attr(attr);
        if (func) {
            if (func.indexOf('@') == 0) {
                var fnName = func.substring(1);
                //call form.fn
                if(myclass.fn[fnName]){
                    return myclass.fn[fnName].call(o, model);
                }
                //call Snow.Form.fn
                if(Snow.Form.fn[fnName]){
                    return Snow.Form.fn[fnName].call(o, model);
                }
                //undefined function
                console.error('The function of "' + fnName + '" is not defined!');
            }
            else {
                var str = 'with(model){' + (isReturn ? 'return ' : '') + ' ' + o.attr(attr) + '}';
                return new Function('model', 'response', str).call(o, model, response);
            }
        }
        
        //var str = 'with(obj){' + (isReturn ? 'return ':'') +' '+o.attr(attr)+'}';
        //return new Function('obj', str).call(o, model);
    }
    function delayRunScript(o, attr, event){
        var delay = o.attr(attr + '-delay') || 0;
        if(delay > 0){
            var key = attr + '-timer';
            clearTimeout(o.data(key));
            o.data(key, setTimeout(event, delay));
        }
        else{
            event();
        }
    }
    function getValue(o){
        if(o.attr('data-view')){
            for(var key in o.view){
                if(o.view.hasOwnProperty(key)) {
                    var view = o.view[key];
                    if (view && view.getValue) {
                        return view.getValue.call(o);
                    }
                }
            }
            return undefined;
        }
        if(o.tagName == 'INPUT'){
            if(o.type == 'checkbox'){
                return o.checked;
            }
            else if(o.type == 'radio'){
                return o.checked ? o.value : null;
            }
            else{
                return o.value;
            }
        }
        else if(o.tagName == 'SELECT'){
            if (o.attr('multiple') != null) {
                var values = [];
                o.options.each(function(option){
                    if (option.selected) {
                        values.push(option.value);
                    }
                });
                return values;
            }
            else {
                return o.value;
            }
        }
        else if(o.tagName == 'TEXTAREA'){
            return o.value;
        }
        return o.html();
    }
    function setValue(o, value){
        if(o.attr('data-view')){
            for(var key in o.view){
                if(o.view.hasOwnProperty(key)) {
                    var view = o.view[key];
                    if (view && view.setValue) {
                        return view.setValue.call(o, value);
                    }
                }
            }
            return;
        }
        if(o.tagName == 'INPUT'){
            if(o.type == 'checkbox'){
                o.checked = value;
            }
            else if(o.type == 'radio'){
                o.checked = o.value == value;
            }
            else{
                o.value = value;
            }
        }
        else if(o.tagName == 'SELECT'){
            if (o.attr('multiple') != null) {
                var values = [];
                for (var i = 0; i < o.options.length; i++) {
                    var option = o.options[i];
                    if (option.selected) {
                        values.push(option.value);
                    }
                }
                return values;
            }
            else {
                o.value = value;
            }
        }
        else if(o.tagName == 'TEXTAREA'){
            o.value = value;
        }
        o.html(value);
    }
    function unifyValue(o){
        var value = getValue(o);
        switch (o._type) {
            case 'int':
                return value ? parseInt(value) : 0;
            case 'float':
                return value ? parseFloat(value) : 0.0;
            case 'bool':
                return new Boolean(value);
            default:
                return value;
        }
    }
    function validate(o){
        var temp = o.attr('data-validate');
        var name = o.attr('data-model');
        var value = name ? model[name] : getValue(o);
        temp = temp.replace(/\\,/g, '@@');
        var vals = temp.split(',');
        var isList = vals.contains('list');
        for (var i = 0; i < vals.length; i++) {
            var valKey = vals[i].replace(/ /g, '');
            if (valKey == 'required') {
                var msg = o.attr('data-requiredmsg') || 'This field is required.';
                if (isList) {
                    if (!value || !value.length) {
                        return { success: false, message: msg };
                    }
                }
                else if (!Snow.Validate.notNull(value)) {
                    return { success: false, message: msg };
                }
            }
            else if (valKey != 'list') {
                if (isList) {
                    //check every item in the value
                    if (value && value.length) {
                        for (var j = 0; j < value.length; j++) {
                            var ret = verifyValue(o, valKey, value[j]);
                            if (!ret.success) {
                                return ret;
                            }
                        }
                    }
                }
                else {
                    return verifyValue(o, valKey, value);
                }
            }
        }
        return { success: true };
    }
    function verifyValue(o, valKey, value) {
        if (value != null && value != undefined && value != '') {
            var success = true;
            var valid = Snow.Validate[valKey];
            if(valid){
                if(!valid(value)){
                    success = false;
                }
            }
            else{
                var reg = new RegExp(valKey.replace(/@@/g, ',').replace(/\\/g, '\\'));
                if (!reg.test(value)) {
                    success = false;
                }
            }

            if (!success) {
                var msg = o.attr('data-invalidmsg');
                return { success: false, message: (msg || 'Please enter a valid value.') };
            }
        }
        return { success: true };
    }

    //delay to init the function for initializing the functions
    init();

    return myclass;
};
Snow.Form.view = {};
Snow.Form.fn = {};
document.ready(function(){
    findAll('[data-type="snowform"]').each(function(o){
        Snow.Form(o, {
            action: o.attr('data-action') || o.attr('action'),
            method: o.attr('data-method') || o.attr('method')
        });
    });
});
