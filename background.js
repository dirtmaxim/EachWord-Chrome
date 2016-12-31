// Warning: some variables defined in "commonFunction.js".
let settingsArray;
let selectedThemes;
let intervalIdShowing;
let timeoutIdNotification;
let intervalTime;
let stopSign;

// Initialization.
checkStorage();
setIcon();
settingsArray = checkSettings();
selectedThemes = checkSelectedThemes();
dictionaryArrayQueue = checkDictionary();
intervalTime = settingsArray.selectInterval * 1000 * 60 + settingsArray.selectDelay * 1000;

// Start interval if it is possible.
if (JSON.parse(localStorage.getItem("dictionaryArray")).length !== 0 && JSON.parse(localStorage.getItem("switchState")) !== false) {
    intervalIdShowing = setInterval(showWord, intervalTime);
    stopSign = false;
} else {
    stopSign = true;
}

function showNotification(word, translation, settingsArray) {
    let options;
    let showTimeline;
    let _notificationId;
    let progressCounter;
    let intervalIdNotification;

    options = {
        type: "progress",
        title: "EachWord",
        message: word + " — " + translation,
        iconUrl: "images/icons/iconNotification128.png",
        // In order to increase showing time without recreating.
        priority: 2,
        progress: 0
    };

    showTimeline = settingsArray.showTimeline;

    if (!showTimeline) {
        options.type = "basic";
        delete options.progress;
    }

    _notificationId = "wordCard" + Math.floor(Math.random() * 9999999);
    chrome.notifications.create(_notificationId, options);
    progressCounter = 0;
    intervalIdNotification = setInterval(function () {
        if (progressCounter < 100) {
            progressCounter++;

            if (showTimeline) {
                options.progress++;
            }
        } else {
            chrome.notifications.clear(_notificationId);
            clearInterval(intervalIdNotification);
        }

        chrome.notifications.update(_notificationId, options);

        // In order to reduce losses in the division: settingsArray["selectDelay"] * 10 == settingsArray["selectDelay"] / 100 * 1000.
    }, settingsArray.selectDelay * 10);
    chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
        if (notificationId === _notificationId) {
            if (byUser) {
                chrome.notifications.clear(_notificationId);
                clearInterval(intervalIdNotification);
            } else if (progressCounter < 100) {
                chrome.notifications.create(_notificationId, options);
            }
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
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "showWord",
                    settingsArray: settingsArray,
                    wordArray: chosenWord,
                    theme: chosenTheme
                });
            });
    }
}

function setIcon() {
    let switchState = JSON.parse(localStorage.getItem("switchState"));

    if (switchState) {
        chrome.browserAction.setIcon({path: "images/default_icons/icon38.png"});
    } else {
        chrome.browserAction.setIcon({path: "images/default_icons/icon38_(without_color).png"});
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
    let themes;

    themes = [];
    themes[0] = "#wordCard8730011{background-color:#3cb371;}#timer8730011{color:#9d0019;}#headerOne8730011,#headerThree8730011{color:#006363;}#headerTwo8730011{color:#9d0019;}#word8730011{color:#006363;}#translation8730011{color:#006363;}#dash8730011{color:#9d0019;}";
    themes[1] = "#wordCard8730011{background-color:#8b8b7a;}#headerOne8730011,#headerThree8730011{color:#494915;}#headerTwo8730011{color:#005b8c;}#word8730011{color:#494915;}#translation8730011{color:#494915;}#dash8730011{color:#005b8c;}#timer8730011{color:#005b8c;}";
    themes[2] = "#wordCard8730011{background-color:#5e9dd2;}#headerOne8730011,#headerThree8730011{color:#065ba1;}#headerTwo8730011{color:#d9bd32;}#word8730011{color:#065ba1;}#translation8730011{color:#065ba1;}#dash8730011{color:#d9bd32;}#timer8730011{color:#d9bd32;}";
    themes[3] = "#wordCard8730011{background-color:#e9d387;}#headerOne8730011,#headerThree8730011{color:#806f39;}#headerTwo8730011{color:#005b8c;}#word8730011{color:#806f39}#translation8730011{color:#806f39;}#dash8730011{color:#005b8c;}#timer8730011{color:#005b8c;}";
    localStorage.setItem("themes", JSON.stringify(themes));
    return themes.length;
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
    let lastWordTab = localStorage.getItem("lastWordTab");
    let switchState = localStorage.getItem("switchState");
    let fromLanguage = localStorage.getItem("fromLanguage");
    let intoLanguage = localStorage.getItem("intoLanguage");
    let searchInput = localStorage.getItem("searchInput");
    let versionArray = localStorage.getItem("versionArray");
    let welcomeIsShown = localStorage.getItem("welcomeIsShown");
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

    if (!(settingsArray.hasOwnProperty("enableNewTab"))) {
        settingsArray.enableNewTab = true;
    }

    if (!(settingsArray.hasOwnProperty("translateFrom"))) {
        settingsArray.translateFrom = "en";
    }

    if (!(settingsArray.hasOwnProperty("translateInto"))) {
        settingsArray.translateInto = "ru";
    }

    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));

    if (!dictionaryArray) {
        dictionaryArray = [];
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

    if (!lastWordTab) {
        lastWordTab = null;
        localStorage.setItem("lastWordTab", JSON.stringify(lastWordTab));
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

    if (!welcomeIsShown) {
        welcomeIsShown = false;
        localStorage.setItem("welcomeIsShown", JSON.stringify(welcomeIsShown));
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

/**
 * Listener will be activated when user adds or deletes words from the Dictionary.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "changeDictionary") {
            dictionaryArrayQueue = checkDictionary();
        }
    }
);

/**
 * Listener will be activated when user stops showing word cards.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "stopInterval") {
            clearInterval(intervalIdShowing);
            stopSign = true;
        }
    }
);

/**
 * Listener will be activated when user starts showing word cards.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "startInterval") {
            let switchState = JSON.parse(localStorage.getItem("switchState"));

            if (switchState) {
                stopSign = false;
                intervalIdShowing = setInterval(showWord, intervalTime);
            }
        }
    }
);

/**
 * Listener will be activated when user presses "Show Notification" in "options.js".
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "showNotification") {
            showNotification("Word", "Translation", settingsArray);
        }
    }
);

/**
 * Listener will be activated when user makes different kind of changes of settings.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "changeSettings") {
            settingsArray = checkSettings();
            selectedThemes = checkSelectedThemes();
            intervalTime = settingsArray.selectInterval * 1000 * 60 + settingsArray.selectDelay * 1000;
            if (!stopSign) {
                clearInterval(intervalIdShowing);
                intervalIdShowing = setInterval(showWord, intervalTime);
            }
        }
    }
);

/**
 * Listener will be activated when "content.js" sends message to make sure that word card
 * will be shown as native card and it may disable push notification showing.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "wordCardShown") {
            clearTimeout(timeoutIdNotification);
            increaseCurrentThemeNumber();
        }
    }
);

/**
 * Listener will be activated when "content.js" sends message to request translation.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "giveTranslation") {
            translate(settingsArray.translateFrom, settingsArray.translateInto, request.text, function (translation) {
                chrome.tabs.query({"active": true, "currentWindow": true},
                    function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: "translationCompleted",
                            result: translation
                        });
                    });
            });
        }
    }
);

/**
 * Listener will be activated when "content.js" sends message to add word.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
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

            if (dictionaryArray.length === 1) {
                chrome.runtime.sendMessage({type: "startInterval"});
            }

            localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
            localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));
            return false;
        }
    }
);

/**
 * Add entry to the context menu.
 */
chrome.contextMenus.create({
    title: function () {
        if (navigator.userAgent.indexOf("Mac") >= 0) {
            return "EachWord (Shift + Cmd + E)";
        } else {
            return "EachWord (Shift + Ctrl + E)";
        }
    }(),
    contexts: ["selection"],
    documentUrlPatterns: ["https://*/*", "http://*/*"],
    onclick: function (event) {
        chrome.tabs.query({"active": true, "currentWindow": true},
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "showWindow",
                    text: event.selectionText
                });
            });
    }
});