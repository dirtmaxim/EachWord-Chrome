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
    let showBeforeDeletion = JSON.parse(localStorage.getItem("settingsArray")).showBeforeDeletion;
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
                localStorage.setItem(localStorageLastWord, JSON.stringify(lastWord));
                localStorage.setItem(localStorageKey, JSON.stringify(auxiliaryDictionary));
                return lastWord;
            }

            lastWord = auxiliaryDictionary.splice(randomNumber - 1, 1)[0];
            if (lastWord.showCount) {
                lastWord.showCount++;
            } else {
                lastWord.showCount = 1;
            }
            if (showBeforeDeletion > 0 && lastWord.showCount >= showBeforeDeletion) {
                dictionaryArray.splice(dictionaryArray.indexOfObject(lastWord), 1);
            } else {
                let index = dictionaryArray.indexOfObject(lastWord);
                if (index) {
                    dictionaryArray[index] = lastWord;
                }
            }
            localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
            localStorage.setItem(localStorageLastWord, JSON.stringify(lastWord));
            localStorage.setItem(localStorageKey, JSON.stringify(auxiliaryDictionary));
            return lastWord;
        }
    }

    lastWord = auxiliaryDictionary.splice(randomNumber, 1)[0];
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
    let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
        + from + "&tl=" + into + "&dt=t&q=" + encodeURI(text);

    let result = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    after(result);
    /* let translationLink = "http://www.transltr.org/api/translate?text=" + encodeURI(text) + "&to="
     + into + "&from=" + from;
     let xhr = new XMLHttpRequest();

     xhr.open("GET", translationLink, true);
     xhr.onload = function () {
     let translation;

     text = text.trim();

     if (text !== "") {
     translation = JSON.parse(xhr.responseText);
     after({
     translation: translation.translationText,
     isTranslated: translation.translationText.toLowerCase() !== text.toLowerCase()
     });
     } else {
     after({
     translation: "",
     isTranslated: true
     });
     }

     };
     xhr.send();*/
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