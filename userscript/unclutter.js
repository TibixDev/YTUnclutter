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
        const ytButtons = ytButtonsParent.children;
        const ytButtonsLen = ytButtonsParent.querySelectorAll("ytd-toggle-button-renderer").length 
                           + ytButtonsParent.querySelectorAll("ytd-button-renderer").length;
        
        console.log(`[YT-Unclutter] Found ${ytButtonsLen} native YT buttons`);

        // Remove Share button (Just copy the URL)
        ytButtons[2].remove();
        console.log("[YT-Unclutter] Removed 'Share' button.");

        // Remove Download button (Premium-only)
        ytButtons[2].remove();
        console.log("[YT-Unclutter] Removed 'Download' button.");

        // Remove Donate button
        if (ytButtonsLen === 7) {
            ytButtons[2].remove();
            console.log("[YT-Unclutter] Found & removed 'Donate' button.");
        }

        // Remove Clip button (Mostly unused)
        ytButtons[2].remove();
        console.log("[YT-Unclutter] Removed 'Clip' button.");

        console.log(ytButtons);
        console.log("[YT-Unclutter] Uncluttering done");
    }
})();