importScripts("common_functions.js");

const SHOW_WORD_ALARM = "eachwordShowWord";
const CONTEXT_MENU_ID = "eachword-selection";

let settingsArray;
let selectedThemes;
let timeoutIdNotification;
let intervalTime;
let stopSign;
let isMac = navigator.userAgent.indexOf("Mac") >= 0;
let isWindows = navigator.userAgent.indexOf("Windows") >= 0;
let isLinux = navigator.userAgent.indexOf("Linux") >= 0;
let storageCache = {};

// Chrome version in format: [59, 0, 3071, 115]. From major to minor.
let chromeVersionMatch = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s/);
let chromeVersion = chromeVersionMatch ? chromeVersionMatch[2].split(".").map(Number) : [0, 0, 0, 0];

if (typeof localStorage === "undefined") {
    self.localStorage = {
        getItem: function (key) {
            return storageCache.hasOwnProperty(key) ? storageCache[key] : null;
        },
        setItem: function (key, value) {
            storageCache[key] = String(value);
            chrome.storage.local.set({[key]: storageCache[key]});
        },
        removeItem: function (key) {
            delete storageCache[key];
            chrome.storage.local.remove(key);
        },
        clear: function () {
            storageCache = {};
            chrome.storage.local.clear();
        }
    };
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName !== "local") {
        return;
    }

    Object.keys(changes).forEach(function (key) {
        if (typeof changes[key].newValue === "undefined") {
            delete storageCache[key];
        } else {
            storageCache[key] = String(changes[key].newValue);
        }
    });
});

function hydrateStorageCache(after) {
    chrome.storage.local.get(null, function (items) {
        storageCache = {};

        Object.keys(items).forEach(function (key) {
            storageCache[key] = String(items[key]);
        });

        after();
    });
}

function createOrUpdateAlarm() {
    let periodInMinutes = Math.max(intervalTime / 60000, 0.5);
    chrome.alarms.create(SHOW_WORD_ALARM, {periodInMinutes: periodInMinutes});
}

function clearWordAlarm() {
    chrome.alarms.clear(SHOW_WORD_ALARM);
}

function refreshRuntimeState() {
    settingsArray = checkSettings();
    selectedThemes = checkSelectedThemes();
    dictionaryArrayQueue = checkDictionary();
    intervalTime = settingsArray.selectInterval * 1000 * 60;
}

function syncScheduleFromStorage() {
    let dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));
    let switchState = JSON.parse(localStorage.getItem("switchState"));

    if (dictionaryArray.length !== 0 && switchState !== false) {
        stopSign = false;
        createOrUpdateAlarm();
    } else {
        stopSign = true;
        clearWordAlarm();
    }
}

function initializeBackground() {
    checkStorage();
    setIcon();
    refreshRuntimeState();
    syncScheduleFromStorage();
    registerContextMenu();
}

hydrateStorageCache(initializeBackground);

function sendMessageToTab(tabId, message) {
    if (!tabId) {
        return Promise.resolve();
    }

    return chrome.tabs.sendMessage(tabId, message).catch(function (error) {
        if (error && error.message &&
            (error.message.indexOf("Receiving end does not exist") !== -1 ||
                error.message.indexOf("Could not establish connection") !== -1)) {
            return;
        }

        console.warn("EachWord: failed to send tab message", error);
    });
}

function showNotification(word, translation, settingsArray) {
    let options;
    let _notificationId;
    let progressCounter;
    let intervalIdNotification;
    let typeFlag = isWindows || isLinux || (isMac && chromeVersion[0] >= 59);

    if (typeFlag) {
        options = {
            type: "basic",
            title: "EachWord",
            message: word + " - " + translation,
            iconUrl: "images/icons/icon128.png",
            requireInteraction: true,
            priority: 2
        };
    } else {
        options = {
            type: "progress",
            title: "EachWord",
            message: word + " - " + translation,
            iconUrl: "images/icons/iconNotification128.png",
            requireInteraction: true,
            priority: 2,
            progress: 0
        };
    }

    _notificationId = "wordCard" + Math.floor(Math.random() * 9999999);
    chrome.notifications.create(_notificationId, options);
    progressCounter = 0;
    intervalIdNotification = setInterval(function () {
        if (progressCounter < 100) {
            progressCounter++;

            if (!typeFlag) {
                options.progress++;
                chrome.notifications.update(_notificationId, options);
            }
        } else {
            chrome.notifications.clear(_notificationId);
            clearInterval(intervalIdNotification);
        }

        // In order to reduce losses in the division: settingsArray.selectDelay * 10 == settingsArray.selectDelay / 100 * 1000.
    }, settingsArray.selectDelay * 10);

    chrome.notifications.onClosed.addListener(function (notificationId) {
        if (notificationId === _notificationId) {
            chrome.notifications.clear(_notificationId);
            clearInterval(intervalIdNotification);
        }
    });
}

/**
 * This function will be executed when the time to show comes.
 */
function showWord() {
    let chosenWord = chooseWord(dictionaryArrayQueue, "dictionaryArrayQueue", "lastWordQueue");
    let chosenTheme = chooseTheme();

    if (settingsArray.showNotificationCardsChecked) {
        timeoutIdNotification = setTimeout(function () {
            // Defined in "commonFunction.js".
            showNotification(chosenWord.word, chosenWord.translation, settingsArray);
        }, 1000);
    }

    if (settingsArray.showNativeCardsChecked) {
        chrome.tabs.query({"active": true, "currentWindow": true},
            function (tabs) {
                if (!tabs || tabs.length === 0) {
                    return;
                }

                sendMessageToTab(tabs[0].id, {
                    type: "showWord",
                    settingsArray: settingsArray,
                    wordArray: chosenWord,
                    theme: chosenTheme
                });
            });
    }

    updateWord();
}

function updateWord() {
    let word = JSON.parse(localStorage.getItem("lastWordQueue"));
    let dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));
    let index = dictionaryArray.indexOfObject(word);

    if (index >= 0) {
        if (word.displays) {
            word.displays++;
        } else {
            word.displays = 1;
        }

        if (settingsArray.displaysBeforeDeletion > 0 && word.displays >= settingsArray.displaysBeforeDeletion) {
            dictionaryArray.splice(index, 1);
        } else {
            dictionaryArray[index] = word;
        }

        localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    }
}

function setIcon() {
    let switchState = JSON.parse(localStorage.getItem("switchState"));

    if (switchState) {
        chrome.action.setIcon({path: "images/default_icons/icon38.png"});
    } else {
        chrome.action.setIcon({path: "images/default_icons/icon38_(without_color).png"});
    }
}

function checkDictionary() {
    let dictionaryArrayQueue;

    dictionaryArrayQueue = localStorage.getItem("dictionaryArrayQueue");
    dictionaryArrayQueue = JSON.parse(dictionaryArrayQueue);
    return dictionaryArrayQueue;
}

function checkSettings() {
    return JSON.parse(localStorage.getItem("settingsArray"));
}

function checkSelectedThemes() {
    return JSON.parse(localStorage.getItem("selectedThemes"));
}

function updateTheme() {
    return storeDefaultThemes();
}

/**
 * In case of it is first application launch or there were some troubles with localStorage.
 */
function checkStorage() {
    let settingsArray = localStorage.getItem("settingsArray");
    let dictionaryArray = localStorage.getItem("dictionaryArray");
    let dictionaryArrayQueue = localStorage.getItem("dictionaryArrayQueue");
    let dictionaryArrayTab = localStorage.getItem("dictionaryArrayTab");
    let lastWordQueue = localStorage.getItem("lastWordQueue");
    let switchState = localStorage.getItem("switchState");
    let fromLanguage = localStorage.getItem("fromLanguage");
    let intoLanguage = localStorage.getItem("intoLanguage");
    let searchInput = localStorage.getItem("searchInput");
    let versionArray = localStorage.getItem("versionArray");
    let themes = localStorage.getItem("themes");
    let selectedThemes = localStorage.getItem("selectedThemes");
    let currentThemeNumber = localStorage.getItem("currentThemeNumber");
    let themesLengthAfterUpdate;

    if (!settingsArray) {
        settingsArray = {};
    } else {
        settingsArray = JSON.parse(settingsArray);
    }

    if (!(settingsArray.hasOwnProperty("selectInterval"))) {
        settingsArray.selectInterval = 5;
    }

    if (!(settingsArray.hasOwnProperty("selectDelay"))) {
        settingsArray.selectDelay = 6;
    }

    if (!(settingsArray.hasOwnProperty("showClose"))) {
        settingsArray.showClose = true;
    }

    if (!(settingsArray.hasOwnProperty("showBlur"))) {
        settingsArray.showBlur = false;
    }

    if (!(settingsArray.hasOwnProperty("showNativeCardsChecked"))) {
        settingsArray.showNativeCardsChecked = true;
    }

    if (!(settingsArray.hasOwnProperty("showNotificationCardsChecked"))) {
        settingsArray.showNotificationCardsChecked = true;
    }

    if (!(settingsArray.hasOwnProperty("showNativeCardsDisabled"))) {
        settingsArray.showNativeCardsDisabled = false;
    }

    if (!(settingsArray.hasOwnProperty("showNotificationCardsDisabled"))) {
        settingsArray.showNotificationCardsDisabled = false;
    }

    if (!(settingsArray.hasOwnProperty("showTimeline"))) {
        settingsArray.showTimeline = true;
    }

    if (!(settingsArray.hasOwnProperty("searchFromBegin"))) {
        settingsArray.searchFromBegin = false;
    }

    if (!(settingsArray.hasOwnProperty("translateFrom"))) {
        settingsArray.translateFrom = "en";
    }

    if (!(settingsArray.hasOwnProperty("translateInto"))) {
        settingsArray.translateInto = "ru";
    }

    if (!(settingsArray.hasOwnProperty("displaysBeforeDeletion"))) {
        settingsArray.displaysBeforeDeletion = 200;
    }

    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));

    if (!dictionaryArray) {
        dictionaryArray = [{
            "word": "Welcome",
            "translation": "\u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c",
            "displays": 0
        }];
        localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    }

    if (!dictionaryArrayQueue) {
        dictionaryArrayQueue = [];
        localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));
    }

    if (!dictionaryArrayTab) {
        dictionaryArrayTab = [];
        localStorage.setItem("dictionaryArrayTab", JSON.stringify(dictionaryArrayTab));
    }

    if (!lastWordQueue) {
        lastWordQueue = null;
        localStorage.setItem("lastWordQueue", JSON.stringify(lastWordQueue));
    }

    if (!switchState) {
        switchState = true;
        localStorage.setItem("switchState", JSON.stringify(switchState));
    }

    if (!fromLanguage) {
        fromLanguage = "";
        localStorage.setItem("fromLanguage", JSON.stringify(fromLanguage));
    }

    if (!intoLanguage) {
        intoLanguage = "";
        localStorage.setItem("intoLanguage", JSON.stringify(intoLanguage));
    }

    if (!searchInput) {
        searchInput = "";
        localStorage.setItem("searchInput", JSON.stringify(searchInput));
    }

    if (!versionArray) {
        versionArray = [];
        localStorage.setItem("versionArray", JSON.stringify(versionArray));
    }

    themesLengthAfterUpdate = updateTheme();

    if (!themes) {
        themes = JSON.parse(localStorage.getItem("themes"));
    } else {
        themes = JSON.parse(themes);
    }

    if (!selectedThemes) {
        selectedThemes = [];
        themes = JSON.parse(localStorage.getItem("themes"));

        for (let i = 0; i < themes.length; i++) {
            selectedThemes.push(i);
        }

        localStorage.setItem("selectedThemes", JSON.stringify(selectedThemes));
    } else if (themes.length < themesLengthAfterUpdate) {
        selectedThemes = JSON.parse(localStorage.getItem("selectedThemes"));

        for (let i = themes.length; i < themesLengthAfterUpdate; i++) {
            selectedThemes.push(i);
        }

        localStorage.setItem("selectedThemes", JSON.stringify(selectedThemes));
    } else if (themes.length > themesLengthAfterUpdate) {
        themes = JSON.parse(localStorage.getItem("themes"));
        selectedThemes = JSON.parse(localStorage.getItem("selectedThemes"));

        for (let i = 0; i < selectedThemes.length; i++) {
            if (themes[selectedThemes[i]] === undefined) {
                delete selectedThemes[i];
            }
        }

        for (let i = 0; i < selectedThemes.length; i++) {
            if (selectedThemes[i] === undefined) {
                selectedThemes.splice(i, 1);
            }
        }

        localStorage.setItem("selectedThemes", JSON.stringify(selectedThemes));
    }

    if (!currentThemeNumber) {
        currentThemeNumber = 0;
        localStorage.setItem("currentThemeNumber", JSON.stringify(currentThemeNumber));
    }
}

function registerContextMenu() {
    chrome.contextMenus.remove(CONTEXT_MENU_ID, function () {
        if (chrome.runtime.lastError &&
            chrome.runtime.lastError.message.indexOf("Cannot find menu item") === -1) {
            console.warn(chrome.runtime.lastError.message);
        }

        chrome.contextMenus.create({
            id: CONTEXT_MENU_ID,
            title: isMac ? "EachWord (Cmd + Shift + E)" : "EachWord (Ctrl + Shift + E)",
            contexts: ["selection"],
            documentUrlPatterns: ["https://*/*", "http://*/*"]
        }, function () {
            if (chrome.runtime.lastError &&
                chrome.runtime.lastError.message.indexOf("duplicate id") === -1) {
                console.warn(chrome.runtime.lastError.message);
            }
        });
    });
}

chrome.runtime.onInstalled.addListener(function () {
    registerContextMenu();
});

chrome.runtime.onStartup.addListener(function () {
    hydrateStorageCache(function () {
        refreshRuntimeState();
        syncScheduleFromStorage();
        setIcon();
        registerContextMenu();
    });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === SHOW_WORD_ALARM && !stopSign) {
        showWord();
    }
});

chrome.contextMenus.onClicked.addListener(function (event, tab) {
    if (event.menuItemId !== CONTEXT_MENU_ID || !tab || !tab.id) {
        return;
    }

    sendMessageToTab(tab.id, {
        type: "showWindow",
        text: event.selectionText
    });
});

/**
 * Listener for runtime messages.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender) {
        if (request.type === "changeDictionary") {
            dictionaryArrayQueue = checkDictionary();
            syncScheduleFromStorage();
        }

        if (request.type === "stopInterval") {
            stopSign = true;
            clearWordAlarm();
        }

        if (request.type === "startInterval") {
            let switchState = JSON.parse(localStorage.getItem("switchState"));

            if (switchState) {
                stopSign = false;
                createOrUpdateAlarm();
            }
        }

        if (request.type === "showNotification") {
            showNotification("Word", "Translation", settingsArray);
        }

        if (request.type === "changeSettings") {
            refreshRuntimeState();
            if (!stopSign) {
                createOrUpdateAlarm();
            }
            setIcon();
        }

        if (request.type === "wordCardShown") {
            clearTimeout(timeoutIdNotification);
            increaseCurrentThemeNumber();
        }

        if (request.type === "giveTranslation") {
            translate(settingsArray.translateFrom, settingsArray.translateInto, request.text, function (translation) {
                if (sender.tab && sender.tab.id) {
                    sendMessageToTab(sender.tab.id, {
                        type: "translationCompleted",
                        result: translation
                    });
                }
            });
        }

        if (request.type === "addWordFromContextMenu") {
            let dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));
            let word;
            let translation;

            word = request.word;
            translation = request.translation;

            word = word[0].toUpperCase() + word.slice(1);
            translation = translation[0].toUpperCase() + translation.slice(1);
            dictionaryArray.push({word: word, translation: translation});
            dictionaryArrayQueue.push({word: word, translation: translation});

            localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
            localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));
            syncScheduleFromStorage();
            return false;
        }

        if (request.type === "playWord") {
            chrome.tts.stop();
            chrome.tts.speak(request.word, {
                lang: request.language || settingsArray.translateFrom,
                rate: 1.0
            });
        }

        return false;
    }
);

