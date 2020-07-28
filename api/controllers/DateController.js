/**
 * DateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  

    format: async function (req, res) {
        var formatter = req.body;
        console.log(formatter);
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
     * dateOperation is used to Manipulate a date and/or time by adding/subtracting days, months, years, hours, minutes, seconds..
     * @date date *Required Date you would like to manipulate..
     * @string expression *Required Provide the amount of time you would like to add or subtract to the date (negative values subtract time). Examples: +8 hours 1 minute, +1 month -2 days, -1 day +8 hours..
     * @string toFormat *Required Provide the format that the date should be converted to..
     * @string fromFormat *Optional to denote the decimal.
     * 
     */

    dateOperation(data) {
        var valid = module.exports.validate(data, ['date', 'expression', 'toFormat']);
        if(!valid.status) return valid;
        data = module.exports.optional(data, ['fromFormat'], ['']);

        var strtotime = require("strtotime");//https://www.npmjs.com/package/strtotime
        var moment = require("moment");//https://www.npmjs.com/package/moment

        var time = moment(strtotime(data.expression, strtotime(data.date)));
        return time.format(data.toFormat);
    },

    /**
     * formatDate is used to Change a date or time to a new format or style.
     * @string toFormat *Required Provide the format that the date should be converted to..
     * @string fromZone *Optional the date should be converted from. (Default: UTC)
     * @string toZone *Optional the date should be converted to. (Default: UTC)
     * 
     */
    formatDate(data) {

        var valid = module.exports.validate(data, ['date', 'toFormat']);
        if(!valid.status) return valid;
        data = module.exports.optional(data, ['fromZone', 'toZone'], ['UTC', 'UTC']);

        var moment = require('moment-timezone');//https://www.npmjs.com/package/moment-timezone
        var server_offset = false;
        
        if(!isNaN(data.date)) {
            var epoch = parseInt(data.date);
            server_offset = 330;
            var outputtext = notices = '';
            if ((epoch >= 1E16) || (epoch <= -1E16)) {
                outputtext += "Assuming that this timestamp is in nanoseconds (1 billionth of a second)";
                epoch = Math.floor(epoch / 1000000);
            } else if ((epoch >= 1E14) || (epoch <= -1E14)) {
                outputtext += "Assuming that this timestamp is in microseconds (1/1,000,000 second)";
                epoch = Math.floor(epoch / 1000);
            } else if ((epoch >= 1E11) || (epoch <= -3E10)) {
                outputtext += "Assuming that this timestamp is in milliseconds";
            } else {
                outputtext += "Assuming that this timestamp is in seconds";
                if ((epoch > 1E11) || (epoch < -1E10)) {
                    notices += "Remove the last 3 digits if you are trying to convert milliseconds.";
                }
                epoch = (epoch * 1000);
            }
            data.date = epoch;
        }
         // first convert usere datetime (date) of form_zone to server datetime
         var in_server_date = new Date(data.date); // date in server_zone
 
         if(server_offset == false) server_offset = moment(in_server_date).utcOffset(); // take the server_offset
 
         var fromZone_off_set = moment(in_server_date).tz(data.fromZone).utcOffset(); // now take the offset from fromZone
         
         // Now below convert date in respective server zone date
         var server_date = moment(in_server_date).add(server_offset, 'minute').subtract(fromZone_off_set, 'minute');
 
         return server_date.tz(data.toZone).format(data.toFormat); // now convert server date to to_zone date in given to_fromat
    }
};

