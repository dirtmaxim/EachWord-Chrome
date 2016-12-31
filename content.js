let windowFocused;
let fromFocused;
let intoFocused;
let addFocused;

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
 * Check focus to delete panel if it is not in focus.
 *
 * @returns {boolean} false
 */
function checkFocus() {
    let window8730011 = document.getElementById("window8730011");

    if (!windowFocused && !fromFocused && !intoFocused && !addFocused) {
        if (window8730011) {
            window8730011.remove();
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
function addHandler(event) {
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

    windowFocused = false;
    fromFocused = true;
    intoFocused = false;
    addFocused = false;
    div.id = "window8730011";

    // To get focus.
    div.setAttribute("contenteditable", "true");
    div.innerHTML = "<input id='from8730011' type='text' value='" + text +
        "' placeholder='Word' maxlength='50' tabindex='1'><input id='into8730011' type='text'" +
        "placeholder='Translation' maxlength='50' tabindex='2'><a href='' id='addButton8730011'" +
        "title='Add word card' tabindex='-1'>+</a>";
    body.appendChild(div);
    from8730011 = document.getElementById("from8730011");
    into8730011 = document.getElementById("into8730011");
    addButton8730011 = document.getElementById("addButton8730011");
    addButton8730011.onclick = addHandler;
    from8730011.value = text;

    from8730011.onkeypress = function (event) {
        if (event.keyCode === 13) {
            addHandler(event);
        }
    };

    into8730011.onkeypress = function (event) {
        if (event.keyCode === 13) {
            addHandler(event);
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

    document.getElementById("from8730011").focus();

    // Force first translation.
    from8730011.oninput();
}

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

window.onkeydown = function (event) {
    let platformFlag = navigator.userAgent.indexOf("Mac") >= 0;
    let selectedText = window.getSelection().toString();

    if (event.shiftKey && ((!platformFlag && event.ctrlKey) ||
        (platformFlag && event.metaKey)) &&
        String.fromCharCode(event.which).toLowerCase() === "e" && selectedText !== "") {
        showWindow(selectedText);
    }
};