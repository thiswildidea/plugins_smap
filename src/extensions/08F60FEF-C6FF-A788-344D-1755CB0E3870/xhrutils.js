;
define(['dojo/_base/declare', "dojo/Deferred", "dojo/request/xhr", "dojo/request", "dojo/domReady!"], function (f, g, h, i) {
    var j = f(null, {
        constructor: function () {},
        mapconfig: function (b, c, d, e) {
            const url = d + e
            return i(url, {
                method: "GET",
                query: {
                    username: b,
                    menuName: c
                },
                timeout: 60000,
                handleAs: "json"
            }).then(function (a) {
                return a
            }, function (a) {
                console.log("地图初始化配置失败" + a)
            })
        },
        maptoken_backend: function (b, c, d, e) {
            const url = b + c + '?'
            return i(url, {
                method: "GET",
                query: {
                    tokenconfigname: d,
                    domainName: e
                },
                timeout: 60000,
                handleAs: "json"
            }).then(function (a) {
                return a
            }, function (a) {
                console.log("地图token初始化失败" + a)
            })
        },
        maptoken_front: function (b, c, d) {
            const expirationTime = 1440
            const tokenUrl = b + '?request=getToken&username=' + c + '&password=' + d + '&clientid=ref.' + window.location.host + '&expiration=' + expirationTime + '&f=json'
            const url = tokenUrl
            return i(url, {
                method: "POST",
                timeout: 60000,
                handleAs: "json"
            }).then(function (a) {
                return a
            }, function (a) {
                console.log("地图token初始化失败" + a)
            })
        },
    });
    return new j()
});;