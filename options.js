let settingsArray;
let themes;
let selectedThemes;
let translateFrom;
let translateInto;
let showNativeCards;
let showBlur;
let selectInterval;
let selectDuration;
let checkBoxTheme;
let showTestCard;
let showNotificationCards;
let showTestNotification;
let exportDictionary;
let importDictionary;
let confirmClear;
let clearDictionary;
let currentThemeNumber;
let intervalValue;
let durationValue;

function controlCheckedTypesOfNative() {
    showNotificationCards.disabled = showNativeCards.checked === false;
    saveShowNativeCards();
    saveShowNotificationCards();
}

function controlCheckedTypesOfNotification() {
    showNativeCards.disabled = showNotificationCards.checked === false;
    saveShowNativeCards();
    saveShowNotificationCards();
}

function controlCheckedTypesOfThemes() {
    let count = 0;
    let lastIndex;

    for (let i = 0; i < checkBoxTheme.length && count < 2; i++) {
        if (checkBoxTheme[i].getElementsByTagName('input')[0].checked === true) {
            count++;
            lastIndex = i;
        }
    }

    if (count === 1) {
        controlCheckedTypesOfThemes.lastIndex = lastIndex;
        checkBoxTheme[lastIndex].getElementsByTagName('input')[0].disabled = true;
    } else if (controlCheckedTypesOfThemes.lastIndex === undefined) {
        controlCheckedTypesOfThemes.lastIndex = -1;
    } else if (controlCheckedTypesOfThemes.lastIndex !== -1) {
        checkBoxTheme[controlCheckedTypesOfThemes.lastIndex].getElementsByTagName('input')[0].disabled = false;
        controlCheckedTypesOfThemes.lastIndex = -1;
    }

    saveThemes();
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
        alert("Dictionary has been cleared!");
    } else {
        alert("Dictionary is empty!");
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
    } else {
        alert("Your dictionary is empty!");
    }
    return false;
}

/**
 * Import the dictionary.
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

                for (let i = 0; i < result.length; i++) {
                    dictionaryArray.push(result[i]);
                }
                localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
                localStorage.setItem("dictionaryArrayQueue", JSON.stringify([]));

            } catch (error) {
                alert("It is not a Dictionary format file!");
            }
        };

        fileReader.readAsText(file);
    } else {
        alert("It is not a Dictionary format file!");
    }
    return false;
}

/*
 * Save settings
 */
function saveTranslateFrom() {
    settingsArray.translateFrom = translateFrom.getAttribute("data-value");
    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    chrome.runtime.sendMessage({type: "changeSettings"});
}

function saveTranslateInto() {
    settingsArray.translateInto = translateInto.getAttribute("data-value");
    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    chrome.runtime.sendMessage({type: "changeSettings"});
}

function saveShowNativeCards() {
    settingsArray.showNativeCardsChecked = showNativeCards.checked;
    settingsArray.showNativeCardsDisabled = showNativeCards.disabled;
    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    chrome.runtime.sendMessage({type: "changeSettings"});
}

function saveShowBlur() {
    settingsArray.showBlur = showBlur.checked;
    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    chrome.runtime.sendMessage({type: "changeSettings"});
}

function saveSelectInterval() {
    settingsArray.selectInterval = selectInterval.value;
    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    chrome.runtime.sendMessage({type: "changeSettings"});
}

function saveSelectDuration() {
    settingsArray.selectDelay = selectDuration.value;
    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    chrome.runtime.sendMessage({type: "changeSettings"});
}

function saveThemes() {
    currentThemeNumber = JSON.parse(localStorage.getItem("currentThemeNumber"));
    selectedThemes = [];

    for (let i = 0; i < checkBoxTheme.length; i++) {
        if (checkBoxTheme[i].getElementsByTagName('input')[0].checked) {
            selectedThemes.push(i);
        }
    }

    localStorage.setItem("selectedThemes", JSON.stringify(selectedThemes));

    if (currentThemeNumber > selectedThemes.length - 1) {
        currentThemeNumber = 0;
        localStorage.setItem("currentThemeNumber", JSON.stringify(currentThemeNumber));
    }
    chrome.runtime.sendMessage({type: "changeSettings"});
}

function saveShowNotificationCards() {
    settingsArray.showNotificationCardsChecked = showNotificationCards.checked;
    settingsArray.showNotificationCardsDisabled = showNotificationCards.disabled;
    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    chrome.runtime.sendMessage({type: "changeSettings"});
}

window.onload = function () {
    settingsArray = JSON.parse(localStorage.getItem("settingsArray"));
    themes = JSON.parse(localStorage.getItem("themes"));
    selectedThemes = JSON.parse(localStorage.getItem("selectedThemes"));

    translateFrom = document.getElementById("translateFrom");
    translateInto = document.getElementById("translateInto");
    showNativeCards = document.getElementById("showNativeCards");
    showBlur = document.getElementById("showBlur");
    selectInterval = document.getElementById("selectInterval").getElementsByTagName('input')[0];
    selectDuration = document.getElementById("selectDuration").getElementsByTagName('input')[0];
    showTestCard = document.getElementById("showTestCard");
    showNotificationCards = document.getElementById("showNotificationCards");
    showTestNotification = document.getElementById("showTestNotification");
    exportDictionary = document.getElementById("exportDictionary");
    importDictionary = document.getElementById("inputImport");
    confirmClear = document.getElementById("confirmClear");
    clearDictionary = document.getElementById("clearDictionary");

    translateFrom.setAttribute("data-value", settingsArray.translateFrom);
    translateInto.setAttribute("data-value", settingsArray.translateInto);
    translateFrom.onchange = saveTranslateFrom;
    translateInto.onchange = saveTranslateInto;

    $('#changeLanguages').click(function () {
        let from = $('#translateFrom');
        let into = $('#translateInto');
        let fromValue = from.attr('data-value');
        let intoValue = into.attr('data-value');
        let fromHtml = from.children('.selected').children('span').html();
        let intoHtml = into.children('.selected').children('span').html();
        from.attr('data-value', intoValue);
        from.children('.selected').children('span').html(intoHtml);
        into.attr('data-value', fromValue);
        into.children('.selected').children('span').html(fromHtml);
        from.change();
        into.change();
    });

    showNativeCards.checked = settingsArray.showNativeCardsChecked;
    showNativeCards.disabled = settingsArray.showNativeCardsDisabled;
    showNativeCards.onchange = controlCheckedTypesOfNative;

    showBlur.checked = settingsArray.showBlur;
    showBlur.onchange = saveShowBlur;


    selectInterval.value = settingsArray.selectInterval;
    selectDuration.value = settingsArray.selectDelay;
    intervalValue = selectInterval.value;
    durationValue = selectDuration.value;
    $(".rangeWrapper").each(function() {
        $(this).children("input[type=range]").on("change mousemove", function () {
            $(this).parent().children(".timeWrapper").children(".time").html($(this).val());
        }).mousemove();
    });
    selectInterval.onblur = saveSelectInterval;
    selectInterval.onmouseout = function() {
        let temp = selectInterval.getAttribute("value");
        if (temp !== intervalValue) {
            saveSelectInterval();
            intervalValue = temp;
        }
    };
    selectDuration.onblur = saveSelectDuration;
    selectDuration.onmouseout = function() {
        let temp = selectDuration.getAttribute("value");
        if (temp !== durationValue) {
            saveSelectDuration();
            durationValue = temp;
        }
    };

    //Add themes to html page
    if (themes) {
        for (let i = 0; i < themes.length; i++) {
            let div;
            let input;
            let label;

            div = document.createElement("div");
            div.className = "roundCheckbox";

            input = document.createElement("input");
            input.type = "checkbox";
            input.id = "theme" + i;
            label = document.createElement("label");
            label.setAttribute("for", "theme" + i);
            // RegExp to set up "background-color" of themes rounds in "options.js".
            label.style.backgroundColor = themes[i].match(/#wordCard8730011\s?\{\s?background-color\s?:\s?(#\w{3,6})\s?;/)[1];
            div.appendChild(input);
            div.appendChild(label);
            document.getElementById("cardThemes").appendChild(div);
        }
    }

    checkBoxTheme = document.getElementsByClassName("roundCheckbox");
    for (let i = 0; i < selectedThemes.length; i++) {
        checkBoxTheme[selectedThemes[i]].getElementsByTagName('input')[0].checked = true;
    }

    if (selectedThemes.length === 1) {
        controlCheckedTypesOfThemes.lastIndex = selectedThemes[0];
        checkBoxTheme[selectedThemes[0]].getElementsByTagName('input')[0].disabled = true;
    }

    for (let i = 0; i < checkBoxTheme.length; i++) {
        checkBoxTheme[i].getElementsByTagName('input')[0].onchange = controlCheckedTypesOfThemes;
    }

    showTestCard.onclick = testWordCard;

    showNotificationCards.checked = settingsArray.showNotificationCardsChecked;
    showNotificationCards.disabled = settingsArray.showNotificationCardsDisabled;
    showNotificationCards.onchange = controlCheckedTypesOfNotification;

    showTestNotification.onclick = testNotification;

    exportDictionary.onclick = exportDictionaryFile;
   // importDictionary.onclick = importDictionaryFile;
    confirmClear.onchange = enableDisableClearButton;
    clearDictionary.onclick = clearEntireDictionary;

    $('.select').each(function() {
        initializeCustomSelect($(this));
    });

    // Set range style
    let thumbStyle = 'input[type="range"]::-webkit-slider-thumb{box-shadow:';
    let shadowSize = -6;
    let shadowColor = '#9d9d9d';
    let shadowWidth = $('.rangeWrapper').width();
    for (let i = 6; i <= shadowWidth; i++) {
        thumbStyle += i + 'px 0 0 ' + shadowSize + 'px ' + shadowColor;
        if (i != shadowWidth) {
            thumbStyle += ',';
        }
    }
    thumbStyle += ';}';
    $('head').append('<style>' + thumbStyle + '</style>');
};

/**
 * Initialize custom select
 */
function initializeCustomSelect(select) {
    let selected = $(select).children('.selected');
    let options = $(select).children('.options');
    let selectedValue = select.attr('data-value');
    let selectedOption = $(options).children('[data-value = ' + selectedValue + ']');

    $(selected).children('span').html($(selectedOption).html());

    selected.click(function () {
        if (select.hasClass('active')) {
            options.addClass('hidden');
            select.removeClass('active');
        } else {
            options.removeClass('hidden');
            select.addClass('active');
        }
    });

    options.children('.option').each(function () {
        $(this).click(function () {
            $(select).attr('data-value', $(this).attr('data-value'));
            $(selected).children('span').html($(this).html());
            selected.click();
            select.change();
        })
    });
}