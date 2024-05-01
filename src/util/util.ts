import { MusicInfoType } from '@/types/musicPlayer/types'

export const onDateHandler = (itemDate: string) => {
  const date = new Date(itemDate).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return date
}

export const getToday = () => {
  const today = new Date()
  const date = today.toISOString()

  return date
}

// 페이지네이션을 위해 현재 페이지 state를 쥬스탄드에 저장해 전역에서 사용함으로 공유할수있게 만듬
// setCurrentPageData가 페이지네이션 함수와 컴포넌트에도 전달되어 기존 setCurrentPage와 같은 역할을 한다
export const paging = (
  data: any,
  currentPage: number,
  setCurrentPageData: (page: number) => void,
  itemsPer: number = 10,
) => {
  if (!data)
    return {
      currentItems: [],
      nextPage: () => {},
      prevPage: () => {},
      totalPages: 0,
    }

  const itemsPerPage = itemsPer
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPageData(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPageData(currentPage - 1)
    }
  }
  return { currentItems, nextPage, prevPage, totalPages }
}

// 현재 페이지를 리셋해주는 함수 , 새로 검색을 하거나 리렌더가 일어날 경우 실행된다.
export const resetPagination = (setCurrentPageData: (page: number) => void) => {
  setCurrentPageData(1)
}

export const onDateTimeHandler = (itemDate: string) => {
  const date = new Date(itemDate).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })
  return date
}

// 드래그 이벤트 시 dataTransfer에 드래그한 요소의 데이터를 저장한다
// JSON을 사용한 이유는 dataTransfer가 문자만 저장되기 때문. 전역 상태로 만들지 않은 이유는 dataTransfer로 코드를 더 간결하게 사용할 수 있기때문(보일러플레이트)
export const dragHandler = (
  e: React.DragEvent<HTMLLIElement>,
  item: MusicInfoType,
) => {
  e.dataTransfer.setData(
    'musicInfo',
    JSON.stringify({
      musicSource: item.thumbnail,
      musicId: item.musicId,
      musicTitle: item.musicTitle,
      musicArtist: item.artist,
      musicLyrics: item.lyrics,
      musicRunTime: item.runTime,
      musicUrl: item.musicSource,
    }),
  )
}
