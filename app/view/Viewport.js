
Ext.define('DirectoryListing.view.Viewport', {
   extend: 'Ext.container.Viewport',
   layout:'fit',

   requires: [

   ],

   defaults: {

   },

   initComponent: function() {

      this.items = [
         {
            xtype:'window',
            xid:'filewindow',

            title:'webshelf file explorer @ '+hostname,
            icon:'fileicons/folder_explore.png',
            width:Settings.windowwidth,
            height:Settings.windowheight,
            maximizable:true,
            closable:false,
            autoShow:true,
            layout:'border',

            tbar: [
               {
                  text:'Refresh',
                  tooltip:'Refresh Tree',
                  icon:'fileicons/arrow_refresh.png',
                  xid:'tree-reload'
               },
               {
                  text:'Expand',
                  tooltip:'Expand all',
                  icon:'fileicons/arrow_out.png',
                  xid:'expandall'
               },
               {
                  text:'Collapse',
                  tooltip:'Collapse all',
                  icon:'fileicons/arrow_in.png',
                  xid:'collapseall'
               },
               {
                  text:'Open',
                  tooltip:'Open',
                  icon:'fileicons/application_go.png',
                  xid:'file-open',
                  disabled:true
               },
               {
                  text:'URL',
                  tooltip:'Direct URL',
                  icon:'fileicons/application_link.png',
                  xid:'direct-link',
                  disabled:true
               },
               {
                  text:'Show',
                  tooltip:'Show hidden files',
                  icon:'fileicons/flag_red.png',
                  xid:'hidden-files',
                  enableToggle: true,
                  listeners: {
                     toggle: function(btn, pressed) {
                        if(pressed) {
                           this.setIcon("fileicons/flag_green.png");
                           this.setTooltip("Hide hidden files");
                           this.setText("Hide");
                        } else {
                           this.setIcon("fileicons/flag_red.png");
                           this.setTooltip("Show hidden files");
                           this.setText("Show");
                        }
                     }
                  }
               },
               {
                  text:'Upload',
                  tooltip:'Upload multiple files',
                  icon:'fileicons/page_white_get.png',
                  xid:'upload'
               },
               { xtype:'tbfill' },
               {
                  xtype:'label',
                  hidden:true,
                  xid:'logininfo',
                  style: 'padding-right:10px;'
               },
               {
                  text:'Manage',
                  icon:'fileicons/cog.png',
                  disabled:true,
                  hidden:true,
                  xid:'manage'
               },
               {
                  text:'Get Status...',
                  icon:'fileicons/user_go.png',
                  xid:'login'
               },
               {
                  text:'About',
                  icon:'fileicons/information.png',
                  xid:'about'
               }

            ],

            items: [
               {
                  region:'west',
                  width:220,
                  xtype:'treepanel',
                  xid:'dirtree',
                  rootVisible: false,
                  split: true,

                  store: Ext.create('Ext.data.TreeStore', {
                     nodeParam:'args[node]',
                     proxy: {
                        type: 'ajax',
                        url: 'ajax.php?controller=filesystem&action=getfiles&args[filter]=folders',
                        reader: {
                           type: 'json',
                           root: 'result'
                        }
                     }
                  })


               },
               {
                  region:'north',
                  xtype:'panel',
                  bodyPadding:5,
                  border:0,
                  layout:'anchor',
                  items: [
                     {
                        xtype:'textfield',
                        xid:'current-path',
                        border:0,
                        readOnly:true,
                        anchor:'100%',
                        value:'/'
                     }
                  ]
               },
               {
                  region:'center',
                  xtype:'gridpanel',
                  xid:'filelist',

                  columns: [
                     { header:'', dataIndex:'metadata', width:32, renderer:this.fileIconRenderer },
                     { header:'Filename', dataIndex:'text', flex:4 },
                     { header:'Last modified', dataIndex:'metadata', flex:1, renderer: function(value) { return value.mtime; } },
                     { header:'Size', dataIndex:'metadata', flex:1, renderer:this.filesizerenderer },
                  ],

                  store: Ext.create('Ext.data.Store', {
                     fields:['text', 'children', 'metadata', 'qtip'],
                     proxy: {
                        type: 'ajax',
                        url: 'ajax.php?controller=filesystem&action=getfiles&args[filter]=files',
                        reader: {
                           type: 'json',
                           root: 'result'
                        }
                     }
                  })


               }
            ]


         }
      ];

      this.callParent();


   },

   filesizerenderer: function(value) {
      var size = value.size;
      var unit = "Byte";

      if(size>1024) {
         size = (size/1024);
         unit = "KByte";
      }

      if(size>1024) {
         size = (size/1024);
         unit = "MByte";
      }

      if(size>1024) {
         size = (size/1024);
         unit = "GByte";
      }

      if(size>1024) {
         size = (size/1024);
         unit = "TByte";
      }

      return (unit=='Byte' ? size : size.toFixed(2))+" "+unit;
   },

   fileIconRenderer: function(value) {
      var ext = value.extension;
      var filename = "page_white";
      if(ext!=null && ext!="") {

         switch(ext) {
            case 'pdf':
               filename='page_white_acrobat'; break;
            case 'cpp':
               filename='page_white_cplusplus'; break;
            case 'c':
               filename='page_white_c'; break;
            case 'h':
               filename='page_white_h'; break;
            case 'cs':
               filename='page_white_csharp'; break;
            case 'iso':
            case 'img':
               filename='page_white_cd'; break;
            case 'gz':
            case 'zip':
            case 'rar':
            case 'bz2':
            case 'tar':
            case 'ace':
            case '7z':
            case 'ar':
            case 'xz':
               filename='page_white_compressed'; break;
            case 'js':
            case 'css':
            case 'xml':
            case 'xaml':
            case 'phps':
               filename='page_white_code'; break;
            case 'jar':
            case 'class':
               filename='page_white_cup'; break;
            case 'sql':
               filename='page_white_database'; break;
            case 'xls':
            case 'xlsx':
            case 'csv':
               filename='page_white_excel'; break;
            case 'swf':
               filename='page_white_flash'; break;
            case 'exe':
            case 'bin':
               filename='page_white_gear'; break;
            case 'asc':
            case 'pgp':
            case 'key':
            case 'pub':
               filename='page_white_key'; break;
            case 'php':
            case 'php3':
            case 'php4':
            case 'php5':
               filename='page_white_php'; break;
            case 'gif':
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'tiff':
            case 'bmp':
            case 'tif':
            case 'xcf':
            case 'ico':
            case 'xpm':
               filename='page_white_picture'; break;
            case 'pps':
            case 'ppsx':
               filename='page_white_powerpoint'; break;
            case 'sh':
               filename='page_white_tux'; break;
            case 'svg':
               filename='page_white_vector'; break;
            case 'doc':
            case 'docx':
               filename='page_white_word'; break;
            case 'html':
            case 'htm':
               filename='page_white_world'; break;
         }

      }

      return '<img src="fileicons/'+filename+'.png" alt="'+ext+'" title="'+ext+'">';

   }


});
