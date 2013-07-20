
Ext.define('Ext.ux.fiaedotws.imageviewer.Panel', {
   extend:'Ext.panel.Panel',
   alias:'widget.imageviewer',

   autoScroll:true,

   resizeMode:'fit',
   zoomLevel:100,
   mousedowntime:0,
   images:[],
   imageindex:1,
   sourceX:0,
   sourceY:0,
   targetX:0,
   targetY:0,
   panWidth:0,
   panHeight:0,
   orgWidth:0,
   orgHeight:0,

   initComponent: function()
   {
      Ext.tip.QuickTipManager.init();
      var me = this;

      this.bbar = [
         { xtype:'tbfill' },
         {
            tooltip:'Previous',
            iconCls:'iconcls-arrow_left',
            xid:'prev'
         },
         {
            tooltip:'Next',
            iconCls:'iconcls-arrow_right',
            xid:'next'
         },
         {
            tooltip:'Original',
            iconCls:'iconcls-arrow_out',
            xid:'org'
         },
         {
            tooltip:'Fit to window',
            iconCls:'iconcls-arrow_in',
            xid:'fit'
         },
         {
            tooltip:'Fit vertical',
            iconCls:'iconcls-arrow-up-down',
            xid:'fit-v'
         },
         {
            tooltip:'Fit horizontal',
            iconCls:'iconcls-arrow-left-right',
            xid:'fit-h'
         },
         {
            tooltip:'Zoom out',
            iconCls:'iconcls-magifier_zoom_out',
            xid:'zoom-out'
         },
         {
            xtype:'slider',
            xid:'zoomlevel',
            increment: 1,
            minValue: 10,
            maxValue: 200,
            value:100,
            width:200
         },
         {
            xtype:'tbtext',
            xid:'zoomlevel-text',
            width:40,
            style:'text-align:right;',
            text:'100%'
         },
         {
            tooltip:'Zoom in',
            iconCls:'iconcls-magnifier_zoom_in',
            xid:'zoom-in'
         },
         { xtype:'tbfill' }
      ];

      this.items = [
         {
            xtype:'image',
            src:''
         }
      ];


      me.callParent();


      me.on('afterrender', this.onImagePanelRendered, this);
      me.on('resize', this.onPanelResized, this);
      me.on('firstimage', this.onFirstImage, this);
      me.on('lastimage', this.onLastImage, this);
      me.on('imagechange', this.onImageChange, this);
      me.child('image').on('afterrender', this.onImageRendered, this);
   },

   setImages: function(img) {
      this.images = img;
   },

   setCurrentImage: function(img) {
      var index = this.images.indexOf(img);
      if(index>-1) {
         this.imageindex = (index+1);
      }
   },

   // Events -----------------------------------------------------------------------------------------

   onImagePanelRendered: function() {
      var me = this;
      var bdy = this.body;
      bdy.on('mousedown', this.onImagePanelMouseDown, this);
      bdy.on('mouseup', this.onImagePanelMouseUp, this);

      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      Ext.each(tb.query('button'), function(btn) {
         btn.on('click', me.onToolbarButtonClicked, me);
      });

      tb.child('slider[xid=zoomlevel]').on('change', this.onZoomlevelChanged, this);
      tb.child('slider[xid=zoomlevel]').on('drag', this.onZoomlevelSelected, this);
      tb.child('slider[xid=zoomlevel]').getEl().on('click', this.onZoomlevelSelected, this);

      this.fireEvent('resize');
   },

   onPanelResized: function() {
      this.panWidth = Ext.get(this.body.dom).getWidth()-20;
      this.panHeight = Ext.get(this.body.dom).getHeight()-20;
      this.resize();
   },

   onImagePanelMouseDown: function(e) {
      if(e.button==0) {
         this.mousedowntime = new Date().getTime();
         this.sourceX = this.targetX = e.browserEvent.clientX;
         this.sourceY = this.targetY = e.browserEvent.clientY;
         this.body.on('mousemove', this.onBodyMouseMove, this);
         e.stopEvent();
      }
   },

   onImagePanelMouseUp: function(e) {
      if(e.button==0) {

         var klicktime = ((new Date().getTime())-this.mousedowntime);

         if(klicktime<180 && (this.targetX-this.sourceX)<5 &&
            (this.targetX-this.sourceX)>-5 && (this.targetY-this.sourceY)<5 &&
            (this.targetY-this.sourceY)>-5)
         {
            this.next();
         }

         this.body.un("mousemove", this.onBodyMouseMove, this);

      }
      this.mousedowntime = 0;
   },

   onBodyMouseMove: function(e) {
      this.scrollBy((this.targetX-e.browserEvent.clientX), (this.targetY-e.browserEvent.clientY));
      this.targetX = e.browserEvent.clientX;
      this.targetY = e.browserEvent.clientY;
   },

   onImageChange: function() {
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      tb.child('button[xid=next]').enable();
      tb.child('button[xid=prev]').enable();
   },

   onFirstImage: function() {
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      tb.child('button[xid=prev]').disable();
   },

   onLastImage: function() {
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      tb.child('button[xid=next]').disable();
   },

   onToolbarButtonClicked: function(btn) {
      if(btn.xid=="fit") {
         this.resizeMode = "fit";
      }
      if(btn.xid=="fit-h") {
         this.resizeMode="fith";
      }
      if(btn.xid=="fit-v") {
         this.resizeMode = "fitv";
      }
      if(btn.xid=="org") {
         this.resizeMode = null;
      }
      if(btn.xid=="fit" || btn.xid=="fit-h" || btn.xid=="fit-v" || btn.xid=="org") {
         this.resize();
      }
      if(btn.xid=="next") {
         this.next();
      }
      if(btn.xid=="prev") {
         this.prev();
      }
      if(btn.xid=="zoom-in") {
         this.zoomIn(10);
      }
      if(btn.xid=="zoom-out") {
         this.zoomOut(10);
      }
   },

   onZoomlevelChanged: function(combo, newval) {
      this.zoomLevel=newval;
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      var tbtext = tb.child('tbtext[xid=zoomlevel-text]');
      tbtext.setText(this.zoomLevel+'%');
      this.imageZoom(this.zoomLevel);
   },

   onZoomlevelSelected: function(slider) {
      this.resizeMode="zoom";
   },

   onImageRendered: function(img) {
      var me = this;
      img.el.on({
         load: function (evt, ele, opts) {
            ele.style.width="";
            ele.style.height="";
            me.orgWidth = Ext.get(ele).getWidth();
            me.orgHeight = Ext.get(ele).getHeight();
            me.resize();
            me.fireEvent('imageloaded');
            if(ele.src!="") {
               me.setLoading(false);
            }
         },
         error: function (evt, ele, opts) {

         }
      });
      this.prev();
   },


   // Methods ----------------------------------------------------------------------------------------

   resize: function() {
      if(this.resizeMode=="fit") {
         this.imageFit();
      }
      else if(this.resizeMode=="fith") {
         this.imageFitHorizontal();
      }
      else if(this.resizeMode=="fitv") {
         this.imageFitVertical();
      }
      else if(this.resizeMode==null) {
         this.imageFitNot();
      }
      this.imageZoom(this.zoomLevel);
   },

   imageFit: function() {
      var pwidth = this.panWidth;
      var pheight = this.panHeight;
      var iwidth = this.orgWidth;
      var iheight = this.orgHeight;

      if ((iwidth * pheight / iheight) > pwidth) {
         this.imageFitHorizontal();
      } else {
         this.imageFitVertical();
      }
   },

   imageFitHorizontal: function() {
      var pwidth = this.panWidth;
      var pheight = this.panHeight;
      var iwidth = this.orgWidth;
      var iheight = this.orgHeight;

      if(iwidth>=pwidth) {
         var perc = (100/iwidth*pwidth);
         var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
         tb.child('slider[xid=zoomlevel]').setValue(perc);
      } else {
         this.imageFitNot();
      }
   },

   imageFitVertical: function(changemode) {
      var pwidth = this.panWidth;
      var pheight = this.panHeight;
      var iwidth = this.orgWidth;
      var iheight = this.orgHeight;

      if(iheight>=pheight) {
         var perc = (100/iheight*pheight);
         var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
         tb.child('slider[xid=zoomlevel]').setValue(perc);
      } else {
         this.imageFitNot();
      }
   },

   imageZoom: function(level) {
      var iwidth = this.orgWidth;
      var iheight = this.orgHeight;
      this.child('image').getEl().dom.style.width = parseInt((iwidth/100*level))+"px";
      this.child('image').getEl().dom.style.height = parseInt((iheight/100*level))+"px";
   },

   zoomIn: function(interval) {
      this.resizeMode="zoom";
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      var slider = tb.child('slider[xid=zoomlevel]');
      var min = slider.minValue;
      var max = slider.maxValue;
      var current = slider.getValue();

      var target = current+interval;
      if(target>max) {
         target = max;
      }

      slider.setValue(target);
   },

   zoomOut: function(interval) {
      this.resizeMode="zoom";
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      var slider = tb.child('slider[xid=zoomlevel]');
      var min = slider.minValue;
      var max = slider.maxValue;
      var current = slider.getValue();

      var target = current-interval;
      if(target>max) {
         target = max;
      }

      slider.setValue(target);
   },

   imageFitNot: function(changemode) {
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      tb.child('slider[xid=zoomlevel]').setValue(100);
   },

   setImage: function(img) {
      var ip = this.child('image');
      this.setLoading('Loading...');
      ip.setSrc(img);
   },

   next: function() {
      if(this.images[(this.imageindex+1)]) {
         this.imageindex++;
         this.setImage(this.images[this.imageindex]);
         this.fireEvent('imagechange');
         this.fireEvent('nextimage');
         if(this.imageindex<=0) {
            this.fireEvent('firstimage');
         }
         if((this.images.length-1)<=this.imageindex) {
            this.fireEvent('lastimage');
         }
      }
   },

   prev: function() {
      if(this.images[(this.imageindex-1)]) {
         this.imageindex--;
         this.setImage(this.images[this.imageindex]);
         this.fireEvent('imagechange');
         this.fireEvent('previousimage');
         if(this.imageindex<=0) {
            this.fireEvent('firstimage');
         }
         if((this.images.length-1)<=this.imageindex) {
            this.fireEvent('lastimage');
         }
      }
   }



});

