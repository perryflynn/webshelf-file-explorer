
Ext.define('DirectoryListing.view.BasicWindow', {
   extend: 'Ext.window.Window',
   alias:'widget.basicwindow',

   title:'New Basic Window',
   width:400,
   height:400,

   basicheight:0,
   basicwidth:0,

   windowState: 'restored',

   initComponent: function()
   {
      this.basicheight = this.height;
      this.basicwidth = this.width;

      this.callParent();

      this.on('afterrender', this._onBodyRendered, this);
      this.on('maximize', this._onWindowMaximized, this);
      this.on('restore', this._onWindowRestored, this);

   },

   _onBodyRendered: function() {
      this.up('viewport').on('resize', this._onViewportResized, this);
      this.up('viewport').fireEvent('resize');
   },

   _onWindowMaximized: function() {
      this.windowState = "maximized";
   },

   _onWindowRestored: function() {
      this.windowState = "restored";
   },

   _onViewportResized: function() {
      var me = this;

      window.setTimeout(function() {
         var body = me.up('viewport');
         var bwidth = body.getWidth();
         var bheight = body.getHeight();
         var win = me;
         var wwidth = me.basicwidth+20;
         var wheight = me.basicheight+20;

         if(me.windowState=="restored" && (wwidth>bwidth || wheight>bheight)) {
            win.setPosition(0,0);
            win.maximize();
         } else if(me.windowState=="maximized" && wwidth<=bwidth && wheight<=bheight) {
            win.restore();
         }

         if(me.windowState=="restored") {
            win.center();
         }
      }, 50);

   }





});