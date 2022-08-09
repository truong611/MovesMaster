import * as React from 'react';
import {Text as ReactNativeText} from 'react-native';
import {presets} from './text.presets';
import {TextProps} from './text.props';
import {translate} from '../../i18n';
import {color} from '../../theme';

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function Text(props: TextProps) {
    // grab the props
    const {preset = 'default', tx, txOptions, text, children, style: styleOverride, fonts, ...rest} = props;

    // figure out which content to use
    const i18nText = tx && translate(tx, txOptions);
    const content = i18nText || text || children;

    const style = presets[preset] || presets.default;
    const styles = [style, styleOverride];
    const fontFamily = fonts || 'Medium';

    return (
        <ReactNativeText {...rest} style={[{color: color.palette.white, lineHeight: 20}, styles, {
            fontFamily: `UrbaneRounded-${fontFamily}`,
        }]}>
            {content}
        </ReactNativeText>
    );
}
