/**
 * FormatterController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  
    format: async function (req, res) {
        // const colors = require('colors');
        // console.log("");
        // console.log("------------------------------------------");
        // console.log("");

        // const performance = require('perf_hooks').performance;
        // var a = performance.now();

        var formatter = req.body;

        if (typeof module.exports[formatter.type] !== 'function') return res.badRequest();
        var response =  module.exports[formatter.type](formatter.data);

        // var b = performance.now();

        formatter.result = response;

        // var now = new Date();
        // console.log(colors.yellow(now));
        // var execTime = (b - a) / 1000.0
        // if(execTime > 1) execTime = console.log('Execution time ' +colors.red(execTime)+ ' s.');
        // else console.log('Execution time ' +colors.green(execTime)+ ' s.');
        // console.log(formatter);
        
        return res.send({type: formatter.type, result: response});
    },

    validate: function (data, requiredKeys) {
        var valid = {status: true, keys: []}
        requiredKeys.forEach(function(item, index, arr) {
            if(!(item in data)  || data[item] == '') {
                if(valid.status) {
                    valid.status = false;
                    valid.msg = 'Required params';
                }
                valid.keys.push(item);
            }
        })
        return valid;
    },

    optional: function (data, optionalKeys, optionalValues) {
        optionalKeys.forEach(function(item, index, arr) {
            if(!(item in data)) {
                data[item] = optionalValues[index];
            }
        });
        return data;
    },

    /**
     * formatCurrency is used to format a number into currency..
     * @number number *Required Number you would like to format as a currency..
     * @string currency *Required Specify the currency to be used for formatting..
     * @string locale *Required Specify the locale to be used for the currency formatting..
     * @string format *Required Specify the format to be used for the currency formatting. Use the unicode currency symbol (¤) for special formatting options. Formatting rules can be found here: http://www.unicode.org/reports/tr35/tr35-numbers.html#Number_Format_Patterns..
     * 
     */

    formatCurrency(data) {
        //https://www.npmjs.com/package/number-format.js
        //https://github.com/smirzaei/currency-formatter/blob/master/currencies.json

        var numberFormatJs = require("number-format.js");

        var valid = module.exports.validate(data, ['number', 'currency', 'locale', 'format']);
        if(!valid.status) return valid;
        
        if(data.format.search('sym') != -1) {
            var symbol = module.exports.getCurrencySymbol(data.currency, data.locale);
            data.format = data.format.replace("sym", symbol);
        }
     
        return numberFormatJs(data.format, data.number); 
    },

    getCurrencySymbol(currency, locale) {
        let currencies = require('../../includes/currencies.json');
  
        if(!(currency in currencies)) return '';
        return currencies[currency].symbol;
    },

    /**
     * formatNumber is used to Format a number to a new style. Does not perform any rounding or padding of the number..
     * @number number *Required Number you would like to format..
     * @string decimalMark *Required [',' , '.'] The character the input uses to denote the decimal/fractional portion of the number..
     * @string group *Required for grouping the number..
     * @string decimal *Required to denote the decimal.
     * 
     */

    formatNumber(data) {

        var valid = module.exports.validate(data, ['number', 'decimalMark', 'group', 'decimal']);
        if(!valid.status) return valid;

        var numberFormatJs = require("number-format.js");
        var format = "#" + data.group + "##0" + data.decimal + "####";
        var index = data.number.lastIndexOf(data.decimalMark);
        if(index > 0) data.number = data.number.substring(0, index).replace(/[^\d]/g, '') + "." + data.number.substring(index + 1, data.number.length).replace(/[^\d]/g, '')
        return numberFormatJs(format, data.number);
    },

     /**
     * formatPhoneNumber is used to Format a phone number to a new style. The number should be a valid phone number for country code (default is US), or phone number will be returned unchanged.
     * @number number *Required Phone Number you would like to format to a new style..
     * @string format *Required format the phone number will be converted to..
     * @string countryCode *Required for Adding the country code..
     * @string formatType *Optional use to remove symbols..
     * 
     */

    formatPhoneNumber(data) {
        var awesomePhonenumber = require("awesome-phonenumber");//https://www.npmjs.com/package/awesome-phonenumber

        var valid = module.exports.validate(data, ['number', 'format', 'countryCode']);
        if(!valid.status) return valid;

        data = module.exports.optional(data, ['formatType'], ['default']);

        var phonenumber = new awesomePhonenumber(data.number, data.countryCode);
 
        if(!phonenumber.isValid()) return data.number;
        
        var phnnum = phonenumber.getNumber(data.format);

        if(phnnum === undefined) return data.number;  

        if(data.format == 'international' && data.formatType == 'noCoutryCode') {
            phnnum.replace('+' + phonenumber.getCountryCode(), "").trim();
        }else if(data.format == 'international' && data.formatType == 'noHyphens') {
            phnnum = phnnum.replace(/[-]/g, "").trim();
        }else if(data.format == 'national' && data.formatType == 'noParenthesis') {
            phnnum = phnnum.replace(/[()]/g, "").trim();
        }else if((data.format == 'international' || data.format == 'national') && data.formatType == 'nosymbol') {
            phnnum = phnnum.replace(/[^\d]/g, "").trim();
        }

        return phnnum;
    },


    /**
     * mathOperation Perform mathematical operations on value(s)
     * @array number *Required to perform operation..
     * @string operation *Required The math operation to perform..
     * 
     */
    mathOperation(data) {

        var valid = module.exports.validate(data, ['numbers', 'operation']);
        if(!valid.status) return valid;

        var result = 0;
        if(data.operation == 'add') {
            data.numbers.forEach(function(num, index) {
                if(index == 0) result = num;
                else result += num;
            });
        }else if(data.operation == 'subtract') {
            data.numbers.forEach(function(num, index) {
                if(index == 0) result = num;
                else result -= num;
            });
        }else if(data.operation == 'multiply') {
            data.numbers.forEach(function(num, index) {
                if(index == 0) result = num;
                else result *= num;
            });
        }else if(data.operation == 'divide') {
            data.numbers.forEach(function(num, index) {
                if(index == 0) result = num;
                else result /= num;
            });
        }else if(data.operation == 'negative') {
            data.numbers.forEach(function(num, index, arr) {
                if(arr.length == 1) result = Math.abs(num) * -1;
                else {
                    if(index == 0) result = [];
                    result.push(Math.abs(num) * -1);
                }
            });
        }
        return result;
    },

    /**
     * spreadsheetFormula Transform a number with a spreadsheet-style formula.
     * @string formula *Required Spreadsheet-style formula to evaluate. Example: ROUNDUP(100.1231, 2) * 100.
     * 
     */

    spreadsheetFormula(data) {
        var FormulaParser = require('hot-formula-parser').Parser;//https://www.npmjs.com/package/hot-formula-parser

        var valid = module.exports.validate(data, ['formula']);
        if(!valid.status) return valid;

        var parser = new FormulaParser();
        //Intialize boolean variables
        parser.setVariable('true', true);
        parser.setVariable('false', false);
        
        /** IFS Custom Function Added example: IFS('John' = '1John', 'Hello!', false, 'Goodbye!', true, IFS(false, 'Bye', true, 'It Works!'))*/

        parser.setFunction('IFS', function(params) {
            var val = '#N/A';
            for(var i = 0; i < params.length; i += 2) if(params[i]) {
                val = params[i+1];
                break;
            }
            return val;
        });

        parser.setFunction('SUBSTITUTE', function(params) {
            if (params.length < 2) {
                return '#Error';
            }

            text = params[0], old_text = params[1], new_text = params[2], occurrence = parseInt(params[3]);

            if(isNaN(occurrence)) occurrence = undefined;

            if (!text || !old_text || !new_text) {
                return text;
              } else if (occurrence === undefined) {
                return text.replace(new RegExp(old_text, 'g'), new_text);
              } else {
                var index = 0;
                var i = 0;
                while (text.indexOf(old_text, index) > 0) {
                  index = text.indexOf(old_text, index + 1);
                  i++;
                  if (i === occurrence) {
                    return text.substring(0, index) + new_text + text.substring(index + old_text.length);
                  }
                }
              }
        });

        /**IFS End */
        
        var response = parser.parse(data.formula);

        if(response.error !== null) return data.formula;

        return response.result;
    },
};

