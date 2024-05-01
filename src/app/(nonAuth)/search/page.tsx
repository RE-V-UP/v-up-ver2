'use client'
import NoSearchResult from '@/components/search/NoSearchResult'
import SearchedCommunityData from '@/components/search/SearchedCommunityData'
import SearchedMusicData from '@/components/search/SearchedMusicData'
import { searchedData } from '@/query/search/searchQueryKeys'
import { usePaginationStore } from '@/shared/store/paginationStore'
import { useSearchedKeywordStore } from '@/shared/store/searchStore'
import Pagination from '@/util/Pagination '
import { paging } from '@/util/util'

// 검색 페이지
const Search = () => {
  // 페이지네이션을 위해 현재 페이지 state를 쥬스탄드에 저장해 전역에서 사용함으로 공유할수있게 만듬
  // setCurrentPageData가 페이지네이션 함수와 컴포넌트에도 전달되어 기존 setCurrentPage와 같은 역할을 한다
  const setCurrentPageData = usePaginationStore(
    (state) => state.setCurrentPageData,
  )

  // 쥬스탄드에 저장한 현재 페이지 state
  const { currentPageData } = usePaginationStore()
  const { currentPage } = currentPageData

  // 쥬스탄드에 저장돤 검색 키워드와 셀렉트박스(노래,커뮤니티)
  const { searchedKeyword } = useSearchedKeywordStore()
  const { keyword, selectedTabs } = searchedKeyword

  // 서버에서 가져온 음악 검색 결과, 어떤것을 검색하는지 구분짓기위해 쿼리키 요청 함수에 인자로 selectedTabs를 넣어줌으로 분기처리함
  const { musicResult, musicDataIsLoading, musicDataIsError } = searchedData(
    keyword,
    selectedTabs,
  )
  // 서버에서 가져온 커뮤니티 검색 결과, 어떤것을 검색하는지 구분짓기위해 쿼리키 요청 함수에 인자로 selectedTabs를 넣어줌으로 분기처리함
  const { communityResult, communityDataIsLoading, communityDataIsError } =
    searchedData(keyword, selectedTabs)

  const isLoadingSate = musicDataIsLoading && communityDataIsLoading
  const isErrorState = musicDataIsError && communityDataIsError

  if (isLoadingSate) {
    return <div>정보를 가져오고 있습니다</div>
  }

  if (isErrorState) {
    console.error('검색 결과를 가져오지 못했습니다')
    return
  }

  // selectedTabs 에 따라 무엇을 검색하는지 구분하기위한 삼항연산자 이 변수가 페이징 함수로 들어가 페이징되어 return된 변수를 브라우저에 보여주게된다
  const searchedResult =
    selectedTabs === 'musicInfo' ? musicResult : communityResult

  const { currentItems, nextPage, prevPage, totalPages } = paging(
    searchedResult,
    currentPage,
    setCurrentPageData,
    5,
  )

  return (
    <div>
      {searchedResult && searchedResult.length > 0 ? (
        <div className='flex h-[440px] w-[732px] flex-col'>
          <div className='my-[48px] h-[28px] text-[20px] font-bold leading-[140%]'>
            {selectedTabs === 'musicInfo'
              ? `'${keyword}'에 대한 노래 검색 결과`
              : `'${keyword}'에 대한 게시글 검색 결과`}
          </div>
          {selectedTabs === 'musicInfo' ? (
            <SearchedMusicData currentItems={currentItems} />
          ) : (
            <SearchedCommunityData currentItems={currentItems} />
          )}
          {currentItems && currentItems.length > 0 && (
            <div
              className={
                selectedTabs === 'musicInfo' ? 'mt-[82px]' : 'mt-[32px]'
              }
            >
              <Pagination
                totalPages={totalPages}
                prevPage={prevPage}
                nextPage={nextPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className='my-[48px] h-[28px] text-[20px] font-bold leading-[140%]'>
            {`'${keyword}'에 대한 검색 결과가 없습니다`}
          </h2>
          <NoSearchResult />
        </div>
      )}
    </div>
  )
}

export default Search
