export async function getVideoList(page: number, size: number): Promise<any[]> {
  const url = `http://api-app.qichangv.com/video/list?page=${page}&page_size=${size}`;
  console.log('🚀 ~ file: API.ts ~ line 3 ~ getVideoList ~ url', url);

  let res = await fetch(url);
  let json = await res.json();

  return json.data.entries;
}
