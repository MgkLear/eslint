const indent = ['error', 4];

module.exports = {
    rules: {
        /* eslint-disable quote-props */
        'semi': 'error',
        '@typescript-eslint/semi': 'off',
        '@typescript-eslint/indent': indent,
        'react/jsx-indent': indent,
        'react/jsx-indent-props': indent,
        'react/jsx-props-no-spreading': 'off',
        'import/prefer-default-export': 'off',
        'react/function-component-definition': ['error', {
            'namedComponents': ['function-declaration', 'arrow-function'],
            'unnamedComponents': ['function-expression', 'arrow-function'],
        }],
    },
};
