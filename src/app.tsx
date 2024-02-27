import * as React from "react";
import * as ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import IndexPage from "./page/IndexPage";
import "./css/app.css";

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    ReactDOM.render(<IndexPage />, document.getElementById("popup"));
});
