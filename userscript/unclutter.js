// ==UserScript==
// @name         YouTube Unclutter
// @version      0.2
// @description  This little script aims clean up the YouTube UI by removing unnecessary elements.
// @author       TibixDev
// @match        https://www.youtube.com/*
// @icon         https://i.imgur.com/aAEvYbj.png
// @license      MIT
// @homepageURL  https://github.com/TibixDev/YTUnclutter
// ==/UserScript==

(async function () {
    'use strict';
    console.log("[YT-Unclutter] YouTube Unclutter script loaded");

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

    // Wait for DOM element function
    // Credit: https://stackoverflow.com/a/61511955/10771609
    function waitForElem(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
    
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });
    
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    function waitForAllElemChildrenToMatchSelector(element, selector) {
        return new Promise(resolve => {
            function detect() {
                let children = [...element.children];
                if (children.length > 0) {
                    for (let i = 0; i < children.length; i++) {
                        //if (!children[i].querySelector(selector)) {
                        //    return false;
                        //}
                        if (!children[i].getElementsByTagName(selector).length) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }

            if (detect()) {
                resolve();
            }
    
            const observer = new MutationObserver(mutations => {
                if (detect()) {
                    resolve();
                    observer.disconnect();
                }
            });
    
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    let titleElem = (await waitForElem("h1.title.ytd-video-primary-info-renderer>*"));
    let title = '';
    console.log("Title is: " + title);

    let previousUrl = '';
    const observer = new MutationObserver(async function (mutations) {
        if (window.location.href !== previousUrl && title !== titleElem.innerText) {
            console.log(`URL changed to ${window.location.href}`);
            console.log(`Old title was ${title}, changed to ${titleElem.innerText}`);
            title = titleElem.innerText;
            previousUrl = window.location.href;
            if (window.location.href.includes("watch?v=")) {
                console.log("[YT-Unclutter] Video URL detected, uncluttering...");                
                waitForElem("#top-level-buttons-computed path")
                    .then(async () => {
                        console.log("[YT-Unclutter] Found first path element...");  
                        await doUnclutter();
                    })

            }
        }
    });
    const config = { subtree: true, childList: true };
    observer.observe(document, config);

    async function doUnclutter() {
        let ytButtonsParent = document.querySelector("#info>#menu-container>#menu>ytd-menu-renderer>#top-level-buttons-computed");
        let ytButtons = [...ytButtonsParent.children];
        await waitForAllElemChildrenToMatchSelector(ytButtonsParent, "path")
        console.log("[YT-Unclutter] Detected path for all ytButtonsParent children");

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
        console.log(`[YT-Unclutter] Removing ${ytButtons.length} buttons`);
        for (let i = 0; i < ytButtons.length; i++) {
            let button = ytButtons[i];
            console.log(`Iter #${i} | Button: ${!!button}`)
            let buttonHash = djb2(button.getElementsByTagName("path")[0].getAttribute("d"));
            console.log(`Button #${i} has hash: ${buttonHash}`);
            for (let buttonType of buttonsToRemove) {
                if (buttonHash === buttonHashes[buttonType]) {
                    console.log(`[YT-Unclutter] Removing ${buttonType} button (#${i} - ${buttonHash})`);
                    button.remove();
                    break;
                }
            }
        }

        console.log(ytButtons);
        console.log("[YT-Unclutter] Uncluttering done");
    }
})();