
HashManager = {

   hashstring: window.location.hash,
   parameters: {},

   init: function() {

      if(this.hashstring.length>2 && this.hashstring.substring(0, 2)!="#!") {
         return;
      }

      var me = this;
      var params = me.hashstring.substring(2).split('&');

      Ext.each(params, function(param) {
         var keyvalue = param.split('=');
         if(keyvalue.length>1) {
            me.parameters[keyvalue[0]] = keyvalue[1];
         }
      });

      me.setHash();

   },

   setHash: function() {
      var hash = [  ];
      Ext.iterate(this.parameters, function(key, value) {
         hash.push(key+"="+value);
      });

      var hashstring = "";
      if(hash.length>0) {
         hashstring = "#!"+hash.join('&');
      }
      window.location.hash = hashstring;
      
   },

   get: function(key) {
      return this.parameters[key];
   },

   set: function(key, value) {
      this.parameters[key] = value;
      this.setHash();
   },

   unset: function(key) {
      delete this.parameters[key];
      this.setHash();
   }

}
