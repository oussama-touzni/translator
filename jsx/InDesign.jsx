//@include 'json.jsx';
//@include 'utils.jsx';
$._ext_IDSN = {

    getText: function (isSel) {
        var doc = app.activeDocument;
        if (isSel == "true" && app.selection.length == 0) {
            return JSON.stringify([]);
        }
        var textFrames = [];
        var length = isSel == "true" ? app.selection.length : doc.textFrames.length;
        for (var i = 0; i < length; i++) {
            var pi = isSel == "true" ? app.selection[i] : doc.textFrames[i];
            if (pi instanceof TextFrame) {
                if (pi.contents.constructor.name == "String") {
                    var frame = {
                        id: pi.id,
                        originalText: pi.contents,
                        translatedText: ""
                    };
                    textFrames.push(frame);
                }

            }
        }
        return JSON.stringify(textFrames);
    },
    applyTranslations: function (translations) {
        var doc = app.activeDocument;
        for (var i = 0; i < translations.length; i++) {
            doc.textFrames.itemByID(translations[i].id).contents = translations[i].translatedText;
        }
    },
    isDocumentOpen: function () {
        return JSON.stringify(app.documents.length != 0);
    },
    getDocumentName: function () {
        return app.activeDocument.name;
    },
    getLayers: function () {
        var result = [];
        try {
            layers = app.activeDocument.layers;
            for (var i = 0; i < layers.length; i++) {
                result.push({ id: layers[i].id, name: layers[i].name });
            }
            return JSON.stringify(result);
        } catch (error) {
            logError(error);
            return JSON.stringify(result);
        }
    },
    getTextFromLayers: function (layersArray) {
        var textFrames = [];
        var doc = app.activeDocument;
        for (var i = 0; i < layersArray.length; i++) {
            layer = doc.layers.itemByID(parseInt(layersArray[i]));
            for (var j = 0; j < layer.textFrames.length; j++) {
                var pi = layer.textFrames[j];
                if (pi instanceof TextFrame) {
                    if (pi.contents.constructor.name == "String") {
                        var frame = {
                            layerId: layer.id,
                            layerName: layer.name,
                            id: pi.id,
                            originalText: pi.contents,
                            translatedText: ""
                        };
                        textFrames.push(frame);
                    }

                }

            }
        }
        return JSON.stringify(textFrames);
    },
    applyTranslationsLayers: function (translations, toLanguage, layers) {
        try {
            var doc = app.activeDocument;
            //duplicate original layers 
            for (var j = 0; j < layers.length; j++) {
                try {
                    var oldLayer = doc.layers.itemByID(parseInt(layers[j])); 
                    
                    newLayer= oldLayer.duplicate();
                    oldLayer.name = oldLayer.name + "_" + toLanguage;
                    newLayer.name = newLayer.name.substring(0, newLayer.name.length - 5);
                    oldLayer.visible = false;
                   

                } catch (error) {
                    alert("getting layer " + error);
                }

            }
            for (var i = 0; i < translations.length; i++) {
                doc.textFrames.itemByID(translations[i].id).contents = translations[i].translatedText;
            }
        } catch (error) {
            logError("error applying translation layers: " + error);
            alert("error applying translation layers: " + error);
        }

    }

};