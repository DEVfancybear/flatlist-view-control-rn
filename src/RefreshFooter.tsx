import React, {memo} from 'react';
import isEqual from 'react-fast-compare';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {RefreshState} from './RefreshState';

type Props = {
  state: RefreshState;
  onRetryLoading?: () => void;

  footerRefreshingText?: string;
  footerLoadMoreText?: string;
  footerFailureText?: string;
  footerNoMoreDataText?: string;
};

const RefreshFooter: React.FC<Props> = props => {
  const {
    state,
    footerRefreshingText,
    footerNoMoreDataText,
    footerFailureText,
    footerLoadMoreText,
    onRetryLoading,
  } = props;

  let color = useColorScheme();

  let fontColorC3 = color === 'dark' ? '#A9AAAD' : '#555555';

  let footer = null;

  switch (state) {
    case RefreshState.Idle:
      // It is null in the case of Idle, and the tail component is not displayed
      break;
    case RefreshState.Refreshing:
      footer = (
        <View style={styles.loadingView}>
          <ActivityIndicator size="small" />
          <Text style={[styles.refreshingText, {color: fontColorC3}]}>
            {footerRefreshingText}
          </Text>
        </View>
      );
      break;
    case RefreshState.CanLoadMore:
      footer = (
        <View style={styles.loadingView}>
          <Text style={[styles.footerText, {color: fontColorC3}]}>
            {footerLoadMoreText}
          </Text>
        </View>
      );
      break;
    case RefreshState.NoMoreData:
      footer = (
        <View style={styles.loadingView}>
          <Text style={[styles.footerText, {color: fontColorC3}]}>
            {footerNoMoreDataText}
          </Text>
        </View>
      );
      break;
    case RefreshState.Failure:
      footer = (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.loadingView}
          onPress={() => {
            onRetryLoading && onRetryLoading();
          }}>
          <Text style={[styles.footerText, {color: fontColorC3}]}>
            {footerFailureText}
          </Text>
        </TouchableOpacity>
      );
      break;
  }
  return footer;
};

RefreshFooter.defaultProps = {
  footerRefreshingText: 'Loading…',
  footerFailureText: 'Not connect to server, please click to reload!',
  footerNoMoreDataText: 'All data loaded',
  footerLoadMoreText: 'Pull up to load more',
};

export default memo(RefreshFooter, isEqual);

const styles = StyleSheet.create({
  loadingView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  refreshingText: {
    fontSize: 12,
    paddingLeft: 10,
  },
  footerText: {
    fontSize: 12,
  },
});
