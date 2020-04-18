global.fs = require('fs');
class configFile {

    constructor(config) {
        const homedir = require('os').homedir().replace(/[\\]/g, "/");
        if (fileExists(homedir + '/Documents/translator/', 'configuration.json')) {
            try {
                var contents = fs.readFileSync(homedir + '/Documents/translator/configuration.json', 'utf8');
                config = JSON.parse(contents);
            } catch (err) {
                console.log("error reading file : " + err);
                logError(err);
            }
        } else {
            try {
                fs.mkdirSync(homedir + '/Documents/translator/');
            } catch (error) {
                if (error.code === 'EEXIST') {
                    logDebug("dir exists continuing creation of config file");
                } else {
                    logError(error);
                    return;
                }

            }

            fs.writeFileSync(homedir + '/Documents/translator/configuration.json', JSON.stringify(config, null, 2), 'utf8', function (err) {
                if (err) logInternal("error writing file : ", err);
                try {
                    var contents = fs.readFileSync(homedir + '/Documents/translator/configuration.json', 'utf8');
                    config = JSON.parse(contents);
                } catch (error) {
                    logError(error);
                }
            });
        }
        this.config = config;
    }

    getItem(item) {
        var value = null;
        if (this.config[item] != undefined) {
            value = this.config[item];
        }
        return value;
    }

    setItem(item, value) {
        this.config[item] = value;
        var homeDir = require('os').homedir().replace(/[\\]/g, "/");
        fs.writeFileSync(homeDir + '/Documents/translator/configuration.json', JSON.stringify(this.config, null, 2) + "\n", 'utf8', function (err) {
            if (err) logError("error writing file : " + err);
        });
    }

    removeItem(item) {
        this.setItem(item, null);
    }

    hasItem(item) {
        var hasItem = false;
        if (this.getItem(item) != undefined) {
            hasItem = true;
        }
        return hasItem;
    }

}