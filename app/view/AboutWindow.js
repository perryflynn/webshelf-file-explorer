
Ext.define('DirectoryListing.view.AboutWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',
   
   title:'About',
   width:400,
   
   items: [{
         xtype:'panel',
         bodyPadding:5,
         items: [
            {
               xtype:'container',
               html:(Config.about && Config.about.length>0 ? Config.about+"<hr>" : "")
            },
            {
               xtype:'container',
               html:
                  '<b><u>Credits</u></b><br>'+
                  'Script by Christian Blechert (<a href="http://fiae.ws" target="_blank">http://fiae.ws</a>)<br>'+
                  'Powered by <a href="http://www.sencha.com/products/extjs/" target="_blank">ExtJS</a>'
            }
         ]
   }]
   
});
