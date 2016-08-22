taxer
=====
[![Build Status](https://travis-ci.org/teracyhq/taxer.svg?branch=develop)](https://travis-ci.org/teracyhq/taxer)
[![Coverage Status](https://coveralls.io/repos/github/teracyhq/taxer/badge.svg?branch=develop)](https://coveralls.io/github/teracyhq/taxer?branch=develop)


universal tax calculator javascript library

Library Architecture
--------------------

It's designed with plugin mechanism and minimalist in mind. By default:

```
const taxer = new Taxer();
taxer.use(new CustomTaxer());
const taxInfo = taxer.calc(countryCode, income, options);
```

in which:

CustomTaxer should be a class which has:
- isMatched(countryCode, taxableIncome, options) method: to be hooked up if it is the first to return true.
- calc(taxableIncome, options) method: the taxInfo is calculated and returned.

If no matched taxer middleware, an error will be thrown.

For example:

```js

export class VnTaxer {
    constructor() {
    }

    calc(taxableIncome, options={}) {
        return {
            taxableIncome: taxableIncome
        }
    }

    isMatched(countryCode, income, options) {
        if (typeof countryCode === 'string') {
            countryCode = countryCode.toLowerCase();
        }
        return ['vn', 'vnm', 704, 'vietnam', 'viet nam'].indexOf(countryCode) > -1;
    }
}
```

That's how the library architecture works.


How to use
----------

1. Configure

    1.1. From the default taxer with built-in tax middleware:

    ```
    const taxer = defaultTaxer();
    // add more custom tax middleware function
    taxer.use(customTaxer());
    ```

    1.2. From scratch

    ```
    const taxer = new Taxer();
    taxer.use(VnTaxer());
    taxer.use(UsaTaxer());
    taxer.use(SgTaxer());
    taxer.use(customTaxer());
    ``` 

2. Use

```
const taxInfo = taxer.calc(countryCode, income, options);
console.log(taxInfo);
```


How to develop
--------------

This is the minimalist plugin architecture inspired by express.js and koa.js a lot.
Let's keep it as minimal and lightweight as possible.

Clone this repository and:

```
$ npm install
$ npm run test
```

How to contribute
-----------------

By writing custom tax plugins to create a good solid universal tax system throughout the world.

Follow Teracy workflow: http://dev.teracy.org/docs/workflow.html


References
----------

These are related similar projects we should take a look:

- https://github.com/rkh/income-tax

- https://www.npmjs.com/package/uk-income-tax


License
-------
MIT license. See LICENSE file.
