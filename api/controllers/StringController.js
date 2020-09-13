/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    format: async function (req, res) {
        var formatter = req.body;
        console.log(formatter)
        if (typeof module.exports[formatter.type] !== 'function') return res.badRequest();
        var response =  module.exports[formatter.type](formatter.data);
        
        return res.send({type: formatter.type, result: response});
    },

    validate: function (data, requiredKeys) {
        var valid = {status: true, keys: []}
        requiredKeys.forEach(function(item, index, arr) {
            if(!(item in data) || data[item] == '') {
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

    IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },

    /**
     * capitalize first character in the string..
     * @string text *Required to capitalize..
     * @bool lower *Optional default TRUE if text is already in Uppercase 'HELLOW WORLD' then it'll convert it to 'Hellow World' else if lower is false it'll return 'HELLOW WORLD'...
    */

    capitalize: function (data) {

        var valid = module.exports.validate(data, ['text']);
        
        if(!valid.status) return valid;
        data = module.exports.optional(data, ['lower'], [true]);

        return (data.lower ? data.text.toLowerCase() : data.text).replace(/(?:^|\s)\S/g, function(a) {
            return a.toUpperCase();
        });
   },

    /**
     * markToHTML is used to replace special character to HTML tag.
     *  @string text *Required to mark..
     */
    markToHTML: function (data) {
        //https://ourcodeworld.com/articles/read/396/how-to-convert-markdown-to-html-in-javascript-using-remarkable

        var {Remarkable} = require('remarkable');
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        var md = new Remarkable();

        return md.render(data.text);
    },

    /**
     * convertToASCII replace ALL non-ASCII characterS..
     *  @string text *Required to replace..
     *  @string replaceBy *Optional to replace by.
     */
    convertToASCII: function (data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;
        data = module.exports.optional(data, ['replaceBy'], ['']);
        return data.text.replace(/[^\x00-\x7F]/g, data.replaceBy);
    },

    /**
     * extractEmail extract from string..
     * @string text *Required to extract email..
     */
    extractEmail: function (data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;
        // return this.string.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
        return data.text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    },

    /**
     * extractNumber extracts number/digit from string..
     * @string text *Required to extract email..
     * @string replaceBy *Optional to replace by.
     */
    extractNumber: function (data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;
        data = module.exports.optional(data, ['replaceBy'], ['']);
        return data.text.replace(/\D+/g, data.replaceBy);
    },

    /**
     * extractPattern  extracts regex from string..
     * @string text *Required to extract email..
     * @regex pattern *Required to extract..
     * Use RegExp.prototype.toJSON = RegExp.prototype.toString to fix empty key when converting object to json..
     * 
     */
    extractPattern(data) {
        var valid = module.exports.validate(data, ['text', 'pattern']);
        if(!valid.status) return valid;
        try {
            return data.text.match(data.pattern);
        } catch(e) {
            return "Invalid regular expression";
        }
    },

    /**
     * extractPhoneNumber extracts phone numbers from string..
     * @string text *Required to extract phone number..
     */
    extractPhoneNumber(data) {
        //ref https://zapier.com/blog/extract-links-email-phone-regex/#regex
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        return data.text.match(/(?:(?:\+?([1-9]|[0-9][0-9]|[0-9][0-9][0-9])\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([0-9][1-9]|[0-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/gm);
    },

    /**
     * extractUrl extracts urls from string..
     * @string text *Required to extract URL..
     */
    extractUrl(data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        return data.text.match(/\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gm);
    },

    /**
     * Find the first position of a value in the text, -1 if the value is not found
     * @string text *Required to FIND..
     * @string search *Required to search..
     * @number start *optional to start search from..
     * 
     */
    find(data) {
        var valid = module.exports.validate(data, ['text', 'search']);
        if(!valid.status) return valid;

        data = module.exports.optional(data, ['start'], [0]);

        return data.text.indexOf(data.search, data.start);
    },

    /**
     * Get length of a string..
     * @string text *Required for length..
     */
    length(data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        return data.text.length;
    },

    /**
     * lower change string to lowercase..
     * @string text *Required for lowercase..
     */
    lowerCase(data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;
        
        return data.text.toLowerCase();
    },

    /**
     * Pluralize any English word (frog turns into frogs; child turns into children)..
     * @string text *Required to pluralize..
     */
    pluralize(data) {
        //ref // https://www.npmjs.com/package/pluralize
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        var plur = require('pluralize')
        return plur(data.text);
    },

    /**
     * stripTags remove HTML tags from string..
     * @string text *Required for strip tags..
     * 
     */
    stripTags(data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        return data.text.replace(/<[^>]*>?/gm, '');
    },

    /**
     * replace string..
     * @string text *Required for replace..
     */
    replace(data) {
        var valid = module.exports.validate(data, ['text', 'from', 'to']);
        if(!valid.status) return valid;

        // return data.text.replace(data.from, data.to);
        var regex = data.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        // "["+data.from+"]"
        return data.text.replace(new RegExp(regex, 'g'), data.to);
    },

    /**
     * split string by given separator and return index if provided..
     * @string text *Required for split..
     * @string separator *Required for seprate a string..
     * @string index *Optional Segment of text to return after splitting. (Default: First) for last text -1, second last -2, so on..
     * 
     */
    split(data) {
 
        var valid = module.exports.validate(data, ['text', 'separator']);
        if(!valid.status) return valid;

        data = module.exports.optional(data, ['index'], [0]);

        var splited = data.text.split(data.separator);

        if(data.index != null && parseInt(data.index) < 0) return splited[splited.length + parseInt(data.index)];
        else if(data.index != null && parseInt(data.index) >= 0) return splited[parseInt(data.index)];
        
        return splited;
    },

    /**
     * splitter string by given before or after seprator..
     * @string text *Required for split..
     * @string before separator for seprate a string..
     * @string after separator for seprate a string..
     * 
     */

    // splitter(data) {
 
    //     var valid = module.exports.validate(data, ['text']);
    //     if(!valid.status) return valid;

    //     data = module.exports.optional(data, ['before', 'after'], ["", ""]);
    //     var parsed = data.text;
    //     var re = {};

    //     if(data.after !== "") {
    //         re = new RegExp(data.after)
    //         console.log(parsed.split(/TEXT/i))
    //         parsed = parsed.split(/text/).pop().trim();
    //     }
    
    //     if(data.before !== "") {
    //         parsed = parsed.split(data.before)[0].trim();
    //     }

    //     return parsed;
    // },

    splitter(data) {
 
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        data = module.exports.optional(data, ['before', 'after'], ["", ""]);
        var parsed = data.text;
        
        if(data.after !== "") {
            var start = parsed.indexOf(data.after) != -1 ? parsed.indexOf(data.after) + data.after.length : 0;
            parsed = parsed.substring(start , parsed.length);
        }
    
        if(data.before !== "") {
            var end = parsed.indexOf(data.before) != -1 ? parsed.indexOf(data.before) : parsed.length;
            parsed = parsed.substring(0 , end);
        }

        return parsed.trim();
    },


    /**
     * titleCase convert string to title case..
     * @string text *Required for Title Case..
     * 
     */
    titleCase(data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        return data.text.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    },

    /**
     * trim white space..
     * @string text *Required for trimming..
     * 
     */
    trim(data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        return data.text.trim();
    },

    /**
     * Truncate Adds ellipse in the end of the string..
     * @string text *Required for truncate..
     * @number length *Required max length the text should be..
     * @number skip *optional default is 0 Will skip the first N characters in the text..
     * @bool end *optional default is false Will shorten text by three characters and append "..." to the end, if necessary.
     * @string ending *optional default is '...' Will add this "..." to the end..
     * 
     */
    truncate(data) {
        // str, length = 0, skip = 0, end = false, ending = '...'
        var valid = module.exports.validate(data, ['text', 'length']);
        if(!valid.status) return valid;

        data = module.exports.optional(data, ['skip', 'end', 'ending'], [0, false, '...']);
   
        var string = data.text.substring(data.skip, data.text.length);
        var endLen = 0;
        if(string.length > data.length && data.end) endLen = data.ending.length;
        if(string.length <= data.length || !data.end) data.ending = '';
        
        return string.substring(0, data.length - endLen) + data.ending;
    },

    /**
     * Decodes url from string.
     * @string url *Required for decode..
     * @bool url *Optional default is false Will convert "+" to spaces instead of converting "%20", and will not convert "/"..
     * 
     */
    urlDecode(data) {
        var valid = module.exports.validate(data, ['url']);
        if(!valid.status) return valid;

        data = module.exports.optional(data, ['plus'], [false]);

        eUrl = decodeURIComponent(data.url);
        
        if(data.plus) return eUrl.replace(/\+/g, " ");
        return eUrl;
    },


    /**
     * Encodes url from string..
     * @string url *Required for encode..
     * @bool url *Optional default is false Will convert spaces to "+" instead of "%20" and will not convert "/".
     */
    urlEncode(data) {
        var valid = module.exports.validate(data, ['url']);
        if(!valid.status) return valid;

        data = module.exports.optional(data, ['plus'], [false]);

        eUrl = encodeURIComponent(data.url);
        if(data.plus) return eUrl.replace(/%20/g, "+");
        return eUrl.replace(/%2F/g, "/");
    },

    /**
     * Word count on the string..
     * @string text *Required for count..
     */
    wordCount(data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        return data.text.split(' ').length;
    },

    /**
     * upper change string to uppercase..
     * @string text *Required for convert..
     */
    upperCase(data) {
        var valid = module.exports.validate(data, ['text']);
        if(!valid.status) return valid;

        return data.text.toUpperCase();
    },

};

