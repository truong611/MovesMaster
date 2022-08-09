import * as React from 'react';
import {Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from '../text/text';
import {color} from '../../theme';

const layout = Dimensions.get('window');

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function MButton(props: any) {
  // grab the props
  const {
    text,
    style,
    styleText,
    ...rest
  } = props;

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      {...rest}
    >
      <Text style={[styles.text, styleText]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.width * 3 / 4,
    height: 40,
    borderRadius: 20,
    color: color.white,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.white,
  },
  text: {
    color: color.primary,
  },
});
