let disappearingStarted;
let drawingStarted;
let timeoutIdTimer;
let dictionaryArrayQueue;
let dictionaryArrayTab;

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

    if (auxiliaryDictionary.length === 0) {
        dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));
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
    let themeLink = document.getElementById("themeLink8730011");
    let timerStyle = document.getElementById("timerStyle8730011");
    let blurStyle = document.getElementById("blurStyle8730011");
    let closeStyle = document.getElementById("closeStyle8730011");
    let intervalIdDisappearing;

    disappearingStarted = true;

    if (blurStyle) {
        blurStyle.remove();
    }

    intervalIdDisappearing = setInterval(function () {
        const checkToTopOverflow = parseFloat(wordCard.style.top) - 1.5;

        if (checkToTopOverflow > -30) {
            wordCard.style.top = checkToTopOverflow + "%";
        } else {
            wordCard.remove();
            themeLink.remove();
            timerStyle.remove();

            if (closeStyle) {
                closeStyle.remove();
            }

            clearInterval(intervalIdDisappearing);
            disappearingStarted = false;
            drawingStarted = false;
        }
    }, 10);
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
 * @param {Object} theme name and color of theme
 * @param {Object} settingsArray array of the settings fetched from the "background.js"
 */
function appearing(word, translation, theme, settingsArray) {
    let selectDelay = settingsArray.selectDelay;
    let showClose = settingsArray.showClose;
    let wordCard;
    let themeLink;
    let timerStyle;
    let blurStyle;
    let closeButton;
    let commonLength;
    let words;
    let intervalIdAppearing;

    drawingStarted = true;
    wordCard = document.createElement("div");
    wordCard.id = "wordCard8730011";
    wordCard.style.top = "-30%";

    // Primary html-code of creating card.
    wordCard.innerHTML =
        "<div id=\"wordsWrapper8730011\">" +
            "<div id=\"words8730011\">" +
                "<div id=\"timer8730011\">" +
                    "<div class=\"backgroundCircle8730011\"></div>" +
                    "<div class=\"circlesWrapper8730011\" data-anim8730011=\"base wrapper\">" +
                        "<div class=\"circle8730011\" data-anim8730011=\"base left\"></div> " +
                        "<div class=\"circle8730011\" data-anim8730011=\"base right\"></div>" +
                    "</div>" +
                    "<a href=\"\" id=\"closeButton8730011\" title=\"Close this card\" tabindex=\"-1\"></a>" +
                "</div>" +
                "<div id=\"wordsContainer8730011\">" +
                    "<a href=\"\" title=\"Listen\" id=\"playButton8730011\" tabindex=\"-1\"></a>" +
                    "<span id=\"word8730011\">" + word + "</span>" +
                    "<span id=\"dash8730011\"> &mdash; </span>" +
                    "<span id=\"translation8730011\">" + translation + "</span>" +
                "</div>"
            "</div>" +
        "</div>";

    themeLink = document.createElement("link");
    themeLink.id = "themeLink8730011";
    themeLink.setAttribute("rel", "stylesheet");
    themeLink .setAttribute("href", "css/themes/" + theme.name);
    document.head.appendChild(themeLink);

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

    // Set delay for timer
    timerStyle = document.createElement("style");
    timerStyle.id = "timerStyle8730011";
    timerStyle.innerHTML =
        ".circlesWrapper8730011[data-anim8730011~=wrapper] { animation-delay: " + selectDelay/2 + "s; }" +
        ".circle8730011[data-anim8730011~=left] { animation-duration: " + selectDelay + "s; }" +
        ".circle8730011[data-anim8730011~=right] { animation-duration: " + selectDelay/2 + "s; }";
    document.head.appendChild(timerStyle);

    document.getElementById("playButton8730011").onclick = function() {
        playWord(word);
        return false;
    }

    intervalIdAppearing = setInterval(function () {
        let checkToTopOverflow;
        let tempDelay;

        checkToTopOverflow = parseFloat(wordCard.style.top) + 1.5;

        if (checkToTopOverflow >= 0) {
            wordCard.style.top = "0%";
            clearInterval(intervalIdAppearing);
            tempDelay = selectDelay - 1;
            timeoutIdTimer = setTimeout(function timerUpdate() {
                tempDelay--;

                if (tempDelay >= 0) {
                    timeoutIdTimer = setTimeout(timerUpdate, 1000);
                } else {
                    if (!disappearingStarted) {
                        disappearing();
                    }
                }
            }, 1000);
        } else {
            wordCard.style.top = checkToTopOverflow + "%";
        }
    }, 10);
}

/**
 * Start appearing of the word card and pass the parameters to the "appearing" function.
 *
 * @param {string} word
 * @param {string} translation
 * @param {Object} theme name and color of theme
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
 */
function playWord(word) {
    chrome.tts.speak(word, {"voiceName": "Google UK English Male"});
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
    let translationLink = "http://www.transltr.org/api/translate?text=" + encodeURI(text) + "&to="
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
    xhr.send();
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