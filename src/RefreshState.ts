export enum RefreshState {
  Idle = 'Idle', // Initial state, no refresh
  CanLoadMore = 'CanLoadMore', // You can load more, indicating that the list still has data to continue loading
  Refreshing = 'Refreshing', // Refreshing
  NoMoreData = 'NoMoreData', // No more data
  Failure = 'Failure', // Refresh failed
}
