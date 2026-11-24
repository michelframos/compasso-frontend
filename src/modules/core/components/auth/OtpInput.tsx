import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'

interface OtpInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  length?: number
}

export function OtpInput({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  length = 6,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const commit = (next: string[]) => {
    onChange(next.join('').slice(0, length))
  }

  const setDigit = (index: number, char: string) => {
    const next = [...digits]
    next[index] = char
    commit(next)
  }

  const focusAt = (index: number) => {
    const el = inputsRef.current[index]
    el?.focus()
    el?.select()
  }

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '')
    if (!cleaned) {
      setDigit(index, '')
      return
    }

    if (cleaned.length > 1) {
      const next = [...digits]
      cleaned
        .slice(0, length - index)
        .split('')
        .forEach((ch, offset) => {
          next[index + offset] = ch
        })
      commit(next)
      focusAt(Math.min(index + cleaned.length, length - 1))
      return
    }

    setDigit(index, cleaned)
    if (index < length - 1) focusAt(index + 1)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '')
      } else if (index > 0) {
        setDigit(index - 1, '')
        focusAt(index - 1)
      }
      event.preventDefault()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusAt(index - 1)
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = Array.from({ length }, (_, i) => pasted[i] ?? '')
    commit(next)
    focusAt(Math.min(pasted.length, length - 1))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-0`} className="ml-1 font-medium text-zinc-700">
        {label}
      </Label>
      <div className="flex gap-2 sm:gap-2.5">
        {digits.map((digit, index) => (
          <input
            key={`${id}-${index}`}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            id={`${id}-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={length}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Dígito ${index + 1} de ${length}`}
            className={cn(
              'auth-otp-cell h-12 w-full max-w-12 flex-1 rounded-[10px] border border-zinc-200 bg-white text-center text-lg font-semibold text-zinc-900 outline-none transition',
              'focus:border-[var(--auth-magenta)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--auth-magenta)_25%,transparent)]',
              error && 'border-destructive',
              disabled && 'opacity-60',
            )}
          />
        ))}
      </div>
      {error && <p className="ml-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
