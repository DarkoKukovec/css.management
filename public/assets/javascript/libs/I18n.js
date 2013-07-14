// Copyright (c) 2011 Infinum

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var I18n = (function() {
  var locale = '';
  var locales = [];
  var translations = {};
  var defaultLocale = null;
  var warnForDefault = true;

  var warn = function(string, locale) {
    return "<div class=\"noTranslation\">" + locale + ": " + string + "</div>";
  };

  var pluralize = function(key, count, locale) {
    return translations[locale][key + '_' + (count == 1 ? 'one' : 'other')];
  };

  return {
    init: function(config) {
      var i, ln, l;

      if (config === undefined) {
        throw "I18n - Init has to be called with a config object!";
      }
      if (config.locales === undefined) {
        throw "I18n - Config object needs to contain at least one locale!";
      }
      if (config.defaultLocale === undefined) {
        throw "I18n - Config object needs to have defaultLocale defined!";
      }

      locales = config.locales;

      for (i = 0, ln = locales.length; i < ln; i++) {
        l = locales[i];
        if (config.translation && config.translations[l] !== null) {
          translations[l] = config.translations[l];
        } else {
          translations[l] = {};
        }
      }

      defaultLocale = config.defaultLocale;

      locale = config.initialLocale || defaultLocale;

      if (config.warnForDefault === false) {
        warnForDefault = false;
      }

      if ((config.warn !== null) && typeof config.warn === 'function' && config.warn.length === 2) {
        warn = config.warn;
      }

      if ((config.pluralize !== null) && typeof config.pluralize === 'function' && config.pluralize.length === 3) {
        pluralize = config.pluralize;
      }
    },

    t: function(string, params, userLocale) {
      var param, regex, translation;

      if (typeof params === 'string') {
        userLocale = params;
        params = null;
      }

      userLocale = userLocale || locale;
      if (userLocale === null) {
        throw "I18n:init *must* be called before any translation is done.";
      }


      if (params && typeof params.count === 'number') {
        translation = pluralize(string, params.count, userLocale);
      } else {
        translation = translations[userLocale][string];
      }

      if (translation === undefined) {
        if (!(warnForDefault || userLocale !== defaultLocale)) {
          translation = string;
        } else {
          translation = warn(string, userLocale);
        }
      }

      if (params !== null && params !== undefined) {
        if (translation !== null) {
          regex = null;
          var paramCounter = 0;
          for (param in params) {
            if (!params.hasOwnProperty(param)) {
              continue;
            }
            translation = translation.replace("%s", params[paramCounter] );
            paramCounter++;
          }
        } else {
          translation = warn(string, userLocale);
        }
      }

      return translation;
    },

    getLocale: function() {
      return locale;
    },

    setLocale: function(newLocale) {
      var l, i, ln;

      for (i = 0, ln = locales.length; i < ln; i++) {
        if (locales[i] == newLocale) {
          locale = newLocale;
          return true;
        }
      }

      throw "I18n - called setLocale on a non-existent locale: " + newLocale;
    },

    getLocales: function() {
      return locales;
    },

    addTranslation: function(locale, translation) {
      var i, ln;

      for (i = 0, ln = locales.length; i < ln; i++) {
        if (locales[i] == locale) {
          translations[locale] = translation;
          return true;
        }
      }

      return false;
    },

    loadTranslation: function(locale, callback, scope) {
      var selectedLocale = locale || 'en',
        that = this,
        translationNotLoaded = true,
        i, ln, xhr;

      scope = scope || this;

      for (i = 0, ln = locales.length; i < ln; i++) {
        if (locales[i] == selectedLocale) {
          for (var j in translations[selectedLocale]) {
            if (translations[selectedLocale].hasOwnProperty(j)) {
              translationNotLoaded = false;
              break;
            }
          }
          break;
        }
      }

      this.setLocale(selectedLocale);

      if (translationNotLoaded) {
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            // For some reason node-webkit gives the status 0...
            if (xhr.status == 200 || xhr.status === 0) {
              var jsonResponse = JSON.parse(xhr.responseText);
              that.addTranslation(selectedLocale, jsonResponse);
              if (callback) {
                callback.call(scope);
              }
            } else {
              alert("An error has occured making the request");
            }
          }
        };
        xhr.open('GET', 'assets/translations/' + selectedLocale + '.json', true);
        xhr.send();
      } else if (callback) {
        callback.call(scope);
      }
    }
  };
})();
