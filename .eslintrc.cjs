module.exports = {
    "env": {
        "es2021": true,
        "node": true
    },
    "extends": "standard-with-typescript",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": './tsconfig.json'
    },
    "rules": {
        "@typescript-eslint/semi": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/comma-dangle": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
    }
}
