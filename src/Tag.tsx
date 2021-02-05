import React, { ReactElement } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';
import ClassNames from 'classnames';
import {
  tagSource,
  tagTarget,
  dragSource,
  dropCollect,
} from './DragAndDropHelper';
import { canDrag } from './utils';

import RemoveComponent from './RemoveComponent';

const ItemTypes = { TAG: 'tag' };

interface Props {
  labelField?: string;
  onDelete: (e: any) => void;
  tag: {
    id: string;
    className?: string;
    key?: string;
  };
  moveTag?: () => void;
  removeComponent?: React.ElementType;
  onTagClicked?: (e: any) => void;
  classNames?: {
    [key: string]: string;
  };
  readOnly?: boolean;
  connectDragSource: (item: any) => ReactElement;
  isDragging: boolean;
  connectDropTarget: (item: any) => ReactElement;
  allowDragDrop?: boolean;
}

const Tag: React.FC<Props> = ({
  labelField = 'text',
  onDelete,
  tag,
  moveTag,
  removeComponent,
  onTagClicked,
  classNames,
  readOnly = false,
  connectDragSource,
  isDragging,
  connectDropTarget,
  allowDragDrop = true,
}) => {
  const label = tag[labelField];
  const { className = '' } = tag;
  const tagComponent = (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      className={ClassNames('tag-wrapper', classNames.tag, className)}
      style={{
        opacity: isDragging ? 0 : 1,
        cursor: canDrag({ moveTag, readOnly, allowDragDrop }) ? 'move' : 'auto',
      }}
      onClick={onTagClicked}
      onKeyDown={onTagClicked}
      onTouchStart={onTagClicked}
    >
      {label}
      <RemoveComponent
        tag={tag}
        className={classNames.remove}
        removeComponent={removeComponent}
        onClick={onDelete}
        readOnly={readOnly}
      />
    </span>
  );
  return connectDragSource(connectDropTarget(tagComponent));
};

export default flow(
  DragSource(ItemTypes.TAG, tagSource, dragSource),
  DropTarget(ItemTypes.TAG, tagTarget, dropCollect)
)(Tag);
