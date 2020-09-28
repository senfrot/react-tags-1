import React from 'react';
import cs from 'classnames';

import RemoveComponent from './RemoveComponent';

interface TagProps {
  labelField?: string;
  onDelete: (e: any) => void;
  tag: {
    id: string;
    className?: string;
    key?: string;
  };
  removeComponent?: React.ElementType;
  onTagClicked?: (e: any) => void;
  classNames?: {
    [key: string]: string;
  };
  readOnly?: boolean;
}

const Tag: React.FC<TagProps> = ({
  labelField = 'text',
  onDelete,
  readOnly = false,
  tag,
  removeComponent,
  onTagClicked,
  classNames,
}) => {
  const label = tag[labelField];
  return (
    <span
      className={cs('tag-wrapper', classNames.tag, tag.className)}
      onClick={onTagClicked}
      onKeyDown={onTagClicked}
      onTouchStart={onTagClicked}
      // TODO: I don't like role and tabIndex
      role="button"
      tabIndex={0}
    >
      {label}
      <RemoveComponent
        className={classNames.remove}
        removeComponent={removeComponent}
        onClick={onDelete}
        readOnly={readOnly}
      />
    </span>
  );
};

export default Tag;
