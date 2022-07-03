// ==UserScript==
// @name         YouTube Unclutter
// @version      0.1
// @description  This little script aims clean up the YouTube UI by removing unnecessary elements.
// @author       TibixDev
// @match        https://www.youtube.com/*
// @icon         https://i.imgur.com/aAEvYbj.png
// @grant        GM_addStyle
// ==/UserScript==

(async function () {
    'use strict';
    console.log("[YT-Unclutter] YouTube Unclutter script loaded");

    function setButtonBarInterval() {
        return setInterval(() => {
            if (document.querySelector("#info>#menu-container>#menu>ytd-menu-renderer>#top-level-buttons-computed>ytd-toggle-button-renderer")) {
                console.log("[YT-Unclutter] Menu container found, executing...");
                doUnclutter()
            }
        }, 1000);
    }

    // DJB2 hashing function
    // Credit: https://gist.github.com/eplawless/52813b1d8ad9af510d85?permalink_comment_id=3367765#gistcomment-3367765
    function djb2(str) {
        let len = str.length
        let h = 5381

        for (let i = 0; i < len; i++) {
            h = h * 33 ^ str.charCodeAt(i)
        }
        return h >>> 0
    }

    let waitForButtonBar = null;

    let location = window.location.href;
    if (location.match(/^https:\/\/www\.youtube\.com\/watch\?v=([^&]*)/)) {
        waitForButtonBar = setButtonBarInterval();
    }

    let waitForUrlChange = setInterval(() => {
        if (location !== window.location.href && window.location.href.includes("watch?v=") && !waitForButtonBar) {
            console.log("[YT-Unclutter] Video URL detected, uncluttering...");
            waitForButtonBar = setButtonBarInterval();
            location = window.location.href;
        }
    }, 1000);

    function doUnclutter() {
        clearInterval(waitForButtonBar);
        waitForButtonBar = null;
        const ytButtonsParent = document.querySelector("#info>#menu-container>#menu>ytd-menu-renderer>#top-level-buttons-computed");
        const ytButtons = [...ytButtonsParent.children];

        console.log(`[YT-Unclutter] Found ${ytButtons.length} native YT buttons`);
        console.log(ytButtons);

        const buttonHashes = {
            like: 4121615887,
            dislike: 1508558179,
            share: 3222078241,
            download: 668597389,
            thank: 3561708383,
            clip: 1038096254,
            save: 2447476316
        }

        let buttonsToRemove = ["share", "download", "thank", "clip"];

        let fakeIndex = 0;
        for (let i = 0; i < ytButtons.length; i++) {
            let button = ytButtons[i];
            let buttonHash = djb2(button.querySelector("path").getAttribute("d"));
            console.log(`Button #${fakeIndex} has hash: ${buttonHash}`);
            for (let buttonType of buttonsToRemove) {
                if (buttonHash === buttonHashes[buttonType]) {
                    console.log(`[YT-Unclutter] Removing ${buttonType} button (#${fakeIndex} - ${buttonHash})`);
                    button.remove();
                    break;
                }
            }
            fakeIndex++;
        }

        //console.log(ytButtons);
        console.log("[YT-Unclutter] Uncluttering done");
    }
})();