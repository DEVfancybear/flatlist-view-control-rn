import * as React from 'react';
import {StyleSheet, View} from 'react-native';
import Test from './Test';

export default function App() {
  return (
    <View style={styles.container}>
      <Test />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
