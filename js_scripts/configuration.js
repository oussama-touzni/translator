var $ = global.jQuery;
function chooseFolder() {
   var result = window.cep.fs.showOpenDialogEx(false, true);
    document.getElementById("exportDirectory").value = result.data;
    document.getElementById("exportDirectory").title = result.data;
}
async function saveConfiguration() {
    apiKey = $('#apiKey').val();
    exportFolder = $('#exportDirectory').val();
    languageSelect = document.getElementById("pluginLanguage");
    toLanguageSelect = document.getElementById("pluginLanguageTo");
    modeSelect = document.getElementById("translationMode");
    language = languageSelect.options[languageSelect.selectedIndex].value ;
    toLanguage = toLanguageSelect.options[toLanguageSelect.selectedIndex].value ;
    mode = modeSelect.options[modeSelect.selectedIndex].value ;
    if (apiKey !="" && apiKey !=readFromConfigFile("apiKey")) {
        try {
            logDebug("verifying api key");
            var res =await performRequestAsync('/language/translate/v2?key=' + apiKey, 'POST', {
                "q": ["Hello"],
                "target": "de"
              }); 
        } catch (error) {
            displayAlert("error", "KEY", "alertInvalidAPI");
            return; 
        } 
    }
   
    if (exportFolder=="") {
        displayAlert("error", "Directory", "alertInvalidDirectory");
        return;
    }

    saveToConfigFile("apiKey",apiKey);
    saveToConfigFile("exportFolder",exportFolder);
    saveToConfigFile("translationMode",mode);
    saveToConfigFile("pluginLanguage",language);
    saveToConfigFile("pluginLanguageTo",toLanguage);
    selectOption("docTranslateLanguagesFrom",language ) ;
    selectOption("docTranslateLanguagesTo", toLanguage) ;
    selectOption("selectLanguagesQuickFrom",language ) ;
    selectOption("selectLanguagesQuickTo", toLanguage) ;
    selectOption("layersLanguageFrom",language ) ;
    selectOption("layersLanguageTo", toLanguage) ;
    displayAlert("success", "Configuration", "settingsSaved");
}

async function saveInitialConfig(){
    apiKey = $('#apiKeyInit').val();
    if (apiKey !="") {
        try {
            logDebug("verifying api key");
            var res =await performRequestAsync('/language/translate/v2?key=' + apiKey, 'POST', {
                "q": ["Hello"],
                "target": "de"
              }); 
              saveToConfigFile("apiKey",apiKey);
              $('#apiKey').val(apiKey);
              getSupportedLanguages();
              document.getElementById("modal_initial_configuration").style.display="none";
              displayAlert("error", "Configuration", "Valid Key , please continue configuring");
              switchTab(1);
        } catch (error) {
           document.getElementById("keyValidation").style.display="block";
            return; 
        } 
    }else{
        document.getElementById("keyValidation").style.display="block";
    }
}