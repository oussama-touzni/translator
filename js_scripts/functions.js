var $ = global.jQuery;
global.csInterface = new CSInterface();
global.resourceBundle = csInterface.initResourceBundle();
global.appName = csInterface.hostEnvironment.appName;
global.extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
async function evalScriptCallBack(result, mode,layers) {
  var textFrames = JSON.parse(result);
  if (textFrames.length == 0) {
    displayAlert("error","Translation","alertNoTexts");
    return;
  }
  var remaining = textFrames.length % 10 != 0 ? 1 : 0;
  var numberOfSubArrays = Math.trunc(textFrames.length / 10) + remaining;
  var isLast = false;
  var iteration = 0;
  var model = readFromConfigFile("translationMode") !=undefined ? readFromConfigFile("translationMode") : "base";
  
  var fromSelect = layers ==undefined? document.getElementById("docTranslateLanguagesFrom") :document.getElementById("layersLanguageFrom") ;
  var from = fromSelect.options[fromSelect.selectedIndex].value != "Choose language" ? fromSelect.options[fromSelect.selectedIndex].value : "";
  var toSelect = layers ==undefined?document.getElementById("docTranslateLanguagesTo"):document.getElementById("layersLanguageTo");
  var to = toSelect.options[toSelect.selectedIndex].value;
  if (to == undefined || to == "Choose language") {
    alert("please specify target language");
    return;
  }

  for (let i = 0; i < numberOfSubArrays; i++) {
    var subArray;
    iteration = i;
    data = {};
    data.source = from;
    data.target = to;
    data.model=model;
    try {
      if (i != numberOfSubArrays - 1) {

        subArray1 = textFrames.slice(i * 10, i * 10 + 10);
        data.q = getTextsArray(subArray1);
        var res = await performRequestAsync('/language/translate/v2?key=' + readFromConfigFile("apiKey"), 'POST', data);
        for (let j = 0; j < 10; j++) {
          textFrames[i * 10 + j].translatedText = decodeHtml(res.data.translations[j].translatedText);
        }
  
      } else {
        isLast = true;
        subArray = textFrames.slice(i * 10, textFrames.length);
        data.q = getTextsArray(subArray);
        var res = await performRequestAsync('/language/translate/v2?key=' + readFromConfigFile("apiKey"), 'POST', data);
        for (let j = 0; j < textFrames.length - ((numberOfSubArrays - 1) * 10); j++) {
          textFrames[i * 10 + j].translatedText = decodeHtml(res.data.translations[j].translatedText);
        }
  
        if (mode == "translate") {
          if (layers!=undefined) {
            var translateScript = `$._ext_IDSN.applyTranslationsLayers(${JSON.stringify(textFrames)},${JSON.stringify(to)},${JSON.stringify(layers)})`;
          } else {
            var translateScript = `$._ext_IDSN.applyTranslations(${JSON.stringify(textFrames)})`;
          }
          evalScript(translateScript, function () {
            updateLayersList();
            displayAlert("success","Translation","alertTranslationSuccess");
          });
          

        } else {
          if (layers!=undefined) {
            exportTranslationsToExcelFileLayers(textFrames,layers,to);
          } else {
            exportTranslationsToExcelFile(textFrames);
          }
         
        }
  
  
      }
    } catch (error) {
     logError("error getting translations: " + error);
     displayAlert("error","Translation","alertTranslationError");
    }
    

  }

}
async function translateAll(mode) {
  executeIfDocumentOpen(()=>{
    var transMode = document.querySelector('input[name="translate"]:checked').value;
    isSel = transMode == "sel" ? "true" : "false";
    var extScript = "$._ext_IDSN.getText('" + isSel + "')";
    evalScript(extScript, res => evalScriptCallBack(res, mode));
  });
}

function getTextsArray(ArrayOfTextFrames) {
  var textsTotranslate = [];
  for (let i = 0; i < ArrayOfTextFrames.length; i++) {
    textsTotranslate.push(ArrayOfTextFrames[i].originalText);
  }
  return textsTotranslate;
}

function getSupportedLanguages() {

  function successCallback(resultData) {

    saveToConfigFile("supportedLanguages", JSON.stringify(resultData));
    setLanguageSelectOptions("docTranslateLanguagesFrom", resultData.data.languages);
    setLanguageSelectOptions("docTranslateLanguagesTo", resultData.data.languages);
    setLanguageSelectOptions("selectLanguagesQuickFrom", resultData.data.languages);
    setLanguageSelectOptions("selectLanguagesQuickTo", resultData.data.languages);
    setLanguageSelectOptions("pluginLanguage", resultData.data.languages);
    setLanguageSelectOptions("pluginLanguageTo", resultData.data.languages);
    setLanguageSelectOptions("layersLanguageFrom", resultData.data.languages);
    setLanguageSelectOptions("layersLanguageTo", resultData.data.languages);
    saveToConfigFile("langCfg", true);


  }

  performRequest('/language/translate/v2/languages?key=' + readFromConfigFile("apiKey"), 'GET', {
    target: "en"
  }, successCallback);
}

function setLanguageSelectOptions(selectId, languages) {
  for (i = document.getElementById(selectId).options.length - 1; i > 0; i--) {
    document.getElementById(selectId).remove(i);
  }

  for (var i = 0; i < languages.length; i++) {
    var option = document.createElement("option");
    var option_text = document.createTextNode(languages[i].name);
    option.appendChild(option_text);
    option.value = languages[i].language;
    document.getElementById(selectId).appendChild(option);
  }
}

function quickTranslate() {
  var fromText = document.getElementById("quickFrom");
  var fromSelect = document.getElementById("selectLanguagesQuickFrom");
  var toLanguageSelect = document.getElementById("selectLanguagesQuickTo");
  var to = toLanguageSelect.options[toLanguageSelect.selectedIndex].value != "Choose language" ? toLanguageSelect.options[toLanguageSelect.selectedIndex].value : "";
  var from = fromSelect.options[fromSelect.selectedIndex].value != "Choose language" ? fromSelect.options[fromSelect.selectedIndex].value : "";
  var model = readFromConfigFile("translationMode") !=undefined ? readFromConfigFile("translationMode") : "base";
  if (fromText.value == "") {
    displayAlert("error", "Error", "alertMissingText");
    return;
  }
  if (to == "") {
    displayAlert("error", "Error", "alertMissingTarget");
    return;
  }

  function successCallback(resultData) {

    document.getElementById("quickResult").value = decodeHtml(resultData.data.translations[0].translatedText);
  }
  data = {};
  data.q = fromText.value;
  data.source = from;
  data.target = to;
  data.model = model;
  performRequest('/language/translate/v2?key=' + readFromConfigFile("apiKey"), 'POST', data, successCallback);
}

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function exportTranslationsToExcelFile(translationsArray) {
  openModal();
  const XLSX = require('xlsx');
  const path = require('path');
  let finalHeaders = ['id','originalText','translatedText'];
  if (readFromConfigFile("exportFolder") == "") {
    displayAlert("error", "Directory", "alertMissingDir");
    return;
  }
  var exportDir = readFromConfigFile("exportFolder");
  try {
    
    let ws = XLSX.utils.json_to_sheet(translationsArray, {header: finalHeaders});
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "INDD");
    var getDocumentNameScript = "$._ext_IDSN.getDocumentName()"; 
    evalScript(getDocumentNameScript, (docName) => {
      var dt = new Date();
      excelFileName = path.parse(docName).name + "_" + dt.getTime();
      excelFilePath= exportDir+"/"+excelFileName+".xlsx";
      XLSX.writeFile(wb,excelFilePath);
      closeModal();
      displayAlert("success", "Export", resourceBundle.transExpTo+" " + excelFileName+".xlsx");
    });
  } catch (error) {
    logError("error exporting to excel : " + error);
    closeModal();
    displayAlert("error", "Export", "alertTranslationError");
  }

  closeModal();

}

function exportTranslationsToExcelFileLayers(translationsArray,layers,toLanguage) {
  openModal();
  const XLSX = require('xlsx');
  const path = require('path');
  let finalHeaders = ['layerId', 'layerName', 'id','originalText','translatedText'];
  if (readFromConfigFile("exportFolder") == "") {
    displayAlert("error", "Directory", "alertMissingDir");
    return;
  }
  var exportDir = readFromConfigFile("exportFolder");
  try {
    
    let ws = XLSX.utils.json_to_sheet(translationsArray, {header: finalHeaders});
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "INDD");
    if(!wb.Custprops) wb.Custprops = {};
    wb.Custprops["targetLanguage"] = toLanguage;
    wb.Custprops["layers"]=JSON.stringify(layers);
    var getDocumentNameScript = "$._ext_IDSN.getDocumentName()"; 
    evalScript(getDocumentNameScript, (docName) => {
      var dt = new Date();
      excelFileName = path.parse(docName).name + "_" + dt.getTime();
      excelFilePath= exportDir+"/"+excelFileName+".xlsx";
      XLSX.writeFile(wb,excelFilePath);
      closeModal();
      displayAlert("success", "Export", resourceBundle.transExpTo +" " + excelFileName+".xlsx");
    });
  } catch (error) {
    logError("error exporting to excel : " + error);
    closeModal();
    displayAlert("error", "Export", "alertTranslationError");
  }

  closeModal();

}
function readTranslationsFromExcelFile() {
  executeIfDocumentOpen(processImport);
}
function processImport() {
  
  var XLSX = require('xlsx');
  var file = document.getElementById("excelFile").files[0];
  if (file == undefined) {
    displayAlert("error", "Import", "alertSuppFile");
    return;
  }
  if (!isSupportedExcelFile(file.name)) {
    displayAlert("error", "Import", "alertSuppFile");
    return;
  }
  
  try {
    var fileReader = new FileReader();
    fileReader.onload = function (e) {
      try {
        var workbook = XLSX.read(e.target.result, {
          type: 'array',
          cellDates: true,
          cellStyles: true
        });
        var sheet_name_list = workbook.SheetNames;
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        var translateScript = `$._ext_IDSN.applyTranslations(${JSON.stringify(xlData)})`;
        console.log(workbook.Custprops)
        if(workbook.Custprops !=undefined && workbook.Custprops.layers!=undefined){
          console.log(workbook.Custprops)
           translateScript = `$._ext_IDSN.applyTranslationsLayers(${JSON.stringify(xlData)},${JSON.stringify(workbook.Custprops.targetLanguage)},${workbook.Custprops.layers})`;
        }
        evalScript(translateScript, function () {
          updateLayersList();
        });
      } catch (error) {
        closeModal();
        logError('error parsing excel: ' + error);
        displayAlert("error", "Import", "alertTranslationError");
        return;
      }

    };
    fileReader.readAsArrayBuffer(file);


  } catch (error) {
    logError('error parsing excel: ' + error);
    displayAlert("error", "Import", "alertTranslationError");
    closeModal();
    return;
  }
  closeModal();
  displayAlert("success", "Import", "alertTransImported");

}
function executeIfDocumentOpen(cb) {
  var checkDoc = `$._ext_IDSN.isDocumentOpen()`;
  evalScript(checkDoc, function (isOpen) {
    if (isOpen=="true") {
      cb();
    } else {
      closeModal();
      displayAlert("error", "Document", "alertNoOpenDoc");
      logError('trying to perform action with no open documents');
    }
  });
}

function updateLayersList(){
  var checkDoc = `$._ext_IDSN.isDocumentOpen()`;
  evalScript(checkDoc, function (isOpen) {
    if (isOpen=="true") {
      var getLayersScript = `$._ext_IDSN.getLayers()`;
      evalScript(getLayersScript, function (res) {
        layers = JSON.parse(res);
        if (layers.length>0) {
          setLayersSelectOptions("layers-select", layers);
        }
      });
    }

  });

}

function setLayersSelectOptions(selectId, layers) {
  for (i = document.getElementById(selectId).options.length - 1; i >= 0; i--) {
    document.getElementById(selectId).remove(i);
  }

  for (var i = 0; i < layers.length; i++) {
    var option = document.createElement("option");
    var option_text = document.createTextNode(layers[i].name);
    option.appendChild(option_text);
    option.value = layers[i].id;
    document.getElementById(selectId).appendChild(option);
  }
}

async function translateAllLayers(mode) {
  var selectedLayers=[];
    var selectLayers=document.getElementById("layers-select");

    for (var j = 0; j < selectLayers.options.length; j++) {

        if (selectLayers.options[j].selected) {
          selectedLayers.push(selectLayers.options[j].value);
        }
    }

  executeIfDocumentOpen(()=>{
    var extScript = `$._ext_IDSN.getTextFromLayers(${JSON.stringify(selectedLayers)})`;
    evalScript(extScript, res =>evalScriptCallBack(res, mode,selectedLayers));
  });
}