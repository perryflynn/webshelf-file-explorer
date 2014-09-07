
Ext.define('DirectoryListing.view.AboutWindow',
{
   extend: 'Ext.window.Window',
   layout:'fit',

   title:'About webshelf '+webshelf_version+' ('+webshelf_date+')',
   iconCls:'iconcls-information',
   width:400,
   height:300,

   items: [{
         xtype:'panel',
         border:0,
         layout:'border',
         defaults: {
            split:true,
            border:0,
            bodyPadding:5
         },
         items: [
            {
               xtype:'panel',
               region:'center',
               autoScroll:true,
               html:(Settings.about_content && Settings.about_content.length>0 ? Settings.about_content : "")
            },
            {
               xtype:'panel',
               region:'south',
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
