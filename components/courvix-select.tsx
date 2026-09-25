"use client";
import { Children, isValidElement, useState, type ReactNode, type OptionHTMLAttributes } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import "./courvix-select.css";

type Props = {
  children: ReactNode; name?: string; value?: string; defaultValue?: string;
  onChange?: (event: { target: { value: string } }) => void;
  disabled?: boolean; required?: boolean; className?: string; id?: string;
  "aria-label"?: string;
};
/** One accessible, keyboard-operated select for filters and native HTML forms. */
export function CourvixSelect({ children, name, value, defaultValue, onChange, disabled, required, className = "", ...label }: Props) {
  const options = Children.toArray(children).filter(isValidElement).map(child => {
    const p = child.props as OptionHTMLAttributes<HTMLOptionElement>;
    return { value: String(p.value ?? p.children), label: p.children, disabled: p.disabled };
  });
  const [chosen, setChosen] = useState(defaultValue);
  const current = value ?? chosen ?? options.find(o => !o.disabled)?.value ?? "";
  return <Select name={name} value={current} required={required} disabled={disabled || !options.length}
    onValueChange={next => { setChosen(next); onChange?.({ target: { value: next } }); }}>
    <SelectTrigger {...label} className={`cv-select-trigger ${className}`}><SelectValue placeholder="Pilih opsi" /></SelectTrigger>
    <SelectContent position="popper" align="start" sideOffset={5} className="cv-select-content">
      {options.filter(o => o.value !== "").map(o => <SelectItem key={o.value} value={o.value} disabled={o.disabled} className="cv-select-item">{o.label}</SelectItem>)}
    </SelectContent>
  </Select>;
}
