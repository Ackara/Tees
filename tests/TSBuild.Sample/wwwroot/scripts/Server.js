var TSMin;
(function (TSMin) {
    var ServerPromise = /** @class */ (function () {
        function ServerPromise(action) {
            action(this.pass.bind(this), this.reject.bind(this));
        }
        ServerPromise.prototype.then = function (callback) {
            this.thenCallback = callback;
            return this;
        };
        ServerPromise.prototype["catch"] = function (callback) {
            this.catchCallback = callback;
            return this;
        };
        ServerPromise.prototype["finally"] = function (callback) {
            this.finalCallback = callback;
        };
        ServerPromise.prototype.pass = function (data) {
            if (this.thenCallback) {
                this.thenCallback(data || true);
            }
            if (this.finalCallback) {
                this.finalCallback();
            }
        };
        ServerPromise.prototype.reject = function (data) {
            if (this.catchCallback) {
                this.catchCallback(data);
            }
            if (this.finalCallback) {
                this.finalCallback();
            }
        };
        return ServerPromise;
    }());
    TSMin.ServerPromise = ServerPromise;
    var Server = /** @class */ (function () {
        function Server() {
        }
        Server.sendHttpRequest = function (method, url, options) {
            return new ServerPromise(function (pass, reject) {
                var application_json = "application/json; charset=utf-8";
                if (!options) {
                    options = {};
                }
                if (!options.hasOwnProperty("contentType")) {
                    options.contentType = (typeof options.body === "object" ? application_json : null);
                }
                var request = new XMLHttpRequest();
                request.open(method, url, true);
                if (options.contentType) {
                    request.setRequestHeader("Content-Type", options.contentType);
                }
                if (options.headers) {
                    for (var i = 0; i < options.headers.length; i++) {
                        request.setRequestHeader(options.headers[i].name, options.headers[i].value);
                    }
                }
                request.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        var result = (this.getResponseHeader("Content-Type") === application_json ? JSON.parse(this.responseText) : this.responseText);
                        if (this.status >= 200 && this.status <= 299) {
                            pass(result);
                            if (!result) {
                                console.warn(method + " " + this.responseURL + ": NO CONTENT");
                            }
                        }
                        else {
                            reject({
                                status: this.status, url: this.responseURL, data: result,
                                message: (method + " " + this.responseURL + ": " + this.status + " " + (typeof result !== 'object' ? this.responseText : '')).trim()
                            });
                            console.debug(result);
                        }
                    }
                };
                request.onerror = function () {
                    reject({ message: "Network Error" });
                };
                if (options.contentType === application_json) {
                    request.send(JSON.stringify(options.body));
                }
                else {
                    request.send(options.body);
                }
            });
        };
        return Server;
    }());
    TSMin.Server = Server;
})(TSMin || (TSMin = {}));