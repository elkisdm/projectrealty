# Mapping v2.0.0 Implementation

## Overview

This document describes the implementation of the mapping v2.0.0 configuration for transforming raw data into canonical building and unit models.

## Architecture

### Core Components

1. **Transformation Functions** (`lib/adapters/assetplan.ts`)
   - Data normalization and validation functions
   - Type conversion utilities
   - Business rule implementations

2. **Derivation Functions** (`lib/derive.ts`)
   - Aggregation calculations
   - Derived field computations
   - Business logic for featured flags and pricing

3. **Mapping Transformer** (`lib/mapping-v2.ts`)
   - Main transformation orchestration
   - Configuration-driven data mapping
   - Type-safe transformation pipeline

## Key Features

### 1. Data Normalization

#### Building Data
- **ID Generation**: SHA1 hash of Condominio|Comuna|Direccion
- **Name**: Title case normalization
- **Comuna**: Removes codes, normalizes to Title Case
- **GC Mode**: MF fixed except exceptions (VISD, SNMD, LIAD, MRSD)

#### Unit Data
- **Tipology**: Canonical format (Studio, 1D1B, 2D1B, 2D2B, 3D2B)
- **Areas**: Interior + Exterior calculation, cm² to m² correction
- **Parking/Storage**: Pipe-separated IDs or 'x' for optional
- **Orientation**: Strict enum validation (N, NE, E, SE, S, SO, O, NO)

### 2. Availability Rules

```typescript
// Units are available if:
disponible = estado ∈ ['RE - Acondicionamiento', 'Lista para arrendar'] 
           && arriendo_total > 1
```

### 3. Pricing Calculations

#### Base Pricing
- **Rent Amount**: CLP to integer conversion
- **GC Total**: Optional CLP to integer
- **Renta Mínima**: `arriendo_total * rentas_necesarias`

#### Promotions
- **Discount**: Percentage to 0-100 integer
- **No Guarantee Surcharge**: 6% of total amount
- **Guarantee Installments**: 1-12 range validation
- **Guarantee Months**: 0, 1, or 2 months

### 4. Aggregations

#### Building Level
- **Price From**: MIN of available units
- **Price To**: MAX of available units
- **Has Availability**: EXISTS available units

#### Featured Flag
```typescript
featured = tremenda_promo 
        || discount_percent >= 50 
        || sin_garantia 
        || price_percentile <= 25
```

## Usage

### Basic Transformation

```typescript
import { createMappingV2Transformer } from '@lib/mapping-v2';

const transformer = createMappingV2Transformer();

// Transform building data
const building = transformer.transformBuilding(rawBuildingData);

// Transform unit data
const unit = transformer.transformUnit(rawUnitData, buildingId);

// Transform promotion data
const promotion = transformer.transformPromotion(rawUnitData);
```

### Configuration

The transformer uses a default configuration that matches the v2.0.0 specification:

```typescript
const defaultConfig = {
  meta: {
    version: "2.0.0",
    primary_key: "OP",
    currency: "CLP"
  },
  availability: {
    publishable_states: ["RE - Acondicionamiento", "Lista para arrendar"],
    min_rent_exclusive: 1
  }
};
```

## Validation Rules

### Hard Checks (Critical)
- `precioDesde` consistency with unit minimums
- `precioHasta` consistency with unit maximums
- Typology canonical format validation
- Area reasonable range (20-200 m² interior, 0-50 m² exterior)
- OP uniqueness
- Condominio+Unidad uniqueness

### Soft Checks (Moderate)
- Comuna without digits
- Link listing contains unit number
- GC mode coherence
- Guarantee installments range

## Business Rules

### 1. Availability
- Only units with valid state and rent > 1 are publishable
- RE - Acondicionamiento units get "Pronto" badge

### 2. Pricing
- Exclude units with rent ≤ 1 from aggregations
- Calculate min/max from remaining publishable units

### 3. Promotions
- Fixed 6% surcharge for no guarantee
- Applied to rent + extras if they sum to rent
- Discount percentages 0-100 range

### 4. Pet Restrictions
- Maximum weight: 20kg
- Restricted breeds: pitbull, rottweiler, doberman, bulldog

## Error Handling

### Graceful Degradation
- Missing data returns `undefined` or `null`
- Invalid formats are normalized or discarded
- Type conversion failures default to safe values

### Validation
- Schema validation with Zod
- Business rule validation
- Range and format checking

## Testing

### Test Coverage
- ✅ Building transformation
- ✅ Unit transformation
- ✅ Promotion transformation
- ✅ Pet restrictions validation
- ✅ Aggregation calculations
- ✅ Edge cases and error handling

### Running Tests
```bash
npm test -- tests/unit/mapping-v2.test.ts
```

## Migration from v1

### Breaking Changes
- New field names and formats
- Stricter validation rules
- Enhanced business logic

### Compatibility
- Backward compatible where possible
- Optional fields for gradual migration
- Default values for missing data

## Performance Considerations

### Optimization
- Efficient hash generation
- Minimal object creation
- Lazy evaluation where appropriate

### Scalability
- Stateless transformation functions
- Configurable batch processing
- Memory-efficient aggregations

## Future Enhancements

### Planned Features
- Database integration for percentiles
- Real-time validation
- Advanced promotion rules
- Multi-currency support

### Extensibility
- Plugin-based transformation pipeline
- Custom business rule injection
- Dynamic configuration loading
