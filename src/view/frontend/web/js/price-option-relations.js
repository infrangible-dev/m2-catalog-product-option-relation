/**
 * @author      Andreas Knollmann
 * @copyright   2014-2025 Softwareentwicklung Andreas Knollmann
 * @license     http://www.opensource.org/licenses/mit-license.php MIT
 */

define([
    'jquery',
    'priceUtils'
], function ($, utils) {
    'use strict';

    const globalOptions = {
        optionsSelector: '.product-custom-option',
        optionConfig: {}
    };

    $.widget('infrangible.priceOptionRelations', {
        options: globalOptions,

        _init: function initPriceOptionRelations() {
        },

        _create: function createPriceOptionRelations() {
            const options = $(this.options.optionsSelector, this.element);

            this.updateOptions();

            options.on('change', this._onOptionChanged.bind(this));
        },

        _onOptionChanged: function onOptionChanged(event) {
            const changedOption = $(event.target);

            this.updateOptions(changedOption);
        },

        updateOptions: function updateOptions(changedOption) {
            const self = this;

            const changedOptionId = changedOption ? utils.findOptionId(changedOption[0]) : 0;

            const selectedOptions = this.getOptionValues();

            const options = $(this.options.optionsSelector, this.element);

            options.each(function() {
                const option = $(this);

                const optionId = utils.findOptionId(option[0]);

                if (optionId !== changedOptionId && self.options.optionConfig[optionId]) {
                    const optionType = option.prop('type');

                    const optionValue = option.val();

                    switch (optionType) {
                        case 'select-one':
                        case 'select-multiple':
                            option.find('option').each(function() {
                                const value = $(this);

                                if (this.value) {
                                    if (self.options.optionConfig[optionId][this.value]) {
                                        let allowed = true;
                                        let hide = false;

                                        const relations = self.options.optionConfig[optionId][this.value];

                                        $.each(relations, function(relationOptionId, optionRelations) {
                                            $.each(optionRelations, function(relationOptionValue, relationType) {
                                                if (relationType === '1' || relationType === '3') {
                                                    if (Array.isArray(selectedOptions[relationOptionId])) {
                                                        if (selectedOptions[relationOptionId].indexOf(relationOptionValue) === -1) {
                                                            console.debug('No match allowed: ' + selectedOptions[relationOptionId] + '!=' + relationOptionValue);
                                                            allowed = false;
                                                            hide = relationType === '3';
                                                        }
                                                    } else if (selectedOptions[relationOptionId] !== relationOptionValue) {
                                                        console.debug('No match allowed: ' + selectedOptions[relationOptionId] + '!=' + relationOptionValue);
                                                        allowed = false;
                                                        hide = relationType === '3';
                                                    }
                                                } else if ((relationType === '2' || relationType === '4')) {
                                                    if (Array.isArray(selectedOptions[relationOptionId])) {
                                                        if (selectedOptions[relationOptionId].indexOf(relationOptionValue) !== -1) {
                                                            console.debug('Match prohibited: ' + selectedOptions[relationOptionId] + '==' + relationOptionValue);
                                                            allowed = false;
                                                            hide = relationType === '4';
                                                        }
                                                    } else if (selectedOptions[relationOptionId] === relationOptionValue) {
                                                        console.debug('Match prohibited: ' + selectedOptions[relationOptionId] + '==' + relationOptionValue);
                                                        allowed = false;
                                                        hide = relationType === '4';
                                                    }
                                                }
                                            });
                                        });

                                        if (allowed) {
                                            value.removeAttr('disabled');
                                            value.show();
                                        } else {
                                            if (Array.isArray(optionValue)) {
                                                const valueIndex = optionValue.indexOf(this.value);
                                                if (valueIndex !== -1) {
                                                    optionValue.splice(valueIndex, 1);
                                                    option.val(optionValue);
                                                }
                                            } else {
                                                if (optionValue === this.value) {
                                                    option.val('');
                                                }
                                            }

                                            value.attr('disabled', 'disabled');
                                            if (hide) {
                                                value.hide();
                                            }
                                        }
                                    }
                                }
                            });
                            break;
                        case 'radio':
                        case 'checkbox':
                            if (this.value) {
                                if (self.options.optionConfig[optionId][this.value]) {
                                    let allowed = true;
                                    let hide = false;

                                    const relations = self.options.optionConfig[optionId][this.value];

                                    $.each(relations, function(relationOptionId, optionRelations) {
                                        $.each(optionRelations, function(relationOptionValue, relationType) {
                                            if (relationType === '1' || relationType === '3') {
                                                if (Array.isArray(selectedOptions[relationOptionId])) {
                                                    if (selectedOptions[relationOptionId].indexOf(relationOptionValue) === -1) {
                                                        console.debug('No match allowed: ' + selectedOptions[relationOptionId] + '!=' + relationOptionValue);
                                                        allowed = false;
                                                        hide = relationType === '3';
                                                    }
                                                } else if (selectedOptions[relationOptionId] !== relationOptionValue) {
                                                    console.debug('No match allowed: ' + selectedOptions[relationOptionId] + '!=' + relationOptionValue);
                                                    allowed = false;
                                                    hide = relationType === '3';
                                                }
                                            } else if ((relationType === '2' || relationType === '4')) {
                                                if (Array.isArray(selectedOptions[relationOptionId])) {
                                                    if (selectedOptions[relationOptionId].indexOf(relationOptionValue) !== -1) {
                                                        console.debug('Match prohibited: ' + selectedOptions[relationOptionId] + '==' + relationOptionValue);
                                                        allowed = false;
                                                        hide = relationType === '4';
                                                    }
                                                } else if (selectedOptions[relationOptionId] === relationOptionValue) {
                                                    console.debug('Match prohibited: ' + selectedOptions[relationOptionId] + '==' + relationOptionValue);
                                                    allowed = false;
                                                    hide = relationType === '4';
                                                }
                                            }
                                        });
                                    });

                                    if (allowed) {
                                        option.removeAttr('disabled');
                                        option.show();
                                    } else {
                                        option.prop('checked', false);
                                        option.attr('disabled', 'disabled');
                                        if (hide) {
                                            option.hide();
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
            });
        },

        getOptionValues: function getOptionValues() {
            const options = $(this.options.optionsSelector, this.element);

            const optionValues = [];

            options.each(function() {
                const option = $(this);
                const optionId = utils.findOptionId(option[0]);
                const nodeName = option.prop('nodeName');
                let optionValue = null;
                if (nodeName === 'SELECT') {
                    optionValue = option.val();
                } else if (nodeName === 'INPUT') {
                    const type = option.attr('type');
                    if (type === 'radio') {
                        if (option.is(':checked')) {
                            optionValue = option.val();
                        }
                    } else if (type === 'checkbox') {
                        if (option.is(':checked')) {
                            optionValue = option.val();
                            if (optionValues[optionId] !== undefined) {
                                if (Array.isArray(optionValues[optionId])) {
                                    optionValue = optionValues[optionId];
                                } else {
                                    optionValue = [optionValues[optionId]];
                                }
                                optionValue.push(option.val());
                            }
                        }
                    }
                }
                if (optionValue) {
                    optionValues[optionId] = optionValue;
                }
            });

            return optionValues;
        }
    });
});
