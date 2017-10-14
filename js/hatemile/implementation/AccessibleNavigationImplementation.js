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
    var base, self;

    self = this;

    this.hatemile || (this.hatemile = {});

    (base = this.hatemile).implementation || (base.implementation = {});

    this.hatemile.implementation.AccessibleNavigationImplementation = (function () {
        var CLASS_HEADING_ANCHOR, CLASS_LONG_DESCRIPTION_LINK, CLASS_SKIPPER_ANCHOR, DATA_ANCHOR_FOR, DATA_HEADING_ANCHOR_FOR, DATA_HEADING_LEVEL, DATA_LONG_DESCRIPTION_FOR_IMAGE, ID_CONTAINER_HEADING, ID_CONTAINER_SKIPPERS, ID_TEXT_HEADING, freeShortcut, generateAnchorFor, generateListHeading, generateListSkippers, getHeadingLevel, isValidHeading;

        ID_CONTAINER_SKIPPERS = 'container-skippers';

        ID_CONTAINER_HEADING = 'container-heading';

        ID_TEXT_HEADING = 'text-heading';

        CLASS_SKIPPER_ANCHOR = 'skipper-anchor';

        CLASS_HEADING_ANCHOR = 'heading-anchor';

        DATA_ANCHOR_FOR = 'data-anchorfor';

        DATA_HEADING_ANCHOR_FOR = 'data-headinganchorfor';

        DATA_HEADING_LEVEL = 'data-headinglevel';

        CLASS_LONG_DESCRIPTION_LINK = 'longdescription-link';

        DATA_LONG_DESCRIPTION_FOR_IMAGE = 'data-longdescriptionfor';

        generateListSkippers = function (parser) {
            var container, list, local;
            container = parser.find("#" + ID_CONTAINER_SKIPPERS).firstResult();
            if (self.isEmpty(container)) {
                local = parser.find('body').firstResult();
                if (!self.isEmpty(local)) {
                    container = parser.createElement('div');
                    container.setAttribute('id', ID_CONTAINER_SKIPPERS);
                    local.getFirstElementChild().insertBefore(container);
                }
            }
            list = void 0;
            if (!self.isEmpty(container)) {
                list = parser.find(container).findChildren('ul').firstResult();
                if (self.isEmpty(list)) {
                    list = parser.createElement('ul');
                    container.appendElement(list);
                }
            }
            return list;
        };

        generateListHeading = function (parser, textHeading) {
            var container, list, local, textContainer;
            container = parser.find("#" + ID_CONTAINER_HEADING).firstResult();
            if (self.isEmpty(container)) {
                local = parser.find('body').firstResult();
                if (!self.isEmpty(local)) {
                    container = parser.createElement('div');
                    container.setAttribute('id', ID_CONTAINER_HEADING);
                    textContainer = parser.createElement('span');
                    textContainer.setAttribute('id', ID_TEXT_HEADING);
                    textContainer.appendText(textHeading);
                    container.appendElement(textContainer);
                    local.appendElement(container);
                }
            }
            list = void 0;
            if (!self.isEmpty(container)) {
                list = parser.find(container).findChildren('ol').firstResult();
                if (self.isEmpty(list)) {
                    list = parser.createElement('ol');
                    container.appendElement(list);
                }
            }
            return list;
        };

        getHeadingLevel = function (element) {
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

        isValidHeading = function (parser) {
            var countMainHeading, element, elements, i, lastLevel, len, level;
            elements = parser.find('h1,h2,h3,h4,h5,h6').listResults();
            lastLevel = 0;
            countMainHeading = 0;
            for (i = 0, len = elements.length; i < len; i++) {
                element = elements[i];
                level = getHeadingLevel(element);
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

        generateAnchorFor = function (element, dataAttribute, anchorClass, parser, prefixId) {
            var anchor;
            self.hatemile.util.CommonFunctions.generateId(element, prefixId);
            anchor = void 0;
            if (self.isEmpty(parser.find(("[" + dataAttribute + "=\"") + ((element.getAttribute('id')) + "\"]")).firstResult())) {
                if (element.getTagName() === 'A') {
                    anchor = element;
                } else {
                    anchor = parser.createElement('a');
                    self.hatemile.util.CommonFunctions.generateId(anchor, prefixId);
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

        freeShortcut = function (shortcut, parser) {
            var alphaNumbers, element, elementWithShortcuts, elements, found, i, j, k, key, len, len1, len2, shortcuts;
            alphaNumbers = '1234567890abcdefghijklmnopqrstuvwxyz';
            elements = parser.find('[accesskey]').listResults();
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

        function AccessibleNavigationImplementation(parser1, configure, skippers) {
            this.parser = parser1;
            this.skippers = skippers;
            this.prefixId = configure.getParameter('prefix-generated-ids');
            this.attributeLongDescriptionPrefixBefore = configure.getParameter('attribute-longdescription-prefix-before');
            this.attributeLongDescriptionSuffixBefore = configure.getParameter('attribute-longdescription-suffix-before');
            this.attributeLongDescriptionPrefixAfter = configure.getParameter('attribute-longdescription-prefix-after');
            this.attributeLongDescriptionSuffixAfter = configure.getParameter('attribute-longdescription-suffix-after');
            this.elementsHeadingBefore = configure.getParameter('elements-heading-before');
            this.elementsHeadingAfter = configure.getParameter('elements-heading-after');
            this.listSkippersAdded = false;
            this.validateHeading = false;
            this.validHeading = false;
            this.listSkippers = void 0;
        }

        AccessibleNavigationImplementation.prototype.provideNavigationBySkipper = function (element) {
            var anchor, auxiliarElement, auxiliarElements, auxiliarSkipper, i, itemLink, j, len, len1, link, ref, shortcut, shortcuts, skipper;
            skipper = void 0;
            ref = this.skippers;
            for (i = 0, len = ref.length; i < len; i++) {
                auxiliarSkipper = ref[i];
                auxiliarElements = this.parser.find(auxiliarSkipper['selector']).listResults();
                for (j = 0, len1 = auxiliarElements.length; j < len1; j++) {
                    auxiliarElement = auxiliarElements[j];
                    if (auxiliarElement.getData() === element.getData()) {
                        skipper = auxiliarSkipper;
                        break;
                    }
                }
                if (skipper !== void 0) {
                    break;
                }
            }
            if (skipper !== void 0) {
                if (!this.listSkippersAdded) {
                    this.listSkippers = generateListSkippers(this.parser);
                    this.listSkippersAdded = true;
                }
                if (!self.isEmpty(this.listSkippers)) {
                    anchor = generateAnchorFor(element, DATA_ANCHOR_FOR, CLASS_SKIPPER_ANCHOR, this.parser, this.prefixId);
                    if (!self.isEmpty(anchor)) {
                        itemLink = this.parser.createElement('li');
                        link = this.parser.createElement('a');
                        link.setAttribute('href', "#" + (anchor.getAttribute('name')));
                        link.appendText(skipper['description']);
                        shortcuts = skipper['shortcut'];
                        if (!self.isEmpty(shortcuts)) {
                            shortcut = shortcuts[0];
                            if (!self.isEmpty(shortcut)) {
                                freeShortcut(shortcut, this.parser);
                                link.setAttribute('accesskey', shortcut);
                            }
                        }
                        self.hatemile.util.CommonFunctions.generateId(link, this.prefixId);
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
            var anchor, item, level, link, list, superItem;
            if (!this.validateHeading) {
                this.validHeading = isValidHeading(this.parser);
                this.validateHeading = true;
            }
            if (this.validHeading) {
                anchor = generateAnchorFor(heading, DATA_HEADING_ANCHOR_FOR, CLASS_HEADING_ANCHOR, this.parser, this.prefixId);
                if (!self.isEmpty(anchor)) {
                    level = getHeadingLevel(heading);
                    if (level === 1) {
                        list = generateListHeading(this.parser, "" + this.elementsHeadingBefore + this.elementsHeadingAfter);
                    } else {
                        superItem = this.parser.find("#" + ID_CONTAINER_HEADING).findDescendants(("[" + DATA_HEADING_LEVEL + "=\"") + (((level - 1).toString()) + "\"]")).lastResult();
                        if (!self.isEmpty(superItem)) {
                            list = this.parser.find(superItem).findChildren('ol').firstResult();
                            if (self.isEmpty(list)) {
                                list = this.parser.createElement('ol');
                                superItem.appendElement(list);
                            }
                        }
                    }
                    if (!self.isEmpty(list)) {
                        item = this.parser.createElement('li');
                        item.setAttribute(DATA_HEADING_LEVEL, level.toString());
                        link = this.parser.createElement('a');
                        link.setAttribute('href', "#" + (anchor.getAttribute('name')));
                        link.appendText(heading.getTextContent());
                        item.appendElement(link);
                        list.appendElement(item);
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
            var anchor, id, text;
            if (image.hasAttribute('longdesc')) {
                self.hatemile.util.CommonFunctions.generateId(image, this.prefixId);
                id = image.getAttribute('id');
                if (self.isEmpty(this.parser.find("[" + DATA_LONG_DESCRIPTION_FOR_IMAGE + "=\"" + id + "\"]").firstResult())) {
                    if (image.hasAttribute('alt')) {
                        if (!(self.isEmpty(this.attributeLongDescriptionPrefixBefore) && self.isEmpty(this.attributeLongDescriptionSuffixBefore))) {
                            text = (this.attributeLongDescriptionPrefixBefore + " ") + ((image.getAttribute('alt')) + " ") + ("" + this.attributeLongDescriptionSuffixBefore);
                            anchor = this.parser.createElement('a');
                            anchor.setAttribute('href', image.getAttribute('longdesc'));
                            anchor.setAttribute('target', '_blank');
                            anchor.setAttribute(DATA_LONG_DESCRIPTION_FOR_IMAGE, id);
                            anchor.setAttribute('class', CLASS_LONG_DESCRIPTION_LINK);
                            anchor.appendText(text);
                            image.insertBefore(anchor);
                        }
                        if (!(self.isEmpty(this.attributeLongDescriptionPrefixAfter) && self.isEmpty(this.attributeLongDescriptionSuffixAfter))) {
                            text = (this.attributeLongDescriptionPrefixAfter + " ") + ((image.getAttribute('alt')) + " ") + ("" + this.attributeLongDescriptionSuffixAfter);
                            anchor = this.parser.createElement('a');
                            anchor.setAttribute('href', image.getAttribute('longdesc'));
                            anchor.setAttribute('target', '_blank');
                            anchor.setAttribute(DATA_LONG_DESCRIPTION_FOR_IMAGE, id);
                            anchor.setAttribute('class', CLASS_LONG_DESCRIPTION_LINK);
                            anchor.appendText(text);
                            image.insertAfter(anchor);
                        }
                    }
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
