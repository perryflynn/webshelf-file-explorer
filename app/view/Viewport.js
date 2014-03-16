
Ext.define('DirectoryListing.view.Viewport', {
   extend: 'Ext.container.Viewport',
   layout:'fit',

   requires: [
      'DirectoryListing.view.BasicWindow'
   ],

   defaults: {

   },

   initComponent: function() {

      this.items = [
         {
            xtype:'basicwindow',
            xid:'filewindow',

            title:'webshelf file explorer @ '+hostname,
            icon:'fileicons/folder_explore.png',
            width:Settings.windowwidth,
            height:Settings.windowheight,
            maximizable:true,
            closable:false,
            autoShow:true,
            layout:'border',
            //modal:true,

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
                  xid:'expandall',
                  hidden:true
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
                  text:'Image Viewer',
                  tooltip:'Image Viewer',
                  icon:'fileicons/photo.png',
                  xid:'image-viewer',
                  hidden:true,
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
                  text:'New Item',
                  tooltip:'Create or upload new Files or Folders',
                  icon:'fileicons/new.png',
                  hidden:true,
                  xid:'newmenu',
                  menu: [
                     {
                        text:'Upload multiple files',
                        icon:'fileicons/page_white_get.png',
                        xid:'upload',
                        hidden:(!Settings.upload)
                     },
                     {
                        text:'New Folder',
                        icon:'fileicons/folder_add.png',
                        xid:'newfolder',
                        hidden:(!Settings.mkdir),
                        menu: [
                           {
                              xtype:'textfield',
                              emptyText:'New Folder'
                           }
                        ]
                     }

                  ]
               },
               { xtype:'tbfill' },
               {
                  xtype:'label',
                  hidden:true,
                  xid:'logininfo',
                  style: 'padding-right:10px;'
               },
               {
                  tooltip:'Manage settings, users, groups and shares',
                  icon:'fileicons/cog.png',
                  disabled:true,
                  hidden:true,
                  xid:'manage'
               },
               {
                  tooltip:'Get Status...',
                  icon:'fileicons/user_go.png',
                  xid:'login'
               },
               {
                  tooltip:'Change password of current user',
                  icon:'fileicons/key_go.png',
                  xid:'changepw',
                  hidden:true
               },
               {
                  tooltip:'About',
                  icon:'fileicons/information.png',
                  xid:'about'
               }

            ],

            items: [
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
                  region:'west',
                  width:220,
                  xtype:'treepanel',
                  xid:'dirtree',
                  rootVisible: false,
                  split: true,

                  viewConfig: {
                     plugins: {
                        ptype: 'treeviewdragdrop',
                        dragGroup:'ddfileop',
                        ddGroup:'ddfileop',
                        dragText:'{0} selected file{1}',
                        appendOnly: true,
                        sortOnDrop: true,
                        pluginId:'dragdrop'
                     }
                  },

                  store: Ext.create('Ext.data.TreeStore', {
                     nodeParam:'node',
                     proxy: {
                        type: 'ajax',
                        url: 'index.php/filesystem/getfiles',
                        actionMethods: {
                           create: 'POST',
                           destroy: 'POST',
                           read: 'POST',
                           update: 'POST'
                        },
                        extraParams: {
                           filter:'folders'
                        },
                        reader: {
                           type: 'json',
                           root: 'result'
                        }
                     }
                  }),

                  dockedItems: [
                     {
                        xtype:'toolbar',
                        dock:'bottom',
                        height:25,
                        hidden:true,
                        items: [
                           {
                              xtype:'progressbar',
                              xid:'space',
                              flex:1,
                              text:'Get filesystem info...',
                              value:0
                           }
                        ]
                     }
                  ]


               },
               {
                  region:'center',
                  xtype:'gridpanel',
                  xid:'filelist',
                  multiSelect: true,

                  viewConfig: {
                      plugins: {
                          ptype: 'gridviewdragdrop',
                          dragGroup:'ddfileop',
                          ddGroup:'ddfileop',
                          dragText:'{0} selected file{1}',
                          appendOnly: true,
                          sortOnDrop: true,
                          enableDrop: false,
                          pluginId:'dragdrop'
                      }
                  },

                  columns: [
                     { header:'', dataIndex:'metadata', width:32, renderer:this.fileIconRenderer },
                     { header:'Filename', dataIndex:'text', flex:4 },
                     { header:'Created', dataIndex:'ctime', width:100, xtype: 'datecolumn', format:'Y-m-d H:i' },
                     { header:'Last Accessed', hidden:true, dataIndex:'atime', width:100, xtype: 'datecolumn', format:'Y-m-d H:i' },
                     { header:'Last modified', hidden:true, dataIndex:'mtime', width:100, xtype: 'datecolumn', format:'Y-m-d H:i' },
                     { header:'Size', dataIndex:'filesize', flex:1, renderer:Tools.filesizeformat }
                  ],

                  store: Ext.create('Ext.data.Store', {
                     fields:[
                        'text', 'children', 'metadata', 'qtip',
                        {
                           name:'mtime',
                           type:'date',
                           convert: function(v, record) {
                              var d = Ext.Date.parse(record.raw.metadata.mtime, 'Y-m-d H:i:s');
                              return d;
                           }
                        },
                        {
                           name:'ctime',
                           type:'date',
                           convert: function(v, record) {
                              var d = Ext.Date.parse(record.raw.metadata.ctime, 'Y-m-d H:i:s');
                              return d;
                           }
                        },
                        {
                           name:'atime',
                           type:'date',
                           convert: function(v, record) {
                              var d = Ext.Date.parse(record.raw.metadata.atime, 'Y-m-d H:i:s');
                              return d;
                           }
                        },
                        {
                           name:'filesize',
                           convert: function(v, record) {
                              return parseInt(record.raw.metadata.size);
                           }
                        }
                     ],
                     proxy: {
                        type: 'ajax',
                        url: 'index.php/filesystem/getfiles',
                        actionMethods: {
                           create: 'POST',
                           destroy: 'POST',
                           read: 'POST',
                           update: 'POST'
                        },
                        extraParams: {
                           filter:'files'
                        },
                        reader: {
                           type: 'json',
                           root: 'result'
                        }
                     }
                  }),

                  dockedItems: [
                     {
                        xtype:'toolbar',
                        dock:'bottom',
                        height:25,
                        items: [
                           {
                              xtype:'tbtext',
                              xid:'sumfiles'
                           }
                        ]
                     }
                  ]


               }
            ]


         }
      ];

      this.callParent();


   },

   fileIconRenderer: function(value, meta, record) {
      var ext = value.extension.toLowerCase();
      /*console.log(ext);
      if(value.isfile==true && (ext=="jpg" || ext=="png" || ext=="gif" || ext=="jpeg")) {
         meta.tdAttr = 'data-qtip="<img src=\'' + value.thumbnailurl + '\' alt=\'t\'>"';
      }*/

      var filename = "page_white";
      if(ext!=null && ext!="") {

         switch(ext) {
            case 'apk':
               filename='android'; break;
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
            case 'mp3':
            case 'm4a':
            case 'wav':
            case 'flac':
               filename='music'; break;
            case 'ppt':
            case 'pptx':
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

      return '<img src="fileicons/'+filename+'.png" alt="'+ext+'">';

   }


});
