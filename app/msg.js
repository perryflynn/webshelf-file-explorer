
Msg = {

   msgCt:null,

   createBox: function(t, s){
      return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
   },

   show : function(title, format){
      if(!this.msgCt){
          this.msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
      }
      var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
      var m = Ext.DomHelper.append(this.msgCt, this.createBox(title, s), true);
      m.hide();
      m.slideIn('t').ghost("t", { delay: 3000, remove: true});
   }

}
