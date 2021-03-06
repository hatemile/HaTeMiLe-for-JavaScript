/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

(function () {
    'use strict';
    var base, self;

    self = this;

    this.hatemile || (this.hatemile = {});

    (base = this.hatemile).implementation || (base.implementation = {});

    this.hatemile.implementation.AccessibleNavigationImplementation = (function () {
        var CLASS_FORCE_LINK_AFTER, CLASS_FORCE_LINK_BEFORE, CLASS_HEADING_ANCHOR, CLASS_SKIPPER_ANCHOR, CLASS_TEXT_HEADING, DATA_ANCHOR_FOR, DATA_ATTRIBUTE_LONG_DESCRIPTION_OF, DATA_HEADING_ANCHOR_FOR, DATA_HEADING_LEVEL, ID_CONTAINER_HEADING_AFTER, ID_CONTAINER_HEADING_BEFORE, ID_CONTAINER_SKIPPERS;

        ID_CONTAINER_SKIPPERS = 'container-skippers';

        ID_CONTAINER_HEADING_BEFORE = 'container-heading-before';

        ID_CONTAINER_HEADING_AFTER = 'container-heading-after';

        CLASS_TEXT_HEADING = 'text-heading';

        CLASS_SKIPPER_ANCHOR = 'skipper-anchor';

        CLASS_HEADING_ANCHOR = 'heading-anchor';

        CLASS_FORCE_LINK_BEFORE = 'force-link-before';

        CLASS_FORCE_LINK_AFTER = 'force-link-after';

        DATA_ANCHOR_FOR = 'data-anchorfor';

        DATA_HEADING_ANCHOR_FOR = 'data-headinganchorfor';

        DATA_HEADING_LEVEL = 'data-headinglevel';

        DATA_ATTRIBUTE_LONG_DESCRIPTION_OF = 'data-attributelongdescriptionof';

        AccessibleNavigationImplementation.prototype._generateListSkippers = function () {
            var container, list, local;
            container = this.parser.find("#" + ID_CONTAINER_SKIPPERS).firstResult();
            if (container === null) {
                local = this.parser.find('body').firstResult();
                if (local !== null) {
                    container = this.parser.createElement('div');
                    container.setAttribute('id', ID_CONTAINER_SKIPPERS);
                    local.prependElement(container);
                }
            }
            list = null;
            if (container !== null) {
                list = this.parser.find(container).findChildren('ul').firstResult();
                if (list === null) {
                    list = this.parser.createElement('ul');
                    container.appendElement(list);
                }
            }
            this.listSkippersAdded = true;
            return list;
        };

        AccessibleNavigationImplementation.prototype._generateListHeading = function () {
            var containerAfter, containerBefore, local, textContainer;
            local = this.parser.find('body').firstResult();
            if (local !== null) {
                containerBefore = this.parser.find("#" + ID_CONTAINER_HEADING_BEFORE).firstResult();
                if ((containerBefore === null) && (this.elementsHeadingBefore.length > 0)) {
                    containerBefore = this.parser.createElement('div');
                    containerBefore.setAttribute('id', ID_CONTAINER_HEADING_BEFORE);
                    textContainer = this.parser.createElement('span');
                    textContainer.setAttribute('class', CLASS_TEXT_HEADING);
                    textContainer.appendText(this.elementsHeadingBefore);
                    containerBefore.appendElement(textContainer);
                    local.prependElement(containerBefore);
                }
                if (containerBefore !== null) {
                    this.listHeadingBefore = this.parser.find(containerBefore).findChildren('ol').firstResult();
                    if (this.listHeadingBefore === null) {
                        this.listHeadingBefore = this.parser.createElement('ol');
                        containerBefore.appendElement(this.listHeadingBefore);
                    }
                }
                containerAfter = this.parser.find("#" + ID_CONTAINER_HEADING_AFTER).firstResult();
                if ((containerAfter === null) && (this.elementsHeadingAfter.length > 0)) {
                    containerAfter = this.parser.createElement('div');
                    containerAfter.setAttribute('id', ID_CONTAINER_HEADING_AFTER);
                    textContainer = this.parser.createElement('span');
                    textContainer.setAttribute('class', CLASS_TEXT_HEADING);
                    textContainer.appendText(this.elementsHeadingAfter);
                    containerAfter.appendElement(textContainer);
                    local.appendElement(containerAfter);
                }
                if (containerAfter !== null) {
                    this.listHeadingAfter = this.parser.find(containerAfter).findChildren('ol').firstResult();
                    if (this.listHeadingAfter === null) {
                        this.listHeadingAfter = this.parser.createElement('ol');
                        containerAfter.appendElement(this.listHeadingAfter);
                    }
                }
                this.listHeadingAdded = true;
            }
        };

        AccessibleNavigationImplementation.prototype._getHeadingLevel = function (element) {
            var tag;
            tag = element.getTagName();
            if (tag === 'H1') {
                return 1;
            } else if (tag === 'H2') {
                return 2;
            } else if (tag === 'H3') {
                return 3;
            } else if (tag === 'H4') {
                return 4;
            } else if (tag === 'H5') {
                return 5;
            } else if (tag === 'H6') {
                return 6;
            } else {
                return -1;
            }
        };

        AccessibleNavigationImplementation.prototype._isValidHeading = function () {
            var countMainHeading, element, elements, i, lastLevel, len, level;
            this.validateHeading = true;
            elements = this.parser.find('h1,h2,h3,h4,h5,h6').listResults();
            lastLevel = 0;
            countMainHeading = 0;
            for (i = 0, len = elements.length; i < len; i++) {
                element = elements[i];
                level = this._getHeadingLevel(element);
                if (level === 1) {
                    if (countMainHeading === 1) {
                        return false;
                    } else {
                        countMainHeading = 1;
                    }
                }
                if (level - lastLevel > 1) {
                    return false;
                }
                lastLevel = level;
            }
            return true;
        };

        AccessibleNavigationImplementation.prototype._generateAnchorFor = function (element, dataAttribute, anchorClass) {
            var anchor;
            this.idGenerator.generateId(element);
            anchor = null;
            if (this.parser.find("[" + dataAttribute + "=\"" + (element.getAttribute('id')) + "\"]").firstResult() === null) {
                if (element.getTagName() === 'A') {
                    anchor = element;
                } else {
                    anchor = this.parser.createElement('a');
                    this.idGenerator.generateId(anchor);
                    anchor.setAttribute('class', anchorClass);
                    element.insertBefore(anchor);
                }
                if (!anchor.hasAttribute('name')) {
                    anchor.setAttribute('name', anchor.getAttribute('id'));
                }
                anchor.setAttribute(dataAttribute, element.getAttribute('id'));
            }
            return anchor;
        };

        AccessibleNavigationImplementation.prototype._freeShortcut = function (shortcut) {
            var alphaNumbers, element, elementWithShortcuts, elements, found, i, j, k, key, len, len1, len2, shortcuts;
            alphaNumbers = '1234567890abcdefghijklmnopqrstuvwxyz';
            elements = this.parser.find('[accesskey]').listResults();
            for (i = 0, len = elements.length; i < len; i++) {
                element = elements[i];
                shortcuts = element.getAttribute('accesskey').toLowerCase();
                if (self.hatemile.util.CommonFunctions.inList(shortcuts, shortcut)) {
                    for (j = 0, len1 = alphaNumbers.length; j < len1; j++) {
                        key = alphaNumbers[j];
                        found = true;
                        for (k = 0, len2 = elements.length; k < len2; k++) {
                            elementWithShortcuts = elements[k];
                            shortcuts = elementWithShortcuts.getAttribute('accesskey').toLowerCase();
                            if (self.hatemile.util.CommonFunctions.inList(shortcuts, key)) {
                                found = false;
                                break;
                            }
                        }
                        if (found) {
                            element.setAttribute('accesskey', key);
                            break;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
            }
        };

        function AccessibleNavigationImplementation(parser, configure, skippers) {
            this.parser = parser;
            this.configure = configure;
            this.skippers = skippers;
            this.idGenerator = new hatemile.util.IDGenerator('navigation');
            this.attributeLongDescriptionPrefixBefore = this.configure.getParameter('attribute-longdescription-prefix-before');
            this.attributeLongDescriptionSuffixBefore = this.configure.getParameter('attribute-longdescription-suffix-before');
            this.attributeLongDescriptionPrefixAfter = this.configure.getParameter('attribute-longdescription-prefix-after');
            this.attributeLongDescriptionSuffixAfter = this.configure.getParameter('attribute-longdescription-suffix-after');
            this.elementsHeadingBefore = this.configure.getParameter('elements-heading-before');
            this.elementsHeadingAfter = this.configure.getParameter('elements-heading-after');
            this.listSkippersAdded = false;
            this.listHeadingAdded = false;
            this.validateHeading = false;
            this.validHeading = false;
            this.listSkippers = null;
            this.listHeadingBefore = null;
            this.listHeadingAfter = null;
        }

        AccessibleNavigationImplementation.prototype.provideNavigationBySkipper = function (element) {
            var anchor, auxiliarElement, auxiliarElements, auxiliarSkipper, i, itemLink, j, len, len1, link, ref, shortcut, shortcuts, skipper;
            skipper = null;
            ref = this.skippers;
            for (i = 0, len = ref.length; i < len; i++) {
                auxiliarSkipper = ref[i];
                auxiliarElements = this.parser.find(auxiliarSkipper['selector']).listResults();
                for (j = 0, len1 = auxiliarElements.length; j < len1; j++) {
                    auxiliarElement = auxiliarElements[j];
                    if (auxiliarElement.equals(element)) {
                        skipper = auxiliarSkipper;
                        break;
                    }
                }
                if (skipper !== null) {
                    break;
                }
            }
            if (skipper !== null) {
                if (!this.listSkippersAdded) {
                    this.listSkippers = this._generateListSkippers();
                }
                if (this.listSkippers !== null) {
                    anchor = this._generateAnchorFor(element, DATA_ANCHOR_FOR, CLASS_SKIPPER_ANCHOR);
                    if (anchor !== null) {
                        itemLink = this.parser.createElement('li');
                        link = this.parser.createElement('a');
                        link.setAttribute('href', "#" + (anchor.getAttribute('name')));
                        link.appendText(this.configure.getParameter(skipper['description']));
                        shortcuts = skipper['shortcut'];
                        if ((shortcuts !== void 0) && (shortcuts.length > 0)) {
                            shortcut = shortcuts[0];
                            this._freeShortcut(shortcut);
                            link.setAttribute('accesskey', shortcut);
                        }
                        this.idGenerator.generateId(link);
                        itemLink.appendElement(link);
                        this.listSkippers.appendElement(itemLink);
                    }
                }
            }
        };

        AccessibleNavigationImplementation.prototype.provideNavigationByAllSkippers = function () {
            var element, elements, i, j, len, len1, ref, skipper;
            ref = this.skippers;
            for (i = 0, len = ref.length; i < len; i++) {
                skipper = ref[i];
                elements = this.parser.find(skipper['selector']).listResults();
                for (j = 0, len1 = elements.length; j < len1; j++) {
                    element = elements[j];
                    if (self.hatemile.util.CommonFunctions.isValidElement(element)) {
                        this.provideNavigationBySkipper(element);
                    }
                }
            }
        };

        AccessibleNavigationImplementation.prototype.provideNavigationByHeading = function (heading) {
            var anchor, item, level, link, listAfter, listBefore, selector, superItem;
            if (!this.validateHeading) {
                this.validHeading = this._isValidHeading();
            }
            if (this.validHeading) {
                anchor = this._generateAnchorFor(heading, DATA_HEADING_ANCHOR_FOR, CLASS_HEADING_ANCHOR);
                if (anchor !== null) {
                    if (!this.listHeadingAdded) {
                        this._generateListHeading();
                    }
                    listBefore = null;
                    listAfter = null;
                    level = this._getHeadingLevel(heading);
                    if (level === 1) {
                        listBefore = this.listHeadingBefore;
                        listAfter = this.listHeadingAfter;
                    } else {
                        selector = "[" + DATA_HEADING_LEVEL + "=\"" + ((level - 1).toString()) + "\"]";
                        if (this.listHeadingBefore !== null) {
                            superItem = this.parser.find(this.listHeadingBefore).findDescendants(selector).lastResult();
                            if (superItem !== null) {
                                listBefore = this.parser.find(superItem).findChildren('ol').firstResult();
                                if (listBefore === null) {
                                    listBefore = this.parser.createElement('ol');
                                    superItem.appendElement(listBefore);
                                }
                            }
                        }
                        if (this.listHeadingAfter !== null) {
                            superItem = this.parser.find(this.listHeadingAfter).findDescendants(selector).lastResult();
                            if (superItem !== null) {
                                listAfter = this.parser.find(superItem).findChildren('ol').firstResult();
                                if (listAfter === null) {
                                    listAfter = this.parser.createElement('ol');
                                    superItem.appendElement(listAfter);
                                }
                            }
                        }
                    }
                    item = this.parser.createElement('li');
                    item.setAttribute(DATA_HEADING_LEVEL, level.toString());
                    link = this.parser.createElement('a');
                    link.setAttribute('href', "#" + (anchor.getAttribute('name')));
                    link.appendText(heading.getTextContent());
                    item.appendElement(link);
                    if (listBefore !== null) {
                        listBefore.appendElement(item.cloneElement());
                    }
                    if (listAfter !== null) {
                        listAfter.appendElement(item.cloneElement());
                    }
                }
            }
        };

        AccessibleNavigationImplementation.prototype.provideNavigationByAllHeadings = function () {
            var element, elements, i, len;
            elements = this.parser.find('h1,h2,h3,h4,h5,h6').listResults();
            for (i = 0, len = elements.length; i < len; i++) {
                element = elements[i];
                if (self.hatemile.util.CommonFunctions.isValidElement(element)) {
                    this.provideNavigationByHeading(element);
                }
            }
        };

        AccessibleNavigationImplementation.prototype.provideNavigationToLongDescription = function (image) {
            var anchor, beforeText, id, text;
            if ((image.hasAttribute('longdesc')) && (image.hasAttribute('alt'))) {
                this.idGenerator.generateId(image);
                id = image.getAttribute('id');
                if ((this.parser.find(("." + CLASS_FORCE_LINK_BEFORE) + ("[" + DATA_ATTRIBUTE_LONG_DESCRIPTION_OF + "=\"" + id + "\"]")).firstResult() === null) && ((this.attributeLongDescriptionPrefixBefore.length > 0) || (this.attributeLongDescriptionSuffixBefore.length > 0))) {
                    beforeText = ("" + this.attributeLongDescriptionPrefixBefore) + ("" + (image.getAttribute('alt'))) + ("" + this.attributeLongDescriptionSuffixBefore);
                    anchor = this.parser.createElement('a');
                    anchor.setAttribute('href', image.getAttribute('longdesc'));
                    anchor.setAttribute('target', '_blank');
                    anchor.setAttribute(DATA_ATTRIBUTE_LONG_DESCRIPTION_OF, id);
                    anchor.setAttribute('class', CLASS_FORCE_LINK_BEFORE);
                    anchor.appendText(beforeText);
                    image.insertBefore(anchor);
                }
                if ((this.parser.find(("." + CLASS_FORCE_LINK_AFTER) + ("[" + DATA_ATTRIBUTE_LONG_DESCRIPTION_OF + "=\"" + id + "\"]")).firstResult() === null) && ((this.attributeLongDescriptionPrefixAfter.length > 0) || (this.attributeLongDescriptionSuffixAfter.length > 0))) {
                    text = ("" + this.attributeLongDescriptionPrefixAfter) + ("" + (image.getAttribute('alt'))) + ("" + this.attributeLongDescriptionSuffixAfter);
                    anchor = this.parser.createElement('a');
                    anchor.setAttribute('href', image.getAttribute('longdesc'));
                    anchor.setAttribute('target', '_blank');
                    anchor.setAttribute(DATA_ATTRIBUTE_LONG_DESCRIPTION_OF, id);
                    anchor.setAttribute('class', CLASS_FORCE_LINK_AFTER);
                    anchor.appendText(text);
                    image.insertAfter(anchor);
                }
            }
        };

        AccessibleNavigationImplementation.prototype.provideNavigationToAllLongDescriptions = function () {
            var element, elements, i, len;
            elements = this.parser.find('[longdesc]').listResults();
            for (i = 0, len = elements.length; i < len; i++) {
                element = elements[i];
                if (self.hatemile.util.CommonFunctions.isValidElement(element)) {
                    this.provideNavigationToLongDescription(element);
                }
            }
        };

        return AccessibleNavigationImplementation;

    })();

}).call(this);
