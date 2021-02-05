import React from 'react';

interface Props {
  tag: {
    id: string;
    className?: string;
    key?: string;
  };
  className?: string;
  onClick: (e: any) => void;
  readOnly?: boolean;
  removeComponent?: React.ElementType;
}

const crossStr = String.fromCharCode(215);
const RemoveComponent: React.FC<Props> = (props) => {
  const { readOnly, removeComponent, onClick, className } = props;
  if (readOnly) {
    return <></>;
  }

  if (removeComponent) {
    const Component = removeComponent;
    return <Component {...props} />;
  }

  return (
    // TODO: Fix static-element-interactions and anchor-is-valid
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid
    <a onClick={onClick} className={className} onKeyDown={onClick}>
      {crossStr}
    </a>
  );
};

export default RemoveComponent;
