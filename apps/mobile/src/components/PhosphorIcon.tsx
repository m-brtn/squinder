import {
  type Icon as PhosphorIcon,
  type IconProps,
  type IconWeight,
} from 'phosphor-react-native';
import { StyleSheet, type ColorValue } from 'react-native';

export function createPhosphorIcon(
  Component: PhosphorIcon,
  weight: IconWeight,
  size: number,
) {
  function PhosphorIconAdapter({ color, style, ...props }: IconProps) {
    const resolvedStyle = StyleSheet.flatten(style);
    const styleColor =
      resolvedStyle && 'color' in resolvedStyle
        ? (resolvedStyle.color as ColorValue)
        : undefined;
    const resolvedColor = color ?? styleColor;

    return (
      <Component
        {...props}
        color={resolvedColor as string}
        size={size}
        style={style}
        weight={weight}
      />
    );
  }

  PhosphorIconAdapter.displayName = `${Component.displayName ?? 'PhosphorIcon'}Adapter`;
  return PhosphorIconAdapter;
}
