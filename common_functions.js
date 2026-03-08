if (typeof window !== "undefined" &&
    window.location &&
    window.location.protocol === "chrome-extension:" &&
    typeof chrome !== "undefined" &&
    chrome.storage &&
    chrome.storage.local &&
    typeof Storage !== "undefined" &&
    !Storage.prototype.eachWordStorageMirrorApplied) {
    let originalSetItem = Storage.prototype.setItem;
    let originalRemoveItem = Storage.prototype.removeItem;
    let originalClear = Storage.prototype.clear;

    Storage.prototype.setItem = function (key, value) {
        originalSetItem.call(this, key, value);
        chrome.storage.local.set({[key]: String(value)});
    };

    Storage.prototype.removeItem = function (key) {
        originalRemoveItem.call(this, key);
        chrome.storage.local.remove(key);
    };

    Storage.prototype.clear = function () {
        originalClear.call(this);
        chrome.storage.local.clear();
    };

    Storage.prototype.eachWordStorageMirrorApplied = true;


}
function ensureExtensionStorageDefaults() {
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

    themesLengthAfterUpdate = storeDefaultThemes();

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

function buildDefaultThemes() {
    let themes = [];

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

    return themes;
}

function storeDefaultThemes() {
    let themes = buildDefaultThemes();

    localStorage.setItem("themes", JSON.stringify(themes));
    return themes.length;
}
function hydrateExtensionPageStorage(after) {
    if (!(typeof window !== "undefined" &&
        window.location &&
        window.location.protocol === "chrome-extension:" &&
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local)) {
        ensureExtensionStorageDefaults();
        after();
        return;
    }

    chrome.storage.local.get(null, function (items) {
        let keys = Object.keys(items);

        if (keys.length > 0) {
            keys.forEach(function (key) {
                localStorage.setItem(key, items[key]);
            });
        } else if (localStorage.length > 0) {
            let snapshot = {};

            for (let i = 0; i < localStorage.length; i++) {
                let storageKey = localStorage.key(i);
                snapshot[storageKey] = localStorage.getItem(storageKey);
            }

            chrome.storage.local.set(snapshot);
        }

        ensureExtensionStorageDefaults();
        after();
    });
}
let disappearingStarted;
let drawingStarted;
let timeoutIdTimer;
let dictionaryArrayQueue;
let dictionaryArrayTab;
let wordCardDelay = 1000;

// Works as semaphore for "disappearing()".
disappearingStarted = false;

// Works as semaphore for "drawCard()".
drawingStarted = false;

/**
 *  Special algorithm which shows word cards without reps alike cards and does it with equal probability.
 *
 * @param {Object[]} auxiliaryDictionary
 * @param {string} localStorageKey
 * @param {string} localStorageLastWord
 * @returns {Object} Last word
 */
function chooseWord(auxiliaryDictionary, localStorageKey, localStorageLastWord) {
    let flag = false;
    let lastWord = JSON.parse(localStorage.getItem(localStorageLastWord));
    let dictionaryArray;
    let randomNumber;
    dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));

    if (auxiliaryDictionary.length === 0) {
        auxiliaryDictionary = dictionaryArray;
        localStorage.setItem(localStorageKey, JSON.stringify(auxiliaryDictionary));
        flag = true;
    }

    if (auxiliaryDictionary.length === 1) {
        // Save last word into the last position of auxiliary array.
        lastWord = auxiliaryDictionary.splice(0, 1)[0];
        delete lastWord.displays;
        localStorage.setItem(localStorageLastWord, JSON.stringify(lastWord));
        localStorage.setItem(localStorageKey, JSON.stringify(auxiliaryDictionary));
        return lastWord;
    }

    randomNumber = Math.floor(Math.random() * auxiliaryDictionary.length);

    if (flag && lastWord) {
        if (auxiliaryDictionary[randomNumber].word === lastWord.word &&
            auxiliaryDictionary[randomNumber].translation === lastWord.translation) {
            if (randomNumber === 0) {
                lastWord = auxiliaryDictionary.splice(randomNumber + 1, 1)[0];
                delete lastWord.displays;
                localStorage.setItem(localStorageLastWord, JSON.stringify(lastWord));
                localStorage.setItem(localStorageKey, JSON.stringify(auxiliaryDictionary));
                return lastWord;
            }

            lastWord = auxiliaryDictionary.splice(randomNumber - 1, 1)[0];
            delete lastWord.displays;
            localStorage.setItem(localStorageLastWord, JSON.stringify(lastWord));
            localStorage.setItem(localStorageKey, JSON.stringify(auxiliaryDictionary));
            return lastWord;
        }
    }

    lastWord = auxiliaryDictionary.splice(randomNumber, 1)[0];
    delete lastWord.displays;
    localStorage.setItem(localStorageLastWord, JSON.stringify(lastWord));
    localStorage.setItem(localStorageKey, JSON.stringify(auxiliaryDictionary));
    return lastWord;
}

/**
 * It chooses color scheme to put it into web page when word card is showed.
 *
 * @returns {null|string} Based on html theme.
 */
function chooseTheme() {
    let themes = JSON.parse(localStorage.getItem("themes"));
    let selectedThemes = JSON.parse(localStorage.getItem("selectedThemes"));
    let currentThemeNumber = JSON.parse(localStorage.getItem("currentThemeNumber"));

    if (!selectedThemes || !themes) {
        return null;
    }

    return themes[selectedThemes[currentThemeNumber]];
}

/**
 * Hide a word card from the web page.
 */
function disappearing() {
    let wordCard = document.getElementById("wordCard8730011");
    let blurStyle = document.getElementById("blurStyle8730011");

    disappearingStarted = true;

    if (blurStyle) {
        blurStyle.remove();
    }

    wordCard.style.transform = null;
    setTimeout(function () {
        let themeStyle = document.getElementById("themeStyle8730011");
        let fontStyle = document.getElementById("fontStyle8730011");
        let closeStyle = document.getElementById("closeStyle8730011");
        wordCard.remove();
        themeStyle.remove();
        fontStyle.remove();

        if (closeStyle) {
            closeStyle.remove();
        }

        disappearingStarted = false;
        drawingStarted = false;
    }, wordCardDelay);
}

/**
 * Action that executes when close button on the word card is pressed.
 *
 * @param {Object} event
 */
function closeButtonAction(event) {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(timeoutIdTimer);

    if (!disappearingStarted) {
        disappearing();
    }
}

/**
 * Increment "currentThemeNumber" after word card is showed.
 */
function increaseCurrentThemeNumber() {
    let currentThemeNumber = JSON.parse(localStorage.getItem("currentThemeNumber"));
    let selectedThemes = JSON.parse(localStorage.getItem("selectedThemes"));

    if (currentThemeNumber < selectedThemes.length - 1) {
        currentThemeNumber++;
    } else {
        currentThemeNumber = 0;
    }

    localStorage.setItem("currentThemeNumber", JSON.stringify(currentThemeNumber));
}

/**
 * Show a word card on the web page.
 *
 * @param {string} word
 * @param {string} translation
 * @param {string} theme Based on html theme
 * @param {Object} settingsArray array of the settings fetched from the "background.js"
 */
function appearing(word, translation, theme, settingsArray) {
    let selectDelay = settingsArray.selectDelay;
    let showClose = settingsArray.showClose;
    let wordCard;
    let themeStyle;
    let fontStyle;
    let blurStyle;
    let closeButton;
    let commonLength;
    let words;

    drawingStarted = true;
    wordCard = document.createElement("div");
    wordCard.id = "wordCard8730011";

    // Primary html-code of creating card.
    fontStyle = document.createElement("style");
    fontStyle.id = "fontStyle8730011";
    fontStyle.innerHTML =
        "@font-face{font-family:\"RobotoRegular\";" +
        "src:url(" + chrome.runtime.getURL("fonts/RobotoRegular/RobotoRegular.eot") + ");" +
        "src:url(" + chrome.runtime.getURL("fonts/RobotoRegular/RobotoRegular.eot?#iefix") + ")format(\"embedded-opentype\")," +
        "url(" + chrome.runtime.getURL("fonts/RobotoRegular/RobotoRegular.woff") + ")format(\"woff\")," +
        "url(" + chrome.runtime.getURL("fonts/RobotoRegular/RobotoRegular.ttf") + ")format(\"truetype\");" +
        "font-style:normal;" +
        "font-weight:normal;}" +
        "@font-face{font-family:\"RobotoRegular\";" +
        "src:url(" + chrome.runtime.getURL("fonts/RobotoLight/RobotoLight.eot") + ");" +
        "src:url(" + chrome.runtime.getURL("fonts/RobotoLight/RobotoLight.eot?#iefix") + ")format(\"embedded-opentype\")," +
        "url(" + chrome.runtime.getURL("fonts/RobotoLight/RobotoLight.woff") + ")format(\"woff\")," +
        "url(" + chrome.runtime.getURL("fonts/RobotoLight/RobotoLight.ttf") + ")format(\"truetype\");" +
        "font-style:normal;" +
        "font-weight:200;}" +
        "}";
    document.head.appendChild(fontStyle);

    themeStyle = document.createElement("style");
    themeStyle.id = "themeStyle8730011";
    themeStyle.innerHTML = theme;
    document.head.appendChild(themeStyle);

    wordCard.innerHTML =
        "<div id=\"wordsWrapper8730011\">" +
        "<div id=\"words8730011\">" +
        "<figure id=\"timer8730011\">" +
        "<svg>" +
        "<circle class='background_circle8730011' cx='50%' cy='50%' r='calc(50% - 2px)'/>" +
        "<circle class='outer8730011' cx='50%' cy='50%' r='calc(50% - 2px)' style='animation-duration: " + selectDelay + "s'/>" +
        "</svg>" +
        "<a href='' id='closeButton8730011' tabindex='-1'></a>" +
        "</figure>" +
        "<div id='wordsContainer8730011'>" +
        "<a href='' id='playButton8730011' tabindex='-1'></a>" +
        "<span id='word8730011'>" + word + "</span>" +
        "<span id='dash8730011'> &mdash; </span>" +
        "<span id='translation8730011'>" + translation + "</span>" +
        "</div>" +
        "</div>" +
        "</div>";

    if (settingsArray.showBlur) {
        blurStyle = document.createElement("style");
        blurStyle.id = "blurStyle8730011";
        blurStyle.innerHTML = "body{-webkit-filter:blur(10px);}";
        document.head.appendChild(blurStyle);
    }

    document.documentElement.insertBefore(wordCard, document.documentElement.firstChild);
    closeButton = document.getElementById("closeButton8730011");

    // If user enabled "Show close button" in options.
    if (showClose) {
        closeButton.onclick = closeButtonAction;
    } else {
        closeButton.remove();
    }

    commonLength = word.length + translation.length;
    words = document.getElementById("words8730011");

    // Pick up font size depending word and translation size.
    if (commonLength < 25) {
        words.style.fontSize = "100%";
    } else if (commonLength < 30) {
        words.style.fontSize = "90%";
    } else if (commonLength < 35) {
        words.style.fontSize = "80%";
    } else if (commonLength < 40) {
        words.style.fontSize = "70%";
    } else if (commonLength < 45) {
        words.style.fontSize = "60%";
    } else if (commonLength < 55) {
        words.style.fontSize = "50%";
    } else if (commonLength < 65) {
        words.style.fontSize = "40%";
    } else {
        words.style.fontSize = "30%";
    }

    document.getElementById("playButton8730011").onclick = function () {
        chrome.runtime.sendMessage({type: "playWord", word: word, language: settingsArray.translateFrom});
        return false;
    };


    setTimeout(function () {
        wordCard.style.transform = "translateY(0%)";
    }, 10);

    timeoutIdTimer = setTimeout(function () {
        if (!disappearingStarted) {
            disappearing();
        }
    }, selectDelay * 1000);
}

/**
 * Start appearing of the word card and pass the parameters to the "appearing" function.
 *
 * @param {string} word
 * @param {string} translation
 * @param {string} theme Based on html theme
 * @param {Object} settingsArray array of the settings fetched from the "background.js"
 */
function drawCard(word, translation, theme, settingsArray) {
    if (!drawingStarted) {
        appearing(word, translation, theme, settingsArray);
    }
}

/**
 * Function that transfer text to speech.
 *
 * @param {string} word Word to transfer
 * @param {string} language Language to transfer
 */
function playWord(word, language) {
    if (typeof chrome !== "undefined" && chrome.tts) {
        chrome.tts.stop();
        chrome.tts.speak(word, {lang: language, rate: 1.0});
        return;
    }

    //noinspection JSUnresolvedFunction
    let audio = new Audio("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" +
        language + "&q=" + encodeURIComponent(word));
    audio.play();
}

/**
 * Translate word from one language to another.
 *
 * @param {string} from
 * @param {string} into
 * @param {string} text Word to translate
 * @param {function} after Function that will be executed after translation is fetched
 */
function translate(from, into, text, after) {
    // text.toLowerCase() gives more variants of result in some cases.
    let googleTranslator = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&hl=" +
        encodeURIComponent(from) + "&sl=" + encodeURIComponent(from) + "&tl=" +
        encodeURIComponent(into) + "&q=" + encodeURIComponent(text.toLowerCase());

    function handleResponse(responseText) {
        let result;
        let translation = "";
        let alternative;
        let alternatives = [];
        let normalizedText = text.trim();

        if (normalizedText !== "") {
            result = JSON.parse(responseText);
            translation = result[0][0][0];
            translation = translation.charAt(0).toUpperCase() + translation.slice(1);

            // Save alternatives for future functionality.
            if (result[1] != null) {
                for (let i = 0; i < result[1].length; i++) {
                    alternative = {};

                    // Capitalize first letter in each alternative word.
                    result[1][i][1].forEach(function (part, index, array) {
                        array[index] = array[index].charAt(0).toUpperCase() + array[index].slice(1);
                    });
                    alternative[result[1][i][0]] = result[1][i][1];
                    alternatives.push(alternative);
                }
            }
        }

        after({
            translation: translation,
            alternatives: normalizedText !== "" ? alternatives : null,
            isTranslated: normalizedText === "" || translation.toLowerCase() !== normalizedText.toLowerCase()
        });
    }

    if (typeof XMLHttpRequest !== "undefined") {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                handleResponse(xhr.responseText);
            }
        };
        xhr.open("GET", googleTranslator, true);
        xhr.send();
        return;
    }

    fetch(googleTranslator)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Translation request failed");
            }

            return response.text();
        })
        .then(handleResponse);
}
/**
 * End functions from "content.js".
 *
 * @param {Object} object
 * @returns {number}
 */
Array.prototype.indexOfObject = function (object) {
    let flag;
    let key;

    for (let i = 0; i < this.length; i++) {
        flag = true;

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                if (this[i][key] !== object[key]) {
                    flag = false;
                    break;
                }
            }
        }

        if (flag) {
            return i;
        }
    }

    return -1;
};



