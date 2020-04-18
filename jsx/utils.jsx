$._ext_COMMON = {

    log: function (logPath, level, message) {
        var output = this.timeStamp() + " \t" + level + " \t" + message;
        try {
            //if log path not defined, create it here. 
            if (!logPath){
                logPath = Folder.myDocuments + "/translator/plugin.log";
                //alert(logPath)
             }
            var logFile = File(logPath);
            if (!logFile.exists) {
                logFile = new File(logPath);
            }

            logFile.open("a");
            logFile.writeln(output.toString());
            logFile.close();

        } catch (error) {
            alert(error);
            return now + " logging fail error " + error;
        }
    },

    logMsgLevel: function (logPath, level, message) {
        this.log(logPath,level, message);
    },

    /** just write with info level */
    logDebug: function (message) {
        this.log("","DEBUG", message);
    },
    
    /** just write with info level */
    logInfo: function (message) {
        this.log("","INFO", message);
    },

    /** write with error level */
    logError: function (message) {
        this.log("","ERROR", message);
    },

    timeStamp : function(){  
        var digital = new Date();  
        var hours = digital.getHours();  
        var minutes = digital.getMinutes();  
        var seconds = digital.getSeconds();  
      
        if (minutes <= 9) minutes = "0" + minutes;  
        if (seconds <= 9) seconds = "0" + seconds;  
        
        var date = new Date();  
        var d  = date.getDate();  
        var day = (d < 10) ? '0' + d : d;  
        var m = date.getMonth() + 1;  
        var month = (m < 10) ? '0' + m : m;  
        var yy = date.getYear();  
        var year = (yy < 1000) ? yy + 1900 : yy;  
      
        MonthNames = new Array("January","February","March","April","May","June","July","August","September","October","November","December");  
        todaysDate = ""+d +"-"+m+"-"+year+" "+hours + ":" + minutes + ":" + seconds;
        return todaysDate;  
      },
      isDocumentSaved: function () {
          var result = app.activeDocument.saved;
          return  JSON.stringify(result);
      }
      
      
};