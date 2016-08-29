import camelCase from 'camel-case';

import { Exector } from './exector';
import { filter, pick } from './util';

const currentYear = new Date().getFullYear();

const defaultOptions = {
    type: 'payroll',
    incomeType: 'gross',
    taxYear: (currentYear - 1)  + '_' + currentYear,
    period: 'monthly',
    fromCurrency: null,
    toCurrency: null,
    exchangeRate: 1
};

/**
 * The base class for easier implementation of Calctorable interface to be used with the @{Taxer} class.
 *
 * interface Tax {
 *   taxRate: Number
 *   taxableIncome: Number
 *   taxAmount: Number
 * }
 *
 *
 * interface TaxInfo {
 *   type: 'payroll' || String
 *   incomeType: 'gross' || 'net'
 *   taxYear: Number || String
 *   period: 'monthly' || 'yearly'
 *   taxableIncome: Number
 *   taxAmount: Number
 *   netIncome: Number
 *   taxBand: [<Tax>]
 * }
 *
 *
 * interface Calctorable {
 *   isMatched(countryCode, income, options={}): boolean
 *   calc(income, options): TaxInfo
 * }
 */
export class Calctor extends Exector {

    get defaultOptions() {
        return defaultOptions;
    }

    /**
     * By default, no country codes supported
     * @returns {Array}
     */
    get supportedCountryCodes() {
        return [];
    }

    get supportedIncomeRange() {
        return [0, Infinity];
    }


    isMatched(countryCode, income=0, options={}) {
        return (this.isCountryCodeMatched(countryCode) &&
                this.isIncomeMatched(income) &&
                this.isOptionsMatched(options)) ||
                this.isCombinationMatched(countryCode, income, options);
    }

    isCountryCodeMatched(countryCode) {
        if (typeof countryCode === 'string') {
            countryCode = countryCode.toLowerCase();
        }
        return this.supportedCountryCodes.indexOf(countryCode) > - 1;
    }

    isIncomeMatched(income) {
        const [rangeStart, rangeEnd] = this.supportedIncomeRange;
        return rangeStart <= income && income <= rangeEnd;
    }

    isOptionsMatched(options) {
        return true;
    }

    isCombinationMatched(countryCode, income, options) {
        return false;
    }

    /**
     * Gets processed income
     *
     * @param income
     * @returns {*}
     */
    processedIncome(income) {
        this.income = income;
        return this.income;
    }

    /**
     * Gets processed options
     *
     * @param options
     * @returns {*}
     */
    processedOptions(options) {
        this.options = Object.assign({}, this.defaultOptions, options);
        return this.options;
    }

    /**
     * Gets processed tax info
     *
     * @param taxInfo
     */
    processedTaxInfo(taxInfo) {
        this.taxInfo = Object.assign({}, pick(this.options, ...Reflect.ownKeys(defaultOptions)));
        return Object.assign(this.taxInfo, taxInfo);
    }

    /**
     * Default calc hooks definitions.
     * subclasses could override this to define more hooks
     */
    getCalcHooks(income, options) {
        // define the hook methods of pattern for subclass to implement
        // 0. period+IncomeType+Type+taxYear+Calc(income, options)
        // 1. period+IncomeType+Type+Calc(income, options)
        // 2. incomeType+Type+Calc(income, options)
        // 3. type+Calc(income, options)
        // 4. doCalc(income, options)
        // 5. throw 'Not Implemented'
        const pittc = camelCase(['do', options.period, options.incomeType, options.type, options.taxYear, 'Calc'].join(' '));
        const pitc = camelCase(['do', options.period, options.incomeType, options.type, 'Calc'].join(' '));
        const itc = camelCase(['do', options.incomeType, options.type, 'Calc'].join(' '));
        const tc = camelCase(['do', options.type, 'Calc'].join(' '));

        return [pittc, pitc, itc, tc, 'doCalc'];
    }

    calc(income, options={}) {
        income = this.processedIncome(income);
        options = this.processedOptions(options);

        const matchedHooks = filter(this.getCalcHooks(income, options), method => {
            if (typeof this[method] === 'function') {
                throw 'break';
            };
            return false;
        });

        if (matchedHooks.length > 0) {
            return this.processedTaxInfo(this[matchedHooks[0]](income, options));
        } else {
            throw 'Not Implemented';
        }
    }

}
