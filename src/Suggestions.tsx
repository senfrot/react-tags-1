import React, { useEffect, useRef } from 'react';
// import isEqual from 'lodash/isEqual';
import escape from 'lodash/escape';

const maybeScrollSuggestionIntoView = (suggestionEl, suggestionsContainer) => {
  const containerHeight = suggestionsContainer.offsetHeight;
  const suggestionHeight = suggestionEl.offsetHeight;
  const relativeSuggestionTop =
    suggestionEl.offsetTop - suggestionsContainer.scrollTop;

  if (relativeSuggestionTop + suggestionHeight >= containerHeight) {
    // eslint-disable-next-line no-param-reassign
    suggestionsContainer.scrollTop +=
      relativeSuggestionTop - containerHeight + suggestionHeight;
  } else if (relativeSuggestionTop < 0) {
    // eslint-disable-next-line no-param-reassign
    suggestionsContainer.scrollTop += relativeSuggestionTop;
  }
};

interface Props {
  query: string;
  selectedIndex: number;
  suggestions: any[];
  handleClick: (e: any) => void;
  handleHover: (e: any) => void;
  minQueryLength?: number;
  shouldRenderSuggestions?: () => void;
  isFocused: boolean;
  classNames?: {
    [key: string]: string;
  };
  labelField: string;
  renderSuggestion?: (item: any, query: any) => JSX.Element;
}

const Suggestions: React.FC<Props> = ({
  query,
  selectedIndex,
  suggestions,
  handleClick,
  handleHover,
  minQueryLength = 2,
  shouldRenderSuggestions,
  isFocused,
  classNames,
  labelField,
  renderSuggestion,
}) => {
  // shouldComponentUpdate(nextProps) {
  //   const { props } = this;
  //   const shouldRenderSuggestions =
  //     props.shouldRenderSuggestions || this.shouldRenderSuggestions;
  //   return (
  //     props.isFocused !== nextProps.isFocused ||
  //     !isEqual(props.suggestions, nextProps.suggestions) ||
  //     shouldRenderSuggestions(nextProps.query) ||
  //     shouldRenderSuggestions(nextProps.query) !==
  //       shouldRenderSuggestions(props.query)
  //   );
  // }
  const suggestionsContainer = useRef(null);

  useEffect(() => {
    const activeSuggestion =
      suggestionsContainer.current &&
      suggestionsContainer.current.querySelector(classNames.activeSuggestion);

    if (activeSuggestion) {
      maybeScrollSuggestionIntoView(activeSuggestion, suggestionsContainer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  const markIt = (input, queryText) => {
    const escapedRegex = queryText
      .trim()
      .replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    const { [labelField]: labelValue } = input;

    return {
      __html: labelValue.replace(RegExp(escapedRegex, 'gi'), (x) => {
        return `<mark>${escape(x)}</mark>`;
      }),
    };
  };

  const handleShouldRenderSuggestions = (queryText) => {
    return queryText.length >= minQueryLength && isFocused;
  };

  const handleRenderSuggestion = (item, queryText) => {
    if (typeof renderSuggestion === 'function') {
      return renderSuggestion(item, queryText);
    }
    return <span dangerouslySetInnerHTML={markIt(item, queryText)} />;
  };

  const suggestionsList = suggestions.map((item, i) => {
    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/mouse-events-have-key-events
      <li
        key={i}
        onMouseDown={() => handleClick(i)}
        onTouchStart={() => handleClick(i)}
        onMouseOver={() => handleHover(i)}
        className={i === selectedIndex ? classNames.activeSuggestion : ''}
      >
        {handleRenderSuggestion(item, query)}
      </li>
    );
  });

  // use the override, if provided
  const willRenderSuggestions =
    shouldRenderSuggestions || handleShouldRenderSuggestions;
  if (suggestionsList.length === 0 || !willRenderSuggestions(query)) {
    return null;
  }

  return (
    <div ref={suggestionsContainer} className={classNames.suggestions}>
      <ul>{suggestionsList}</ul>
    </div>
  );
};

export default Suggestions;
