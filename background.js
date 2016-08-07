var settingsArray,
	// Duplicate of dictionaryArray in localStorage but it is needed for provide
	// temporary storage for special algorithm which shows word cards.
	intervalIdShowing,
	timeoutIdNotification,
	intervalTime,
	stopSign;
	
function showNotification(word, translation, settingsArray) {
	"use strict";
	var options,
		showTimeline,
		_notificationId,
		progressCounter,
		intervalIdNotification;
	options = {
		type: "progress",
		title: "EachWord",
		message: word + " — " + translation,
		iconUrl: "images/icons/iconNotification128.png",
		// In order to increase showing time without recreating.
		priority: 2,
		progress: 0
	};
	showTimeline = settingsArray.showTimeline;
	if (!showTimeline) {
		options.type = "basic";
		delete options.progress;
	}
	_notificationId = "wordCard" + Math.floor(Math.random() * 9999999);
	chrome.notifications.create(_notificationId, options);
	progressCounter = 0;
	intervalIdNotification = setInterval(function () {
		if (progressCounter < 100) {
			progressCounter++;
			if (showTimeline) {
				options.progress++;
			}
		} else {
			chrome.notifications.clear(_notificationId);
			clearInterval(intervalIdNotification);
		}
		chrome.notifications.update(_notificationId, options);
	// In order to reduce losses in the division: settingsArray["selectDelay"] * 10 == settingsArray["selectDelay"] / 100 * 1000.
	}, settingsArray.selectDelay * 10);
	chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
		if (notificationId === _notificationId) {
			if (byUser) {
				chrome.notifications.clear(_notificationId);
				clearInterval(intervalIdNotification);
			} else if (progressCounter < 100) {
				chrome.notifications.create(_notificationId, options);
			}
		}
	});
}

// This function will be executed when the time to show comes.
function showWord() {
	"use strict";
	var chosenWord;
	chosenWord = chooseWord();
	if (settingsArray.showNotificationCardsChecked) {
		timeoutIdNotification = setTimeout(function () {
			// Defined in "commonFunction.js".
			showNotification(chosenWord.word, chosenWord.translation, settingsArray);
		}, 1000);
	}
	if (settingsArray.showNativeCardsChecked) {
		chrome.tabs.query({"active": true, "currentWindow": true},
			function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {
					type: "showWord",
					settingsArray: settingsArray,
					wordArray: chosenWord
				});
			});
	}
}

function setIcon() {
	"use strict";
	var switchState;
	switchState = localStorage.getItem("switchState");
	switchState = JSON.parse(switchState);
	if (switchState) {
		chrome.browserAction.setIcon({path: "images/default_icons/icon38.png"});
	} else {
		chrome.browserAction.setIcon({path: "images/default_icons/icon38_(without_color).png"});
	}
}

function checkDictionary() {
	"use strict";
	var dictionaryArrayQueue;
	dictionaryArrayQueue = localStorage.getItem("dictionaryArrayQueue");
	dictionaryArrayQueue = JSON.parse(dictionaryArrayQueue);
	return dictionaryArrayQueue;
}

function checkSettings() {
	"use strict";
	var settingsArray;
	settingsArray = localStorage.getItem("settingsArray");
	settingsArray = JSON.parse(settingsArray);
	return settingsArray;
}

// In case of it is first application launch or there were some troubles with lockalStorage.
function checkStorage() {
	"use strict";
	var settingsArray,
		dictionaryArray,
		dictionaryArrayQueue,
		switchState,
		fromLanguage,
		intoLanguage,
		versionArray,
		welcomeIsShown;
	settingsArray = localStorage.getItem("settingsArray");
	dictionaryArray = localStorage.getItem("dictionaryArray");
	dictionaryArrayQueue = localStorage.getItem("dictionaryArrayQueue");
	switchState = localStorage.getItem("switchState");
	fromLanguage = localStorage.getItem("fromLanguage");
	intoLanguage = localStorage.getItem("intoLanguage");
	versionArray = localStorage.getItem("versionArray");
	welcomeIsShown = localStorage.getItem("welcomeIsShown");
	if (!settingsArray) {
		settingsArray = {};
	} else {
		settingsArray = JSON.parse(settingsArray);
	}
	if (!(settingsArray.hasOwnProperty("selectInterval"))) {
		settingsArray.selectInterval = 5;
	}
	if (!(settingsArray.hasOwnProperty("selectDelay"))) {
		settingsArray.selectDelay = 6;
	}
	if (!(settingsArray.hasOwnProperty("showClose"))) {
		settingsArray.showClose = true;
	}
	if (!(settingsArray.hasOwnProperty("showBlur"))) {
		settingsArray.showBlur = false;
	}
	if (!(settingsArray.hasOwnProperty("showNativeCardsChecked"))) {
		settingsArray.showNativeCardsChecked = true;
	}
	if (!(settingsArray.hasOwnProperty("showNotificationCardsChecked"))) {
		settingsArray.showNotificationCardsChecked = true;
	}
	if (!(settingsArray.hasOwnProperty("showNativeCardsDisabled"))) {
		settingsArray.showNativeCardsDisabled = false;
	}
	if (!(settingsArray.hasOwnProperty("showNotificationCardsDisabled"))) {
		settingsArray.showNotificationCardsDisabled = false;
	}
	if (!(settingsArray.hasOwnProperty("showTimeline"))) {
		settingsArray.showTimeline = true;
	}
	localStorage.setItem("settingsArray", JSON.stringify(settingsArray));
	if (!dictionaryArray) {
		dictionaryArray = [];
		localStorage.setItem("dictionaryArray", JSON.stringify(dictionaryArray));
	}
	if (!dictionaryArrayQueue) {
		dictionaryArrayQueue = [];
		localStorage.setItem("dictionaryArrayQueue", JSON.stringify(dictionaryArrayQueue));
	}
	if (!switchState) {
		switchState = true;
		localStorage.setItem("switchState", JSON.stringify(switchState));
	}
	if (!fromLanguage) {
		fromLanguage = "";
		localStorage.setItem("fromLanguage", JSON.stringify(fromLanguage));
	}
	if (!intoLanguage) {
		intoLanguage = "";
		localStorage.setItem("intoLanguage", JSON.stringify(intoLanguage));
	}
	if (!versionArray) {
		versionArray = [];
		localStorage.setItem("versionArray", JSON.stringify(versionArray));
	}
	if (!welcomeIsShown) {
		welcomeIsShown = false;
		localStorage.setItem("welcomeIsShown", JSON.stringify(welcomeIsShown));
	}
}

// Listener will be activated when user adds or deletes words from dictionary.
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		"use strict";
		if (request.type === "changeDictionary") {
			dictionaryArrayQueue = checkDictionary();
		}
	}
);

// Listener will be activated when user stops showing word cards.
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		"use strict";
		if (request.type === "stopInterval") {
			clearInterval(intervalIdShowing);
			stopSign = true;
		}
	}
);

// Listener will be activated when user starts showing word cards.
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		"use strict";
		if (request.type === "startInterval") {
			var switchState = localStorage.getItem("switchState");
			switchState = JSON.parse(switchState);
			if (switchState) {
				stopSign = false;
				intervalIdShowing = setInterval(showWord, intervalTime);
			}
		}
	}
);

// Listener will be activated when user presses "Show Notification" in "options.js".
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		"use strict";
		if (request.type === "showNotification") {
			showNotification("Word", "Translation", settingsArray);
		}
	}
);

// Listener will be activated when user makes different kind of changes of settings.
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		"use strict";
		if (request.type === "changeSettings") {
			settingsArray = checkSettings();
			intervalTime = settingsArray.selectInterval * 1000 * 60 + settingsArray.selectDelay * 1000;
			if (!stopSign) {
				clearInterval(intervalIdShowing);
				intervalIdShowing = setInterval(showWord, intervalTime);
			}
		}
	}
);

// Listener will be activated when "content.js" sends message to make sure that word card
// will be shown as native card and it may disable push notification showing.
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		"use strict";
		if (request.type === "wordCardShown") {
			clearTimeout(timeoutIdNotification);
		}
	}
);

// Initialization.
checkStorage();
setIcon();
settingsArray = checkSettings();
dictionaryArrayQueue = checkDictionary();
intervalTime = settingsArray.selectInterval * 1000 * 60 + settingsArray.selectDelay * 1000;
// Start interval if it is possible.
if (JSON.parse(localStorage.getItem("dictionaryArray")).length !== 0 && JSON.parse(localStorage.getItem("switchState")) !== false) {
	intervalIdShowing = setInterval(showWord, intervalTime);
	stopSign = false;
} else {
	stopSign = true;
}