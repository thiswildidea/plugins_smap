/**
 * Created by yangyiwen 2020/02/02
 */
define([
    'dojo/_base/declare',
    "dojo/Deferred",
    "dojo/request/xhr",
    "dojo/request",
    "dojo/domReady!"
],
function (declare, Deferred, xhr, request) {
    var xhrutils = declare(null,{
        constructor: function() {
        },
        mapconfig: function (username, menuname, proxyURL, mapconfig_backend_url) {
        const url = proxyURL + mapconfig_backend_url
          return request(url, {
             method: "GET",
             query: {
                 username: username,
                 menuName: menuname
             },
             timeout: 60000,
             handleAs:"json"
          }).then(function (result) {
            return result
          }, function (error) {
              console.log("地图初始化配置失败" + error);
          });
      },
        maptoken_backend: function (proxyURL, tokenUrl, tokenconfigname, domainName) {
            const url = proxyURL + tokenUrl + '?'
            return request(url, {
                method: "GET",
                query: {
                    tokenconfigname: tokenconfigname,
                    domainName: domainName
                },
                timeout: 60000,
                handleAs: "json"
            }).then(function (result) {
                return result
            }, function (error) {
                console.log("地图token初始化失败" + error);
            });
        },
        maptoken_front: function (front_tokenUrl, tokenUser, tokenPassword) {
            const expirationTime = 1440
            const tokenUrl = front_tokenUrl + '?request=getToken&username=' + tokenUser + '&password=' + tokenPassword + '&clientid=ref.' + window.location.host + '&expiration=' + expirationTime + '&f=json'
            const url = tokenUrl
            return request(url, {
                method: "POST",
                timeout: 60000,
                handleAs: "json"
            }).then(function (result) {
                return result
            }, function (error) {
                console.log("地图token初始化失败" + error);
            });
        },
  });
  return new xhrutils();
});