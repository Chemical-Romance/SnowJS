var Snow = {};

//array extend
NodeList.prototype.each = Array.prototype.each = function(callback){
    if(this.length){
        for(var i=0; i<this.length; i++){
            callback(this[i]);
        }
    }
}

//object extend
Object.prototype.extend = function(source){
    var self = this;
    source.each(function(val, key){
        self[key] = val;
    });
    return this;
}
Object.prototype.each = function(callback){
    for(var key in this){
        if(this.hasOwnProperty(key)) {
            callback(this[key], key);
        }
    }
}
Object.prototype.diff = function(compareObj){
    if(Object.keys(this).length != Object.keys(compareObj).length)
        return true;
    for(var key in this){
        if(this[key] != compareObj[key])
            return true;
    }
    return false;
}

//element extend
HTMLElement.prototype.attr = function(name, value){
    if(value === undefined){
        return this.getAttribute(name);
    }
    this.setAttribute(name, value);
}
HTMLElement.prototype.bind = HTMLElement.prototype.addEventListener;