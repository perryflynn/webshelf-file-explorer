
Tools = {

   filesizeformat: function(value) {
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
   }


}

