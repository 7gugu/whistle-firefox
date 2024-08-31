const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const pack = require("./package.json");

function modify_manifest(buffer, browser_type, version, mode) {
    // copy-webpack-plugin passes a buffer
    const manifest = JSON.parse(buffer.toString());
    manifest.manifest_version = 3;
    manifest.name = pack.name;
    manifest.author = pack.author;
    manifest.version = version;
    manifest.description = pack.description;
    manifest.action = {
        default_icon: {
            16: "unactive@16.png",
            48: "unactive@48.png",
            128: "unactive@128.png",
        },
        default_popup: "popup.html",
    };
    manifest.icons = {
        16: "active@16.png",
        48: "active@48.png",
        128: "active@128.png",
    };
    manifest.background = {
        scripts: ["js/backgroundPage.js"],
    };
    manifest.host_permissions = ["*://*/*"];
    manifest.incognito = "spanning";
    manifest.permissions = [
        "tabs",
        "activeTab",
        "scripting",
        "proxy",
        "storage",
        "notifications",
        "contextMenus",
    ];
    manifest.browser_specific_settings = {
        gecko: {
            id: "whistleSwicher@7gugu.com",
            strict_min_version: "91.1.0",
        },
    };

    // pretty print to JSON with two spaces
    return JSON.stringify(manifest, null, 2);
}

module.exports = (env, argv) => {
    if (!env.version) {
        console.error("lack of version");
        return;
    }
    const ver = env.version;
    return merge(common, {
        mode: "production",
        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: "src/manifest.json",
                        to: `${path.resolve(__dirname, "dist")}/manifest.json`,
                        transform(content, path) {
                            return modify_manifest(
                                content,
                                env.browser_type,
                                ver,
                                argv.mode,
                            );
                        },
                    },
                ],
            }),
        ],
    });
};
