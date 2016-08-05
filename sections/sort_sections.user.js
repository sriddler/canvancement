// ==UserScript==  
// @name        Sort sections  
// @namespace   https://github.com/jamesjonesmath/canvancement  
// @description Sort the list of sections alphabetically  
// @include     https://richland.instructure.com/courses/*/gradebook
// @include     https://richland.instructure.com/courses/*/settings
// @require     https://cdnjs.cloudflare.com/ajax/libs/tinysort/2.3.6/tinysort.js
// @version     1  
// @grant       none  
// ==/UserScript==
requirejs([ './tinysort' ], function() {
  'use strict';
  var tinysort = requirejs('tinysort');
  try {
    checkGradebookClassView();
    checkGradebookIndividualView();
    checkCourseSettings();
  } catch (e) {
    console.log(e);
  }
  function checkGradebookClassView() {
    var regex = new RegExp('^/courses/[0-9]+/gradebook$');
    // Make sure we're on the gradebook page
    if (!regex.test(window.location.pathname)) {
      return;
    } // Check for the class view

    if (!document.querySelector('body').classList.contains('gradebook2')) {
      return;
    }
    if (document.getElementById('section-to-show-menu')) {
      sortGradebookClassView();
    } else {
      // We don't have the list yet, so we need to watch for it to appear
      // The list is mutated twice. The second time replaces the content
      // by removing the nodes and then adding them back, so make sure
      // we're looking at the final time.
      var dst = document.querySelector('div.section-button-placeholder');
      if (dst) {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.removedNodes.length > 0) {
              observer.disconnect();
              sortGradebookClassView();
            }
          });
        });
        observer.observe(dst, {
          'childList' : true
        });
      }
    }
  }
  function checkGradebookIndividualView() {
    var regex = new RegExp('^/courses/[0-9]+/gradebook$');
    // Make sure we're on the gradebook page
    if (!regex.test(window.location.pathname)) {
      return;
    } // Check for the class view

    if (document.querySelector('body').classList.contains('gradebook2')) {
      return;
    }
    if (document.getElementById('section_select')) {
      sortGradebookIndividualView();
    } else {
      // We don't have the select list yet
      // It comes in two parts, the "All sections" and then the other sections
      // If you process it as soon as the element appears, it will only have
      // one element in it, so make sure it's the second time inserting options
      var dst = document.querySelector('div#content');
      if (dst) {
        var observer = new MutationObserver(function(mutations) {
          var ready = false;
          mutations.forEach(function(mutation) {
            if (mutation.target.id === 'section_select' && mutation.previousSibling) {
              ready = true;
            }
          });
          if (ready) {
            observer.disconnect();
            sortGradebookIndividualView();
          }
        });
        observer.observe(dst, {
          'childList' : true,
          'subtree' : true
        });
      }
    }
  }
  function checkCourseSettings() {
    // The settings page comes with the sections already present
    var regex = new RegExp('^/courses/[0-9]+/settings$');
    // Make sure we're on the settings page
    if (!regex.test(window.location.pathname)) {
      return;
    }
    if (document.getElementById('sections')) {
      sortCourseSettings();
    }
  }
  function sortGradebookClassView() {
    tinysort('ul#section-to-show-menu>li.ui-menu-item', {
      sortFunction : function(a, b) {
        var aLabel = a.elm.querySelector('a>label');
        var bLabel = b.elm.querySelector('a>label');
        return (aLabel.htmlFor === 'section_option_') ? 0 : (aLabel.textContent < bLabel.textContent ? -1 : 1);
      }
    });
    return;
  }
  function sortGradebookIndividualView() {
    tinysort('select#section_select>option', {
      sortFunction : function(a, b) {
        return (a.elm.value === '') ? 0 : (a.elm.textContent < b.elm.textContent ? -1 : 1);
      }
    });
    return;
  }
  function sortCourseSettings() {
    tinysort('ul#sections>li.section', {
      sortFunction : function(a, b) {
        var aLabel = a.elm.querySelector('a').textContent.trim();
        var bLabel = b.elm.querySelector('a').textContent.trim();
        return aLabel < bLabel ? -1 : 1;
      }
    });
  }
})();
