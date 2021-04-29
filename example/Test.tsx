import {
  endRefreshing as EndRefreshing,
  RefreshListView,
  RefreshState,
} from 'flatlist-view-control-rn';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {getVideoList} from './API';

let pageSize = 10;
export default function Test1() {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    (async function () {
      let arr = await getVideoList(1, pageSize);
      setData(arr);
    })();
  }, []);
  const onFooterRefresh = async (endRefreshing: EndRefreshing) => {
    let next = currentPage + 1;

    let arr = await getVideoList(next, pageSize);

    if (arr.length === pageSize) {
      setData(data.concat(arr));
      endRefreshing(RefreshState.CanLoadMore);
    } else {
      setData(data.concat(arr));
      endRefreshing(RefreshState.NoMoreData);
    }
    setCurrentPage(next);
  };
  const onHeaderRefresh = async (endRefreshing: EndRefreshing) => {
    let arr = await getVideoList(1, pageSize);
    if (arr.length === pageSize) {
      setData(arr);
      endRefreshing(RefreshState.CanLoadMore);
    } else {
      setData(arr);
      endRefreshing(RefreshState.NoMoreData);
    }
    setCurrentPage(1);
  };

  return (
    <View>
      <RefreshListView
        onFooterRefresh={onFooterRefresh}
        onHeaderRefresh={onHeaderRefresh}
        data={data}
        renderItem={({item}) => <Text style={{height: 50}}>{item.title}</Text>}
      />
    </View>
  );
}
