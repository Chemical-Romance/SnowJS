var Snow = {
    extend: function(deep, target, source){
        if(source){
            source.each(function(val, key){
                if (deep && val instanceof Array) {
                    target[key] = Snow.extend(deep, [], val);
                }
                else if (deep && val instanceof Object) {
                    target[key] = Snow.extend(deep, {}, val);
                }
                else{
                    target[key] = val;
                }
            });
        }
        return target;
    }
};

//extend window
window.height = function(){
    return this.document.documentElement.clientHeight;
}
window.width = function(){
    return this.document.documentElement.clientWidth;
}

//extend document
document.ready = function (callback) {
    document.addEventListener('DOMContentLoaded', function () {
        document.removeEventListener('DOMContentLoaded', arguments.callee, false);
        callback();
    }, false);
    //if (document.addEventListener) {
    //    document.addEventListener('DOMContentLoaded', function () {
    //        document.removeEventListener('DOMContentLoaded', arguments.callee, false);
    //        callback();
    //    }, false)
    //}
    //else if (document.attachEvent) {
    //    document.attachEvent('onreadytstatechange', function () {
    //        if (document.readyState == "complete") {
    //            document.detachEvent("onreadystatechange", arguments.callee);
    //            callback();
    //        }
    //    })
    //}
    //else if (document.lastChild == document.body) {
    //    callback();
    //}
}

//extend element
function find(selectors) {
    if (typeof (selectors) == 'object')
        return selectors;
    else if(selectors.indexOf('<') == 0){
        var doc = (new DOMParser()).parseFromString(selectors, "text/html");
        return doc.body.children[0];
    }
    return document.querySelector(selectors);
}
function findAll(selectors) {
    if (typeof (selectors) == 'object')
        return selectors;
    else if(selectors.indexOf('<') == 0){
        var doc = (new DOMParser()).parseFromString(selectors, "text/html");
        return doc.body.children;
    }
    return document.querySelectorAll(selectors);
}
function matchesSelector(element, selector){
    if(element.matches){
        return element.matches(selector);
    } else if(element.matchesSelector){
        return element.matchesSelector(selector);
    } else if(element.webkitMatchesSelector){
        return element.webkitMatchesSelector(selector);
    } else if(element.msMatchesSelector){
        return element.msMatchesSelector(selector);
    } else if(element.mozMatchesSelector){
        return element.mozMatchesSelector(selector);
    } else if(element.oMatchesSelector){
        return element.oMatchesSelector(selector);
    }
}
HTMLElement.prototype.find = HTMLElement.prototype.querySelector;
HTMLElement.prototype.findAll = HTMLElement.prototype.querySelectorAll;
//only support the dom and express
HTMLElement.prototype.closest = function(selector){
    var node = selector.nodeType ? selector : null;
    var curNode = this;
    while(curNode){
        if(node){
            if(node == curNode) {
                return curNode;
            }
        }
        else{
            if(matchesSelector(curNode, selector)){
                return curNode;
            }
        }
        curNode = curNode.parentNode;
    }
    return null;
};
HTMLElement.prototype.attr = function (name, value) {
    if (value === undefined) {
        return this.getAttribute(name);
    }
    this.setAttribute(name, value);
    return this;
};
HTMLElement.prototype.html = function (html) {
    if (html === undefined) {
        return this.innerHTML;
    }
    this.innerHTML = html;
    return this;
};
HTMLElement.prototype.empty = function () {
    this.innerHTML = '';
    return this;
};
HTMLElement.prototype.append = function (selector) {
    this.appendChild(find(selector));
    return this;
};
HTMLElement.prototype.prepend = function (selector) {
    this.insertBefore(find(selector), this.firstChild);
    return this;
};
HTMLElement.prototype.appendTo = function (selector) {
    find(selector).appendChild(this);
    return this;
};
HTMLElement.prototype.prependTo = function (selector) {
    var dom = find(selector);
    dom.insertBefore(this, dom.firstChild);
    return this;
};
HTMLElement.prototype.before = function (selector) {
    var dom = find(selector);
    this.parentNode.insertBefore(dom, this);
    return this;
};
HTMLElement.prototype.after = function (selector) {
    var dom = find(selector);
    if(this.parentNode.lastChild == this){
        this.parentNode.appendChild(dom);
    }
    else{
        this.parentNode.insertBefore(dom, this.nextSibling);
    }
    return this;
};
HTMLElement.prototype.replaceWith = function (selector) {
    this.parentNode.replaceChild(find(selector), this);
}
HTMLElement.prototype.remove = function (selector) {
    if(selector) {
        this.findAll(selector).each(function(dom){
            dom.parentNode.removeChild(dom);
        });
    }
    else{
        this.parentNode.removeChild(this);
    }
    return this;
};
HTMLElement.prototype.data = function (key, value) {
    if(value == undefined){
        if(this.cache){
            return this.cache[key];
        }
        return null;
    }
    else {
        if (!this.cache) {
            this.cache = {};
        }
        this.cache[key] = value;
    }
    return this;
};
HTMLElement.prototype.hasClass = function (className) {
    className = className.trim();
    var classNames = this.className.split(' ');
    for(var i=0; i<classNames.length; i++){
        if(classNames[i].trim() == className){
            return true;
        }
    }
    return false;
};
HTMLElement.prototype.addClass = function (className) {
    className = className.trim();
    if(!this.hasClass(className)){
        this.className = this.className + ' ' + className;
    }
    return this;
};
HTMLElement.prototype.removeClass = function (className) {
    className = className.trim();
    var classNames = this.className.split(' ');
    for(var i=0; i<classNames.length; i++){
        if(classNames[i].trim() == className){
            classNames.splice(i, 1);
            break;
        }
    }
    this.className = classNames.join(' ');
    return this;
};
HTMLElement.prototype.height = function (height) {
    if(height == undefined){
        return this.offsetHeight;
    }
    if(Snow.Validate.float(height)){
        height = height + 'px';
    }
    this.style.height = height;
    return this;
};
HTMLElement.prototype.width = function (width) {
    if(width == undefined){
        return this.offsetWidth;
    }
    if(Snow.Validate.float(width)){
        width = width + 'px';
    }
    this.style.width = width;
    return this;
};
HTMLElement.prototype.css = function (name, value) {
    if(value == undefined){
        if(typeof(name) == 'object'){
            var cssText = '';
            name.each(function(v, k){
                cssText += (k + ':' + v + ';');
            });
            this.style.cssText += cssText;
        }
        else{
            return (this.currentStyle? this.currentStyle : getComputedStyle(this, null))[name];
        }
    }
    else{
        this.style.cssText += (name + ':' + value + ';');
    }
    return this;
};
HTMLElement.prototype.show = function () {
    this.style.display = '';
    return this;
};
HTMLElement.prototype.hide = function () {
    this.style.display = 'none';
    return this;
};

HTMLElement.prototype.offset = function () {
    var node = this;
    var offset = {top:0, left:0};
    while(node != document){
        offset = {
            top: offset.top + node.offsetTop,
            left: offset.left + node.offsetLeft
        }
        node = node.parentNode;
    }
    return offset;
};
HTMLElement.prototype.position = function () {
    return {
        top: this.offsetTop,
        left: this.offsetLeft
    }
}
HTMLElement.prototype.bind = function (type, listener, useCapture) {
    var self = this;
    type.split(',').each(function (name) {
        self.addEventListener(name, listener, useCapture);
    });
    return this;
};
HTMLElement.prototype.unbind = function (type, listener, useCapture) {
    var self = this;
    type.split(',').each(function (name) {
        self.removeEventListener(name, listener, useCapture);
    });
    return this;
};
//HTMLElement.prototype.click = function (listener, useCapture) {
//    this.addEventListener('click', listener, useCapture);
//    return this;
//};



//extend array
NodeList.prototype.each = Array.prototype.each = function(callback){
    for(var i=0; i<this.length; i++){
        callback(this[i], i);
    }
};
NodeList.prototype.contains = Array.prototype.contains = function (value) {
    for(var i=0; i<this.length; i++){
        if(this[i] == value)
            return true;
    }
    return false;
};
NodeList.prototype.toArray = function () {
    var array = [];
    this.each(function (node) {
        array.push(node);
    });
    return array;
}
Array.prototype.remove = function(value){
    for(var i=0; i<this.length; i++){
        if(this[i] == value){
            this.splice(i, 1);
            break;
        }
    }
};

//extend object
Object.prototype.extend = function(source){
    if(arguments.length > 0){
        var deep = false, i = 0;
        if(typeof(arguments[0]) == 'boolean'){
            deep = arguments[0];
            i = 1;
        }
        //foreach arguments
        for(; i<arguments.length; i++){
            var arg = arguments[i];
            Snow.extend(deep, this, arg);
        }
    }
    return this;
};
Object.prototype.each = function(callback){
    for(var key in this){
        if(this.hasOwnProperty(key)) {
            callback(this[key], key);
        }
    }
};
Object.prototype.diff = function(deep, compareObj){
    //deep compare the objects
    if(typeof(deep) == 'boolean'){
        if(deep){
            if(JSON.stringify(this) == JSON.stringify(compareObj)){
                return false;
            }
            return true;
        }
    }
    else{
        compareObj = deep;
    }

    //compare the objects
    if(!compareObj)
        return true;
    if(Object.keys(this).length != Object.keys(compareObj).length)
        return true;
    for(var key in this){
        if(this.hasOwnProperty(key) && this[key] != compareObj[key]) {
            return true;
        }
    }
    return false;
};

//extend string

//Format string by data model
//var model = { Name: 'Lisa', Age: 12, Employee: { A: 'John'} };
//var string = "Name:{Name} Aget:{Age} Employee:{Employee.A}";
//Call e.g.
//"My name is {Name}".format({Name:"Ryan"})    ==>  "My name is Ryan";
//"My name is {Name}".format()                 ==>  "My name is {Name}";
//"{hello}, my name is {Name}".format(true,{hello:'Hellow'})             ==>  "Hello, my name is ";
//"My name is {0}".format("Ryan")              ==>  "My name is Ryan";
String.prototype.format = function () {
    var result = this.replace(/{{/g, '!<!').replace(/}}/g, '!>!');
    if (arguments.length > 0) {
        var startIndex = 0;
        var clear = false; //clear the argument string: {arg}
        if (typeof (arguments[0]) == 'boolean') {
            clear = arguments[0];
            startIndex = 1;
        }
        var args;
        if (arguments.length == (startIndex + 1) && typeof (args = arguments[startIndex]) == "object") {
            var matchs = result.match(new RegExp("\{[^{^}]*}", "gi"));
            if (matchs) {
                for (var i = 0; i < matchs.length; i++) {
                    var match = matchs[i];
                    var myKey = match.substring(1, match.length - 1);
                    var myValue = myKey.getObjectValue(args);
                    if (myValue != undefined && myValue != null) {
                        result = result.replace(match, myValue);
                    }
                    else if (clear) {
                        result = result.replace(match, '');
                    }
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                var myValue = arguments[i + startIndex];
                var reg = new RegExp("({)" + i + "(})", "g");
                if (myValue != undefined && myValue != null) {
                    result = result.replace(reg, myValue);
                }
                else if (clear) {
                    result = result.replace(reg, '');
                }
            }
        }
    }
    return result.toString().replace(/!<!/g, '{').replace(/!>!/g, '}');;
};
String.prototype.getObjectValue = function (data) {
    var key = this;
    if (!data || typeof (data) != 'object' || key == "")
        return undefined;
    var index = 0;
    if ((index = key.indexOf('.')) > -1) {
        var currentKey = key.substring(0, index);
        var otherKeys = key.substring(index + 1, key.length);
        if (currentKey == '')
            return undefined;
        return otherKeys.getObjectValue(currentKey.getObjectValue(data));
    }
    else {
        var value = data[key];
        return value === null ? '' : value;
    }
};
String.prototype.trim = function () {
    return this.replace(/(^\s+)|(\s+$)/g, "");
};

//extend date
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};