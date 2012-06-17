
Ext.define('DirectoryListing.view.AboutWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   
   title:'About',
   width:400,
   height:100,
   
   items: [{
         xtype:'panel',
         bodyPadding:5,
         items: [
            {
               xtype:'container',
               html:
                  'By Christian Blechert (<a href="http://fiae.ws" target="_blank">http://fiae.ws</a>)<br>'+
                  'Powered by <a href="http://www.sencha.com/products/extjs/" target="_blank">ExtJS</a>'
            }
         ]
   }]
   
});
