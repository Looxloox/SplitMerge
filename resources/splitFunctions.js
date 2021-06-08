( function ( mw, $ ) {

  mw.parsoid_request = function( data ) {
    return new Promise( (successCallback, failureCallback) => {
      $.ajax({
           url : data.url,
           type : data.type,
           dataType : data.dataType,
           data: data.data,
        }).always( function( data, status, error ) {
          if ( status == 'success' ) {
            successCallback( data );
          } else {
            failureCallback( error );
          }
        });
    })
  }

  mw.getSelectionCoords = function() {
      var sel = document.selection, range, rect;
      var x = 0, y = 0;
      if (sel) {
          if (sel.type != "Control") {
              range = sel.createRange();
              range.collapse(true);
              x = range.boundingLeft;
              y = range.boundingTop;
          }
      } else if (window.getSelection) {
          sel = window.getSelection();
          if (sel.rangeCount) {
              range = sel.getRangeAt(0).cloneRange();
              if (range.getClientRects) {
                  range.collapse(true);
                  if (range.getClientRects().length>0){
                      rect = range.getClientRects()[0];
                      x = rect.left;
                      y = rect.top;
                  }
              }
              // Fall back to inserting a temporary element
              if (x == 0 && y == 0) {
                  var span = document.createElement("span");
                  if (span.getClientRects) {
                      // Ensure span has dimensions and position by
                      // adding a zero-width space character
                      span.appendChild( document.createTextNode("\u200b") );
                      range.insertNode(span);
                      rect = span.getClientRects()[0];
                      x = rect.left;
                      y = rect.top;
                      var spanParent = span.parentNode;
                      spanParent.removeChild(span);

                      // Glue any broken text nodes back together
                      spanParent.normalize();
                  }
              }
          }
      }
      return { x: x, y: y };
  }

  mw.getSelectionHtml = function() {
      var html = "";
      if (typeof window.getSelection != "undefined") {
          var sel = window.getSelection();
          if (sel.rangeCount) {
              var container = document.createElement("div");
              for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                  container.appendChild(sel.getRangeAt(i).cloneContents());
              }
              html = container.innerHTML;
          }
      } else if (typeof document.selection != "undefined") {
          if (document.selection.type == "Text") {
              html = document.selection.createRange().htmlText;
          }
      }
      return html;
  }

}( mediaWiki, jQuery ) );
