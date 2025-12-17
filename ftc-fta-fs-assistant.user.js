// ==UserScript==
// @name         FTC FTA/FS assistant
// @version      0.0.0
// @description  Augment the match cycle time with some FS fun stuff
// @author       Austin Frownfelter
// @match        http://localhost/event/*/schedule/
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    var waitForElement = function (selector, callback) {
        if ($(selector).length) {
            callback();
        } else {
            setTimeout(function () {
                waitForElement(selector, callback);
            }, 1000);
        }
    };

    waitForElement(pageLoadedIdentifier, function () {
        // TODO
    });
})();
