( function ( mw, $ ) {

  var $wrapper = $('#split-page-wrapper');
  var parsoidUrl = mw.util.wikiScript( 'rest' ) + '/localhost/v3/transform';

  mw.split_selection = '';
  mw.split_tags = [];
  mw.split_ref_tag = '';
  mw.split_references = {};

  progressBar = new OO.ui.ProgressBarWidget( {
		progress: false
  } );
  $wrapper.html( progressBar.$element );

/*
  $button = $('<button id="take_selection">Prendre</button>');
  $button.on( "click", function(){
    html_to_wikitext( mw.getSelectionHtml() );
  } );
  $wrapper.after($button);
*/

  /**
   * Main function to display original text to select
   */
  function parse_html( data ) {
    var $body = $('<div>');
    $body.html(data);
    var counter = 0;

    $body.find('[data-parsoid]').each( function(){

      var swap = false;

      // TRANSCLUSIONS
      if ( $(this).attr('typeof') == 'mw:Transclusion' ) {
        origin = $(this).prop('outerHTML');
        data_mw = $(this).attr('data-mw');
        label = '{{' + JSON.parse( data_mw ).parts[0].template.target.wt + '}}';
        tag = 'span';
        swap = true;
      }
      // IMAGES
      else if ( $(this).attr('typeof') == 'mw:Image' ) {
        origin = $(this).prop('outerHTML');
        data_parsoid = $(this).find('img').attr('data-parsoid');
        label = '[[' + JSON.parse( data_parsoid ).sa.resource + ']]';
        tag = 'span';
        swap = true;
      }
      // REFERENCES
      else if ( $(this).attr('typeof') == 'mw:Extension/ref' ) {
        origin = $(this).prop('outerHTML');
        text = $(this).find('.mw-reflink-text').text();
        ref = $(this).attr('id').replace('ref','note');
        label = '<sup class="split-ref" ref="'+ref+'">' + text + '</sup>';
        tag = 'span';
        swap = true;
      }
      else if ( $(this).attr('typeof') == 'mw:Extension/references' ) {
        $copy = $(this);
        $copy.find('li').each( function(){
          key = $(this).attr('id');
          key = key.replace('note-', 'note');
          mw.split_references[key] = $(this).prop('outerHTML');
          $(this).remove();
        });
        mw.split_ref_tag = $copy.prop('outerHTML');
        $(this).remove();
      }
      // TABLES
      else if ( $(this).prop('outerHTML').match(/^<table/) ) {
        origin = $(this).prop('outerHTML');
        tag = 'div';
        label = '{| Table |}';
        swap = true;
      }
      // TITLES
      else if ( $(this).prop('outerHTML').match(/^<h[23456] /) ) {
        origin = $(this).prop('outerHTML');
        tag = $(this).prop('outerHTML').match(/^<(h[23456]) /)[1];
        label = $(this).attr('id');
        swap = true;
      }
      // LINKS
      else if ( $(this).first().attr('rel') == 'mw:WikiLink' ) {
        origin = $(this).prop('outerHTML');
        tag = 'span';
        label = '[[' + $(this).first().html() + ']]';
        swap = true;
      }
      else if ( $(this).first().attr('rel') == 'mw:ExtLink' ) {
        origin = $(this).prop('outerHTML');
        tag = 'span';
        disp = $(this).first().html();
        if ( !disp ) disp = $(this).first().attr('href');
        label = '[' + disp + ']';
        swap = true;
      }

      if ( swap ) {
        pre = '<span id="no-split-deb'+counter+'" class="no-split-deb" counter="'+counter+'"></span>';
        elmt = '<'+tag+' id="no-split-area'+counter+'" class="no-split-area" counter="'+counter+'">' + label + '</'+tag+'>';
        post = '<span id="no-split-end'+counter+'" class="no-split-end" counter="'+counter+'"></span>';

        mw.split_tags.push( {
          counter: counter,
          origin: origin,
          id: 'no-split-area'+counter
        });
        $( this ).after( $(pre+elmt+post) );
        $(this).remove();
        counter++;
      }
    });

    // some clean-up...
    $body.find('[about]').each( function(){
      $(this).remove();
    });
    $wrapper.html( $body );
  }

  /**
   * Second main function: parses the selection
   */
  function parse_selection(e) {

   html = mw.getSelectionHtml();
   coord = mw.getSelectionCoords();
   $('.no-split-area-selected').each( function(){
     $(this).removeClass('no-split-area-selected');
   });

   if (html){

     // selection out of frame
     rect = $( '#split-page-wrapper' )[0].getBoundingClientRect();
     if ( !( coord.x >= rect.left && coord.Endx <= rect.right
         && coord.y >= rect.top && coord.Endy <= rect.bottom ) ) {
       alert( 'vous devez sélectionner le texte dans le cadre uniquement');
       return;
     }

     // no HTML tags: is selection inside a no-split tag ?
     if ( !html.match(/<|>/g) ) {
       done = false;
       mw.split_tags.forEach( function( item ) {
         rect = $('#'+item.id )[0].getBoundingClientRect();
         if ( coord.x >= rect.left && coord.Endx <= rect.right
             && coord.y >= rect.top && coord.Endy <= rect.bottom  ) {
           mw.split_selection = item.origin;
           hydrate_input();
           done = true;
         }
       });
       if (!done) {
         mw.split_selection = html;
         hydrate_input();
       }
     }
     else {

     // heavy stuff to bypass incompressible bug using .first().first() on $main elmt ...
     removeFirst = '';
     removeLast = '';
     $test = $( html );

      if ( $test.first().html().length == 0 ) {
        removeFirst = $test.first().attr('data-parsoid');
      }
      if ($test.first().children().length == 1 ){
       $test.first().children().each( function(){
         if ( $(this).html().length == 0 ){
           removeFirst = $test.first().attr('data-parsoid');
         }
       });
      }
      if ( $test.last().html().length == 0 ) {
        removeLast = $test.last().attr('data-parsoid');
      }
      if ($test.last().children().length == 1 ){
       $test.last().children().each( function(){
         if ( $(this).html().length == 0 ){
           removeLast = $test.last().attr('data-parsoid');
         }
       });
      }

      $main = $('<div id="split-main">');
      $main.html( html );

      // remove first/last empty tag (any), note truncated tags
      if ( removeFirst || removeLast ) {
        $main.find('[data-parsoid]').each( function(){
          if ( ( removeFirst && $(this).attr('data-parsoid') == removeFirst )
              || ( removeLast && $(this).attr('data-parsoid') == removeLast ) ) {
            $(this).remove();
          }
        });
      }

       // screen for truncated no-split tags
         //-> end of
       prepend = '';
       $main.find('.no-split-end').each( function(){
         counter = $(this).attr('counter');
         $screen = $main.find('#no-split-deb'+counter);
         if ( $screen.length == 0 ) {
           // keep only tags with part of the innerHTML selected
           inner = $main.find('#no-split-area'+counter).text();
           if ( inner.length > 0 ) {
             prepend = mw.split_tags[counter].origin;
             $('#no-split-area'+counter).addClass('no-split-area-selected');
           }
           $(this).parent('p').remove();
           //$main.find('#no-split-area'+counter).parent('p').remove();
           $main.find('#no-split-area'+counter).remove();
         }
       });
         //-> begining of
       append = '';
       $main.find('.no-split-deb').each( function(){
         counter = $(this).attr('counter');
         $screen = $main.find('#no-split-end'+counter);
         if ( $screen.length == 0 ) {
           // keep only tags with part of the innerHTML selected
           inner = $main.find('#no-split-area'+counter).text();
           if ( inner.length > 0 ) {
             append = mw.split_tags[counter].origin;
             $('#no-split-area'+counter).addClass('no-split-area-selected');
           }
           $(this).parent('p').remove();
           $main.find('#no-split-area'+counter).remove();
         }
       });

       mw.split_selection = prepend + $main.html() + append;
       hydrate_input();
     }
   }
  }

  function hydrate_input() {

    // sanitize the html to parse
    $selection = $('<div>');
    $selection.html( mw.split_selection );
    mw.split_tags.forEach( function( item, key ) {
      $origin = $(item.origin);

      // reinsert references
      if ( $selection.find('#no-split-area'+key+' .split-ref').length > 0 ) {
        ref = $(this).attr('ref').replace('note-','note');
        if ( $selection.find('#split-ref-tag').length == 0 ) {
          $ref_tag = $( mw.split_ref_tag );
          $ref_tag.attr('id', 'split-ref-tag');
          $selection.append( $ref_tag );
        }
        $selection.find('#split-ref-tag ol').append( $( mw.split_references[ref]) );
      }

      // remove temporary tags
      $selection.find('#no-split-area'+key).after( $origin );
      $selection.find('#no-split-deb'+key).remove();
      $selection.find('#no-split-area'+key).remove();
      $selection.find('#no-split-end'+key).remove();
    });

    // convert to wikitext
    mw.parsoid_request( {
       url : parsoidUrl + '/html/to/wikitext/',
       type : 'POST',
       dataType : 'text',
       data: { html: $selection.html() }
     } ).then ( function(data){
       //alert(data);
       $('input[name=wpselected-content]').val( data );
     }, alert );
  }

  /**
   * DO STUFF ...
   */
  mw.parsoid_request( {
     url : parsoidUrl + '/wikitext/to/html/' + mw.config.get( 'wgPageName' ),
     type : 'POST',
     dataType : 'text',
     data: { body_only: "true" }
   } ).then ( parse_html, alert );


   document.addEventListener('mouseup', function(e) {
     parse_selection(e);
   });

}( mediaWiki, jQuery ) );
