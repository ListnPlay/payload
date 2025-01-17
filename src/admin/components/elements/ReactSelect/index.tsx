import React, { MouseEventHandler, useCallback } from 'react';
import Select, {
  components,
  MultiValueProps,
  Props as SelectProps,
} from 'react-select';
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
  SortStartHandler,
  SortEndHandler,
  SortableHandle,
} from 'react-sortable-hoc';
import { arrayMove } from '../../../../utilities/arrayMove';
import { Props, Value } from './types';
import Chevron from '../../icons/Chevron';

import './index.scss';

const SortableMultiValue = SortableElement(
  (props: MultiValueProps<Value>) => {
    // this prevents the menu from being opened/closed when the user clicks
    // on a value to begin dragging it. ideally, detecting a click (instead of
    // a drag) would still focus the control and toggle the menu, but that
    // requires some magic with refs that are out of scope for this example
    const onMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const classes = [
      props.className,
      !props.isDisabled && 'draggable',
    ].filter(Boolean).join(' ');

    return (
      <components.MultiValue
        {...props}
        className={classes}
        innerProps={{ ...props.innerProps, onMouseDown }}
      />
    );
  },
);


const SortableMultiValueLabel = SortableHandle((props) => <components.MultiValueLabel {...props} />);

const SortableSelect = SortableContainer(Select) as React.ComponentClass<SelectProps<Value, true> & SortableContainerProps>;

const ReactSelect: React.FC<Props> = (props) => {
  const {
    className,
    showError = false,
    options,
    onChange,
    value,
    disabled = false,
    placeholder,
    isSearchable = true,
    isClearable,
    isMulti,
    isSortable,
  } = props;

  const classes = [
    className,
    'react-select',
    showError && 'react-select--error',
  ].filter(Boolean).join(' ');

  const onSortStart: SortStartHandler = useCallback(({ helper }) => {
    const portalNode = helper;
    if (portalNode && portalNode.style) {
      portalNode.style.cssText += 'pointer-events: auto; cursor: grabbing;';
    }
  }, []);

  const onSortEnd: SortEndHandler = useCallback(({ oldIndex, newIndex }) => {
    onChange(arrayMove(value as Value[], oldIndex, newIndex));
  }, [onChange, value]);

  if (isMulti && isSortable) {
    return (
      <SortableSelect
        useDragHandle
        // react-sortable-hoc props:
        axis="xy"
        onSortStart={onSortStart}
        onSortEnd={onSortEnd}
        // small fix for https://github.com/clauderic/react-sortable-hoc/pull/352:
        getHelperDimensions={({ node }) => node.getBoundingClientRect()}
        // react-select props:
        placeholder={placeholder}
        {...props}
        value={value as Value[]}
        onChange={onChange}
        disabled={disabled ? 'disabled' : undefined}
        className={classes}
        classNamePrefix="rs"
        options={options}
        isSearchable={isSearchable}
        isClearable={isClearable}
        components={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore We're failing to provide a required index prop to SortableElement
          MultiValue: SortableMultiValue,
          MultiValueLabel: SortableMultiValueLabel,
          DropdownIndicator: Chevron,
        }}
      />
    );
  }

  return (
    <Select
      placeholder={placeholder}
      {...props}
      value={value}
      onChange={onChange}
      disabled={disabled ? 'disabled' : undefined}
      components={{ DropdownIndicator: Chevron }}
      className={classes}
      classNamePrefix="rs"
      options={options}
      isSearchable={isSearchable}
      isClearable={isClearable}
    />
  );
};

export default ReactSelect;
