import React, { useEffect, useState, useRef } from 'react';
import uniq from 'lodash/uniq';
import cs from 'classnames';
import Suggestions from './Suggestions';
import Tag from './Tag';
import '../reactTags.css';

import { buildRegExpFromDelimiters } from './utils';

// Constants
import {
  KEYS,
  DEFAULT_PLACEHOLDER,
  DEFAULT_CLASSNAMES,
  DEFAULT_LABEL_FIELD,
  INPUT_FIELD_POSITIONS,
} from './constants';

interface ReactTagsProps {
  placeholder?: string;
  labelField?: string;
  availableSuggestions?: { id: string; text: string }[];
  delimiters?: number[];
  autofocus?: boolean;
  inline?: boolean; // TODO: Remove in v7.x.x
  // inputFieldPosition: INPUT_FIELD_POSITIONS.INLINE | INPUT_FIELD_POSITIONS.TOP | INPUT_FIELD_POSITIONS.BOTTOM;
  inputFieldPosition?: any;
  handleDelete?: (i: any, e: any) => void;
  handleAddition?: (tag: any) => void;
  handleDrag?: () => void;
  handleFilterSuggestions?: (query: any, suggestions: any) => void;
  handleTagClick?: (i: any, e: any) => void;
  allowDeleteFromEmptyInput?: boolean;
  allowAdditionFromPaste?: boolean;
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
  }[];
  allowUnique?: boolean;
  renderSuggestion?: (item: any, query: any) => JSX.Element;
}

const ReactTags: React.FC<ReactTagsProps> = ({
  placeholder = DEFAULT_PLACEHOLDER,
  labelField = DEFAULT_LABEL_FIELD,
  availableSuggestions = [],
  delimiters = [KEYS.ENTER, KEYS.TAB],
  autofocus = true,
  inline = true,
  maxLength,
  minQueryLength,
  inputFieldPosition = INPUT_FIELD_POSITIONS.INLINE,
  handleDelete,
  handleTagClick,
  handleAddition,
  handleInputFocus,
  handleInputBlur,
  handleInputChange,
  handleFilterSuggestions,
  renderSuggestion,
  shouldRenderSuggestions,
  allowDeleteFromEmptyInput = true,
  allowAdditionFromPaste = true,
  resetInputOnDelete = true,
  autocomplete = false,
  readOnly = false,
  allowUnique = true,
  inputValue,
  removeComponent,
  classNames = {},
  id,
  name,
  tags = [],
}) => {
  const textInput = useRef(null);
  const [state, setState] = useState({
    suggestions: availableSuggestions,
    query: '',
    isFocused: false,
    selectedIndex: -1,
    selectionMode: false,
  });

  const resetAndFocusInput = () => {
    setState((prevState) => ({
      ...prevState,
      query: '',
    }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    // if (!isEqual(prevProps.suggestions, this.props.suggestions)) {
    //   this.updateSuggestions();
    // }
    const newSuggestions = filteredSuggestions(
      state.query,
      availableSuggestions
    );

    // console.log(availableSuggestions, newSuggestions, state.query);

    setState((prevState) => ({
      ...prevState,
      suggestions: newSuggestions,
      selectedIndex:
        prevState.selectedIndex >= newSuggestions.length
          ? newSuggestions.length - 1
          : prevState.selectedIndex,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.query]);

  const onDelete = (i, e) => {
    if (handleDelete) {
      handleDelete(i, e);
    }
    if (!resetInputOnDelete) {
      // textInput && textInput.current.focus();
      if (textInput) {
        textInput.current.focus();
      }
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
      // TODO: compare textInput with previous ver
      // textInput && textInput.current.focus();
      if (textInput) {
        textInput.current.focus();
      }
    } else {
      resetAndFocusInput();
    }
  };

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
    if (!tag.id || !tag[labelField]) {
      return;
    }
    const existingKeys = tags.map((tagItem) => tagItem.id.toLowerCase());

    // Return if tag has been already added
    if (allowUnique && existingKeys.indexOf(tag.id.toLowerCase()) >= 0) {
      return;
    }

    let newTag = tag;

    if (autocomplete) {
      const possibleMatches = filteredSuggestions(
        tag[labelField],
        availableSuggestions
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

      // TODO: check this statement (always true?)
      // if (selectedQuery !== '') {
      //   addTag(selectedQuery);
      // }
      addTag(selectedQuery);
    }

    // when backspace key is pressed and query is blank, delete tag
    if (
      e.keyCode === KEYS.BACKSPACE &&
      query === '' &&
      allowDeleteFromEmptyInput
    ) {
      onDelete(tags.length - 1, e); // TODO: potential error
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

    const maximumLength = maxLength || clipboardText.length;

    const maxTextLength = Math.min(maximumLength, clipboardText.length);
    const pastedText = clipboardData.getData('text').substr(0, maxTextLength);

    // Used to determine how the pasted content is split.
    const delimiterRegExp = buildRegExpFromDelimiters(delimiters);
    const splittedTags = pastedText.split(delimiterRegExp);

    // Only add unique tags
    uniq(splittedTags).forEach((tag) => addTag({ id: tag, [labelField]: tag }));
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

  const getTagItems = () => {
    return tags.map((tag, index) => {
      return (
        <Tag
          key={tag.key || tag.id}
          tag={tag}
          labelField={labelField}
          onDelete={(evt) => onDelete(index, evt)}
          onTagClicked={(evt) => onTagClick(index, evt)}
          readOnly={readOnly}
          removeComponent={removeComponent}
          classNames={{ ...DEFAULT_CLASSNAMES, ...classNames }}
        />
      );
    });
  };

  const tagItems = getTagItems();
  const classes = { ...DEFAULT_CLASSNAMES, ...classNames };

  // get the suggestions for the given query
  const query = state.query.trim();
  const { selectedIndex, suggestions } = state;

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
        name={name || 'tags'}
        id={id || 'react-tags-input'}
        maxLength={maxLength}
        value={inputValue}
      />

      <Suggestions
        query={query}
        suggestions={suggestions}
        labelField={labelField}
        selectedIndex={selectedIndex}
        handleClick={handleSuggestionClick}
        handleHover={handleSuggestionHover}
        minQueryLength={minQueryLength}
        shouldRenderSuggestions={shouldRenderSuggestions}
        isFocused={state.isFocused}
        classNames={classes}
        renderSuggestion={renderSuggestion}
      />
    </div>
  ) : null;

  return (
    <div className={cs(classes.tags, 'react-tags-wrapper')}>
      {position === INPUT_FIELD_POSITIONS.TOP && tagInput}
      <div className={classes.selected}>
        {tagItems}
        {position === INPUT_FIELD_POSITIONS.INLINE && tagInput}
      </div>
      {position === INPUT_FIELD_POSITIONS.BOTTOM && tagInput}
    </div>
  );
};

export default ReactTags;
