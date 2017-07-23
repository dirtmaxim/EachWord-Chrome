// Warning: some variables defined in "commonFunction.js".
let settingsArray;
let selectedThemes;
let intervalIdShowing;
let timeoutIdNotification;
let intervalTime;
let stopSign;
let isMac = navigator.userAgent.indexOf("Mac") >= 0;

// Chrome version in format: [59, 0, 3071, 115]. From major to minor.
let chromeVersion = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s/)[2].split(".").map(Number);

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
    let _notificationId;
    let progressCounter;
    let intervalIdNotification;
    let typeFlag = isMac && chromeVersion[0] >= 59;

    if (typeFlag) {
        options = {
            type: "basic",
            title: "EachWord",
            message: word + " — " + translation,
            iconUrl: "images/icons/icon128.png",
            requireInteraction: true,
            priority: 2
        };
    } else {
        options = {
            type: "progress",
            title: "EachWord",
            message: word + " — " + translation,
            iconUrl: "images/icons/iconNotification128.png",
            requireInteraction: true,
            priority: 2,
            progress: 0,
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

    chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
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
                chrome.tabs.sendMessage(tabs[0].id, {
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
        if (word.showCount) {
            word.showCount++;
        } else {
            word.showCount = 1;
        }
        if (settingsArray.displaysBeforeDeletion > 0 && word.showCount >= settingsArray.displaysBeforeDeletion) {
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
    themes[0] =
        "#wordCard8730011{background-color:#fff;color:#334d5e;}" +
        "#wordsWrapper8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/white_face.png") + ");}" +
        "#words8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/white_verbal_bubble.png") + ");border-color:rgba(161,173,179,0.2);}" +
        "#timer8730011 .background_circle8730011{fill:#fff;stroke:#cfdee6;}" +
        "#timer8730011 .outer8730011{stroke:#00bef3;}" +
        "#closeButton8730011:after{color:#334d5e;}" +
        "#closeButton8730011:hover:after{color:#00bef3;}" +
        "#playButton8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/voice_white.png") + ");}" +
        "#playButton8730011:hover{background-image:url(" + chrome.runtime.getURL("images/word_card/voice_white_hover.png") + ");}";
    themes[1] =
        "#wordCard8730011{background-color:#00bef3;color:#fff;}" +
        "#wordsWrapper8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/white_face.png") + ");}" +
        "#words8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/blue_verbal_bubble.png") + ");border-color:rgba(248,250,254,0.4);}" +
        "#timer8730011 .background_circle8730011{fill:#00bef3;stroke:#fff;}" +
        "#timer8730011 .outer8730011{stroke:#0677a0;}" +
        "#closeButton8730011:after{color:#fff;}" +
        "#closeButton8730011:hover:after{color:#0677a0;}" +
        "#playButton8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/voice_blue.png") + ");}" +
        "#playButton8730011:hover{background-image:url(" + chrome.runtime.getURL("images/word_card/voice_blue_hover.png") + ");}";
    themes[2] =
        "#wordCard8730011{background-color:#043d52;color:#fff;}" +
        "#wordsWrapper8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/dark_face.png") + ");}" +
        "#words8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/dark_verbal_bubble.png") + ");border-color:rgba(0,190,243,0.2);}" +
        "#timer8730011 .background_circle8730011{fill:#043d52;stroke:#cfdee6;}" +
        "#timer8730011 .outer8730011{stroke:#00bef3;}" +
        "#closeButton8730011:after{color:#f8fafe;}" +
        "#closeButton8730011:hover:after{color:#00bef3;}" +
        "#playButton8730011{background-image:url(" + chrome.runtime.getURL("images/word_card/voice_dark.png") + ");}" +
        "#playButton8730011:hover{background-image:url(" + chrome.runtime.getURL("images/word_card/voice_dark_hover.png") + ");}";
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
    let displaysBeforeDeletion = localStorage.getItem("displaysBeforeDeletion");
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
        settingsArray.displaysBeforeDeletion = 0;
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
 * Listener will be activated when user presses "Play word".
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "playWord") {
            playWord(request.word, request.language);
        }
    }
);

/**
 * Add entry to the context menu.
 */
chrome.contextMenus.create({
    title: function () {
        if (isMac) {
            return "EachWord (Cmd + Shift + E)";
        } else {
            return "EachWord (Ctrl + Shift + E)";
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
            }
        );
    }
});