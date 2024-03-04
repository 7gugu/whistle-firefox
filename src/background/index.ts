import { setBadge } from "@src/utils";
import browser from "webextension-polyfill";

// // Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener((request: { activeRules: number }) => {
    setBadge(request.activeRules);
});
// // @ts-ignore
// window.browser.browserAction.onClicked.addListener(() => {
//     browser.browserAction.setBadgeText({ text: "1" });
// });
