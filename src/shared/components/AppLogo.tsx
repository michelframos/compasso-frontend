import { APP_LOGO, APP_NAME } from '@/shared/constants/app'
import { cn } from '@/shared/lib/utils'

type AppLogoVariant = 'plain' | 'badge' | 'glass'

interface AppLogoProps {
  className?: string
  imgClassName?: string
  alt?: string
  /** Todas as variantes usam círculo com fundo branco */
  variant?: AppLogoVariant
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClass: Record<NonNullable<AppLogoProps['size']>, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
  xl: 'h-16 w-16',
}

const variantClass: Record<AppLogoVariant, string> = {
  plain: 'bg-white p-1.5 shadow-sm ring-1 ring-black/5',
  badge: 'bg-white p-1.5 shadow-sm ring-1 ring-black/5',
  glass: 'bg-white p-1.5 shadow-lg shadow-black/20 ring-1 ring-white/70',
}

export function AppLogo({
  className,
  imgClassName,
  alt = APP_NAME,
  variant = 'plain',
  size = 'md',
}: AppLogoProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        sizeClass[size],
        variantClass[variant],
        className,
      )}
    >
      <img
        src={APP_LOGO}
        alt={alt}
        className={cn('h-full w-full scale-[1.08] object-contain drop-shadow-sm', imgClassName)}
        draggable={false}
      />
    </span>
  )
}
