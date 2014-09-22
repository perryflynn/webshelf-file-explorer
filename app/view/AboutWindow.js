
Ext.define('DirectoryListing.view.AboutWindow',
{
   extend: 'DirectoryListing.view.BasicWindow',
   layout:'fit',

   title:'About webshelf file explorer',
   iconCls:'iconcls-information',
   width:600,
   height:400,
   modal:true,

   items: [
      {
         xtype:'panel',
         border:0,
         layout:'border',
         defaults: {
            split:true,
            border:0
         },
         items: [
            {
               xtype:'panel',
               region:'west',
               layout:'vbox',
               width:135,
               defaults: {
                  border:0
               },
               items: [
                  {
                     xtype:'panel',
                     html:'<p style="text-align:center; margin:0px; padding:0px;"><img src="res/logo-128.png" alt="Logo"></p>',
                  },
                  {
                     xtype:'panel',
                     bodyPadding:5,
                     html:'<span style="font-weight:bold; text-decoration:underline;">Version</span><br>'+webshelf_version+
                             '<br>&nbsp;<br>'+
                             '<span style="font-weight:bold; text-decoration:underline;">Date</span><br>'+webshelf_date+
                             '<br>&nbsp;<br>'+
                             '<span style="font-weight:bold; text-decoration:underline;">Source code</span><br>'+
                             '<a href="https://github.com/perryflynn/webshelf-file-explorer" target="_blank">Github Page</a>'
                  }
               ]
            },
            {
               region:'center',
               xtype:'panel',
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
                     html:
                        '<p style="font-weight:bold; text-decoration:underline;">About</p>'+
                        (Settings.about_content && Settings.about_content.length>0 ? Settings.about_content : "-")
                  },
                  {
                     xtype:'panel',
                     region:'south',
                     html:
                        '<p style="font-weight:bold; text-decoration:underline;">Credits</p>'+
                        'webshelf by Christian Blechert (<a href="http://fiae.ws" target="_blank">http://fiae.ws</a>)<br>'+
                        'Icons by <a href="http://www.famfamfam.com/lab/icons/" target="_blank">famfamfam</a><br>'+
                        'Upload Widget by <a href="https://github.com/ivan-novakov/extjs-upload-widget" target="_blank">Ivan Novakov</a><br>'+
                        'Template Engine by <a href="http://twig.sensiolabs.org/" target="_blank">SensioLabs</a><br>'+
                        'PHP Framework by <a href="http://silex.sensiolabs.org/" target="_blank">SensioLabs</a><br>'+
                        'UI Framework by <a href="http://www.sencha.com/products/extjs/" target="_blank">Sencha</a>'
                  }
               ]
            }
         ]
      }
   ]

});
