import React, { useState } from 'react';
import { ReactTags } from './index';

export default {
  title: 'React Tags',
};

export const Primary = (): JSX.Element => {
  const [tags, setTags] = useState([
    { id: 'USA', text: 'USA' },
    { id: 'Germany', text: 'Germany' },
  ]);

  const suggestions = [
    { id: 'USA', text: 'USA' },
    { id: 'Germany', text: 'Germany' },
    { id: 'Austria', text: 'Austria' },
    { id: 'Costa Rica', text: 'Costa Rica' },
    { id: 'Sri Lanka', text: 'Sri Lanka' },
    { id: 'Thailand', text: 'Thailand' },
  ];

  const handleDelete = (i) => {
    setTags((prevState) => prevState.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag) => {
    setTags((prevState) => [...prevState, tag]);
  };

  return (
    <ReactTags
      tags={tags}
      suggestionsList={suggestions}
      handleAddition={handleAddition}
      handleDelete={handleDelete}
    />
  );
};
