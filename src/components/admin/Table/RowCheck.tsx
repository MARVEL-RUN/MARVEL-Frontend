type Props = {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function RowCheck({
  checked,
  indeterminate = false,
  disabled,
  label,
  onChange,
}: Props) {
  return (
    <input
      type="checkbox"
      className="admin-row-check"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate && !checked;
      }}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        event.stopPropagation();
        onChange(event.target.checked);
      }}
    />
  );
}
