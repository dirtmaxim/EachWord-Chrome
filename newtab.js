let settingsArray = JSON.parse(localStorage.getItem("settingsArray"));

// If user disable EachWord new tab, then redirect him to a standard one.
if (!settingsArray.enableNewTab) {
    chrome.tabs.update({
        url: "chrome-search://local-ntp/local-ntp.html"
    });
} else {
    $("html").css("visibility", "visible");
}

window.onload = function () {
    let $words = $("#words");
    let dictionaryArray = JSON.parse(localStorage.getItem("dictionaryArray"));
    let dictionaryArrayTab;
    let chosenWord;

    if (dictionaryArray.length !== 0) {
        dictionaryArrayTab = JSON.parse(localStorage.getItem("dictionaryArrayTab"));
        chosenWord = chooseWord(dictionaryArrayTab, "dictionaryArrayTab", "lastWordTab");
        $words.html("<span id='word'>" + chosenWord.word +
            "</span><a href='' id='playWordButton' title='Listen' tabindex='-1'></a><span id='dash'> &mdash; </span><span id='translation'>" +
            chosenWord.translation + "</span>");
        $("#playWordButton").on("click", function () {
            playWord($("#word").text());
            return false;
        })
    } else {
        $words.html("First of all, add some words to EachWord<br>and see what will happen <img src=\"images/smiles/sunglasses.svg\" width=\"26\">");
    }
};