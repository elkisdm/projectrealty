import { theme } from '@lib/theme';

describe('theme', () => {
  it('has correct brand colors', () => {
    expect(theme.brand.primary).toBe('#6D4AFF');
    expect(theme.brand.secondary).toBe('#00E6B3');
    expect(theme.brand.accent).toBe('#FF8A00');
  });

  it('has correct light theme colors', () => {
    expect(theme.light.bg).toBe('#FFFFFF');
    expect(theme.light.surface).toBe('#F8FAFC');
    expect(theme.light.soft).toBe('#F1F5F9');
    expect(theme.light.text).toBe('#0F172A');
    expect(theme.light.subtext).toBe('#475569');
    expect(theme.light.ring).toBe('#6D4AFF');
  });

  it('has correct dark theme colors', () => {
    expect(theme.dark.bg).toBe('#0B0B10');
    expect(theme.dark.surface).toBe('#12121A');
    expect(theme.dark.soft).toBe('#1A1A24');
    expect(theme.dark.text).toBe('#F5F7FA');
    expect(theme.dark.subtext).toBe('#B7C0CE');
    expect(theme.dark.ring).toBe('#A28BFF');
  });

  it('has correct radii values', () => {
    expect(theme.radii.card).toBe('1.25rem');
    expect(theme.radii.pill).toBe('999px');
  });

  it('theme object structure is correct', () => {
    expect(theme).toHaveProperty('brand');
    expect(theme).toHaveProperty('light');
    expect(theme).toHaveProperty('dark');
    expect(theme).toHaveProperty('radii');
    expect(Object.keys(theme.brand)).toHaveLength(3);
    expect(Object.keys(theme.light)).toHaveLength(6);
    expect(Object.keys(theme.dark)).toHaveLength(6);
    expect(Object.keys(theme.radii)).toHaveLength(2);
  });
});
