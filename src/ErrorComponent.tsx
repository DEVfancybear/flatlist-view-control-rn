import React, {FC} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  style?: ViewStyle;
  errorInfo?: string;
  onPress?: () => void;
};

const ErrorComponent: FC<Props> = ({style, onPress, errorInfo}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={onPress ? 0.8 : 1}
        style={styles.buttonContainer}
        onPress={onPress}>
        <Text style={[styles.text]}>{errorInfo}</Text>
      </TouchableOpacity>
    </View>
  );
};

ErrorComponent.defaultProps = {
  errorInfo: 'Not connect to server, please click to reload!',
};

export default ErrorComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
    right: 0,
    left: 0,
  },
  buttonContainer: {},
});
