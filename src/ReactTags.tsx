import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';
import ClassNames from 'classnames';
import Suggestions from './Suggestions';
import Tag from './Tag';
import './reactTags.css';

import { buildRegExpFromDelimiters } from './utils';

// Constants
import {
  KEYS,
  DEFAULT_PLACEHOLDER,
  DEFAULT_CLASSNAMES,
  DEFAULT_LABEL_FIELD,
  INPUT_FIELD_POSITIONS,
} from './constants';

interface Props {
  placeholder?: string;
  labelField?: string;
  suggestionsList: { id: string; [key: string]: string }[];
  delimiters?: number[];
  autofocus?: boolean;
  inline?: boolean; // TODO: Remove in v7.x.x
  // inputFieldPosition: oneOf([
  //   INPUT_FIELD_POSITIONS.INLINE;
  //   INPUT_FIELD_POSITIONS.TOP;
  //   INPUT_FIELD_POSITIONS.BOTTOM;
  // ]);
  inputFieldPosition?: any;
  handleDelete?: (i: any, e: any) => void;
  handleAddition?: (tag: any) => void;
  handleDrag?: (tag: any, x: any, y: any) => void;
  handleFilterSuggestions?: (query: any, suggestions: any) => void;
  handleTagClick?: (i: any, e: any) => void;
  allowDeleteFromEmptyInput?: boolean;
  allowAdditionFromPaste?: boolean;
  allowDragDrop?: boolean;
  resetInputOnDelete?: boolean;
  handleInputChange?: (e: any) => void;
  handleInputFocus?: (value: any) => void;
  handleInputBlur?: (value: any) => void;
  minQueryLength?: number;
  shouldRenderSuggestions?: () => void;
  removeComponent?: React.ElementType;
  autocomplete?: boolean | number;
  readOnly?: boolean;
  classNames?: {
    [key: string]: string;
  };
  name?: string;
  id?: string;
  maxLength?: number;
  inputValue?: string;
  tags: {
    id: string;
    key?: string;
    className?: string;
    [key: string]: string;
  }[];
  allowUnique?: boolean;
  renderSuggestion?: (item: any, query: any) => JSX.Element;
}

const ReactTags: React.FC<Props> = ({
  placeholder = DEFAULT_PLACEHOLDER,
  labelField = DEFAULT_LABEL_FIELD,
  suggestionsList = [],
  delimiters = [KEYS.ENTER, KEYS.TAB],
  autofocus = true,
  inline = true,
  inputFieldPosition = INPUT_FIELD_POSITIONS.INLINE,
  handleDelete,
  handleAddition,
  handleDrag,
  handleFilterSuggestions,
  handleTagClick,
  allowDeleteFromEmptyInput = true,
  allowAdditionFromPaste = true,
  allowDragDrop = true,
  resetInputOnDelete = true,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  minQueryLength,
  shouldRenderSuggestions,
  removeComponent,
  autocomplete = false,
  readOnly = false,
  classNames,
  name,
  id,
  maxLength,
  inputValue,
  tags = [],
  allowUnique = true,
  renderSuggestion,
  ...rest
}) => {
  console.log(rest);
  const textInput = useRef(null);
  const [state, setState] = useState({
    suggestions: suggestionsList,
    query: '',
    isFocused: false,
    selectedIndex: -1,
    selectionMode: false,
  });

  const getQueryIndex = (query, item) => {
    return item[labelField].toLowerCase().indexOf(query.toLowerCase());
  };

  const filteredSuggestions = (query, suggestions) => {
    if (handleFilterSuggestions) {
      return handleFilterSuggestions(query, suggestions);
    }

    const exactSuggestions = suggestions.filter((item) => {
      return getQueryIndex(query, item) === 0;
    });
    const partialSuggestions = suggestions.filter((item) => {
      return getQueryIndex(query, item) > 0;
    });
    return exactSuggestions.concat(partialSuggestions);
  };

  const resetAndFocusInput = () => {
    setState((prevState) => ({ ...prevState, query: '' }));
    if (textInput) {
      textInput.current.value = '';
      textInput.current.focus();
    }
  };

  useEffect(() => {
    if (!inline) {
      // eslint-disable-next-line no-console
      console.warn(
        '[DEPRECATION] The inline attribute is deprecated. Will be removed in future. Please use inputFieldPosition instead'
      );
    }

    if (autofocus && !readOnly) {
      resetAndFocusInput();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDelete = (i, e) => {
    if (handleDelete) {
      handleDelete(i, e);
    }
    if (!resetInputOnDelete) {
      // textInput && textInput.current.focus();
      if (textInput) textInput.current.focus();
    } else {
      resetAndFocusInput();
    }
    e.stopPropagation();
  };

  const onTagClick = (i, e) => {
    if (handleTagClick) {
      handleTagClick(i, e);
    }
    if (!resetInputOnDelete) {
      if (textInput) textInput.current.focus();
    } else {
      resetAndFocusInput();
    }
  };

  const updateSuggestions = () => {
    const { query, selectedIndex } = state;
    const suggestions = filteredSuggestions(query, suggestionsList);

    setState((prevState) => ({
      ...prevState,
      suggestions,
      selectedIndex:
        selectedIndex >= suggestions.length
          ? suggestions.length - 1
          : selectedIndex,
    }));
  };

  useEffect(() => {
    // if (!isEqual(prevProps.suggestions, this.props.suggestions)) {
    //   this.updateSuggestions();
    // }
    updateSuggestions();
  }, [state.query]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    if (handleInputChange) {
      handleInputChange(e.target.value);
    }

    const query = e.target.value.trim();
    setState((prevState) => ({ ...prevState, query }));
  };

  const handleFocus = (e) => {
    const { value } = e.target;
    if (handleInputFocus) {
      handleInputFocus(value);
    }
    setState((prevState) => ({ ...prevState, isFocused: true }));
  };

  const handleBlur = (e) => {
    const { value } = e.target;
    if (handleInputBlur) {
      handleInputBlur(value);
      if (textInput) {
        textInput.current.value = '';
      }
    }
    setState((prevState) => ({ ...prevState, isFocused: false }));
  };

  const addTag = (tag) => {
    let newTag = tag;
    // const { tags, labelField, allowUnique } = this.props;
    if (!tag.id || !tag[labelField]) {
      return;
    }
    console.log(newTag);
    const existingKeys = tags.map((tagItem) => tagItem.id.toLowerCase());

    // Return if tag has been already added
    if (allowUnique && existingKeys.indexOf(tag.id.toLowerCase()) >= 0) {
      return;
    }
    if (autocomplete) {
      const possibleMatches = filteredSuggestions(
        tag[labelField],
        suggestionsList
      );

      if (
        (autocomplete === 1 && possibleMatches.length === 1) ||
        (autocomplete === true && possibleMatches.length)
      ) {
        [newTag] = possibleMatches;
      }
    }

    // call method to add
    handleAddition(newTag);

    // reset the state
    setState((prevState) => ({
      ...prevState,
      query: '',
      selectionMode: false,
      selectedIndex: -1,
    }));

    resetAndFocusInput();
  };

  const handleKeyDown = (e) => {
    const { query, selectedIndex, suggestions, selectionMode } = state;

    // hide suggestions menu on escape
    if (e.keyCode === KEYS.ESCAPE) {
      e.preventDefault();
      e.stopPropagation();
      setState((prevState) => ({
        ...prevState,
        selectedIndex: -1,
        selectionMode: false,
        suggestions: [],
      }));
    }

    // When one of the terminating keys is pressed, add current query to the tags.
    // If no text is typed in so far, ignore the action - so we don't end up with a terminating
    // character typed in.
    if (delimiters.indexOf(e.keyCode) !== -1 && !e.shiftKey) {
      if (e.keyCode !== KEYS.TAB || query !== '') {
        e.preventDefault();
      }

      const selectedQuery =
        selectionMode && selectedIndex !== -1
          ? suggestions[selectedIndex]
          : { id: query, [labelField]: query };

      // TODO: always true?
      // if (selectedQuery !== '') {
      addTag(selectedQuery);
      // }
    }

    // when backspace key is pressed and query is blank, delete tag
    if (
      e.keyCode === KEYS.BACKSPACE &&
      query === '' &&
      allowDeleteFromEmptyInput
    ) {
      onDelete(tags.length - 1, e);
    }

    // up arrow
    if (e.keyCode === KEYS.UP_ARROW) {
      e.preventDefault();
      setState((prevState) => ({
        ...prevState,
        selectedIndex:
          selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1,
        selectionMode: true,
      }));
    }

    // down arrow
    if (e.keyCode === KEYS.DOWN_ARROW) {
      e.preventDefault();
      setState((prevState) => ({
        ...prevState,
        selectedIndex:
          suggestions.length === 0
            ? -1
            : (selectedIndex + 1) % suggestions.length,
        selectionMode: true,
      }));
    }
  };

  const handlePaste = (e) => {
    if (!allowAdditionFromPaste) {
      return;
    }

    e.preventDefault();

    // TODO: window.clipboardData - doesn't exist - security issue? - https://stackoverflow.com/a/30381888
    // const clipboardData = e.clipboardData || window.clipboardData;
    const { clipboardData } = e;
    const clipboardText = clipboardData.getData('text');

    const maximumLength = clipboardText.length || maxLength;

    const maxTextLength = Math.min(maximumLength, clipboardText.length);
    const pastedText = clipboardData.getData('text').substr(0, maxTextLength);

    // Used to determine how the pasted content is split.
    const delimiterRegExp = buildRegExpFromDelimiters(delimiters);
    const tagsList = pastedText.split(delimiterRegExp);

    // Only add unique tags
    uniq(tagsList).forEach((tag) => addTag({ id: tag, [labelField]: tag }));
  };

  const handleSuggestionClick = (i) => {
    addTag(state.suggestions[i]);
  };

  const handleSuggestionHover = (i) => {
    setState((prevState) => ({
      ...prevState,
      selectedIndex: i,
      selectionMode: true,
    }));
  };

  const moveTag = (dragIndex, hoverIndex) => {
    // locate tags
    const dragTag = tags[dragIndex];

    // call handler with the index of the dragged tag
    // and the tag that is hovered
    handleDrag(dragTag, dragIndex, hoverIndex);
  };

  const getTagItems = () => {
    const movableTag = allowDragDrop ? moveTag : null;
    return tags.map((tag, index) => {
      return (
        <Tag
          key={tag.key || tag.id}
          index={index}
          tag={tag}
          labelField={labelField}
          onDelete={(e) => onDelete(index, e)}
          moveTag={movableTag}
          removeComponent={removeComponent}
          onTagClicked={(e) => onTagClick(index, e)}
          readOnly={readOnly}
          classNames={{ ...DEFAULT_CLASSNAMES, ...classNames }}
          allowDragDrop={allowDragDrop}
        />
      );
    });
  };

  const tagItems = getTagItems();
  const classes = { ...DEFAULT_CLASSNAMES, ...classNames };

  // get the suggestions for the given query
  const { query, selectedIndex, suggestions, isFocused } = state;

  const position = !inline ? INPUT_FIELD_POSITIONS.BOTTOM : inputFieldPosition;

  const tagInput = !readOnly ? (
    <div className={classes.tagInput}>
      <input
        ref={textInput}
        className={classes.tagInputField}
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        name={name}
        id={id}
        maxLength={maxLength}
        value={inputValue}
      />

      <Suggestions
        query={query.trim()}
        suggestions={suggestions}
        labelField={labelField}
        selectedIndex={selectedIndex}
        handleClick={handleSuggestionClick}
        handleHover={handleSuggestionHover}
        minQueryLength={minQueryLength}
        shouldRenderSuggestions={shouldRenderSuggestions}
        isFocused={isFocused}
        classNames={classes}
        renderSuggestion={renderSuggestion}
      />
    </div>
  ) : null;

  return (
    <div className={ClassNames(classes.tags, 'react-tags-wrapper')}>
      {position === INPUT_FIELD_POSITIONS.TOP && tagInput}
      <div className={classes.selected}>
        {console.log(tagItems)}
        {tagItems}
        {position === INPUT_FIELD_POSITIONS.INLINE && tagInput}
      </div>
      {position === INPUT_FIELD_POSITIONS.BOTTOM && tagInput}
    </div>
  );
};

const ReactTagsDnD = DragDropContext(HTML5Backend)(ReactTags);

export { ReactTags, ReactTagsDnD, KEYS };
