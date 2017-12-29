###
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###
self = this

# @namespace hatemile
#
@hatemile or= {}

# @namespace hatemile.implementation
#
@hatemile.implementation or= {}

# The AccessibleCSSImplementation class is official implementation of
# AccessibleCSS interface.
#
# @extend hatemile.AccessibleCSS
#
class @hatemile.implementation.AccessibleCSSImplementation
  
  DATA_IGNORE = 'data-ignoreaccessibilityfix'
  DATA_ISOLATOR_ELEMENT = 'data-auxiliarspan'
  DATA_SPEAK = 'data-cssspeak'
  DATA_SPEAK_AS = 'data-cssspeakas'
  VALID_INHERIT_TAGS = ['SPAN', 'A', 'RT', 'DFN', 'ABBR', 'Q', 'CITE', 'EM', \
      'TIME', 'VAR', 'SAMP', 'I', 'B', 'SUB', 'SUP', 'SMALL', 'STRONG', \
      'MARK', 'RUBY', 'INS', 'DEL', 'KBD', 'BDO', 'CODE', 'P', 'FIGCAPTION', \
      'FIGURE', 'PRE', 'DIV', 'OL', 'UL', 'LI', 'BLOCKQUOTE', 'DL', 'DT', \
      'DD', 'FIELDSET', 'LEGEND', 'LABEL', 'FORM', 'BODY', 'ASIDE', 'ADDRESS', \
      'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SECTION', 'HEADER', 'NAV', \
      'ARTICLE', 'FOOTER', 'HGROUP', 'CAPTION', 'SUMMARY', 'DETAILS', 'TABLE', \
      'TR', 'TD', 'TH', 'TBODY', 'THEAD', 'TFOOT']
  VALID_TAGS = ['SPAN', 'A', 'RT', 'DFN', 'ABBR', 'Q', 'CITE', 'EM', 'TIME', \
      'VAR', 'SAMP', 'I', 'B', 'SUB', 'SUP', 'SMALL', 'STRONG', 'MARK', \
      'RUBY', 'INS', 'DEL', 'KBD', 'BDO', 'CODE', 'P', 'FIGCAPTION', 'FIGURE', \
      'PRE', 'DIV', 'LI', 'BLOCKQUOTE', 'DT', 'DD', 'FIELDSET', 'LEGEND', \
      'LABEL', 'FORM', 'BODY', 'ASIDE', 'ADDRESS', 'H1', 'H2', 'H3', 'H4', \
      'H5', 'H6', 'SECTION', 'HEADER', 'NAV', 'ARTICLE', 'FOOTER', 'CAPTION', \
      'SUMMARY', 'DETAILS', 'TD', 'TH']
  
  # Returns the symbol formated to be searched by regular expression.
  #
  # @param [string] symbol The symbol.
  #
  # @return [string] The symbol formated.
  #
  getFormatedSymbol: (symbol) ->
    return symbol.replace('\\', '\\\\').replace('.', '\\.').replace('+', '\\+')
        .replace('*', '\\*').replace('?', '\\?').replace('^', '\\^')
        .replace('$', '\\$').replace('[', '\\[').replace(']', '\\[')
        .replace('{', '\\{').replace('}', '\\}').replace('(', '\\(')
        .replace(')', '\\)').replace('|', '\\|').replace('/', '\\/')
        .replace(',', '\\,').replace('!', '\\!').replace('=', '\\=')
        .replace(':', '\\:').replace('-', '\\-')
  
  # Returns the description of symbol.
  #
  # @param [string] symbol The symbol.
  #
  # @return [string] The description of symbol.
  #
  getDescriptionOfSymbol: (symbol) ->
    for _symbol in @symbols
      if _symbol.symbol is symbol
        return _symbol.description
    return null
  
  # Returns the regular expression to search all symbols.
  #
  # @return [string] The regular expression to search all symbols.
  #
  getRegularExpressionOfSymbols: () ->
    regularExpression = null
    for symbol in @symbols
      formatedSymbol = @getFormatedSymbol(symbol.symbol)
      if self.isEmpty(regularExpression)
        regularExpression = "(#{formatedSymbol})"
      else
        regularExpression = "#{regularExpression}|(#{formatedSymbol})"
    return regularExpression
  
  # Check that the children of element can be manipulated to apply the CSS
  # properties.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  # @return [boolean] True if the children of element can be manipulated to
  # apply the CSS properties or false if the children of element cannot be
  # manipulated to apply the CSS properties.
  #
  isValidInheritElement: (element) ->
    return (VALID_INHERIT_TAGS.indexOf(element.getTagName()) isnt -1) \
        and (not element.hasAttribute(DATA_IGNORE))
  
  # Check that the element can be manipulated to apply the CSS properties.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  # @return [boolean] True if the element can be manipulated to apply the CSS
  # properties or false if the element cannot be manipulated to apply the CSS
  # properties.
  #
  isValidElement: (element) ->
    return VALID_TAGS.indexOf(element.getTagName()) isnt -1
  
  # Isolate text nodes of element nodes.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  isolateTextNode: (element) ->
    if (element.hasChildrenElements()) and (@isValidElement(element))
      if @isValidElement(element)
        children = element.getChildren()
        for child in children
          if child instanceof self.hatemile.util.html.vanilla
              .VanillaHTMLDOMTextNode
            span = @htmlParser.createElement('span')
            span.setAttribute(DATA_ISOLATOR_ELEMENT, 'true')
            span.appendText(child.getTextContent())
            
            child.replaceNode(span)
      children = element.getChildrenElements()
      for elementChild in children
        @isolateTextNode(elementChild)
    return
  
  # Replace the element by own text content.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  replaceElementByOwnContent: (element) ->
    if element.hasChildrenElements()
      children = element.getChildrenElements()
      for child in children
        element.insertBefore(child)
      element.removeNode()
    else if element.hasChildren()
      element.replaceNode(element.getFirstNodeChild())
    return
  
  # Visit and execute a operation in element and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  # @param [function] operation The operation to be executed.
  #
  visit: (element, operation) ->
    if @isValidInheritElement(element)
      if element.hasChildrenElements()
        children = element.getChildrenElements()
        for child in children
          @visit(child, operation)
      else if @isValidElement(element)
        operation.call(this, element)
    return
  
  # Create a element to show the content.
  #
  # @param [string] content The text content of element.
  # @param [string] dataPropertyValue The value of custom attribute used to
  # identify the fix.
  #
  # @return [hatemile.util.html.HTMLDOMElement] The element to show the content.
  #
  createContentElement: (content, dataPropertyValue) ->
    contentElement = @htmlParser.createElement('span')
    contentElement.setAttribute(DATA_ISOLATOR_ELEMENT, 'true')
    contentElement.setAttribute(DATA_SPEAK_AS, dataPropertyValue)
    contentElement.appendText(content)
    return contentElement
  
  # Create a element to show the content, only to aural displays.
  #
  # @param [string] content The text content of element.
  # @param [string] dataPropertyValue The value of custom attribute used to
  # identify the fix.
  #
  # @return [hatemile.util.html.HTMLDOMElement] The element to show the content.
  #
  createAuralContentElement: (content, dataPropertyValue) ->
    contentElement = @createContentElement(content, dataPropertyValue)
    contentElement.setAttribute('unselectable', 'on')
    contentElement.setAttribute('class', 'screen-reader-only')
    return contentElement
  
  # Create a element to show the content, only to visual displays.
  #
  # @param [string] content The text content of element.
  # @param [string] dataPropertyValue The value of custom attribute used to
  # identify the fix.
  #
  # @return [hatemile.util.html.HTMLDOMElement] The element to show the content.
  #
  createVisualContentElement: (content, dataPropertyValue) ->
    contentElement = @createContentElement(content, dataPropertyValue)
    contentElement.setAttribute('aria-hidden', 'true')
    contentElement.setAttribute('role', 'presentation')
    return contentElement
  
  # Speak the content of element only.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakNormal: (element) ->
    if element.hasAttribute(DATA_SPEAK)
      if (element.getAttribute(DATA_SPEAK) is 'none') \
          and (not element.hasAttribute(DATA_ISOLATOR_ELEMENT))
        element.removeAttribute('role')
        element.removeAttribute('aria-hidden')
        element.removeAttribute(DATA_SPEAK)
      else
        @replaceElementByOwnContent(element)
    return
  
  # Speak the content of element and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakNormalInherit: (element) ->
    @visit(element, @speakNormal)
    
    element.normalize()
    return
  
  # No speak any content of element only.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakNone: (element) ->
    element.setAttribute('role', 'presentation')
    element.setAttribute('aria-hidden', 'true')
    element.setAttribute(DATA_SPEAK, 'none')
    return
  
  # No speak any content of element and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakNoneInherit: (element) ->
    @isolateTextNode(element)
    
    @visit(element, @speakNone)
    return
  
  # Execute a operation by regular expression for element only.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  # @param [string] regularExpression The regular expression.
  # @param [string] dataPropertyValue The value of custom attribute used to
  # identify the fix.
  # @param [function] operation The operation to be executed.
  #
  speakAs: (element, regularExpression, dataPropertyValue, operation) ->
    children = []
    index = -1
    content = element.getTextContent()
    while (content.length > 0)
      index = content.search(new RegExp(regularExpression))
      if index isnt -1
        operation.call(this, content, index, children)

        index = index + 1
        content = content.substr(index)
      else
        break
    
    if children.length > 0
      if content.length > 0
        children.push(@createContentElement(content, dataPropertyValue))
      
      while (element.hasChildren())
        element.getFirstNodeChild().removeNode()
      
      for child in children
        element.appendElement(child)
    return
  
  # Revert changes of a speakAs method for element and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  # @param [string] dataPropertyValue The value of custom attribute used to
  # identify the fix.
  #
  reverseSpeakAs: (element, dataPropertyValue) ->
    dataProperty = "[#{DATA_SPEAK_AS}=\"#{dataPropertyValue}\"]"
    auxiliarElements = @htmlParser.find(element)
        .findDescendants("#{dataProperty}[unselectable=\"on\"]").listResults()
    for auxiliarElement in auxiliarElements
      auxiliarElement.removeNode()
    
    contentElements = @htmlParser.find(element)
        .findDescendants("#{dataProperty}[#{DATA_ISOLATOR_ELEMENT}=\"true\"]")
        .listResults()
    for contentElement in contentElements
      @replaceElementByOwnContent(contentElement)
    
    element.normalize()
    return
  
  # Use the default speak configuration of user agent for element and
  # descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsNormal: (element) ->
    @reverseSpeakAs(element, 'spell-out')
    @reverseSpeakAs(element, 'literal-punctuation')
    @reverseSpeakAs(element, 'no-punctuation')
    @reverseSpeakAs(element, 'digits')
    return
  
  # Speak one letter at a time for each word for element only.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsSpellOut: (element) ->
    dataPropertyValue = 'spell-out'
    @speakAs(element, '[a-zA-Z]', dataPropertyValue, (content, index, \
        children) ->
      children.push(@createContentElement(content.substr(0, index + 1), \
          dataPropertyValue))
      
      children
          .push(@createAuralContentElement(' ', dataPropertyValue))
    )
    return
  
  # Speak one letter at a time for each word for elements and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsSpellOutInherit: (element) ->
    @reverseSpeakAs(element, 'spell-out')
    
    @isolateTextNode(element)
    
    @visit(element, @speakAsSpellOut)
    return
  
  # Speak the punctuation for elements only.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsLiteralPunctuation: (element) ->
    dataPropertyValue = 'literal-punctuation'
    @speakAs(element, @getRegularExpressionOfSymbols(), dataPropertyValue, \
        (content, index, children) ->
      if index isnt 0
        children.push(@createContentElement(content.substr(0, \
            index), dataPropertyValue))
      
      children.push(@createAuralContentElement( \
          " #{@getDescriptionOfSymbol(content.charAt(index))} ", \
          dataPropertyValue))
      
      children.push(@createVisualContentElement(content
          .charAt(index), dataPropertyValue))
    )
    return
  
  # Speak the punctuation for elements and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsLiteralPunctuationInherit: (element) ->
    @reverseSpeakAs(element, 'literal-punctuation')
    @reverseSpeakAs(element, 'no-punctuation')
    
    @isolateTextNode(element)
    
    @visit(element, @speakAsLiteralPunctuation)
    return
  
  # No speak the punctuation for element only.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsNoPunctuation: (element) ->
    dataPropertyValue = 'no-punctuation'
    @speakAs(element, \
        '[!"#$%&\'\\(\\)\\*\\+,-\\./:;<=>?@\\[\\\\\\]\\^_`\\{\\|\\}\\~]', \
        dataPropertyValue, (content, index, children) ->
      if index isnt 0
        children.push(@createContentElement(content
            .substr(0, index), dataPropertyValue))
      
      children.push(@createVisualContentElement(content
          .charAt(index), dataPropertyValue))
    )
    return
  
  # No speak the punctuation for element and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsNoPunctuationInherit: (element) ->
    @reverseSpeakAs(element, 'literal-punctuation')
    @reverseSpeakAs(element, 'no-punctuation')
    
    @isolateTextNode(element)
    
    @visit(element, @speakAsNoPunctuation)
    return
  
  # Speak the digit at a time for each number for element only.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsDigits: (element) ->
    dataPropertyValue = 'digits'
    @speakAs(element, '[0-9]', dataPropertyValue, (content, index, children) ->
      if index isnt 0
        children.push(@createContentElement(content
            .substr(0, index), dataPropertyValue))
      
      children.push(@createAuralContentElement(' ', dataPropertyValue))
      
      children.push(@createContentElement(content
          .charAt(index), dataPropertyValue))
    )
    return
  
  # Speak the digit at a time for each number for element and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsDigitsInherit: (element) ->
    @reverseSpeakAs(element, 'digits')
    
    @isolateTextNode(element)
    
    @visit(element, @speakAsDigits)
    return
  
  # Speaks the numbers for element and descendants as a word number.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakAsContinuousInherit: (element) ->
    @reverseSpeakAs(element, 'digits')
    return
  
  # The cells headers of data cell will be spoken for element only.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakHeaderAlways: (element) ->
    idsHeaders = element.getAttribute('headers').split(new RegExp('[ \n\t\r]+'))
    textHeader = ''
    for idHeader in idsHeaders
      header = @htmlParser.find("##{idHeader}").firstResult()
      if header isnt null
        textHeader = "#{textHeader}#{header.getTextContent()} "
    if not self.isEmpty(textHeader)
      element.prependElement(@createAuralContentElement(textHeader, 'always'))
    return
  
  # The cells headers will be spoken for every data cell for element and
  # descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakHeaderAlwaysInherit: (element) ->
    @speakHeaderOnceInherit(element)
    
    cellElements = @htmlParser.find(element)
        .findDescendants('td[headers],th[headers]').listResults()
    for cellElement in cellElements
      @speakHeaderAlways(cellElement)
    return
  
  # The cells headers will be spoken one time for element and descendants.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  speakHeaderOnceInherit: (element) ->
    headerElements = @htmlParser.find(element)
        .findDescendants("span[#{DATA_SPEAK_AS}=\"always\"]").listResults()
    for headerElement in headerElements
      headerElement.removeNode()
    return
  
  # Initializes a new object that manipulate the accessibility of the CSS of
  # parser.
  #
  # @param [hatemile.util.html.HTMLDOMParser] htmlParser The HTML parser.
  # @param [hatemile.util.css.StyleSheetParser] cssParser The CSS parser.
  # @param [Array<object>] symbols The symbols with descriptions.
  # @option Array<symbols> [string] symbol The symbol.
  # @option Array<symbols> [string] description The description of symbol.
  #
  constructor: (@htmlParser, @cssParser, @symbols) ->
  
  # Provide the CSS features of speaking and speech properties in element.
  #
  # @param [hatemile.util.html.HTMLDOMElement] element The element.
  #
  # @see hatemile.AccessibleCSS#provideSpeakProperties
  #
  provideSpeakProperties: (element) ->
    rules = @cssParser.getRules(['speak', 'speak-punctuation', \
        'speak-numeral', 'speak-header', 'speak-as'])
    for rule in rules
      speakElements = @htmlParser.find(rule.getSelector()).listResults()
      for speakElement in speakElements
        if speakElement.equals(element)
          if rule.hasProperty('speak')
            declarations = rule.getDeclarations('speak')
            for declaration in declarations
              propertyValue = declaration.getValue()
              if propertyValue is 'none'
                @speakNoneInherit(element)
              else if propertyValue is 'normal'
                @speakNormalInherit(element)
              else if propertyValue is 'spell-out'
                @speakAsSpellOutInherit(element)
          if rule.hasProperty('speak-as')
            declarations = rule.getDeclarations('speak-as')
            for declaration in declarations
              propertyValue = declaration.getValue()
              pattern = new RegExp('^((normal)|(inherit)|(initial)|(digits)|' \
                  + '(literal\\-punctuation)|(no\\-punctuation)|(spell\\-out)' \
                  + '|((digits) ((literal\\-punctuation)|(no\\-punctuation)|' \
                  + '(spell\\-out)))|(((literal\\-punctuation)|' \
                  + '(no\\-punctuation)|(spell\\-out)) (digits))|' \
                  + '(((literal\\-punctuation)|(no\\-punctuation)) ' \
                  + '(spell\\-out))|((spell\\-out) ((literal\\-punctuation)|' \
                  + '(no\\-punctuation)))|((digits) ((literal\\-punctuation)|' \
                  + '(no\\-punctuation)) (spell\\-out))|((digits) ' \
                  + '(spell\\-out) ((literal\\-punctuation)|' \
                  + '(no\\-punctuation)))|(((literal\\-punctuation)|' \
                  + '(no\\-punctuation)) (digits) (spell\\-out))|' \
                  + '(((literal\\-punctuation)|(no\\-punctuation)) ' \
                  + '(spell\\-out) (digits))|((spell\\-out) (digits) ' \
                  + '((literal\\-punctuation)|(no\\-punctuation)))|' \
                  + '((spell\\-out) ((literal\\-punctuation)|' \
                  + '(no\\-punctuation)) (digits)))$', 'g')
              if pattern.test(propertyValue)
                propertyValues = declaration.getValues()
                @speakAsNormal(element)
                for propertyValue in propertyValues
                  if propertyValue is 'spell-out'
                    @speakAsSpellOutInherit(element)
                  else if propertyValue is 'literal-punctuation'
                    @speakAsLiteralPunctuationInherit(element)
                  else if propertyValue is 'no-punctuation'
                    @speakAsNoPunctuationInherit(element)
                  else if propertyValue is 'digits'
                    @speakAsDigitsInherit(element)
          if rule.hasProperty('speak-punctuation')
            declarations = rule.getDeclarations('speak-punctuation')
            for declaration in declarations
              propertyValue = declaration.getValue()
              if propertyValue is 'code'
                @speakAsLiteralPunctuationInherit(element)
              else if propertyValue is 'none'
                @speakAsNoPunctuationInherit(element)
          if rule.hasProperty('speak-numeral')
            declarations = rule.getDeclarations('speak-numeral')
            for declaration in declarations
              propertyValue = declaration.getValue()
              if propertyValue is 'digits'
                @speakAsDigitsInherit(element)
              else if propertyValue is 'continuous'
                @speakAsContinuousInherit(element)
          if rule.hasProperty('speak-header')
            declarations = rule.getDeclarations('speak-header')
            for declaration in declarations
              propertyValue = declaration.getValue()
              if propertyValue is 'always'
                @speakHeaderAlwaysInherit(element)
              else if propertyValue is 'once'
                @speakHeaderOnceInherit(element)
    return
  
  # Provide the CSS features of speaking and speech properties in all elements
  # of page.
  #
  # @see hatemile.AccessibleCSS#provideAllSpeakProperties
  #
  provideAllSpeakProperties: () ->
    selector = null
    rules = @cssParser.getRules(['speak', 'speak-punctuation', \
        'speak-numeral', 'speak-header', 'speak-as'])
    for rule in rules
      if selector is null
        selector = rule.getSelector()
      else
        selector = "#{selector},#{rule.getSelector()}"
    if selector isnt null
      elements = @htmlParser.find(selector).listResults()
      for element in elements
        if self.hatemile.util.CommonFunctions.isValidElement(element)
          @provideSpeakProperties(element)
    return
