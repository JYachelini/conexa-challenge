import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ['eslint.config.mjs', './@types', './src/**/*.decorator.ts', './src/modules/config/*'],
    },
    ...compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ),
    {
        plugins: {
            '@typescript-eslint': typescriptEslintEslintPlugin,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            parser: tsParser,
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },

        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/no-explicit-any': 'off',

            // TS errors
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],

            // Eslint off
            '@typescript-eslint/no-empty-object-type': 'off',
            'import/extensions': 'off',
            'import/prefer-default-export': 'off',
            'class-methods-use-this': 'off',
            'no-useless-constructor': 'off',
            'import/no-unresolved': 'off',
            'no-control-regex': 'off',
            'no-shadow': 'off',
            'import/no-cycle': 'off',
            'consistent-return': 'off',
            'no-underscore-dangle': 'off',
            'max-classes-per-file': 'off',
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'property',
                    format: null,
                    filter: {
                        // Matches common HTTP header patterns (kebab-case) or specific common headers
                        regex:
                            '^([A-Za-z0-9]+-)+[A-Za-z0-9]+$|^Set-Cookie$|^Content-Type$|^Authorization$|^User-Agent$|^Accept$|^Content-Length$|^Cache-Control$|^Expires$|^Date$|^Location$|^ETag$',
                        match: true,
                    },
                },
                {
                    selector: 'parameter',
                    format: null,
                    filter: {
                        regex: '^_+$',
                        match: true,
                    },
                },
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    types: ['function'],
                    format: ['camelCase'],
                },
                {
                    selector: 'enum',
                    format: ['PascalCase'],
                    prefix: ['Enum'],
                    filter: {
                        regex: '^Enum[A-Z]',
                        match: true,
                    },
                },
                {
                    selector: 'enumMember',
                    format: ['UPPER_CASE'],
                },
                {
                    selector: 'class',
                    format: ['PascalCase'],
                },
                {
                    selector: 'classMethod',
                    format: ['camelCase'],
                },
                {
                    selector: ['variable', 'parameter', 'property'],
                    format: ['snake_case', 'camelCase'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    prefix: ['I'],
                },
                {
                    selector: 'typeAlias',
                    format: ['PascalCase'],
                    prefix: ['T'],
                    filter: {
                        regex: '^T[A-Z]',
                        match: true,
                    },
                },
                {
                    selector: 'variable',
                    types: ['boolean'],
                    format: ['snake_case'],
                    prefix: ['is_', 'has_', 'should_', 'can_', 'did_', 'will_', 'exists'],
                },
                {
                    selector: 'property',
                    filter: {
                        regex: '^(statusCode|body)$',
                        match: true,
                    },
                    format: ['camelCase'],
                },
            ],
        },
    },
    {
        files: ['**/*.dto.ts'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'class',
                    format: ['PascalCase'],
                    suffix: ['Dto'],
                },
            ],
        },
    },
    {
        files: ['**/*.service.ts'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'class',
                    format: ['PascalCase'],
                    suffix: ['Service'],
                },
            ],
        },
    },
    {
        files: ['**/*.repository.ts'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'class',
                    format: ['PascalCase'],
                    suffix: ['Repository'],
                },
            ],
        },
    },
];
