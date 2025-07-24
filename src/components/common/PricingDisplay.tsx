import React from 'react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

interface PricingDisplayProps {
  price: number
  originalPrice?: number
  currency: string
  percentOff?: number
  savings?: number
  showDiscount?: boolean
  className?: string
}

export function PricingDisplay({
  price,
  originalPrice,
  currency,
  percentOff,
  savings,
  showDiscount = true,
  className
}: PricingDisplayProps) {
  const hasDiscount = originalPrice && originalPrice > price

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className="price-display">
          {formatPrice(price, currency)}
        </span>
        
        {hasDiscount && showDiscount && (
          <>
            <span className="price-original">
              {formatPrice(originalPrice, currency)}
            </span>
            {percentOff && (
              <Badge variant="destructive" className="text-xs">
                {percentOff}% off
              </Badge>
            )}
          </>
        )}
      </div>
      
      {hasDiscount && savings && showDiscount && (
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          Save {formatPrice(savings, currency)}
        </p>
      )}
    </div>
  )
}