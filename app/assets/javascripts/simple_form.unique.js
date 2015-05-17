/**
 *  Ajax Unique for jQuery, version 0.0
 *  (c) 2015 Peter Ragone, PRM Technologies, LLC
 *
 *  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
 *  For details, see the web site: https://github.com/pcragone/simple_form_autocomplete
 */

/*jslint  browser: true, white: true, plusplus: true, vars: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object' && typeof require === 'function') {
    // Browserify
    factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  'use strict';

  var
    utils = (function () {
      return {
        escapeRegExChars: function (value) {
          return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        createNode: function (containerClass) {
          var div = document.createElement('div');
          div.className = containerClass;
          div.style.position = 'absolute';
          div.style.display = 'none';
          return div;
        }
      };
    }()),

    keys = {
      ESC: 27,
      TAB: 9,
      RETURN: 13,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    };

  function UniqueInput(el, options) {
    var noop = function () { },
      that = this,
      defaults = {
        ajaxSettings: {},
        serviceUrl: null,
        minChars: 1,
        deferRequestBy: 0,
        params: {},
        formatResult: UniqueInput.formatResult,
        delimiter: null,
        type: 'GET',
        noCache: false,
        preserveInput: false,
        containerClass: 'autocomplete-suggestions',
        dataType: 'text',
        currentRequest: null,
        preventBadQueries: true,
        lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
          return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
        },
        paramName: 'query',
        transformResult: function (response) {
          return typeof response === 'string' ? $.parseJSON(response) : response;
        }
      };

    // Shared variables:
    that.element = el;
    that.el = $(el);
    that.messageEl = that.el.siblings('.message');
    that.currentValue = that.element.value;
    that.options = $.extend({}, defaults, options);

    // Initialize and set options:
    that.initialize();
    //that.setOptions(options);
  }

  UniqueInput.utils = utils;

  $.UniqueInput = UniqueInput;

  UniqueInput.formatResult = function (suggestion, currentValue) {
    var escapedValue = utils.escapeRegExChars(currentValue);
    var pattern = "(" + escapedValue.split(' ').join('|') + ")";
    var regex = new RegExp(pattern, 'gi');
    var bolded = '<strong>$1<\/strong>';
    var value = suggestion.value;

    return value.replace(regex, bolded);
  };

  UniqueInput.prototype = {

    initialize: function () {
      var that = this,
        options = that.options,
        container;

      that.setParentPosition();

      that.el.on('keydown.uniqueInput', function (e) { that.onKeyPress(e); });
      that.el.on('keyup.uniqueInput', function (e) { that.onKeyUp(e); });
      that.el.on('blur.uniqueInput', function () { that.onBlur(); });
      that.el.on('focus.uniqueInput', function () { that.onFocus(); });
      that.el.on('change.uniqueInput', function (e) { that.onKeyUp(e); });
      that.el.on('input.uniqueInput', function (e) { that.onKeyUp(e); });
      that.options.serviceUrl = that.el.data('source');
      that.options.minChars = that.el.data('min-chars') || 1;
    },

    onFocus: function() {
      var that = this;
      that.storeCurrentValue();
    },

    onBlur: function() {
      var that = this;
      //that.validateUniqueness();
      that.clearCurrentValue();
    },

    onKeyPress: function(e) {
    },

    onKeyUp: function(e) {
      var that = this;

      if (that.disabled) {
        return;
      }

      clearInterval(that.onChangeInterval);

      if (that.currentValue !== that.el.val()) {
        if (that.options.deferRequestBy > 0) {
          // Defer lookup in case when value changes very quickly:
          that.onChangeInterval = setInterval(function () {
            that.onValueChange();
          }, that.options.deferRequestBy);
        } else {
          that.onValueChange();
        }
      }
    },

    onValueChange: function () {
      var that = this,
        options = that.options,
        value = that.el.val(),
        query = that.getQuery(value),
        index;

      clearInterval(that.onChangeInterval);
      that.currentValue = value;

      if (value == that.el.data('original-value')) {
        that.showAvailableMessage();
        return;
      }

      if (query.length < options.minChars) {
      } else {
        that.validateUniqueness(query);
      }
    },

    getQuery: function (value) {
      var delimiter = this.options.delimiter,
        parts;

      if (!delimiter) {
        return value;
      }
      parts = value.split(delimiter);
      return $.trim(parts[parts.length - 1]);
    },

    validateUniqueness: function(q) {
      var response,
        that = this,
        options = that.options,
        serviceUrl = options.serviceUrl,
        params,
        cacheKey,
        ajaxSettings;
      options.params[options.paramName] = q;
      params = options.ignoreParams ? null : options.params;

      params['id'] = that.el.data('object-id');

      if (that.currentRequest) {
        that.currentRequest.abort();
      }

      ajaxSettings = {
        url: serviceUrl,
        data: params,
        type: options.type,
        dataType: options.dataType
      };

      $.extend(ajaxSettings, options.ajaxSettings);
      that.setLoadingMessage();

      that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
        var result;
        that.currentRequest = null;
        result = options.transformResult(data);
        if (result['unique'] === true) {
          that.showAvailableMessage();
        }

        if (result['unique'] === false) {
          that.showUnavailableMessage();
        }
        //that.processResponse(result, q, cacheKey);
        //options.onSearchComplete.call(that.element, q, result.suggestions);
      }).fail(function (jqXHR, textStatus, errorThrown) {
        options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
      });
    },

    processResponse: function (result, originalQuery, cacheKey) {
        var that = this,
        options = that.options;
    },

    storeCurrentValue: function() {
      var that = this;
      that.currentValue = that.el.val();
      return;
    },

    clearCurrentValue: function() {
      var that = this;
      that.currentValue = undefined;
      return;
    },

    setParentPosition: function() {
      var that = this,
        parentEl = that.el.parent();
      // Add a position value to the parent element so we can set the position of the available/unavailable message
      if (parentEl.css('position') === 'static')
        parentEl.css('position', 'relative');
    },

    setLoadingMessage: function () {
      var that = this;
      that.el.parent().removeClass('has-success');
      that.el.parent().removeClass('has-error');
      that.messageEl.removeClass('available');
      that.messageEl.removeClass('unavailable');
      that.messageEl.html('Loading...');
    },

    showAvailableMessage: function () {
      var that = this;
      that.el.parent().removeClass('has-success');
      that.el.parent().removeClass('has-error');
      that.messageEl.removeClass('available');
      that.messageEl.removeClass('unavailable');
      that.el.parent().addClass('has-success');
      that.messageEl.html('Available');
      that.messageEl.addClass('available');
    },

    showUnavailableMessage: function () {
      var that = this;
      that.el.parent().removeClass('has-success');
      that.el.parent().removeClass('has-error');
      that.messageEl.removeClass('available');
      that.messageEl.removeClass('unavailable');
      that.el.parent().addClass('has-error');
      that.messageEl.html('Unavailable');
      that.messageEl.addClass('unavailable');
    }

  };

  // Create chainable jQuery plugin:
  $.fn.unique_input = function (options, args) {
    var dataKey = 'unique';
    // If function invoked without argument return
    // instance of the first matched element:
    if (arguments.length === 0) {
      return this.first().data(dataKey);
    }

    return this.each(function () {
      var inputElement = $(this),
        instance = inputElement.data(dataKey);

      if (typeof options === 'string') {
        if (instance && typeof instance[options] === 'function') {
          instance[options](args);
        }
      } else {
        // If instance already exists, destroy it:
        if (instance && instance.dispose) {
          instance.dispose();
        }
        instance = new UniqueInput(this, options);
        inputElement.data(dataKey, instance);
      }
    });
  };
}));

window.uniqueInput = function(input){
  $(input).unique_input({});
};

uniqueInputInit = function(){
  $('input.simple_form_unique').each(function(index, input) {
    window.uniqueInput(input);
  });
};

$(document).ready(uniqueInputInit);
$(document).on('page:load', uniqueInputInit);
