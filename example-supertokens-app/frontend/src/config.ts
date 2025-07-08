import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";

export function getApiDomain() {
    const apiPort = 3001;
    const apiUrl = `http://localhost:${apiPort}`;
    return apiUrl;
}

export function getWebsiteDomain() {
    const websitePort = 3000;
    const websiteUrl = `http://localhost:${websitePort}`;
    return websiteUrl;
}

export function initSuperTokensUI() {
    (window as any).supertokensUIInit("supertokensui", {
        appInfo: {
            // Call generated helper functions and include base paths
            websiteDomain: getWebsiteDomain(),
            apiDomain: getApiDomain(),
            appName: "SuperTokens Demo App",
            websiteBasePath: "/auth", // Add websiteBasePath
            apiBasePath: "/auth", // Add apiBasePath
        },
        recipeList: [
            (window as any).supertokensUISession.init(),
            (window as any).supertokensUIEmailPassword.init()
        ],
    });
}

export function initSuperTokensWebJS() {
    SuperTokens.init({
        appInfo: {
            appName: "SuperTokens Demo App",
            apiDomain: getApiDomain(),
            // websiteDomain is not needed for core SDK init
            apiBasePath: "/auth",
            // websiteBasePath is not needed for core SDK init
        },
        recipeList: [Session.init()]
    });
}