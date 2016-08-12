var i,
	saveButton,
	showTestCard,
	showTestNotification,
	selectInterval,
	selectDelay,
	showClose,
	showBlur,
	showNativeCards,
	showNotificationCards,
	showTimeline,
	settingsArray,
	settingsSaved,
	exportDictionary,
	inputImport,
	importType,
	checkBoxTheme,
	themes,
	selectedThemes,
	currentThemeNumber;

function controlCheckedTypesOfNative() {
	"use strict";
	if (showNativeCards.checked === false) {
		showNotificationCards.disabled = true;
	} else {
		showNotificationCards.disabled = false;
	}
}

function controlCheckedTypesOfNotification() {
	"use strict";
	if (showNotificationCards.checked === false) {
		showNativeCards.disabled = true;
	} else {
		showNativeCards.disabled = false;
	}
}

function controlCheckedTypesOfThemes() {
	"use strict";
	var count,
		lastIndex;
	count = 0;
	for (var i = 0; i < checkBoxTheme.length && count < 2; i++) {
		if (checkBoxTheme[i].checked === true) {
			count++;
			lastIndex = i;
		}
	}
	if (count === 1) {
		controlCheckedTypesOfThemes.lastIndex = lastIndex;
		checkBoxTheme[lastIndex].disabled = true;
	} else if (controlCheckedTypesOfThemes.lastIndex !== -1) {
		checkBoxTheme[controlCheckedTypesOfThemes.lastIndex].disabled = false;
		controlCheckedTypesOfThemes.lastIndex = -1;
	}
}

// Show test word card.
function testWordCard() {
	"use strict";
	var choosenTheme;
	choosenTheme = chooseTheme();
	drawCard("Word", "Translation", choosenTheme, settingsArray);
	increaseCurrentThemeNumber();
	return false;
}

// Show test Notification.
function testNotification() {
	"use strict";
	chrome.runtime.sendMessage({type: "showNotification"});
	return false;
}

// Show state of settings next to the "Save" button.
function showSettingsState(state) {
	"use strict";
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

// Invokes "showSettingsState" with delay.
function showSettingsStateDelayed(state, delay) {
	"use strict";
	setTimeout(function () {
		showSettingsState(state);
	}, delay);
}

// It shows warning massege when user switch "Append" to "Replace".
function showReplaceWarning() {
	var span;
	importType = document.getElementsByName("importType");
	span = document.createElement("span");
	span.id = "warningMessage";
	span.innerHTML = "<br>Warning! Your current dictionary will be lost.";
	importType[1].parentNode.appendChild(span);
}

// It hides warning massege when user switch "Replace" to "Append".
function hideReplaceWarning() {
	var span;
	span = document.getElementById("warningMessage");
	if (span) {
		span.remove();
	}
}

// Download the file with data when the button is pressed. It is used to export the Dictionary.
function exportDictionaryFile() {
	"use strict";
	var a;
	a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([localStorage.getItem("dictionaryArray")], {type: "application/json"}));
	a.download = "yourDictionary.json";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	showSettingsStateDelayed("Dictionary have been exported!", 1000);
}

// Replace or merge dictionary.
function importDictionaryFile(e) {
	"use strict";
	var i,
		file,
		fileReader;
	file = e.target.files[0];
	if (file !== undefined && file.type === "application/json") {
		fileReader = new FileReader();
		fileReader.onload = function (e) {
			var result,
				dictionaryArray;
			try {
				result = JSON.parse(e.target.result);
				if (!Array.isArray(result)) {
					throw new Error("Parsed object is not an array");
				} else {
					for (i = 0; i < result.length; i++) {
						if (!result[i].hasOwnProperty("word") || !result[i].hasOwnProperty("translation")) {
							throw new Error("Parsed array does not have appropriate property");
						}
					}
				}
				dictionaryArray = localStorage.getItem("dictionaryArray");
				dictionaryArray = JSON.parse(dictionaryArray);
				if (JSON.parse(localStorage.getItem("switchState")) !== false) {
					if (result.length === 0) {
						chrome.runtime.sendMessage({type: "stopInterval"});
					} else if (dictionaryArray.length === 0) {
						chrome.runtime.sendMessage({type: "startInterval"});
					}
				}
				importType = document.getElementsByName("importType");
				if (importType[0].checked) {
					for(i = 0; i < result.length; i++) {
						dictionaryArray.push(result[i]);
					}
					localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
					localStorage.setItem("dictionaryArrayQueue", JSON.stringify([]));
				} else if (importType[1].checked) {
					localStorage.setItem("dictionaryArray", e.target.result);
					localStorage.setItem("dictionaryArrayQueue", JSON.stringify([]));
				}
				showSettingsStateDelayed("Dictionary have been imported!", 500);
			} catch(error) {
				showSettingsStateDelayed("It is not a Dictionary format file!", 500);
			} finally {
				// It allows to load the same file twise.
				inputImport.value = null;
			}
		};
		fileReader.readAsText(file);
	}
	else {
		showSettingsStateDelayed("It is not a Dictionary format file!", 500);
	}
}

// Save settings.
function save() {
	"use strict";
	selectInterval = document.getElementById("selectInterval");
	selectDelay = document.getElementById("selectDelay");
	showClose = document.getElementById("showClose");
	showBlur = document.getElementById("showBlur");
	settingsArray = localStorage.getItem("settingsArray");
	settingsArray = JSON.parse(settingsArray);
	currentThemeNumber = localStorage.getItem("currentThemeNumber");
	currentThemeNumber = JSON.parse(currentThemeNumber);
	settingsArray.selectInterval = selectInterval.selectedIndex + 1;
	settingsArray.selectDelay = selectDelay.selectedIndex + 1;
	settingsArray.showClose = showClose.checked;
	settingsArray.showBlur = showBlur.checked;
	settingsArray.showNativeCardsChecked = showNativeCards.checked;
	settingsArray.showNativeCardsDisabled = showNativeCards.disabled;
	settingsArray.showNotificationCardsChecked = showNotificationCards.checked;
	settingsArray.showNotificationCardsDisabled = showNotificationCards.disabled;
	settingsArray.showTimeline = showTimeline.checked;
	selectedThemes = [];
	for (var i = 0; i < checkBoxTheme.length; i++) {
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
	"use strict";
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
	exportDictionary = document.getElementById("exportDictionary");
	inputImport = document.getElementById("inputImport");
	importType = document.getElementsByName("importType");
	checkBoxTheme = document.getElementsByClassName("checkBoxTheme");
	settingsArray = localStorage.getItem("settingsArray");
	settingsArray = JSON.parse(settingsArray);
	themes = localStorage.getItem("themes");
	themes = JSON.parse(themes);
	selectedThemes = localStorage.getItem("selectedThemes");
	selectedThemes = JSON.parse(selectedThemes);
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
	if (themes) {
		for (i = 0; i < themes.length; i++) {
			var p,
				label,
				span,
				input;
			span = document.createElement("span");
			span.className = "colorSquare";
			span.id = "color" + i;
			span.style.backgroundColor = themes[i].match(/#wordCard8730011\s?{\s?background-color\s?:\s?(#\w{3,6})\s?;\s?}/)[1];
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
	for (i = 0; i < selectedThemes.length; i++) {
		checkBoxTheme[selectedThemes[i]].checked = true;
	}
	if (selectedThemes.length == 1) {
		controlCheckedTypesOfThemes.lastIndex = selectedThemes[0];
		checkBoxTheme[selectedThemes[0]].disabled = true;
	}
	for (i = 0; i < checkBoxTheme.length; i++) {
		checkBoxTheme[i].onchange = controlCheckedTypesOfThemes;
	}
};