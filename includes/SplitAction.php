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

	public function getName() {
		return 'split';
	}

  /**
   * Overuse of this function to set outputPage
   */
	protected function getDescription() {
		$out = $this->getOutput();
		$out->addModules('ext.split');
    $out->setPageTitle( $this->msg( 'split-action-title', $this->getPageTitle() )->plain() );
		return '';
	}

	public function getRestriction() {
		return 'splitmerge';
	}

	protected function usesOOUI() {
		return true;
	}

	protected function getFormFields() {

		return [
			'intro' => [
				'type' => 'info',
				'vertical-label' => true,
				'raw' => true,
				'default' => $this->msg( 'split-action-intro' )->parse() .
					'<div id="split-page-wrapper" preRemove="" postRomove="" parsoidUrl=""></div>'
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
	}

	public function onSuccess() {
		$this->getOutput()->addWikiMsg( 'split-action-success' );
	}
}
