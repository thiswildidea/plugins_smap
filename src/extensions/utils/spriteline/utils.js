/**
 * Created by yangyiwen 2020/09/29
 */
define([
        'dojo/_base/declare',
        "dojo/Deferred",
        "dojo/request/xhr",
        "dojo/request",
        "dojo/domReady!"
    ],
    function (declare, Deferred, xhr, request) {
        var utils = declare(null, {
            constructor: function () {},
            parseJSON: function (str) {
                if (!str || !isString(str)) {
                    return str;
                }
                return JSON.parse(str);
            },
            pushIn: function (dest) {
                for (let i = 1; i < arguments.length; i++) {
                    const src = arguments[i];
                    if (src) {
                        for (let ii = 0, ll = src.length; ii < ll; ii++) {
                            dest.push(src[ii]);
                        }
                    }
                }
                return dest.length;
            }
        });
        return new utils();
    });