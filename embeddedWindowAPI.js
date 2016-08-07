// Show simple window,
// parametr @text is a main content,
// parametr @textAlign is an align of main content,
// parametr @width is a width of window as a string,
// parametr @height is a height of window as a string.
function showSimpleWindow(text, textAlign, width, height) {
	"use strict";
	var span,
		simpleWindow,
		simpleWindowContent,
		frameDocument;
	simpleWindow = document.getElementById("simpleWindow");
	
	// In case of buttonWindow is already shown.
	if (simpleWindow !== null) {
		simpleWindow.remove();
	}
	span = document.createElement("span");
	span.innerHTML = text;
	simpleWindowContent = document.createElement("div");
	simpleWindowContent.id = "simpleWindowContent";
	simpleWindowContent.appendChild(span);
	simpleWindow = document.createElement("div");
	simpleWindow.id = "simpleWindow";
	simpleWindow.appendChild(simpleWindowContent);
	frameDocument = document.getElementsByTagName("iframe")[0].contentWindow.document;
	simpleWindow.style.width = width;
	simpleWindow.style.height = height;
	simpleWindowContent.style.textAlign = textAlign;
	frameDocument.getElementsByTagName("body")[0].appendChild(simpleWindow);
}

// Hide simple window.
function hideSimpleWindow() {
	"use strict";
	var frameDocument,
		simpleWindow;
	frameDocument = document.getElementsByTagName("iframe")[0].contentWindow.document;
	simpleWindow = frameDocument.getElementById("simpleWindow");
	if (simpleWindow !== null) {
		simpleWindow.remove();
	}
}

// Show window with the button,
// parametr @text is a main content,
// parametr @buttonText is a lable of button,
// parametr @textAlign is an align of main content,
// parametr @width is a width of window as a string,
// parametr @height is a height of window as a string,
// parametr @finalAction is an action that will be executed when button is pressed.
function showButtonWindow(text, buttonText, textAlign, width, height, finalAction) {
	"use strict";
	var frameDocument,
		span,
		a,
		buttonWindow,
		buttonWindowContent,
		buttonWindowButton;
	buttonWindow = document.getElementById("buttonWindow");
	
	// In case of buttonWindow is already shown.
	if (buttonWindow !== null) {
		buttonWindow.remove();
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
	buttonWindowContent.appendChild(span);
	buttonWindowContent.appendChild(a);
	buttonWindow = document.createElement("div");
	buttonWindow.id = "buttonWindow";
	buttonWindow.appendChild(buttonWindowContent);
	frameDocument = document.getElementsByTagName("iframe")[0].contentWindow.document;
	buttonWindow.style.width = width;
	buttonWindow.style.height = height;
	buttonWindowContent.style.textAlign = textAlign;
	frameDocument.getElementsByTagName("body")[0].appendChild(buttonWindow);
	buttonWindowButton = frameDocument.getElementById("buttonWindowButton");
	buttonWindowButton.onclick = function () {
		buttonWindow.remove();
		finalAction();
		return false;
	};
}