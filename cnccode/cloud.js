/*

    cloud.js

    a backend API for SNAP!

    written by Jens Mönig

    Copyright (C) 2015 by Jens Mönig

    This file is part of Snap!.

    Snap! is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

// Global settings /////////////////////////////////////////////////////

/*global modules, IDE_Morph, SnapSerializer, hex_sha512, alert, nop,
localize*/

modules.cloud = '2015-January-12';

// Global stuff
getBaseURL = function () {
    var url = location.href;  // entire url including querystring - also: window.location.href;
    if (url.lastIndexOf('#') > 0) {
		url = url.substring(0, url.lastIndexOf('#'));
	}
    url = url.substring(0, url.lastIndexOf('/'));
	return url + "/";
};

var Cloud;
var SnapCloud = new Cloud(
    getBaseURL()+ '../cloud'
);

// Cloud /////////////////////////////////////////////////////////////

function Cloud(url) {
    this.username = null;
    this.password = null; // hex_sha512 hashed
    this.url = url;
}

Cloud.prototype.clear = function () {
    this.username = null;
    this.password = null;
};


// Cloud: Snap! API.


Cloud.prototype.login = function ( username, password,callBack, errorCall) {
    // both callBack and errorCall are two-argument functions
    var request = new XMLHttpRequest(),
        params = 'password=' + password + '&username=' + username,
        myself = this;

    try {
        request.open("POST", this.url + '/../cloudlogin',true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.setRequestHeader("Content-length", params.length);
		request.setRequestHeader("Connection", "close");

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.responseText) {
                    if (request.responseText.slice(0,2) == "OK") {
                        this.username = request.responseText.slice(3);
                        console.log(this.username);
                        callBack.call(myself);
                    } else {
                        errorCall.call(
                            null,
                            request.responseText,
                            'login failed'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send(params);
    } catch (err) {
        errorCall.call(this, err.toString(), 'Snap!Cloud');
    }
};


Cloud.prototype.logout = function ( callBack, errorCall)
{
    var request = new XMLHttpRequest(),
        myself = this;

    try {
        request.open("GET", this.url + '/../cloudlogout',true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function () {
            if (request.readyState === 4) {

                if (request.responseText) {
                    if (request.responseText != "FALSE") {
                        this.username = ""
                        callBack.call(myself);
                    } else {
                        errorCall.call(
                            null,
                            request.responseText,
                            'login failed'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send();
    } catch (err) {
        errorCall.call(this, err.toString(), 'Snap!Cloud');
    }
};


Cloud.prototype.disconnect = function () {
    this.logout();
};



Cloud.prototype.isloggedin = function ( callBack, errorCall)
{
    var request = new XMLHttpRequest(),
        myself = this;

	myself.username = false;

    try {
        request.open("GET", this.url + '/../cloudloggedin',true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.responseText) {
                    if (request.responseText.slice(0,2) == "OK") {
                        myself.username = request.responseText.slice(3);
                        callBack.call(myself);
                    }
                }
			}
		};
        request.send();
    } catch (err) {
        // do nothing
        // errorCall.call(this, err.toString(), 'Snap!Cloud');
    }
};




Cloud.prototype.reconnect = function (
    callBack,
    errorCall
) {
    console.log("reconnect");
    if (localStorage) {
        usr = localStorage['-snap-user'];
        if (usr) {
            usr = this.parseResponse(usr)[0];
            if (usr) {
                this.username = usr.username || null;
                if (this.username) {
                   console.log(this.username);
                }
            }
        }
    }

    if (!(this.username)) {
        this.message('You are not logged in');

    /* this.login(
        this.username,
        this.password,
        callBack,
        errorCall
    ); */
    return;

    }

};

/*Cloud.prototype.signup = function (
    username,
    email,
    callBack,
    errorCall
) {
    // both callBack and errorCall are two-argument functions
    var request = new XMLHttpRequest(),
        myself = this;
    try {
        request.open(
            "GET",
            (this.hasProtocol() ? '' : 'http://')
                + this.url + '/signup'
                + '?Username='
                + encodeURIComponent(username)
                + '&Email='
                + encodeURIComponent(email),
            true
        );
        request.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.responseText) {
                    if (request.responseText.indexOf('ERROR') === 0) {
                        errorCall.call(
                            this,
                            request.responseText,
                            'Signup'
                        );
                    } else {
                        callBack.call(
                            null,
                            request.responseText,
                            'Signup'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url + '/signup',
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send(null);
    } catch (err) {
        errorCall.call(this, err.toString(), 'Turtlestitch Cloud');
    }
};*/

Cloud.prototype.getPublicProject = function (
    id,
    callBack,
    errorCall
) {
    // id is Username=username&projectName=projectname,
    // where the values are url-component encoded
    // callBack is a single argument function, errorCall take two args
    var request = new XMLHttpRequest(),
        responseList,
        myself = this;
    try {
        request.open(
            "GET",
            (this.hasProtocol() ? '' : 'http://')
                + this.url + 'Public'
                + '?'
                + id,
            true
        );
        request.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
        request.withCredentials = true;
        request.onreadystatechange = function () {
            if (request.readyState === 4) {

                if (request.responseText) {
                    if (request.responseText.indexOf('ERROR') === 0) {
                        errorCall.call(
                            this,
                            request.responseText
                        );
                    } else {
                        responseList = myself.parseResponse(
                            request.responseText
                        );
                        callBack.call(
                            null,
                            responseList[0].SourceCode
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url + 'Public',
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send(null);
    } catch (err) {
        errorCall.call(this, err.toString(), 'Snap!Cloud');
    }
};

Cloud.prototype.resetPassword = function (
    username,
    callBack,
    errorCall
) {
    // both callBack and errorCall are two-argument functions
    var request = new XMLHttpRequest(),
        myself = this;
    try {
        request.open(
            "GET",
            (this.hasProtocol() ? '' : 'http://')
                + this.url + '/ResetPW'
                + '?username='
                + encodeURIComponent(username),
            true
        );
        request.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
        request.withCredentials = true;
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.responseText) {
                    if (request.responseText.indexOf('ERROR') === 0) {
                        errorCall.call(
                            this,
                            request.responseText,
                            'Reset Password'
                        );
                    } else {
                        callBack.call(
                            null,
                            request.responseText,
                            'Reset Password'
                        );
                    }
                } else {
                    errorCall.call(
                        null,
                        myself.url + 'ResetPW',
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send(null);
    } catch (err) {
        errorCall.call(this, err.toString(), 'Snap!Cloud');
    }
};


Cloud.prototype.saveProject = function (ide, callBack, errorCall) {
    var myself = this,
        pdata,
        media;

    ide.serializer.isCollectingMedia = true;
    pdata = ide.serializer.serialize(ide.stage);
    media = ide.hasChangedMedia ?
            ide.serializer.mediaXML(ide.projectName) : null;
    ide.serializer.isCollectingMedia = false;
    ide.serializer.flushMedia();

    // check if serialized data can be parsed back again
    try {
        ide.serializer.parse(pdata);
    } catch (err) {
        ide.showMessage('Serialization of program data failed:\n' + err);
        throw new Error('Serialization of program data failed:\n' + err);
    }
    if (media !== null) {
        try {
            ide.serializer.parse(media);
        } catch (err) {
            ide.showMessage('Serialization of media failed:\n' + err);
            throw new Error('Serialization of media failed:\n' + err);
        }
    }
    ide.serializer.isCollectingMedia = false;
    ide.serializer.flushMedia();

    myself.reconnect(
        function () {
            myself.callService(
                'saveProject',
                function (response, url) {
                    callBack.call(null, response, url);
                    myself.disconnect();
                    ide.hasChangedMedia = false;
                },
                errorCall,
                [
                    ide.projectName,
                    pdata,
                    media,
                    pdata.length,
                    media ? media.length : 0
                ]
            );
        },
        errorCall
    );
};

Cloud.prototype.getProjectList = function (callBack, errorCall) {
    var myself = this;
    // both callBack and errorCall are two-argument functions
    var request = new XMLHttpRequest()
	//callBack.call();
	this.reconnect(null,null);

    try {
        request.open("GET", this.url + '/list_projects',true);
		request.setRequestHeader("Connection", "close");

        request.onreadystatechange = function () {
            if (request.readyState === 4) {

                if (request.responseText) {

					if (request.responseText.indexOf('ERROR') === 0) {
							errorCall.call(
                            null,
                            request.responseText,
                            'connection failed');
					} else {
						projects = [];
						console.log(request.responseText);
						request.responseText.split('\n').forEach(
							function (line) {
								endIdx = line.search(new RegExp('.xml'));
								if (endIdx > 0) {
									name = line.substring(0, endIdx);
									dta = {
										name: line,
										thumb: null,
										notes: null
									};
									projects.push(dta);
									console.log(dta);
								}
							}
						);
						callBack.call(myself,projects);
					}
                } else {
                    errorCall.call(
                        null,
                        myself.url,
                        localize('could not connect to:')
                    );
                }
            }
        };
        request.send();
    } catch (err) {
        errorCall.call(this, err.toString(), 'Snap!Cloud');
    }
};

Cloud.prototype.changePassword = function (
    oldPW,
    newPW,
    callBack,
    errorCall
) {
    var myself = this;
    this.reconnect(
        function () {
            myself.callService(
                'changePassword',
                function (response, url) {
                    callBack.call(null, response, url);
                    myself.disconnect();
                },
                errorCall,
                [hex_sha512(oldPW), hex_sha512(newPW)]
            );
        },
        errorCall
    );
};



// Cloud: backend communication

Cloud.prototype.callURL = function (url, callBack, errorCall) {
    // both callBack and errorCall are optional two-argument functions
    var request = new XMLHttpRequest(),
        stickyUrl,
        myself = this;
    try {
        // set the Limo. Also set the glue as a query paramter for backup.
        stickyUrl = url +
            '&SESSIONGLUE=' +
            this.route +
            '&_Limo=' +
            this.limo;
        request.open('GET', stickyUrl, true);
        request.withCredentials = true;
        request.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
        request.setRequestHeader('MioCracker', this.session);
        // Set the glue as a request header.
        request.setRequestHeader('SESSIONGLUE', this.route);
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.responseText) {
                    var responseList = myself.parseResponse(
                        request.responseText
                    );
                    callBack.call(null, responseList, url);
                } else {
                    errorCall.call(
                        null,
                        url,
                        'no response from:'
                    );
                }
            }
        };
        request.send(null);
    } catch (err) {
        errorCall.call(this, err.toString(), url);
    }
};

Cloud.prototype.callService = function (
    serviceName,
    callBack,
    errorCall,
    args
) {
    // both callBack and errorCall are optional two-argument functions
    var request = new XMLHttpRequest(),
        service = this.api[serviceName],
        myself = this,
        stickyUrl,
        postDict;

    if (!this.session) {
        errorCall.call(null, 'You are not connected', 'Cloud');
        return;
    }
    if (!service) {
        errorCall.call(
            null,
            'service ' + serviceName + ' is not available',
            'API'
        );
        return;
    }
    if (args && args.length > 0) {
        postDict = {};
        service.parameters.forEach(function (parm, idx) {
            postDict[parm] = args[idx];
        });
    }
    try {
        stickyUrl = this.url +
            '/' +
            service.url +
            '&SESSIONGLUE=' +
            this.route +
            '&_Limo=' +
            this.limo;
        request.open(service.method, stickyUrl, true);
        request.withCredentials = true;
        request.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
        request.setRequestHeader('MioCracker', this.session);
        request.setRequestHeader('SESSIONGLUE', this.route);
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                var responseList = [];
                if (request.responseText &&
                        request.responseText.indexOf('ERROR') === 0) {
                    errorCall.call(
                        this,
                        request.responseText,
                        localize('Service:') + ' ' + localize(serviceName)
                    );
                    return;
                }
                if (serviceName === 'login') {
                    myself.api = myself.parseAPI(request.responseText);
                }
                responseList = myself.parseResponse(
                    request.responseText
                );
                callBack.call(null, responseList, service.url);
            }
        };
        request.send(this.encodeDict(postDict));
    } catch (err) {
        errorCall.call(this, err.toString(), service.url);
    }
};



Cloud.prototype.parseResponse = function (src) {
    var ans = [],
        lines;
    if (!src) {return ans; }
    lines = src.split(" ");
    lines.forEach(function (service) {
        var entries = service.split("&"),
            dict = {};
        entries.forEach(function (entry) {
            var pair = entry.split("="),
                key = decodeURIComponent(pair[0]),
                val = decodeURIComponent(pair[1]);
            dict[key] = val;
        });
        ans.push(dict);
    });
    return ans;
};

Cloud.prototype.parseDict = function (src) {
    var dict = {};
    if (!src) {return dict; }
    src.split("&").forEach(function (entry) {
        var pair = entry.split("="),
            key = decodeURIComponent(pair[0]),
            val = decodeURIComponent(pair[1]);
        dict[key] = val;
    });
    return dict;
};

Cloud.prototype.encodeDict = function (dict) {
    var str = '',
        pair,
        key;
    if (!dict) {return null; }
    for (key in dict) {
        if (dict.hasOwnProperty(key)) {
            pair = encodeURIComponent(key)
                + '='
                + encodeURIComponent(dict[key]);
            if (str.length > 0) {
                str += '&';
            }
            str += pair;
        }
    }
    return str;
};

// Cloud: user messages (to be overridden)

Cloud.prototype.message = function (string) {
    alert(string);
};
