import React, {PureComponent} from 'react';
import {
  FlatList,
  FlatListProps,
  Insets,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ViewStyle,
  ViewToken,
} from 'react-native';
import RefreshFooter from './RefreshFooter';
import {RefreshState} from './RefreshState';

export type endRefreshing = (footerState: RefreshState) => void;

type Props<ItemT> = {
  onHeaderRefresh?: (endRefreshing: endRefreshing) => void; // Pull-down refresh method
  onFooterRefresh?: (endRefreshing: endRefreshing) => void; // Pull-up loading method

  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onViewableItemsChanged?:
    | ((info: {
        viewableItems: Array<ViewToken>;
        changed: Array<ViewToken>;
      }) => void)
    | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  showsVerticalScrollIndicator?: boolean;
  scrollIndicatorInsets?: Insets; //zeroes
  keyExtractor?: (item: ItemT, index: number) => string;
  extraData?: any;
  style?: ViewStyle;
  data?: ReadonlyArray<ItemT> | null;
  numColumns?: number;
  renderItem: ListRenderItem<ItemT>;
} & FlatListProps<ItemT>;

type State = {
  isHeaderRefreshing: boolean; // Whether the head is refreshing
  isFooterRefreshing: boolean; // Whether the tail is refreshing
  footerState: RefreshState;
};
let callOnScrollEnd = false;
export default class RefreshListView<ItemT> extends PureComponent<
  Props<ItemT>,
  State
> {
  private _renderFooter = () => {
    return (
      <RefreshFooter
        state={this.state.footerState}
        onRetryLoading={() => {
          //this.beginFooterRefresh()
          this.startFooterRefreshing();
        }}
      />
    );
  };

  listRef: FlatList<ItemT> | null = null;

  constructor(props: Props<ItemT>) {
    super(props);

    this.endRefreshing = this.endRefreshing.bind(this);

    this.state = {
      isHeaderRefreshing: false, // Whether the head is refreshing
      isFooterRefreshing: false, // Whether the tail is refreshing
      footerState: RefreshState.Idle, // The current state of the tail, the default is Idle, no controls are displayed
    };
  }

  public scrollToIndex = (index: number) => {
    if (this.listRef && this.props.data && this.props.data.length > 0) {
      this.listRef.scrollToIndex({
        animated: true,
        index: index,
        viewOffset: 0,
        viewPosition: 0,
      });
    }
  };

  public scrollToOffset = (params: {
    animated?: boolean | null;
    offset: number;
  }) => {
    if (this.listRef) {
      this.listRef.scrollToOffset(params);
    }
  };

  public scrollToTop = () => {
    this.scrollToIndex(0);
  };

  render() {
    return (
      <FlatList
        {...this.props}
        extraData={this.props.extraData}
        scrollIndicatorInsets={this.props.scrollIndicatorInsets}
        showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator}
        numColumns={this.props.numColumns}
        data={this.props.data}
        style={this.props.style}
        onViewableItemsChanged={this.props.onViewableItemsChanged}
        ListEmptyComponent={this.props.ListEmptyComponent}
        ItemSeparatorComponent={this.props.ItemSeparatorComponent}
        renderItem={this.props.renderItem}
        ref={ref => (this.listRef = ref)}
        refreshControl={
          // Set the pull-down refresh component
          this.props.onHeaderRefresh ? (
            <RefreshControl
              refreshing={this.state.isHeaderRefreshing}
              onRefresh={this.beginHeaderRefresh.bind(this)} //(()=>this.onRefresh) or use bind to bind this reference to call the method
              title={
                this.state.isHeaderRefreshing
                  ? 'Refreshing....'
                  : 'Pull down to refresh'
              }
            />
          ) : // <MyRefreshControl
          //     refreshing={this.state.isHeaderRefreshing}
          //     //onRefresh={}
          // />
          undefined
        }
        ListHeaderComponent={this.props.ListHeaderComponent}
        keyExtractor={(item, index) =>
          this.props.keyExtractor
            ? this.props.keyExtractor(item, index)
            : index.toString()
        }
        directionalLockEnabled
        scrollEventThrottle={16}
        onScroll={this._onScroll.bind(this)}
        ListFooterComponent={this._renderFooter}
        onEndReached={() => (callOnScrollEnd = true)}
      />
    );
  }

  private _onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    //console.log('_onScroll',event.nativeEvent)

    let offsetY = event.nativeEvent.contentOffset.y;
    let height = event.nativeEvent.layoutMeasurement.height;
    let contentHeight = Math.floor(event.nativeEvent.contentSize.height); //Solve the problem of not triggering Android loading more

    if (callOnScrollEnd && this.shouldStartFooterRefreshing()) {
      if (offsetY + height >= contentHeight) {
        // console.log("load more");
        this.startFooterRefreshing();
        callOnScrollEnd = false;
      }
    }

    if (this.props.onScroll) this.props.onScroll(event);
  }

  ///The state of the tail component, for external calls, generally not used
  footerState() {
    return this.state.footerState;
  }

  /// Start pull-down refresh
  beginHeaderRefresh() {
    if (this.shouldStartHeaderRefreshing()) {
      this.startHeaderRefreshing();
    }
  }

  /// Start to pull up to load more
  beginFooterRefresh() {
    if (this.shouldStartFooterRefreshing()) {
      this.startFooterRefreshing();
    }
  }

  /// Pull down to refresh, call the refresh method after setting the refresh state,
  // so that the loading UI can be displayed on the page, pay attention to the setState writing here
  startHeaderRefreshing() {
    this.setState(
      {
        isHeaderRefreshing: true,
      },
      () => {
        setTimeout(() => {
          this.props.onHeaderRefresh &&
            this.props.onHeaderRefresh(this.endRefreshing);
        }, 500);
      },
    );
  }

  /// Pull up to load more, change the bottom refresh state to refreshing, and then call the refresh method,
  // the page can display the loading UI, pay attention to the wording of setState here
  startFooterRefreshing() {
    this.setState(
      {
        footerState: RefreshState.Refreshing,
        isFooterRefreshing: true,
      },
      () => {
        this.props.onFooterRefresh &&
          this.props.onFooterRefresh(this.endRefreshing);
      },
    );
  }

  /***
   * Is it currently possible to pull down to refresh
   * @returns {boolean}
   *
   * If the end of the list is performing a pull-up load, it returns false
   * If the head of the list is already refreshing, return false
   */
  shouldStartHeaderRefreshing(): boolean {
    if (
      this.state.footerState === RefreshState.Refreshing ||
      this.state.isHeaderRefreshing ||
      this.state.isFooterRefreshing ||
      this.props.onHeaderRefresh === undefined
    ) {
      return false;
    }
    return true;
  }

  /***
   * Is it currently possible to pull up to load more
   * @returns {boolean}
   *
   * If the bottom is already refreshing, return false
   * If the bottom state is that there is no more data, return false
   * If the head is refreshing, return false
   * If the list data is empty, it returns false (the list is empty in the initial state, at this time,
   * there is definitely no need to pull up to load more, but to perform a pull down refresh)
   */
  shouldStartFooterRefreshing(): boolean {
    if (
      this.state.footerState === RefreshState.Refreshing ||
      this.state.footerState === RefreshState.NoMoreData ||
      this.state.footerState === RefreshState.Failure ||
      //this.props.data.length === 0 ||
      this.state.isHeaderRefreshing ||
      this.state.isFooterRefreshing ||
      this.props.onFooterRefresh === undefined
    ) {
      return false;
    }
    return true;
  }

  /**
   * Stop refreshing according to the status of the tail component
   * @param footerState
   *
   * If the refresh is completed and the current list data source is empty, the tail component will not be displayed.
   * This is done here because usually when there is no data in the list, we will display a blank page.
   * If the tail component is displayed again, such as "no more data", it is too much
   */
  public endRefreshing(footerState: RefreshState) {
    let footerRefreshState = footerState;
    // if ((this.props.data && this.props.data.length === 0) || (this.props.sections && this.props.sections[this.props.sections.length -1].data.length === 0) ) {
    //   footerRefreshState = RefreshState.Idle;
    // }
    this.setState({
      footerState: footerRefreshState,
      isHeaderRefreshing: false,
      isFooterRefreshing: false,
    });
  }
}
