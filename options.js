var saveButton,
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
	settingsSaved;
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
// Show test word card.
function testWordCard() {
	"use strict";
	drawCard("Word", "Translation", settingsArray);
	return false;
}
// Show test Notification.
function testNotification() {
	"use strict";
	chrome.runtime.sendMessage({type: "showNotification"});
	return false;
}
// Save settings.
function save() {
	"use strict";
	selectInterval = document.getElementById("selectInterval");
	selectDelay = document.getElementById("selectDelay");
	showClose = document.getElementById("showClose");
	showBlur = document.getElementById("showBlur");
	settingsSaved = document.getElementById("settingsSaved");
	settingsArray = localStorage.getItem("settingsArray");
	settingsArray = JSON.parse(settingsArray);
	settingsArray.selectInterval = selectInterval.selectedIndex + 1;
	settingsArray.selectDelay = selectDelay.selectedIndex + 1;
	settingsArray.showClose = showClose.checked;
	settingsArray.showBlur = showBlur.checked;
	settingsArray.showNativeCardsChecked = showNativeCards.checked;
	settingsArray.showNativeCardsDisabled = showNativeCards.disabled;
	settingsArray.showNotificationCardsChecked = showNotificationCards.checked;
	settingsArray.showNotificationCardsDisabled = showNotificationCards.disabled;
	settingsArray.showTimeline = showTimeline.checked;
	localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
	settingsSaved.style.opacity = 1;
	window.getSelection().empty();
	settingsSaved.innerHTML = "Settings have been saved!";
	setTimeout(function settingsSavedDisappearing() {
		settingsSaved.style.opacity -= 0.05;
		if (settingsSaved.style.opacity > 0) {
			setTimeout(settingsSavedDisappearing, 10);
		}
	}, 3000);
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
	settingsArray = localStorage.getItem("settingsArray");
	settingsArray = JSON.parse(settingsArray);
	saveButton.onclick = save;
	showTestCard.onclick = testWordCard;
	showTestNotification.onclick = testNotification;
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
};