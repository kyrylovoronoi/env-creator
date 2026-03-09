import js from "@eslint/js";
import globals from "globals";

export default [
    {
        ignores: ["dist/"]
    },
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            "padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "*", next: ["if", "for", "switch"] },
                { blankLine: "always", prev: ["if", "for", "switch"], next: "*" }
            ]
        }
    }
];
