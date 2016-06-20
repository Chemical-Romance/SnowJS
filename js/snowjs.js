



HTMLElement.prototype.bind = function(model){
  var list = this.querySelectorAll('[data-model]');
  for(var i=0; i<list.length; i++){
    var o = list[i];
    if(!o.attr('data-value'))
      o.val(model[o.attr('data-model')]);
  }

  //value
  list = this.querySelectorAll('[data-value]');
  for(var i=0; i<list.length; i++){
    var o = list[i];
    o.val(o.excute(model, 'data-value'));
  }

  //script
  list = this.querySelectorAll('[data-script]');
  for(var i=0; i<list.length; i++){
    var o = list[i];
    o.excute(model, 'data-script');
  }

  //class
  list = this.querySelectorAll('[data-class]');
  for(var i=0; i<list.length; i++){
    var o = list[i];
    o.className=o.excute(model, 'data-class');
  }
}
