<?php
namespace MediaWiki\Extension\SplitMerge;
/**
 * Actions to easily split or merge pages.
 *
 * @author Alexandre Brulet <alexandre.brulet@laposte.net>
 * @license GPL-3.0+
 * @package MediaWiki-extension-SplitMerge
 */

class SplitMerge {

  /**
   * Action tabs
   */
  public static function onSkinTemplateNavigation( $skinTemplate, array &$links ) {

    global $wgSplitMergeNamespaces;
    global $wgSplitMergeInTabs;
		$out = $skinTemplate->getOutput();
		$title = $out->getTitle();
		$context = $out->getContext();
    $user = $context->getUser();
		$action = \Action::getActionName( $context );

    if ( !isset($wgSplitMergeNamespaces) || !isset($wgSplitMergeInTabs) ) {
  		if ( !isset($wgSplitMergeNamespaces) )
        $wgSplitMergeNamespaces = $context->getConfig()->get('SplitMergeNamespaces');
  		if ( !isset($wgSplitMergeInTabs) )
        $wgSplitMergeInTabs = $context->getConfig()->get('SplitMergeInTabs');
    }

    if ( $wgSplitMergeInTabs
         && in_array( $title->getNamespace(), $wgSplitMergeNamespaces )
         && $user->isAllowed('splitmerge') ) {
    	$links['actions']['split'] = array(
    		'class' => ( $action == 'split') ? 'selected' : false,
    		'text' => wfMessage('split-action-tab')->plain(),
    		'href' => $title->getLocalURL( [ 'action' => 'split' ] )
    	);
    	$links['actions']['merge'] = array(
    		'class' => ( $action == 'merge') ? 'selected' : false,
    		'text' => wfMessage('merge-action-tab')->plain(),
    		'href' => $title->getLocalURL( [ 'action' => 'merge' ] )
    	);
    }
  }

	/**
	 * Add links in the toolbox
	 */
	public static function onSidebarBeforeOutput( $skin, &$sidebar ) {

    global $wgSplitMergeNamespaces;
    global $wgSplitMergeInToolbox;
    $out = $skin->getOutput();
		$title = $out->getTitle();
    $context = $out->getContext();
		$action = \Action::getActionName( $context );
    $user = $context->getUser();

    if ( !isset($wgSplitMergeNamespaces) || !isset($wgSplitMergeInToolbox) ) {
      if ( !isset($wgSplitMergeNamespaces) )
        $wgSplitMergeNamespaces = $context->getConfig()->get('SplitMergeNamespaces');
      if ( !isset($wgSplitMergeInTabs) )
        $wgSplitMergeInTabs = $context->getConfig()->get('SplitMergeInTabs');
    }

		if ( $wgSplitMergeInToolbox
         && in_array( $title->getNamespace(), $wgSplitMergeNamespaces )
         && $user->isAllowed('splitmerge') ) {
			$sidebar['TOOLBOX'][] = [
				'msg' => 'split-action-link',
				'href' => $title->getLocalURL( [ 'action' => 'split' ] )
			];
      $sidebar['TOOLBOX'][] = [
				'msg' => 'merge-action-link',
				'href' => $title->getLocalURL( [ 'action' => 'merge' ] )
			];
		}
	}

	/**
	 * Do the split request
	 *
	 * @param \IContextSource $context Context containing, between other things, the user and the title.
	 * @return \Status
	 */
	public static function doSplitPage( \IContextSource $context, string $content, string $title_new ) {
	}

	/**
	 * Do the merge request
	 *
	 * @param \IContextSource $context Context containing, between other things, the user and the title.
	 * @return array|\Status
	 */
	public static function doMergePages( \IContextSource $context, string $title_merge ) {
	}
}
