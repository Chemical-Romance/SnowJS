//Snow Form
Snow.Form = function(dom, model){
    var self = this, lastModel, flag = 0,
        modelList = dom.querySelectorAll('[data-model]'),
        attrList = dom.querySelectorAll('[data-value], [data-class], [data-script]');
    var events = ['click', 'change', 'focus', 'blur', 'input', 'keydown'],
        eventList = dom.querySelectorAll('[data-' + events.join('],[data-') + ']');

    var myclass = {
        fn: {}, //user functions
        update: function (newModel) { //update model and view
            flag = 0;
            model.extend(newModel);
            prepare();
        },
        submit: function (callback) {
            var validList = dom.querySelectorAll('[data-validate]');
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
            callback(model);
            //console.log(model);
        }
    };


    function init(){

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

        //set lastModel
        lastModel = {}.extend(model);

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
        eventList.each(function(dom){
            events.each(function(e){
                var attr = 'data-' + e;
                var event = dom.attr(attr);
                if(event){
                    if(event.indexOf('@') == 0){
                        dom.bind(e, function(){myclass.fn[event.substring(1)].call(this, model);});
                    }
                    else {
                        dom.bind(e, function () {
                            script(this, attr);
                            myclass.update(model);
                        });
                    }
                }
            });
        });
    };
    init.views = function(){
        dom.querySelectorAll('[data-view]').each(function(o){
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
                console.log('invalid value');
                setValue(this, model[key]);
                return;
            }
        }
        flag = 0;
        model[key] = unifyValue(this);
        prepare(this);
    };

    function prepare(ignoreDom){
        //prepare the model
        modelList.each(function(o){
            if(o!= ignoreDom) {
                var key = o.attr('data-model');
                if (o.attr('data-value'))
                    model[key] = script(o, 'data-value', true);
            }
        });
        if(lastModel.diff(model)){
            lastModel = {}.extend(model);
            //console.log('rendering');
            if(flag >=100){
                console.log('Some code error');
            }
            prepare(ignoreDom);
        }
        else{
            //console.log('complete');
            updateView(ignoreDom);
        }
    }
    function updateView(ignoreDom){
        //render model
        modelList.each(function(o){
            if(!o.attr('data-value') && o!= ignoreDom)
                setValue(o, model[o.attr('data-model')]);
        });

        //render attribute
        attrList.each(function(o){
            if(o.attr('data-value'))
                setValue(o, script(o, 'data-value', true));
            if(o.attr('data-class'))
                o.className = script(o, 'data-class', true);
            if(o.attr('data-script'))
                script(o, 'data-script');
        });
    }
    function script(o, attr, isReturn){
        var str = 'with(obj){' + (isReturn ? 'return ':'') +' '+o.attr(attr)+'}';
        return new Function('obj', str).call(o, model);
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
        return o.innerHTML;
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
        o.innerHTML = value;
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


    init();

    return myclass;
};
Snow.Form.view = {};
