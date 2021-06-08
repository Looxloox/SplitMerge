<?php
namespace MediaWiki\Extension\SplitMerge;
/**
 * SplitMerge - add a button to split the page.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * @author Alexandre Brulet <alexandre.brulet@laposte.net>
 * @license GPL-3.0+
 * @package MediaWiki-extension-SplitMerge
 */

class SplitAction extends \FormAction {

	private $newPageTitle, $newPageNamespace;

	public function getName() {
		return 'split';
	}

	protected function getDescription() {
		return '';
	}

	public function show() {
		$this->setHeaders();
		$out = $this->getOutput();
		$out->addModules('ext.split');
    $out->setPageTitle( $this->msg( 'split-action-title', $this->getPageTitle() )->plain() );

		// This will throw exceptions if there's a problem
		$this->checkCanExecute( $this->getUser() );

		$form = $this->getForm();
		if ( $form->show() ) {
			$this->onSuccess();
		}
	}

	public function getRestriction() {
		return 'splitmerge';
	}

	protected function usesOOUI() {
		return true;
	}

	protected function getFormFields() {
		global $wgSplitMergeNamespaces;

		return [
			'intro' => [
				'type' => 'info',
				'vertical-label' => true,
				'raw' => true,
				'default' => $this->msg( 'split-action-intro' )->parse() .
					'<div id="split-page-wrapper" ></div>'
			],
			'title-new' => [
				'type' => 'text',
				'vertical-label' => true,
				'raw' => true,
				'label' => $this->msg( 'split-action-new-title-label' )->plain()
			],
			'selected-content' => [
				'type' => 'hidden'
			]
		];
	}

	protected function alterForm( $form ) {
    /*
		$form->setWrapperLegendMsg( 'mgwiki-send-notification-confirm-title' );
		$form->setSubmitTextMsg( 'mgwiki-send-notification-confirm-button' );
    */
	}

	/**
	 * @stable to override
	 * @return string HTML
	 */
	protected function postText() {
	}

	public function onSubmit( $data ) {

		$this->newPageTitle = \Title::newFromText($data['title-new']);

		$stripprefix = "";
		$strippostfix = "";

		$content = \WikiPage::Factory($this->getTitle())->getContent()->getNativeData();

		// adjust truncated elements
		if ( preg_match( '/' . preg_quote($data['selected-content'],'/') . '/', $content ) < 1 ) {
			if ( preg_match( "/(^'''''|^<.*>|^:|^;)(.*\s)/", $data['selected-content'], $matches ) > 0 ) {
				if ( preg_match( '/' . preg_quote($matches[2],'/') . '/', $content ) > 0 ) {
					$stripprefix = $matches[1];
				}
			} elseif ( preg_match( "/(^''')(.*\s)/", $data['selected-content'], $matches ) > 0 ) {
				if ( preg_match( '/' . preg_quote($matches[2],'/') . '/', $content ) > 0 ) {
					$stripprefix = $matches[1];
				}
			} elseif ( preg_match( "/(^'')(.*\s)/", $data['selected-content'], $matches ) > 0 ) {
				if ( preg_match( '/' . preg_quote($matches[2],'/') . '/', $content ) > 0 ) {
					$stripprefix = $matches[1];
				}
			}

			if ( preg_match( "/(\s.*)('''''$|<.*>$)/", $data['selected-content'], $matches ) > 0 ) {
				if ( preg_match( '/' . preg_quote($matches[1],'/') . '/', $content ) > 0 ) {
					$strippostfix = $matches[2];
				}
			} elseif ( preg_match( "/(\s.*)('''$)/", $data['selected-content'], $matches ) > 0 ) {
				if ( preg_match( '/' . preg_quote($matches[1],'/') . '/', $content ) > 0 ) {
					$strippostfix = $matches[2];
				}
			} elseif ( preg_match( "/(\s.*)(''$)/", $data['selected-content'], $matches ) > 0 ) {
				if ( preg_match( '/' . preg_quote($matches[1],'/') . '/', $content ) > 0 ) {
					$strippostfix = $matches[2];
				}
			}
		}

		$strip = $data['selected-content'];
		if ( $stripprefix ) {
			$strip = preg_replace( '/^' . preg_quote($stripprefix,'/') . '/', '', $strip );
		}
		if ( $strippostfix ) {
			$strip = preg_replace( '/' . preg_quote($strippostfix,'/') . '$/', '', $strip );
		}

		if ( preg_match('/' . preg_quote($strip,'/') . '/', $content ) > 0 ) {
			$oldContent = str_replace($strip, '', $content );
			return true;
			//$this->getOutput()->addWikiMsg( 'split-action-success', $this->newPageTitle->getFullText() );
		}
		else var_dump("PAS OK");

	}

	public function onSuccess() {
		$this->getOutput()->addWikiMsg( 'split-action-success', $this->newPageTitle->getFullText() );
	}
}
