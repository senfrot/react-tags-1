import React, { useEffect, useRef, memo } from 'react';
import isEqual from 'lodash/isEqual';
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

interface SuggestionsProps {
  query: string;
  selectedIndex: number;
  suggestions: any[];
  handleClick: (i: any) => void;
  handleHover: (i: any) => void;
  minQueryLength?: number;
  shouldRenderSuggestions?: () => void;
  isFocused: boolean;
  classNames?: {
    [key: string]: string;
  };
  labelField: string;
  renderSuggestion?: (item: any, query: any) => JSX.Element;
}

const Suggestions: React.FC<SuggestionsProps> = ({
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
    console.log('render');
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

  console.log(suggestionsList);

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

// export default memo(Suggestions, (prevProps, nextProps) => {
//   // console.log('suggestions re-render', prevProps, nextProps);
//   const handleShouldRenderSuggestions = (query) =>
//     query.length >= nextProps.minQueryLength && nextProps.isFocused;

//   const willRenderSuggestions =
//     prevProps.shouldRenderSuggestions || handleShouldRenderSuggestions;
//   return (
//     prevProps.isFocused === nextProps.isFocused ||
//     isEqual(prevProps.suggestions, nextProps.suggestions) ||
//     willRenderSuggestions(nextProps.query) ||
//     willRenderSuggestions(nextProps.query) ===
//       willRenderSuggestions(prevProps.query)
//   );
// });

export default Suggestions;
