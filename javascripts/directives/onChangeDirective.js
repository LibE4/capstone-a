"use strict";

app.directive('animateOnChange', function() {
  return function(scope, element, attr) {
    scope.$watch(attr.animateOnChange, function(nv,ov) {
      if (nv!=ov) {
        element.addClass('animated flash');
        setTimeout(function() {
          element.removeClass('animated flash');
        }, 1000); // Could be enhanced to take duration as a parameter
      }
    });
  };
});