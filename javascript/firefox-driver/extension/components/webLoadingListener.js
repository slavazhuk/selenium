/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2011 Software Freedom Conservatory

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

function WebLoadingListener(browser, toCall, opt_window) {
  var listener = this;

  this.handler = {
    active: true,
    QueryInterface: function(iid) {
      if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
          iid.equals(Components.interfaces.nsISupportsWeakReference) ||
          iid.equals(Components.interfaces.nsISupports))
        return this;
      throw Components.results.NS_NOINTERFACE;
    },

    onStateChange: function(webProgress, request, flags, status) {
      if (flags & STATE_STOP) {
        if (request.URI &&  this.active) {
          this.active = false;
          // On versions of firefox prior to 4 removing a listener may cause
          // subsequent listeners to be skipped. Favouring a memory leak over
          // not working properly.
          if (bot.userAgent.isVersion('4')) {
             WebLoadingListener.removeListener(browser, listener);
          }
          toCall(webProgress);
          // Neuter the toCall so that it's never used again.
          toCall = function() {};
        }
      }
      return 0;
    },

    onLocationChange: function(aProgress, aRequest, aURI) { return 0; },
    onProgressChange: function() { return 0; },
    onStatusChange: function() { return 0; },
    onSecurityChange: function() { return 0; },
    onLinkIconAvailable: function() { return 0; }
  };

  browser.addProgressListener(this.handler);
}

WebLoadingListener.removeListener = function(browser, listener) {
  browser.removeProgressListener(listener.handler);
};
