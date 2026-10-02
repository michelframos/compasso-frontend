import React from "react"
import { Input } from "./input"

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number
  onChange: (value: number) => void
  prefix?: string
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, prefix = "", ...props }, ref) => {
    const formatValue = React.useCallback((val: number) => {
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val)
    }, [])

    const [displayValue, setDisplayValue] = React.useState(() => formatValue(value))

    // Update display value when the external value changes
    React.useEffect(() => {
      const formatted = formatValue(value)
      if (formatted !== displayValue) {
        setDisplayValue(formatted)
      }
    }, [value, displayValue, formatValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "")
      const numericValue = parseInt(rawValue || "0", 10) / 100
      onChange(numericValue)
    }

    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <Input
          {...props}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className={`${prefix ? "pl-9" : ""} ${props.className || ""}`}
        />
      </div>
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"
