let windowFocused;
let fromFocused;
let intoFocused;
let addFocused;
let playFocused;

/**
 * Handler for shortcut for trigger EachWord on the web pages.
 *
 * @param {Object} event
 */
window.onkeydown = function (event) {
    let platformFlag = navigator.userAgent.indexOf("Mac") >= 0;
    let selectedText = window.getSelection().toString();
    let window8730011 = document.getElementById("window8730011");

    if (event.shiftKey && ((!platformFlag && event.ctrlKey) ||
        (platformFlag && event.metaKey)) &&
        String.fromCharCode(event.which).toLowerCase() === "e" && selectedText !== "") {
        showWindow(selectedText);
    } else if (event.which === 27) {
        if (window8730011) {
            window8730011.remove();
            window.removeEventListener("click", checkFocus);
        }
    }
};

/**
 * Check focus to delete panel if it is not in focus.
 *
 * @returns {boolean} false
 */
function checkFocus() {
    let window8730011 = document.getElementById("window8730011");

    if (!windowFocused && !fromFocused && !intoFocused && !addFocused && !playFocused) {
        if (window8730011) {
            window8730011.remove();
            document.getElementById("fontStyle8730011").remove();
        }

        window.removeEventListener("click", checkFocus);
    }
}

/**
 * Handler for add button on the pop-up panel.
 *
 * @param {Object} event
 * @returns {boolean} false
 */
function addButtonHandler(event) {
    let from8730011 = document.getElementById("from8730011");
    let into8730011 = document.getElementById("into8730011");
    let word = from8730011.value.trim();
    let translation = into8730011.value.trim();
    let window8730011 = document.getElementById("window8730011");

    event.stopPropagation();

    if (!word) {
        from8730011.focus();
        return false;
    }

    if (!translation) {
        into8730011.focus();
        return false;
    }

    chrome.runtime.sendMessage({
        type: "addWordFromContextMenu",
        word: word,
        translation: translation
    });

    window8730011.remove();
    document.getElementById("fontStyle8730011").remove();
    window.removeEventListener("click", checkFocus);
    return false;
}

/**
 * Show panel to add selected word.
 *
 * @param {string} text
 */
function showWindow(text) {
    let body = document.getElementsByTagName("body")[0];
    let div = document.createElement("div");
    let from8730011;
    let into8730011;
    let addButton8730011;
    let playButton8730011;
    let window8730011;
    let windowWidth;
    let windowHeight;
    let fontStyle;
    let selectionCoords;

    windowFocused = false;
    fromFocused = false;
    intoFocused = true;
    addFocused = false;
    playFocused = false;

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

    div.id = "window8730011";
    div.innerHTML = "<div class='playWrap8730011'>" +
        "<a href='' title='Listen' id='playButton8730011' tabindex='-1'></a>" +
        "</div>" +
        "<div class='wordsWrap8730011'>" +
        "<input id='from8730011' type='text' value='" + text + "' placeholder='Word' maxlength='50' tabindex='1'>" +
        "<input id='into8730011' type='text' placeholder='Translation' maxlength='50' tabindex='2'>" +
        "</div>" +
        "<a href='' id='addButton8730011' title='Add word card' tabindex='-1'>+</a>";
    body.appendChild(div);

    //Find position of window
    window8730011 = document.getElementById("window8730011");
    selectionCoords = window.getSelection().getRangeAt(0).getBoundingClientRect();
    windowWidth = window8730011.clientWidth;
    windowHeight = window8730011.clientHeight;
    let left = selectionCoords.left - windowWidth / 2 + selectionCoords.width / 2;
    let top = selectionCoords.bottom + 10;
    if (left < 0) {
        window8730011.style.left = 0;
    } else {
        if (left + windowWidth > window.innerWidth) {
            window8730011.style.left = "auto";
            window8730011.style.right = 0;
        } else {
            window8730011.style.left = left + "px";
        }
    }
    if (top < 0) {
        window8730011.style.top = 0;
    } else {
        if (top + windowHeight > window.innerHeight) {
            window8730011.style.top = "auto";
            window8730011.style.bottom = 0;
        } else {
            window8730011.style.top = top + "px";
        }
    }

    from8730011 = document.getElementById("from8730011");
    into8730011 = document.getElementById("into8730011");
    addButton8730011 = document.getElementById("addButton8730011");
    playButton8730011 = document.getElementById("playButton8730011");
    playButton8730011.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        chrome.runtime.sendMessage({type: "playWord", word: from8730011.value});
    };
    addButton8730011.onclick = addButtonHandler;
    from8730011.value = text.charAt(0).toUpperCase() + text.slice(1);

    from8730011.onkeypress = function (event) {
        if (event.keyCode === 13) {
            addButtonHandler(event);
        }
    };

    into8730011.onkeypress = function (event) {
        if (event.keyCode === 13) {
            addButtonHandler(event);
        }
    };

    div.onfocus = function () {
        windowFocused = true;
    };

    from8730011.onfocus = function () {
        fromFocused = true;
    };

    into8730011.onfocus = function () {
        intoFocused = true;
    };

    addButton8730011.onfocus = function () {
        addFocused = true;
    };

    playButton8730011.onfocus = function () {
        playFocused = true;
    };

    div.onblur = function () {
        windowFocused = false;
    };

    from8730011.onblur = function () {
        fromFocused = false;
    };

    into8730011.onblur = function () {
        intoFocused = false;
    };

    addButton8730011.onblur = function () {
        addFocused = false;
    };

    playButton8730011.onblur = function () {
        playFocused = false;
    };

    window.addEventListener("click", checkFocus);

    from8730011.oninput = function requestTranslation() {
        clearTimeout(requestTranslation.timeoutId);
        requestTranslation.timeoutId = setTimeout(function () {

            // We cannot use translation function in content script.
            chrome.runtime.sendMessage({
                type: "giveTranslation",
                text: from8730011.value
            });
        }, 300);
    };

    document.getElementById("into8730011").focus();

    // Force first translation.
    from8730011.oninput();
}

/**
 * All functions are defined in "commonFunction.js".
 * This listener gets messages from "background.js" when it is time to showing word card.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "showWord") {
            if (!document.webkitHidden) {
                chrome.runtime.sendMessage({type: "wordCardShown"});
                drawCard(request.wordArray.word, request.wordArray.translation, request.theme, request.settingsArray);
            }
        }
    }
);

/**
 * This listener shows the window to add word from context menu.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "showWindow") {
            showWindow(request.text);
        }
    }
);

/**
 * This listener gets message from "background.js" with translation of requested word.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "translationCompleted") {
            if (request.result.isTranslated) {
                document.getElementById("into8730011").value = request.result.translation;
            } else {
                document.getElementById("into8730011").value = "";
            }
        }
    }
);