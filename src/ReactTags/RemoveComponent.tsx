import React from 'react';

interface RemoveComponentProps {
  className?: string;
  onClick: (evt: any) => void;
  readOnly: boolean;
  removeComponent: React.ElementType;
}

const crossStr = String.fromCharCode(215);
const RemoveComponent: React.FC<RemoveComponentProps> = (props) => {
  const { className, onClick, readOnly, removeComponent } = props;

  if (readOnly) {
    return <></>;
  }

  if (removeComponent) {
    const Component = removeComponent;
    return <Component {...props} />;
  }

  return (
    // TODO: fix
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid
    <a onClick={onClick} className={className} onKeyDown={onClick}>
      {crossStr}
    </a>
  );
};

export default RemoveComponent;
