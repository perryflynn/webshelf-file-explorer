
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

            title:'File Explorer @ '+hostname,
            width:1024,
            height:600,
            maximizable:true,
            closable:false,
            autoShow:true,
            layout:'border',
            
            items: [
               {
                  region:'west',
                  width:220,
                  xtype:'treepanel',
                  xid:'dirtree',
                  rootVisible: false,
                  split: true,
                  
                  tbar: [
                     {
                        text:'Refresh',
                        xid:'tree-reload'
                     },
                     {
                        text:'Expand all',
                        xid:'expandall'
                     },
                     {
                        text:'Collapse all',
                        xid:'collapseall'
                     }
                  ],
                  
                  store: Ext.create('Ext.data.TreeStore', {
                     proxy: {
                        type: 'ajax',
                        url: 'ajax.php?filter=folders',
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
                  
                  tbar: [
                     {
                        text:'Refresh',
                        xid:'list-reload'
                     },
                     {
                        text:'Open',
                        xid:'file-open',
                        disabled:true
                     },
                     {
                        text:'Direct URL',
                        xid:'direct-link',
                        disabled:true
                     },
                     { xtype:'tbfill' },
                     {
                        xtype:'button',
                        text:'About',
                        xid:'about'
                     }
                  ],
                  
                  columns: [
                     { header:'', dataIndex:'metadata', width:32, renderer:this.fileIconRenderer },
                     { header:'Filename', dataIndex:'text', flex:1 },
                     { header:'Last modified', dataIndex:'metadata', renderer: function(value) { return value.mtime; } },
                     { header:'Size', dataIndex:'metadata', renderer:this.filesizerenderer },
                  ],
                  
                  store: Ext.create('Ext.data.Store', {
                     fields:['text', 'children', 'metadata', 'qtip'],
                     proxy: {
                        type: 'ajax',
                        url: 'ajax.php?filter=files',
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
