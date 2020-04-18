/** global logging function */
function logInternal(level, message) {
    var homeDir = require('os').homedir().replace(/[\\]/g, "/");
    //alert(homeDir);
    var logPath = homeDir + '/Documents/translator/plugin.log';
    try {
        if (!level) {
            level = "INFO";
        }
        if (!message) {
            message = "NO MESSAGE";
        }
        level = level.toUpperCase();
        var extScript = '$._ext_COMMON.logMsgLevel("' + logPath + '","' + level + '","' + message + '")';
        evalScript(extScript);
    } catch (err) {
        console.log("error logging message:" + err + "\nlevel: " + level + "\tmessage: " + message);
    }
}

/** write output with level debug,  */
function logDebug(message) {
    logInternal("DEBUG", message);
}

/** log with INFO level */
function logInfo(message) {
    logInternal("INFO", message);
}

/** log with INFO level */
function logError(message) {
    logInternal("ERROR", message);
}

function saveToConfigFile(key, value) {
    configFile.setItem(key, value);
}

function readFromConfigFile(key) {
    return configFile.getItem(key);
}
/** file exists in folder */
function fileExists(directory, filename) {
    var exists = false;
    var files = window.cep.fs.readdir(directory);
    var filesArray = files.data;
    for (var i = 0; i < filesArray.length; i++) {
        if (filesArray[i] == filename) {
            exists = true;
        }
    }
    return exists;
}

function openModal() {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('fade').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('fade').style.display = 'none';
}
function mailToAuthor() {
    window.cep.util.openURLInDefaultBrowser("mailto:oussama.touzni@gmail.com?subject=Translator support");
}
function isSupportedExcelFile(filename) {
    var isSupportedExcelFile = false;
    var extenstion = filename.split('.').pop();
    var supported=["csv","dbf","dif","html","xla","xlam","xls","xlsb","xlsm","xlsx","xlt","xltm","xltx","xlw","xml","xps"];
    for (var i = 0; i < supported.length; i++) {
        if (supported[i].toLowerCase() == extenstion.toLowerCase()) {
            isSupportedExcelFile = true;
        }
    }
    return isSupportedExcelFile;
}