import React, { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { css } from '@emotion/react';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';

type SelectOption = {
  id: number;
  name: string;
};

type SelectProps = {
  id?: string;
  options: SelectOption[];
  initialValue?: string | number;
  onChange: (value: any) => void;
}

const styles = {
  root: css`
  `,
  trigger: css`
    padding: 5px 10px;
    background: white;
    border-radius: 3px;
    font-size: 1rem;
    border: 1px solid #A0A0A0;

    &:hover {
      border: 1px solid #FF7079;
      cursor: pointer;
    }

    &:active,
    &:focus {
      box-shadow: 0px 0px 0px 1px #FF7079;
    }
  `,
  triggerOpen: css`
    border: 1px solid #FF7079;
    box-shadow: 0px 0px 0px 1px #FF7079;
  `,
  content: css`
    background: white;
    box-shadow: 0px 0px 10px 2px lightgrey;
    padding: 0.3rem 1rem;
    border-radius: 3px;
  `,
  item: css`
    cursor: pointer;
  `
};

const Select = ({
  id, options, initialValue, onChange
}: SelectProps) => {
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue || options[0].name);

  const handleSelect = (e) => {
    setValue(e.target.textContent);
    onChange(options.find(option => option.name === e.target.textContent));
  };

  return (
    <Dropdown.Root onOpenChange={setOpen}>
      <Dropdown.Trigger
        id={id}
        css={isOpen ? [styles.trigger, styles.triggerOpen] : [styles.trigger]}
      >
        {value}
        <ChevronDownIcon css={css`vertical-align: middle;`} />
      </Dropdown.Trigger>
      <Dropdown.Content css={styles.content}>
        {options.map((option) => (
          <Dropdown.Item css={styles.item} onSelect={handleSelect}>{option.name}</Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export {
  Select
};
