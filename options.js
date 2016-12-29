let settingsArray;
let saveButton;
let showTestCard;
let showTestNotification;
let selectInterval;
let selectDelay;
let showClose;
let showBlur;
let showNativeCards;
let showNotificationCards;
let showTimeline;
let searchFromBegin;
let enableNewTab;
let translateFrom;
let translateInto;
let settingsSaved;
let exportDictionary;
let inputImport;
let importType;
let checkBoxTheme;
let themes;
let selectedThemes;
let currentThemeNumber;
let confirmClear;
let clearDictionary;

function controlCheckedTypesOfNative() {
    showNotificationCards.disabled = showNativeCards.checked === false;
}

function controlCheckedTypesOfNotification() {
    showNativeCards.disabled = showNotificationCards.checked === false;
}

function controlCheckedTypesOfThemes() {
    let count = 0;
    let lastIndex;

    for (let i = 0; i < checkBoxTheme.length && count < 2; i++) {
        if (checkBoxTheme[i].checked === true) {
            count++;
            lastIndex = i;
        }
    }

    if (count === 1) {
        controlCheckedTypesOfThemes.lastIndex = lastIndex;
        checkBoxTheme[lastIndex].disabled = true;
    } else if (controlCheckedTypesOfThemes.lastIndex === undefined) {
        controlCheckedTypesOfThemes.lastIndex = -1;
    } else if (controlCheckedTypesOfThemes.lastIndex !== -1) {
        checkBoxTheme[controlCheckedTypesOfThemes.lastIndex].disabled = false;
        controlCheckedTypesOfThemes.lastIndex = -1;
    }
}

function enableDisableClearButton() {
    clearDictionary.disabled = !confirmClear.checked;
}

/**
 * Clear all Dictionary.
 */
function clearEntireDictionary() {
    if (JSON.parse(localStorage.getItem("dictionaryArray")).length !== 0) {
        localStorage.setItem("dictionaryArray", JSON.stringify([]));
        localStorage.setItem("dictionaryArrayQueue", JSON.stringify([]));
        chrome.runtime.sendMessage({type: "stopInterval"});
        chrome.runtime.sendMessage({type: "changeDictionary"});
        showSettingsStateDelayed("Dictionary have been cleared!", 500);
    } else {
        showSettingsStateDelayed("Dictionary is empty!", 500);
    }
}

/**
 * Show test word card.
 *
 * @returns {boolean}
 */
function testWordCard() {
    let chosenTheme;

    chosenTheme = chooseTheme();
    drawCard("Word", "Translation", chosenTheme, settingsArray);
    increaseCurrentThemeNumber();
    return false;
}

/**
 * Show test Notification.
 *
 * @returns {boolean}
 */
function testNotification() {
    chrome.runtime.sendMessage({type: "showNotification"});
    return false;
}

/**
 * Show state of settings next to the "Save" button.
 *
 * @param {string} state
 */
function showSettingsState(state) {
    settingsSaved = document.getElementById("settingsSaved");
    settingsSaved.innerHTML = state;
    settingsSaved.style.opacity = 1;
    setTimeout(function settingsSavedDisappearing() {
        settingsSaved.style.opacity -= 0.05;
        if (settingsSaved.style.opacity > 0) {
            setTimeout(settingsSavedDisappearing, 10);
        }
    }, 3000);
}

/**
 * Invokes "showSettingsState" with delay.
 *
 * @param {string} state
 * @param {number} delay
 */
function showSettingsStateDelayed(state, delay) {
    setTimeout(function () {
        showSettingsState(state);
    }, delay);
}

/**
 * It shows warning massege when user switch "Append" to "Replace".
 */
function showReplaceWarning() {
    let span = document.createElement("span");

    hideReplaceWarning();
    importType = document.getElementsByName("importType");
    span.id = "warningMessage";
    span.innerHTML = "<br>Warning! Your current dictionary will be lost.";
    importType[1].parentNode.appendChild(span);
}

/**
 * It hides warning massege when user switch "Replace" to "Append".
 */
function hideReplaceWarning() {
    let span = document.getElementById("warningMessage");

    if (span) {
        span.remove();
    }
}

/**
 * Download the file with data when the button is pressed. It is used to export the Dictionary.
 */
function exportDictionaryFile() {
    let a = document.createElement("a");
    let dictionaryArray = localStorage.getItem("dictionaryArray");

    if (JSON.parse(dictionaryArray).length !== 0) {
        a.href = URL.createObjectURL(new Blob([localStorage.getItem("dictionaryArray")]));
        a.download = "yourDictionary.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showSettingsStateDelayed("Dictionary have been exported!", 1000);
    } else {
        showSettingsStateDelayed("Your dictionary is empty!", 1000);
    }
}

/**
 * Replace or merge the dictionary.
 */
function importDictionaryFile(event) {
    let file = event.target.files[0];
    let fileReader = new FileReader();

    if (file !== undefined && file.name.endsWith(".json")) {
        fileReader.onload = function (event) {
            let result;
            let dictionaryArray;

            try {
                result = JSON.parse(event.target.result);

                if (!Array.isArray(result)) {
                    throw new Error("Parsed object is not an array");
                } else {
                    for (let i = 0; i < result.length; i++) {
                        if (!result[i].hasOwnProperty("word") || !result[i].hasOwnProperty("translation")) {
                            throw new Error("Parsed array does not have an appropriate property");
                        }
                    }
                }

                dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));

                if (JSON.parse(localStorage.getItem("switchState")) !== false) {
                    if (result.length === 0) {
                        chrome.runtime.sendMessage({type: "stopInterval"});
                    } else if (dictionaryArray.length === 0) {
                        chrome.runtime.sendMessage({type: "startInterval"});
                    }
                }

                importType = document.getElementsByName("importType");

                if (importType[0].checked) {
                    for (let i = 0; i < result.length; i++) {
                        dictionaryArray.push(result[i]);
                    }
                    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
                    localStorage.setItem("dictionaryArrayQueue", JSON.stringify([]));
                } else if (importType[1].checked) {
                    localStorage.setItem("dictionaryArray", event.target.result);
                    localStorage.setItem("dictionaryArrayQueue", JSON.stringify([]));
                }

                showSettingsStateDelayed("Dictionary has been successfully imported!", 500);
            } catch (error) {
                showSettingsStateDelayed("It is not a Dictionary format file!", 500);
            } finally {
                // It allows to load the same file twise.
                inputImport.value = null;
            }
        };

        fileReader.readAsText(file);
    } else {
        showSettingsStateDelayed("It is not a Dictionary format file!", 500);
    }
}

/**
 * Save settings.
 *
 * @returns {boolean}
 */
function save() {
    selectInterval = document.getElementById("selectInterval");
    selectDelay = document.getElementById("selectDelay");
    showClose = document.getElementById("showClose");
    showBlur = document.getElementById("showBlur");
    translateFrom = document.getElementById("translateFrom");
    translateInto = document.getElementById("translateInto");
    settingsArray = JSON.parse(localStorage.getItem("settingsArray"));
    currentThemeNumber = JSON.parse(localStorage.getItem("currentThemeNumber"));
    settingsArray.selectInterval = selectInterval.selectedIndex + 1;
    settingsArray.selectDelay = selectDelay.selectedIndex + 1;
    settingsArray.showClose = showClose.checked;
    settingsArray.showBlur = showBlur.checked;
    settingsArray.showNativeCardsChecked = showNativeCards.checked;
    settingsArray.showNativeCardsDisabled = showNativeCards.disabled;
    settingsArray.showNotificationCardsChecked = showNotificationCards.checked;
    settingsArray.showNotificationCardsDisabled = showNotificationCards.disabled;
    settingsArray.showTimeline = showTimeline.checked;
    settingsArray.searchFromBegin = searchFromBegin.checked;
    settingsArray.enableNewTab = enableNewTab.checked;
    settingsArray.translateFrom = translateFrom.options[translateFrom.selectedIndex].value;
    settingsArray.translateInto = translateInto.options[translateInto.selectedIndex].value;
    selectedThemes = [];

    for (let i = 0; i < checkBoxTheme.length; i++) {
        if (checkBoxTheme[i].checked) {
            selectedThemes.push(i);
        }
    }

    localStorage.setItem("selectedThemes", JSON.stringify(selectedThemes));

    if (currentThemeNumber > selectedThemes.length - 1) {
        currentThemeNumber = 0;
        localStorage.setItem("currentThemeNumber", JSON.stringify(currentThemeNumber));
    }

    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    window.getSelection().empty();
    showSettingsState("Settings have been saved!");
    chrome.runtime.sendMessage({type: "changeSettings"});
    return false;
}

window.onload = function () {
    let $translateFrom = $("#translateFrom");
    let $translateInto = $("#translateInto");
    let lastFromDisabled;
    let lastIntoDisabled;

    saveButton = document.getElementById("saveButton");
    showTestCard = document.getElementById("showTestCard");
    showTestNotification = document.getElementById("showTestNotification");
    selectInterval = document.getElementById("selectInterval");
    selectDelay = document.getElementById("selectDelay");
    showClose = document.getElementById("showClose");
    showBlur = document.getElementById("showBlur");
    showNativeCards = document.getElementById("showNativeCards");
    showNotificationCards = document.getElementById("showNotificationCards");
    showTimeline = document.getElementById("showTimeline");
    searchFromBegin = document.getElementById("searchFromBegin");
    enableNewTab = document.getElementById("enableNewTab");
    exportDictionary = document.getElementById("exportDictionary");
    inputImport = document.getElementById("inputImport");
    importType = document.getElementsByName("importType");
    checkBoxTheme = document.getElementsByClassName("checkBoxTheme");
    confirmClear = document.getElementById("confirmClear");
    clearDictionary = document.getElementById("clearDictionary");
    translateFrom = document.getElementById("translateFrom");
    translateInto = document.getElementById("translateInto");
    settingsArray = JSON.parse(localStorage.getItem("settingsArray"));
    themes = JSON.parse(localStorage.getItem("themes"));
    selectedThemes = JSON.parse(localStorage.getItem("selectedThemes"));
    exportDictionary.onclick = exportDictionaryFile;
    inputImport.onchange = importDictionaryFile;
    saveButton.onclick = save;
    showTestCard.onclick = testWordCard;
    showTestNotification.onclick = testNotification;
    importType[0].onclick = hideReplaceWarning;
    importType[1].onclick = showReplaceWarning;
    showNativeCards.onchange = controlCheckedTypesOfNative;
    showNotificationCards.onchange = controlCheckedTypesOfNotification;
    selectInterval.options[settingsArray.selectInterval - 1].selected = true;
    selectDelay.options[settingsArray.selectDelay - 1].selected = true;
    showClose.checked = settingsArray.showClose;
    showBlur.checked = settingsArray.showBlur;
    showNativeCards.checked = settingsArray.showNativeCardsChecked;
    showNativeCards.disabled = settingsArray.showNativeCardsDisabled;
    showNotificationCards.checked = settingsArray.showNotificationCardsChecked;
    showNotificationCards.disabled = settingsArray.showNotificationCardsDisabled;
    showTimeline.checked = settingsArray.showTimeline;
    searchFromBegin.checked = settingsArray.searchFromBegin;
    enableNewTab.checked = settingsArray.enableNewTab;
    confirmClear.onchange = enableDisableClearButton;
    clearDictionary.onclick = clearEntireDictionary;

    if (themes) {
        for (let i = 0; i < themes.length; i++) {
            let span;
            let p;
            let label;
            let input;

            span = document.createElement("span");
            span.className = "colorSquare";
            span.id = "color" + i;

            // RegExp to set up "background-color" of themes rounds in "options.js".
            span.style.backgroundColor = themes[i].match(/#wordCard8730011\s?\{\s?background-color\s?:\s?(#\w{3,6})\s?;\s?}/)[1];
            input = document.createElement("input");
            input.type = "checkbox";
            input.className = "checkBoxTheme";
            label = document.createElement("label");
            label.appendChild(span);
            label.appendChild(input);
            p = document.getElementsByClassName("notSelectable")[0];
            p.appendChild(label);
        }
    }

    $translateFrom.find("option[value='" + settingsArray.translateFrom + "']").attr("selected", "selected");
    $translateInto.find("option[value='" + settingsArray.translateInto + "']").attr("selected", "selected");
    lastFromDisabled = $translateFrom.find("option[value='" + $translateInto.val() + "']");
    lastIntoDisabled = $translateInto.find("option[value='" + $translateFrom.val() + "']");
    lastFromDisabled.prop("disabled", true);
    lastIntoDisabled.prop("disabled", true);
    $translateFrom.on("change", function () {
        lastIntoDisabled.prop("disabled", false);
        lastIntoDisabled = $translateInto.find("option[value='" + $translateFrom.val() + "']");
        lastIntoDisabled.prop("disabled", true);
    });
    $translateInto.on("change", function () {
        lastFromDisabled.prop("disabled", false);
        lastFromDisabled = $translateFrom.find("option[value='" + $translateInto.val() + "']");
        lastFromDisabled.prop("disabled", true);
    });

    for (let i = 0; i < selectedThemes.length; i++) {
        checkBoxTheme[selectedThemes[i]].checked = true;
    }

    if (selectedThemes.length === 1) {
        controlCheckedTypesOfThemes.lastIndex = selectedThemes[0];
        checkBoxTheme[selectedThemes[0]].disabled = true;
    }

    for (let i = 0; i < checkBoxTheme.length; i++) {
        checkBoxTheme[i].onchange = controlCheckedTypesOfThemes;
    }
};