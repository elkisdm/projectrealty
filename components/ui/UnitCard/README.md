# UnitCard Component

A card component for displaying rental unit information with support for V1 (legacy) and V2 (new minimal/premium) layouts.

## Usage

```tsx
import { UnitCard, UnitCardSkeleton } from '@/components/ui/UnitCard';

// Basic usage (uses feature flag to determine variant)
<UnitCard 
  unit={unit} 
  building={building}
  priority={index < 4}
/>

// Explicit V2 variant
<UnitCard 
  unit={unit} 
  building={building}
  variant="v2"
/>

// Loading state
<UnitCardSkeleton />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `unit` | `Unit` | required | The unit data to display |
| `building` | `Building` | - | The building data for context |
| `onClick` | `() => void` | - | Optional click handler (disables Link navigation) |
| `variant` | `'default' \| 'compact' \| 'v2'` | `'default'` | Card layout variant |
| `priority` | `boolean` | `false` | Enable priority loading for images (use for above-fold cards) |
| `className` | `string` | - | Additional CSS classes |

## Variants

### V1 (Legacy)
The original layout with:
- Status badge
- Building name with "Edificio" prefix
- Tipología and comuna pills
- Address with icon
- Price with gasto común

### V2 (New Minimal)
A cleaner, QuintoAndar/Airbnb-inspired layout:
- Image with 4:3 aspect ratio
- Max 1 badge overlay
- Functional favorites with localStorage
- Price hierarchy: main price > total mensual > specs > address
- Max 2 feature chips

## Feature Flag

The component uses a feature flag for gradual V2 rollout:

```bash
# Enable for all users
NEXT_PUBLIC_UNITCARD_V2=true

# Percentage rollout (0-100)
NEXT_PUBLIC_UNITCARD_V2_PERCENT=25
```

## Architecture

```
components/ui/UnitCard/
├── index.ts                    # Public API
├── UnitCard.tsx                # Orchestrator
├── types.ts                    # TypeScript types
├── helpers.ts                  # Pure functions
├── constants.ts                # Configuration
├── UnitCardSkeleton.tsx        # Loading skeleton
├── variants/
│   ├── UnitCardV1.tsx          # Legacy layout
│   └── UnitCardV2.tsx          # New layout
├── parts/
│   ├── CardMedia.tsx           # Image + badge + heart
│   ├── CardBadge.tsx           # Badge overlay
│   ├── CardFavoriteButton.tsx  # Heart button
│   ├── CardPrice.tsx           # Price display
│   ├── CardSpecs.tsx           # m² · D · B
│   ├── CardAddress.tsx         # Truncated address
│   └── CardChips.tsx           # Feature chips
└── __tests__/
    ├── helpers.test.ts
    └── CardFavoriteButton.test.tsx
```

## Migration Guide

### From old UnitCard import

The import path remains the same:

```tsx
// Still works
import { UnitCard } from '@/components/ui/UnitCard';

// Or from the folder
import { UnitCard } from '@/components/ui/UnitCard/index';
```

### Enabling V2

1. **Test locally**: Set `NEXT_PUBLIC_UNITCARD_V2=true` in `.env.local`
2. **Gradual rollout**: Use `NEXT_PUBLIC_UNITCARD_V2_PERCENT=10` for 10% of users
3. **Full rollout**: Set `NEXT_PUBLIC_UNITCARD_V2=true` in production

### Favorites

V2 includes functional favorites using localStorage:

```tsx
import { useFavorites, useUnitFavorite } from '@/hooks/useFavorites';

// For a single unit
const { isFavorited, toggle } = useUnitFavorite(unitId);

// For managing all favorites
const { favorites, toggleFavorite, count } = useFavorites();
```

## Testing

```bash
# Run all UnitCard tests
pnpm jest --testPathPattern="UnitCard"

# Run helper tests only
pnpm jest components/ui/UnitCard/__tests__/helpers.test.ts

# Run favorite button tests
pnpm jest components/ui/UnitCard/__tests__/CardFavoriteButton.test.tsx
```

## Helpers (for testing/advanced usage)

```tsx
import {
  getUnitImage,
  getUnitSlug,
  getStatusText,
  extractFloorNumber,
  getTipologiaColor,
  generateUnitHref,
  computePrimaryBadge,
  computeChips,
  formatSpecs,
  computeUnitData,
} from '@/components/ui/UnitCard/helpers';
```
