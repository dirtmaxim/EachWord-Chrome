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
let inputImport;
let confirmClear;
let prepareClearDictionary;
let clearWrapper;
let clearDictionary;
let currentThemeNumber;
let intervalValue;
let durationValue;
let statusWrapper;

let statusTimeoutId;
let statusTime = 4000;

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
 * Show status.
 */
function showStatus(text, success) {
    if (success) {
        $(statusWrapper).addClass("open");
    } else {
        $(statusWrapper).addClass("open wrong");
    }
    $('#status').html(text);
}

/**
 * Close status.
 */
function closeStatus() {
    if (statusTimeoutId) {
        clearTimeout(statusTimeoutId);
    }
    if ($(statusWrapper).hasClass("wrong")) {
        $(statusWrapper).removeClass("open wrong");
    } else {
        $(statusWrapper).removeClass("open");
    }
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
        showStatus("Dictionary has been cleared!", true);
        if (statusTimeoutId) {
            clearTimeout(statusTimeoutId);
        }
        statusTimeoutId = setTimeout(closeStatus, statusTime);
        exportDictionary.setAttribute("disabled", "true");
        prepareClearDictionary.style["display"] = null;
        prepareClearDictionary.setAttribute("disabled", "true");
        clearWrapper.style["display"] = null;
        confirmClear.checked = false;
    } else {
        showStatus("Dictionary is empty!", false);
        if (statusTimeoutId) {
            clearTimeout(statusTimeoutId);
        }
        statusTimeoutId = setTimeout(closeStatus, statusTime);
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
        a.download = "eachword.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showStatus("Excellent! The dictionary was successfully exported.", true);
        if (statusTimeoutId) {
            clearTimeout(statusTimeoutId);
        }
        statusTimeoutId = setTimeout(closeStatus, statusTime);
    } else {
        if (statusTimeoutId) {
            clearTimeout(statusTimeoutId);
        }
        statusTimeoutId = setTimeout(closeStatus, statusTime);
        showStatus("Your dictionary is empty!", false);
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
                    chrome.runtime.sendMessage({type: "deleteInNationDictionary", word: result[i].word});
                }
                localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
                localStorage.setItem("dictionaryArrayQueue", JSON.stringify([]));

                showStatus("Excellent! The dictionary was successfully imported.", true);
                if (statusTimeoutId) {
                    clearTimeout(statusTimeoutId);
                }
                statusTimeoutId = setTimeout(closeStatus, statusTime);
                exportDictionary.removeAttribute("disabled");
                prepareClearDictionary.removeAttribute("disabled");

            } catch (error) {
                showStatus("Oops. A transfer error occurred. Try again.", false);
                if (statusTimeoutId) {
                    clearTimeout(statusTimeoutId);
                }
                statusTimeoutId = setTimeout(closeStatus, statusTime);
            }
        };

        fileReader.readAsText(file);
    } else {
        showStatus("Oops. A transfer error occurred. Try again.", false);
        if (statusTimeoutId) {
            clearTimeout(statusTimeoutId);
        }
        statusTimeoutId = setTimeout(closeStatus, statusTime);
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
    disableOptions();
}

function saveTranslateInto() {
    settingsArray.translateInto = translateInto.getAttribute("data-value");
    localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
    chrome.runtime.sendMessage({type: "changeSettings"});
    disableOptions();
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

/**
 *  Algorithm which recommends new words for user.
 *
 * @returns {string[]} recommended words
 */
function getNewWords() {
    let portion = 20;
    let forLevelUp = 3;
    let words = [];
    let languageLevel = JSON.parse(localStorage.getItem("languageLevel"));
    let successCount = JSON.parse(localStorage.getItem("successCount"));
    let nationDictionary = JSON.parse(localStorage.getItem("nationDictionary"));

    if (nationDictionary) {
        if (languageLevel < 0) {
            let minIndex = 0;
            let min = nationDictionary[minIndex].length;
            for (let i = 1; i < nationDictionary.length; i++) {
                let currentLength = nationDictionary[i].length;
                if (currentLength < min) {
                    min = currentLength;
                    minIndex = i;
                }
            }
            languageLevel = minIndex;
            localStorage.setItem("languageLevel", JSON.stringify(languageLevel));
        }
        while (true) {
            if (languageLevel < nationDictionary.length) {
                if (nationDictionary[languageLevel].length >= portion) {
                    if (successCount < forLevelUp) {
                        let randomNumber;
                        let tempDictionary = nationDictionary[languageLevel];
                        while (words.length < portion) {
                            randomNumber = Math.floor(Math.random() * tempDictionary.length);
                            words.push(tempDictionary.splice(randomNumber, 1)[0]);
                        }
                        return words;
                    }
                }
                languageLevel++;
                successCount = 0;
                localStorage.setItem("languageLevel", JSON.stringify(languageLevel));
                localStorage.setItem("successCount", JSON.stringify(successCount));
            } else {
                return words;
            }
        }
    }
}

/**
 *  Add recommended words to user's words list.
 *
 */
function addNewWords() {
    let knowCount = 0;
    let nationDictionary = JSON.parse(localStorage.getItem("nationDictionary"));
    let languageLevel = JSON.parse(localStorage.getItem("languageLevel"));
    let successCount = JSON.parse(localStorage.getItem("successCount"));
    let dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));
    let dictionaryArrayQueue = JSON.parse(localStorage.getItem("dictionaryArrayQueue"));
    let word;
    let translation;
    let wordsCount = $('#wordsList').children('li').length;

    $('#wordsList').children('li').each(function () {
        word = $(this).children('span').eq(0).html();
        let radioValue = $(this).find('input:checked').val();
        if (radioValue == "know") {
            knowCount++;
            nationDictionary[languageLevel].splice(nationDictionary[languageLevel].indexOf(word), 1);
        } else if (radioValue == "add") {
            translation = $(this).children('span').eq(1).html();
            dictionaryArray.push({word: word, translation: translation});
            dictionaryArrayQueue.push({word: word, translation: translation});
            nationDictionary[languageLevel].splice(nationDictionary[languageLevel].indexOf(word), 1);
        }
        $(this).remove();
    });
    if (knowCount / wordsCount >= 0.7) {
        successCount++;
    } else {
        successCount = 0;
    }

    localStorage.setItem("nationDictionary", JSON.stringify(nationDictionary));
    localStorage.setItem("languageLevel", JSON.stringify(languageLevel));
    localStorage.setItem("successCount", JSON.stringify(successCount));
    localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
    localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));
    chrome.runtime.sendMessage({type: "changeDictionary"});

    $(this).addClass('hidden');
    $('#getNewWords').removeClass('hidden');
    showStatus("Excellent! New words were added.", true);
    if (statusTimeoutId) {
        clearTimeout(statusTimeoutId);
    }
    statusTimeoutId = setTimeout(closeStatus, statusTime);

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
    inputImport = document.getElementById("inputImport");
    confirmClear = document.getElementById("confirmClear");
    prepareClearDictionary = document.getElementById("prepareClearDictionary");
    clearWrapper = document.getElementsByClassName("clearWrapper")[0];
    clearDictionary = document.getElementById("clearDictionary");
    statusWrapper = $('.statusWrapper');

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
    $(".rangeWrapper").each(function () {
        $(this).children("input[type=range]").on("change mousemove", function () {
            $(this).parent().children(".timeWrapper").children(".time").html($(this).val());
        }).mousemove();
    });
    selectInterval.onblur = saveSelectInterval;
    selectInterval.onmouseout = function () {
        let temp = selectInterval.getAttribute("value");
        if (temp !== intervalValue) {
            saveSelectInterval();
            intervalValue = temp;
        }
    };
    selectDuration.onblur = saveSelectDuration;
    selectDuration.onmouseout = function () {
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
    inputImport.onchange = importDictionaryFile;
    confirmClear.onchange = enableDisableClearButton;
    prepareClearDictionary.onclick = function () {
        this.style["display"] = "none";
        clearWrapper.style["display"] = "block";
    };
    clearDictionary.onclick = clearEntireDictionary;
    if (JSON.parse(localStorage.getItem("dictionaryArray")).length === 0) {
        exportDictionary.setAttribute("disabled", "true");
        prepareClearDictionary.setAttribute("disabled", "true");
    }

    $('#getNewWords').click(function () {
        let words = getNewWords();
        if (words.length > 0) {
            words.forEach(function (word, i) {
                let li;
                let wordsList = document.getElementById("wordsList");

                li = document.createElement("li");
                li.innerHTML = "<div class='know radio'>" +
                                    "<input type='radio' name='radio" + i + "' id='know" + i + "' value='know'>" +
                                    "<label for='know" + i + "'>I know</label>" +
                                "</div>" +
                                "<div class='later radio'>" +
                                    "<input type='radio' name='radio" + i + "' id='later" + i + "' value='later'>" +
                                    "<label for='later" + i + "'>Later</label>" +
                                "</div>" +
                                "<div class='add radio'>" +
                                    "<input type='radio' name='radio" + i + "' id='add" + i + "' checked value='add'>" +
                                    "<label for='add" + i + "'>Add</label>" +
                                "</div>" +
                                "<span>" + word[0].toUpperCase() + word.toLowerCase().slice(1) + "</span>" +
                                "<span></span>";
                wordsList.appendChild(li);
            });
            $('#wordsList li').each(function () {
                let spanArr = $(this).children("span");
                translate("en", "ru", $(spanArr[0]).html(), function (result) {
                    $(spanArr[1]).html(result.translation);
                });
            });
            $('.add').click(function () {
                if ($(this).parent().hasClass('knowClick')) {
                    $(this).parent().removeClass('knowClick');
                }
                if ($(this).parent().hasClass('laterClick')) {
                    $(this).parent().removeClass('laterClick');
                }
            });

            $('.later').on('mouseover', function () {
                $(this).parent().addClass('laterHover');
            }).on('mouseout', function () {
                $(this).parent().removeClass('laterHover');
            }).click(function () {
                if ($(this).parent().hasClass('knowClick')) {
                    $(this).parent().removeClass('knowClick');
                }
                if (!$(this).parent().hasClass('laterClick')) {
                    $(this).parent().addClass('laterClick');
                }
            });

            $('.know').on('mouseover', function () {
                $(this).parent().addClass('knowHover');
            }).on('mouseout', function () {
                $(this).parent().removeClass('knowHover');
            }).click(function () {
                if ($(this).parent().hasClass('laterClick')) {
                    $(this).parent().removeClass('laterClick');
                }
                if (!$(this).parent().hasClass('knowClick')) {
                    $(this).parent().addClass('knowClick');
                }
            });
        }
        $(this).addClass('hidden');
        $('#addNewWords').removeClass('hidden');
    });

    $('#addNewWords').click(addNewWords);

    $('.closeButton').click(function () {
        closeStatus();
        return false;
    });

    $('.select').each(function () {
        initializeCustomSelect($(this));
    });
    disableOptions();

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
            if (!$(this).hasClass("disabled")) {
                $(select).attr('data-value', $(this).attr('data-value'));
                $(selected).children('span').html($(this).html());
                selected.click();
                select.change();
            } else {
                return false;
            }
        })
    });
}

/**
 * Set disable options in translate selects
 */
function disableOptions() {
    let select1 = $("#translateFrom");
    let select2 = $("#translateInto");
    let value1 = select1.attr("data-value");
    let value2 = select2.attr("data-value");
    if (select1.find(".option.disabled")) {
        select1.find(".option.disabled").removeClass("disabled");
    }
    if (select2.find(".option.disabled")) {
        select2.find(".option.disabled").removeClass("disabled");
    }
    select1.find(".option[data-value = " + value2 + "]").addClass("disabled");
    select2.find(".option[data-value = " + value1 + "]").addClass("disabled");
}