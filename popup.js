// Warning: some variables defined in "commonFunction.js".
let dictionaryArray;
let messageTimeoutId;

/**
 * To save entered letters in "Word" field when user closes extension window and translate with delay.
 */
function fromLanguageSaveAndTranslate() {
    localStorage.setItem("fromLanguage", JSON.stringify(document.getElementById("fromLanguage").value));
    clearTimeout(fromLanguageSaveAndTranslate.timeoutId);

    fromLanguageSaveAndTranslate.timeoutId = setTimeout(function () {
        fromLanguageTranslate();
    }, 300);
}

/**
 * Translate "Word" and put translation into "Translation" field.
 */
function fromLanguageTranslate() {
    let textValue = document.getElementById("fromLanguage").value;
    let settingArray = JSON.parse(localStorage.getItem("settingsArray"));
    let $intoLanguage = $("#intoLanguage");

    if (textValue !== "") {
        translate(settingArray.translateFrom, settingArray.translateInto, textValue, function (translation) {
            fromLanguageSaveAndTranslate.isTranslated = translation.isTranslated;

            if (!translation.isTranslated) {
                $intoLanguage.val("");
                intoLanguageSave();
            } else {
                $intoLanguage.val(translation.translation);
                intoLanguageSave();
            }
        });
    } else {
        $intoLanguage.val("");
        intoLanguageSave();
    }
}

/**
 * To save entered letters in "Translation" field when user closes extension window.
 */
function intoLanguageSave() {
    localStorage.setItem("intoLanguage", JSON.stringify(document.getElementById("intoLanguage").value));
}

function searchInputSave() {
    localStorage.setItem("searchInput", JSON.stringify(document.getElementById("searchInput").value));
}

/**
 * If user turns on or turns off extension.
 *
 * @returns {boolean}
 */
function switchButtonChangeState() {
    let switchState = JSON.parse(localStorage.getItem("switchState"));
    let switchButton = document.getElementById("switchButton");

    if (switchState) {
        switchState = false;
        localStorage.setItem("switchState", JSON.stringify(switchState));

        // Change color icon to icon without color to indicate state of extension.
        chrome.browserAction.setIcon({path: "images/default_icons/icon38_(without_color).png"});

        if (JSON.parse(localStorage.getItem("dictionaryArray")).length !== 0) {
            chrome.runtime.sendMessage({type: "stopInterval"});
        }
    } else {
        switchState = true;
        localStorage.setItem("switchState", JSON.stringify(switchState));

        chrome.browserAction.setIcon({path: "images/default_icons/icon38.png"});

        if (JSON.parse(localStorage.getItem("dictionaryArray")).length !== 0) {
            chrome.runtime.sendMessage({type: "startInterval"});
        }
    }

    document.getElementById("fromLanguage").focus();

    return false;
}

/**
 * It checks if extension was updated in case of it is not first installed version.
 *
 * @returns {boolean}
 */
function isExtensionUpdated() {
    let versionArray = JSON.parse(localStorage.getItem("versionArray"));

    if (versionArray.length === 0) {
        versionArray.push(chrome.app.getDetails().version);
        localStorage.setItem("versionArray", JSON.stringify(versionArray));
    } else if (versionArray[versionArray.length - 1] !== chrome.app.getDetails().version) {
        return true;
    }

    return false;
}

/**
 * Add word to the words list.
 *
 * @param {string} word
 * @param {string} translation
 */
function addWordToList(word, translation) {
    let li;
    let wordsBlock = document.getElementById("wordsBlock");

    li = document.createElement("li");
    li.innerHTML = "<a href='' class='playButton' tabindex='-1'></a>" +
        "<input type='text' value='" + word + "'/>" +
        "<input type='text' value='" + translation + "'/>" +
        "<a href='' class='deleteButton' tabindex='-1'></a>";
    wordsBlock.insertBefore(li, wordsBlock.firstChild);

    return li;
}

/**
 * Delete edded word from the dictionary.
 *
 * @returns {boolean}
 */
function deleteAddedWord() {
    let $li = $("#wordsBlock").children("li")[0];
    let index = dictionaryArray.length - 1;
    let indexInQueue;

    $li.remove();
    dictionaryArrayQueue = JSON.parse(localStorage.getItem("dictionaryArrayQueue"));
    indexInQueue = dictionaryArrayQueue.indexOfObject(dictionaryArray.splice(index, 1)[0]);

    if (indexInQueue !== -1) {
        dictionaryArrayQueue.splice(indexInQueue, 1);
    }

    if (dictionaryArray.length === 0) {
        chrome.runtime.sendMessage({type: "stopInterval"});
    }

    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));

    document.getElementById("fromLanguage").focus();
    chrome.runtime.sendMessage({type: "changeDictionary"});
    return false;
}

/**
 * Delete word from the dictionary.
 *
 * @returns {boolean}
 */
function deleteWord() {
    let $li = $(this).parent();
    let index = $li.parent().children().length - $li.index() - 1;
    let indexInQueue;

    $li.remove();

    dictionaryArrayQueue = JSON.parse(localStorage.getItem("dictionaryArrayQueue"));
    indexInQueue = dictionaryArrayQueue.indexOfObject(dictionaryArray.splice(index, 1)[0]);

    if (indexInQueue !== -1) {
        dictionaryArrayQueue.splice(indexInQueue, 1);
    }

    if (dictionaryArray.length === 0) {
        chrome.runtime.sendMessage({type: "stopInterval"});
    }

    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));

    document.getElementById("fromLanguage").focus();
    chrome.runtime.sendMessage({type: "changeDictionary"});
    return false;
}

/**
 * Add word to the dictionary.
 *
 * @returns {boolean}
 */
function addWord() {
    let fromLanguage = document.getElementById("fromLanguage");
    let intoLanguage = document.getElementById("intoLanguage");
    let word = fromLanguage.value;
    let translation = intoLanguage.value;
    let dictionaryArrayQueue;
    let $addedWord;

    word = word.trim();
    translation = translation.trim();

    if (!word) {
        fromLanguage.focus();
        return false;
    }

    if (!translation) {
        intoLanguage.focus();
        return false;
    }

    word = word[0].toUpperCase() + word.slice(1);
    translation = translation[0].toUpperCase() + translation.slice(1);
    fromLanguage.value = null;
    intoLanguage.value = null;
    dictionaryArrayQueue = JSON.parse(localStorage.getItem("dictionaryArrayQueue"));
    dictionaryArray.push({word: word, translation: translation, showCount: 0});
    dictionaryArrayQueue.push({word: word, translation: translation, showCount: 0});

    if (dictionaryArray.length === 1) {
        chrome.runtime.sendMessage({type: "startInterval"});
    }

    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));
    $addedWord = $(addWordToList(word, translation));
    $addedWord.find(".playButton").click(function () {
        playWord($(this).parent().children("input").eq(0).val(), "en");

        return false;
    });
    $addedWord.find(".deleteButton").click(deleteWord).on("mouseover", function () {
        $(this).parent().addClass("deleteStyle");
    }).on("mouseout", function () {
        $(this).parent().removeClass("deleteStyle");
    });
    localStorage.setItem("fromLanguage", JSON.stringify(""));
    localStorage.setItem("intoLanguage", JSON.stringify(""));
    document.getElementById("fromLanguage").focus();
    chrome.runtime.sendMessage({type: "changeDictionary"});
    showSuccess(word);

    if (messageTimeoutId) {
        clearTimeout(messageTimeoutId);
    }

    messageTimeoutId = setTimeout(closeSuccess, 4000);

    return false;
}

/**
 * Show success of adding a word card message.
 */
function showSuccess(text) {
    $("#addedWord").html(text);
    $("#wordBlock").find(".addWrapper").addClass("success");
}

/**
 * Close success of adding a word card message.
 */
function closeSuccess() {
    $("#wordBlock").find(".addWrapper").removeClass("success");
}

/**
 * Hide words before performing actions.
 */
function hideWords() {
    /**
     * @type {JQuery}
     */
    $("#wordsBlock").find("li").each(function () {
        if (!$(this).hasClass("hidden")) {
            $(this).addClass("hidden");
        }
    });
}

/**
 * Show all words.
 */
function showAllWords() {
    /**
     * @type {JQuery}
     */
    $("#wordsBlock").find("li").each(function () {
        if ($(this).hasClass("hidden")) {
            $(this).removeClass("hidden");
        }
    });
}

/**
 * Show word by index in words list.
 */
function showWord(index) {
    /**
     * @type {JQuery}
     */
    $("#wordsBlock").find("li").eq(index).removeClass("hidden");
}

/**
 * Complete character from regular expression with double slash.
 */
function escapeRegularExpression(text) {
    return text.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

/**
 * Filter words in dictionary and display them.
 */
function findWords() {
    let searchValue = $("#searchInput").val().toString().trim();
    let regExp = new RegExp(escapeRegularExpression(searchValue), "ig");
    let word;
    let translation;
    let result;

    hideWords();

    // Display found words.
    if (searchValue.length !== 0) {
        for (let i = 0; i < dictionaryArray.length; i++) {
            let found = false;
            word = dictionaryArray[i].word;
            translation = dictionaryArray[i].translation;

            if ((result = regExp.exec(word)) !== null || (result = regExp.exec(translation)) !== null) {
                found = true;
            }

            if (found) {
                showWord(dictionaryArray.length - i - 1);
            }
        }
    } else {
        showAllWords();
    }
}

/**
 * Change word in the dictionary.
 *
 * @returns {boolean}
 */
function changeWord() {
    let value = $(this).val().toString().trim();
    let index = dictionaryArray.length - $(this).parent().index() - 1;
    let indexInQueue;

    dictionaryArrayQueue = JSON.parse(localStorage.getItem("dictionaryArrayQueue"));
    indexInQueue = dictionaryArrayQueue.indexOfObject(dictionaryArray[index]);
    dictionaryArray[index].word = value;
    dictionaryArrayQueue[indexInQueue].word = value;
    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));
    chrome.runtime.sendMessage({type: "changeDictionary"});

    return false;
}

/**
 * Change translation in the dictionary.
 *
 * @returns {boolean}
 */
function changeTranslation() {
    let value = $(this).val().toString().trim();
    let index = dictionaryArray.length - $(this).parent().index() - 1;
    let indexInQueue;

    dictionaryArrayQueue = JSON.parse(localStorage.getItem("dictionaryArrayQueue"));
    indexInQueue = dictionaryArrayQueue.indexOfObject(dictionaryArray[index]);
    dictionaryArray[index].translation = value;
    dictionaryArrayQueue[indexInQueue].translation = value;
    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));
    chrome.runtime.sendMessage({type: "changeDictionary"});

    return false;
}

/**
 * Press "enter" to add card to the dictionary.
 *
 * @param {object} event
 */
function keyForAddition(event) {
    let word;
    let translation;

    if (event.keyCode === 13) {
        word = document.getElementById("fromLanguage").value;
        translation = document.getElementById("intoLanguage").value;
        word = word.trim();
        translation = translation.trim();

        if (!word) {
            document.getElementById("fromLanguage").focus();
            return;
        }

        if (!translation) {
            document.getElementById("intoLanguage").focus();
            return;
        }

        addWord();
    }
}

/**
 * Change value in inputs.
 */
function changeValue(event) {
    event.target.setAttribute("value", event.target.value);
}

/**
 * Fill in extension window.
 */
window.onload = function () {
    let addButton = document.getElementById("addButton");
    let switchButton = document.getElementById("switchButton");
    let fromLanguage = document.getElementById("fromLanguage");
    let intoLanguage = document.getElementById("intoLanguage");
    let searchInput = document.getElementById("searchInput");
    let $wordsBlock = $("#wordsBlock");
    let versionArray;

    $("#menuButton").click(function () {
        if ($(this).hasClass("openMenu")) {
            $(this).removeClass("openMenu");
            $(this).addClass("closeMenu");
            $("body>.hidden").removeClass("hidden");
        } else {
            $(this).removeClass("closeMenu");
            $(this).addClass("openMenu");
            $("body>:not(#wordBlock)").addClass("hidden");
        }
        return false;
    });
    $("#wordBlock").find(".addWrapper").on("mouseover", function () {
        if (messageTimeoutId) {
            clearTimeout(messageTimeoutId);
        }
    }).on("mouseout", function () {
        if (messageTimeoutId) {
            clearTimeout(messageTimeoutId);
        }
        messageTimeoutId = setTimeout(closeSuccess, 3000);
    });
    $("#deleteButton").on("mouseover", function () {
        $(this).parent().addClass("delete");
    }).on("mouseout", function () {
        $(this).parent().removeClass("delete");
    }).on("click", function () {
        deleteAddedWord();
        if (messageTimeoutId) {
            clearTimeout(messageTimeoutId);
        }
        closeSuccess();

        return false;
    });
    $("#playButton").click(function () {
        playWord($(this).parent().children("input").eq(0).val(), "en");

        return false;
    });

    fromLanguage.onkeypress = keyForAddition;
    intoLanguage.onkeypress = keyForAddition;
    fromLanguage.onchange = changeValue;
    intoLanguage.onchange = changeValue;

    searchInput.addEventListener("search", findWords);
    searchInput.addEventListener("search", changeValue);
    searchInput.addEventListener("change", changeValue);
    searchInput.addEventListener("keyup", changeValue);
    searchInput.addEventListener("keyup", findWords);

    // State of extension: "Turn on" or "Turn off".
    switchButton.onchange = switchButtonChangeState;
    addButton.onclick = addWord;

    // Save entered letters in fields when extension closes.
    fromLanguage.oninput = fromLanguageSaveAndTranslate;
    intoLanguage.oninput = intoLanguageSave;
    searchInput.oninput = searchInputSave;

    // Load saved letters from localStorage into fields.
    fromLanguage.value = JSON.parse(localStorage.getItem("fromLanguage"));
    intoLanguage.value = JSON.parse(localStorage.getItem("intoLanguage"));
    searchInput.value = JSON.parse(localStorage.getItem("searchInput"));
    switchButton.checked = JSON.parse(localStorage.getItem("switchState"));

    // Array of words in localStorage.
    dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));

    // Fill in words, translation and "deleteButton" into "iframe".
    for (let i = 0; i < dictionaryArray.length; i++) {
        let word;
        let translation;

        word = dictionaryArray[i].word;
        translation = dictionaryArray[i].translation;
        addWordToList(word, translation);
    }
    $wordsBlock.find(".playButton").click(function () {
        playWord($(this).parent().children("input").eq(0).val(), "en");

        return false;
    });
    $wordsBlock.find(".deleteButton").click(deleteWord).on("mouseover", function () {
        $(this).parent().addClass("deleteStyle");
    }).on("mouseout", function () {
        $(this).parent().removeClass("deleteStyle");
    });

    $wordsBlock.find("input").each(function () {
        if ($(this).index() % 2 === 1) {
            $(this).blur(changeWord).keypress(function (e) {
                if (e.keyCode === 13) {
                    changeWord();
                }
            });
        } else {
            $(this).blur(changeTranslation).keypress(function (e) {
                if (e.keyCode === 13) {
                    changeTranslation();
                }
            });
        }
    });

    if (searchInput.value) {
        findWords();
    }

    $("#backToTop").click(function () {
        $("#wordsBlock").animate({scrollTop: 0}, 1000);
        return false;
    });

    if (isExtensionUpdated()) {
        versionArray = JSON.parse(localStorage.getItem("versionArray"));
        versionArray.push(chrome.app.getDetails().version);
        localStorage.setItem("versionArray", JSON.stringify(versionArray));
    }

    document.getElementById("fromLanguage").focus();
};