/**
 * Show simple window.
 *
 * @param text {string} Main content
 * @param textAlign {string} Align of text
 * @param width {string} Width of window
 * @param height {string} Height of window
 * @param priority {string} Priority of window
 */
function showSimpleWindow(text, textAlign, width, height, priority) {
    let frameDocument = document.getElementsByTagName("iframe")[0].contentWindow.document;
    let messageWindow = frameDocument.getElementById("messageWindow");
    let span;
    let simpleWindow;
    let simpleWindowContent;

    // In case of buttonWindow is already shown.
    if (messageWindow !== null) {
        if (parseInt(messageWindow.getAttribute("priority")) <= priority) {
            messageWindow.remove();
        } else {
            return;
        }
    }

    if (textAlign !== "left" || textAlign !== "center" || textAlign !== "right") {
        textAlign = "center";
    }

    span = document.createElement("span");
    span.innerHTML = text;
    simpleWindowContent = document.createElement("div");
    simpleWindowContent.id = "simpleWindowContent";
    simpleWindowContent.style.textAlign = textAlign;
    simpleWindowContent.appendChild(span);
    simpleWindow = document.createElement("div");
    simpleWindow.id = "simpleWindow";
    simpleWindow.style.width = width;
    simpleWindow.style.height = height;
    simpleWindow.appendChild(simpleWindowContent);
    messageWindow = document.createElement("div");
    messageWindow.id = "messageWindow";
    messageWindow.setAttribute("priority", priority);
    messageWindow.appendChild(simpleWindow);
    frameDocument = document.getElementsByTagName("iframe")[0].contentWindow.document;
    frameDocument.getElementsByTagName("body")[0].appendChild(messageWindow);
}

/**
 * Hide simple window.
 */
function hideSimpleWindow() {
    let frameDocument = document.getElementsByTagName("iframe")[0].contentWindow.document;
    let messageWindow = frameDocument.getElementById("messageWindow");
    let simpleWindow = frameDocument.getElementById("simpleWindow");

    if (simpleWindow !== null) {
        messageWindow.remove();
    }
}

/**
 * Show window with the button.
 *
 * @param text {string} Main content
 * @param buttonText {string} Label of button
 * @param textAlign {string} Align of main content
 * @param width {string} Width of window
 * @param height {string} Height of window
 * @param priority {string} Priority of window
 * @param finalAction {function} An action that will be executed when button is pressed
 */
function showButtonWindow(text, buttonText, textAlign, width, height, priority, finalAction) {
    let frameDocument = document.getElementsByTagName("iframe")[0].contentWindow.document;
    let messageWindow = frameDocument.getElementById("messageWindow");
    let span;
    let a;
    let buttonWindow;
    let buttonWindowContent;
    let buttonWindowButton;

    // In case of messageWindow is already shown.
    if (messageWindow !== null) {
        if (parseInt(messageWindow.getAttribute("priority")) <= priority) {
            messageWindow.remove();
        } else {
            return;
        }
    }

    if (textAlign !== "left" || textAlign !== "center" || textAlign !== "right") {
        textAlign = "left";
    }

    span = document.createElement("span");
    span.innerHTML = text;
    a = document.createElement("a");
    a.href = "";
    a.id = "buttonWindowButton";
    a.tabIndex = "-1";
    a.innerHTML = buttonText;
    buttonWindowContent = document.createElement("div");
    buttonWindowContent.id = "buttonWindowContent";
    buttonWindowContent.style.textAlign = textAlign;
    buttonWindowContent.appendChild(span);
    buttonWindowContent.appendChild(a);
    buttonWindow = document.createElement("div");
    buttonWindow.id = "buttonWindow";
    buttonWindow.style.width = width;
    buttonWindow.style.height = height;
    buttonWindow.appendChild(buttonWindowContent);
    messageWindow = document.createElement("div");
    messageWindow.id = "messageWindow";
    messageWindow.setAttribute("priority", priority);
    messageWindow.appendChild(buttonWindow);
    frameDocument = document.getElementsByTagName("iframe")[0].contentWindow.document;
    frameDocument.getElementsByTagName("body")[0].appendChild(messageWindow);
    buttonWindowButton = frameDocument.getElementById("buttonWindowButton");
    buttonWindowButton.onclick = function () {
        messageWindow.remove();
        finalAction();
        return false;
    };
    frameDocument.onkeypress = function (event) {
        if (event.keyCode === 13) {
            buttonWindowButton.click();
        }
    }
}