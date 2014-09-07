
Ext.define('DirectoryListing.view.AboutWindow', {
   extend: 'Ext.window.Window',
   layout:'fit',

   title:'About',
   iconCls:'iconcls-information',
   width:400,

   items: [{
         xtype:'panel',
         bodyPadding:10,
         items: [
            {
               xtype:'container',
               html:(Settings.about_content && Settings.about_content.length>0 ? Settings.about_content+"<br>&nbsp;<br><hr>&nbsp;<br>" : "")
            },
            {
               xtype:'container',
               html:
                  '<b><u>Credits</u></b><br>'+
                  'webshelf by Christian Blechert (<a href="http://fiae.ws" target="_blank">http://fiae.ws</a>)<br>'+
                  'Icons by <a href="http://www.famfamfam.com/lab/icons/" target="_blank">famfamfam</a><br>'+
                  'Upload Widget by <a href="https://github.com/ivan-novakov/extjs-upload-widget" target="_blank">Ivan Novakov</a><br>'+
                  'UI by <a href="http://www.sencha.com/products/extjs/" target="_blank">ExtJS</a>'
            }
         ]
   }]

});
