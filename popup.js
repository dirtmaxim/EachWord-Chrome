// Warning, some variables defined in "commonFunction.js".
let isSearchActivated = false;
let notFoundMessage;
let nothingToShowMessage;
let welcomeMessage;
let updateMessage;
let isCrucialUpdate;
let dictionaryArray;

// It affects either updateMessage will be shown or not.
isCrucialUpdate = true;

// Text message initialisation.
notFoundMessage = "We haven't found such words <img src=\"images/smiles/confused.svg\" width=\"18\"><br>Have you added them?<br>";
nothingToShowMessage = "We have nothing to show you <img src=\"images/smiles/confused.svg\" width=\"18\"><br>First of all, add some words.";
welcomeMessage = "Welcome to the EachWord <img src=\"images/smiles/sunglasses.svg\" width=\"18\"><br><br>For a start, add couple words that you want to learn and go on surfing the internet.<br><br>These words will be periodically shown to you. So you will learn them.<br><br>Check out options page.";
updateMessage = "Really? I can't believe <img src=\"images/smiles/neutral_face.svg\" width=\"18\"><br>It's a new version of EachWord!<br>New features:<br>- Import and Export<br>- Design improved<br>- New card colors<br>If you like EachWord, please, share it on social networks using buttons above. It would really help us since we have no money for promotion.";

function fromLanguageSave() {
    localStorage.setItem("fromLanguage", JSON.stringify(document.getElementById("fromLanguage").value));
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
        switchButton.innerHTML = "Turn on";
        switchButton.title = "Turn on push cards";
        switchButton.classList.remove("colorFirst");
        switchButton.classList.add("colorSecond");

        // Change color icon to icon without color to indicate state of extension.
        chrome.browserAction.setIcon({path: "images/default_icons/icon38_(without_color).png"});

        if (JSON.parse(localStorage.getItem("dictionaryArray")).length !== 0) {
            chrome.runtime.sendMessage({type: "stopInterval"});
        }
    } else {
        switchState = true;
        localStorage.setItem("switchState", JSON.stringify(switchState));
        switchButton.innerHTML = "Turn off";
        switchButton.title = "Turn off push cards";
        switchButton.classList.remove("colorSecond");
        switchButton.classList.add("colorFirst");
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
        localStorage.setItem("welcomeIsShown", JSON.stringify(true));
        versionArray.push(chrome.app.getDetails().version);
        localStorage.setItem("versionArray", JSON.stringify(versionArray));
    } else if (versionArray[versionArray.length - 1] !== chrome.app.getDetails().version) {
        return true;
    }

    return false;
}

/**
 * It checks cases to show different type of messages.
 */
function checkCasesToShowMessage() {
    if (JSON.parse(localStorage.getItem("welcomeIsShown"))) {
        showButtonWindow(welcomeMessage, "Got it", "left", "80%", "80%", "10", function () {
            localStorage.setItem("welcomeIsShown", JSON.stringify(false));

            if (isSearchActivated && showHideSearch.toggleFlag) {
                findWords();
            } else if (dictionaryArray.length === 0) {
                showSimpleWindow(nothingToShowMessage, "center", "80%", "25%", "1");
            }
        });
    } else if (dictionaryArray.length === 0) {
        showSimpleWindow(nothingToShowMessage, "center", "80%", "25%", "1");
    }
}

/**
 * Function to play word when user clicks to speaker.
 *
 * @returns {boolean}
 */
function playWord() {
    let settingsArray = JSON.parse(localStorage.getItem("settingsArray"));
    let tr = this.parentNode.parentNode;
    let trNodesArray = tr.parentNode.children;

    for (let i = 1; i < trNodesArray.length; i++) {
        if (this === trNodesArray[i].children[1].children[0]) {
            chrome.tts.speak($(trNodesArray[i].children[0]).text(), {"voiceName": "Google UK English Male"});
            break;
        }
    }

    return false;
}

/**
 * Add word to the table.
 *
 * @param {string} word
 * @param {string} translation
 * @param {string} index
 */
function addWordToList(word, translation, index) {
    let tr;
    let td;
    let a;

    tr = document.createElement("tr");
    td = document.createElement("td");
    td.className = "firstColumn";
    td.innerHTML = word;
    tr.appendChild(td);
    td = document.createElement("td");
    td.className = "secondColumn";
    a = document.createElement("a");
    a.href = "";
    a.title = "Listen";
    a.className = "playWordButton";
    a.tabIndex = "-1";
    a.onclick = playWord;
    td.appendChild(a);
    tr.appendChild(td);
    td = document.createElement("td");
    td.className = "thirdColumn";
    td.innerHTML = translation;
    tr.appendChild(td);
    td = document.createElement("td");
    td.className = "fourthColumn";
    a = document.createElement("a");
    a.href = "";
    a.className = "deleteButton";
    a.tabIndex = "-1";
    a.innerHTML = "X";
    a.onclick = deleteWord;
    td.appendChild(a);
    tr.appendChild(td);
    tr.setAttribute("index", index);
    $("#wordsList").contents().find("table")[0].appendChild(tr);
    tr.scrollIntoView(true);
}

/**
 * Delete word from the dictionary.
 *
 * @returns {boolean}
 */
function deleteWord() {
    let tr = this.parentNode.parentNode;
    let trNodesArray = tr.parentNode.children;
    let index;
    let deleteIndex;

    index = parseInt(this.parentNode.parentNode.getAttribute("index"));
    dictionaryArrayQueue = JSON.parse(localStorage.getItem("dictionaryArrayQueue"));
    deleteIndex = dictionaryArrayQueue.indexOfObject(dictionaryArray.splice(index, 1)[0]);

    if (deleteIndex !== -1) {
        dictionaryArrayQueue.splice(deleteIndex, 1);
    }

    if (dictionaryArray.length === 0) {
        chrome.runtime.sendMessage({type: "stopInterval"});
        showSimpleWindow(nothingToShowMessage, "center", "80%", "25%", "1");
    }

    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));

    // Shift all indices after deleted element.
    for (let i = $(this.parentNode.parentNode).index() + 1; i < trNodesArray.length; i++) {
        trNodesArray[i].setAttribute("index", (parseInt(trNodesArray[i].getAttribute("index")) - 1).toString());
    }

    tr.remove();
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
    let word = document.getElementById("fromLanguage").value;
    let translation = document.getElementById("intoLanguage").value;
    let dictionaryArrayQueue;

    word = word.trim();
    translation = translation.trim();

    if (!word) {
        document.getElementById("fromLanguage").focus();
        return false;
    }

    if (!translation) {
        document.getElementById("intoLanguage").focus();
        return false;
    }

    word = word[0].toUpperCase() + word.slice(1);
    translation = translation[0].toUpperCase() + translation.slice(1);
    document.getElementById("fromLanguage").value = null;
    document.getElementById("intoLanguage").value = null;
    dictionaryArrayQueue = JSON.parse(localStorage.getItem("dictionaryArrayQueue"));
    dictionaryArray.push({word: word, translation: translation});
    dictionaryArrayQueue.push({word: word, translation: translation});

    if (dictionaryArray.length === 1) {
        chrome.runtime.sendMessage({type: "startInterval"});
    }

    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));

    if (isSearchActivated && showHideSearch.toggleFlag) {
        findWords();
    } else {
        hideSimpleWindow();
        addWordToList(word, translation, (dictionaryArray.length - 1).toString());
    }
    localStorage.setItem("fromLanguage", JSON.stringify(""));
    localStorage.setItem("intoLanguage", JSON.stringify(""));
    document.getElementById("fromLanguage").focus();
    chrome.runtime.sendMessage({type: "changeDictionary"});
    return false;
}

/**
 * Complete character from regular expression with double slash.
 */
function escapeRegularExpression(text) {
    return text.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

/**
 * Clear table from content before performing actions.
 */
function clearTable() {
    /**
     * @type {JQuery}
     */
    let $table = $("#wordsList").contents().find("table");

    // Delete all rows in the table except the first.
    $table[0].innerHTML = $table[0].rows[0].innerHTML;
}

/**
 * Filter words in dictionary and display them.
 */
function findWords() {
    let searchValue = $("#searchInput").val().toString().trim();
    let searchFromBegin = JSON.parse(localStorage.getItem("settingsArray")).searchFromBegin;
    let regExp = new RegExp((searchFromBegin ? "^" : "") + escapeRegularExpression(searchValue), "ig");
    let flag = false;
    let word;
    let translation;
    let result;

    isSearchActivated = true;
    clearTable();

    // Display found words.
    if (searchValue.length !== 0) {
        for (let i = 0; i < dictionaryArray.length; i++) {
            let found = false;
            word = dictionaryArray[i].word;
            translation = dictionaryArray[i].translation;

            if ((result = regExp.exec(word)) !== null) {
                word = word.replace(regExp, "<span class='highlight'>$&</span>");
                found = true;
            }

            if ((result = regExp.exec(translation)) !== null) {
                translation = translation.replace(regExp, "<span class='highlight'>$&</span>");
                found = true;
            }

            if (found) {
                if (!flag) {
                    hideSimpleWindow();
                }

                addWordToList(word, translation, i.toString());
                flag = true;
            }
        }

        if (!flag) {
            showSimpleWindow(notFoundMessage, "center", "80%", "25%", "1");
        }
        // In case if there is no text in search field.
    } else {
        isSearchActivated = false;

        if (dictionaryArray.length === 0) {
            showSimpleWindow(nothingToShowMessage, "center", "80%", "25%", "1");
        } else {
            hideSimpleWindow();

            for (let i = 0; i < dictionaryArray.length; i++) {
                addWordToList(dictionaryArray[i].word, dictionaryArray[i].translation, i.toString());
            }
        }
    }
}

/**
 * Enter pattern to find in your dictionary.
 */
function showHideSearch() {
    let $shareButtons = $("#shareButtons");
    let $searchInput = $("#searchInput");
    let $fromLanguage = $("#fromLanguage");

    if (showHideSearch.toggleFlag === undefined) {
        showHideSearch.toggleFlag = false;
        $searchInput.on("input", function () {
            clearTimeout(showHideSearch.timeoutId);
            showHideSearch.timeoutId = setTimeout(function () {
                findWords();
            }, 400);
        })
    }

    if (!showHideSearch.toggleFlag) {
        $shareButtons.hide("slide", 300, function () {
            $searchInput.show("slide", 300, function () {
                showHideSearch.toggleFlag = true;
                $searchInput.focus();

                if ($searchInput.val().toString().trim().length !== 0) {
                    findWords();
                }
            });
        });
    } else {
        $searchInput.hide("slide", 500, function () {
            $shareButtons.show("slide", 500, function () {
                showHideSearch.toggleFlag = false;

                if ($searchInput.val().toString().trim().length !== 0) {
                    if (dictionaryArray.length === 0) {
                        showSimpleWindow(nothingToShowMessage, "center", "80%", "25%", "1");
                    } else {
                        hideSimpleWindow();
                        clearTable();

                        for (let i = 0; i < dictionaryArray.length; i++) {
                            addWordToList(dictionaryArray[i].word, dictionaryArray[i].translation, i.toString());
                        }
                    }
                } else {
                    if (dictionaryArray.length === 0) {
                        showSimpleWindow(nothingToShowMessage, "center", "80%", "25%", "1");
                    }
                }

                $fromLanguage.focus();
            });
        });
    }

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
 * It needs to show or hide search input using "Cmd + F" or "Ctrl + F" keys according to platform.
 *
 * @param {object} event
 * @returns {boolean}
 */
function keysForSearch(event) {
    let platformFlag = navigator.userAgent.indexOf("Mac") >= 0;

    if (!event.shiftKey && ((!platformFlag && event.ctrlKey) ||
        (platformFlag && event.metaKey)) &&
        String.fromCharCode(event.which).toLowerCase() === "f") {
        showHideSearch();
        return false;
    }
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
    let $infoBlock = $("#infoBlock");
    let $searchButton = $("#searchButton");
    let $wordList = $("#wordsList").contents();
    let switchState;
    let versionArray;

    // Prevent to drag images in links.
    $infoBlock.find("img").on("dragstart", function () {
        return false;
    });
    $searchButton.on("click", showHideSearch);
    $(window).bind("keydown", keysForSearch);
    $wordList.bind("keydown", keysForSearch);
    fromLanguage.onkeypress = keyForAddition;
    intoLanguage.onkeypress = keyForAddition;

    // User typed text to find and press "enter" key.
    searchInput.onkeypress = function (event) {
        if (event.keyCode === 13) {
            clearTimeout(showHideSearch.timeoutId);
            findWords();
        }
    };

    // State of extension: "Turn on" or "Turn off".
    switchState = localStorage.getItem("switchState");
    addButton.onclick = addWord;
    switchButton.onclick = switchButtonChangeState;

    // Save entered letters in fields when extension closes.
    fromLanguage.oninput = fromLanguageSave;
    intoLanguage.oninput = intoLanguageSave;
    searchInput.oninput = searchInputSave;

    // Load saved letters from localStorage into fields.
    fromLanguage.value = JSON.parse(localStorage.getItem("fromLanguage"));
    intoLanguage.value = JSON.parse(localStorage.getItem("intoLanguage"));
    searchInput.value = JSON.parse(localStorage.getItem("searchInput"));
    switchState = JSON.parse(switchState);

    if (switchState) {
        switchButton.innerHTML = "Turn off";
        switchButton.title = "Turn off push cards";
        switchButton.classList.remove("colorSecond");
        switchButton.classList.add("colorFirst");
    } else {
        switchButton.innerHTML = "Turn on";
        switchButton.title = "Turn on push cards";
        switchButton.classList.remove("colorFirst");
        switchButton.classList.add("colorSecond");
    }

    // Array of words in localStorage.
    dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));

    // Fill in words, translation and "deleteButton" into "iframe".
    for (let i = 0; i < dictionaryArray.length; i++) {
        let word;
        let translation;

        word = dictionaryArray[i].word;
        translation = dictionaryArray[i].translation;
        addWordToList(word, translation, i.toString());
    }

    if (isExtensionUpdated()) {
        if (isCrucialUpdate) {
            showButtonWindow(updateMessage, "Got it", "left", "80%", "80%", "9", function () {
                versionArray = JSON.parse(localStorage.getItem("versionArray"));
                versionArray.push(chrome.app.getDetails().version);
                localStorage.setItem("versionArray", JSON.stringify(versionArray));
                localStorage.setItem("welcomeIsShown", JSON.stringify(false));

                if (isSearchActivated && showHideSearch.toggleFlag) {
                    findWords();
                } else if (dictionaryArray.length === 0) {
                    showSimpleWindow(nothingToShowMessage, "center", "80%", "25%", "1");
                }
            });
        } else {
            versionArray = JSON.parse(localStorage.getItem("versionArray"));
            versionArray.push(chrome.app.getDetails().version);
            localStorage.setItem("versionArray", JSON.stringify(versionArray));
            checkCasesToShowMessage();
        }
    } else {
        checkCasesToShowMessage();
    }

    document.getElementById("fromLanguage").focus();
};