'use client'
import CommunityListData from '@/components/communityList/CommunityListData'
import CommunityListSort from '@/components/communityList/CommunityListSort'
import { ACTIVE_BUTTON_SHADOW } from '@/components/login/buttonCss'
import { DOWN_ACTIVE_BUTTON } from '@/components/login/loginCss'
import { getCommunityListInCommunity } from '@/query/community/communityQueryKey'
import { usePaginationStore } from '@/shared/store/paginationStore'
import Pagination from '@/util/Pagination '
import { paging, resetPagination } from '@/util/util'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// 커뮤니티 리스트 페이지
const Community = () => {
  const [isSort, setIsSort] = useState(true)
  const setCurrentPageData = usePaginationStore(
    (state) => state.setCurrentPageData,
  )
  const { currentPageData } = usePaginationStore()
  const { currentPage } = currentPageData

  const { communityList, isLoading, isError, refetch } =
    getCommunityListInCommunity(isSort)

  // refetch 쿼리를 재요청하는 함수, state의 상태가 바뀔때마다 서버에 좋아요, 최신순 기준으로 orderBy로 정렬해서 요청함 / true => 최신순
  useEffect(() => {
    refetch()
    resetPagination(setCurrentPageData)
  }, [isSort, refetch])

  if (isLoading) {
    return <div>정보를 가져오고 있습니다</div>
  }

  if (!communityList) {
    return
  }

  if (isError) {
    console.error('커뮤니티 리스트를 가져오지 못했습니다')
    return
  }

  const { currentItems, nextPage, prevPage, totalPages } = paging(
    communityList,
    currentPage,
    setCurrentPageData,
  )

  return (
    <section>
      <div className='shadow-mb relative mt-[32px] flex h-[72px] w-[732px] items-center justify-center rounded-xl border-4 border-white border-opacity-10 bg-white bg-opacity-10'>
        <h1 className='text-[20px] font-bold'>음악 추천 게시판🦻</h1>
        <div
          className={`absolute right-[48px] flex h-12 w-[120px] items-center justify-center rounded-[12px] bg-primary text-[16px] font-bold active:bg-[rgba(104,91,255,0.20)] ${DOWN_ACTIVE_BUTTON} ${ACTIVE_BUTTON_SHADOW} `}
        >
          <Link href='/communitycreate'>글 작성하기</Link>
        </div>
      </div>

      <div className='my-[30px]'>
        <CommunityListSort isSort={isSort} setIsSort={setIsSort} />
      </div>
      {currentItems.map((item: any) => {
        return <CommunityListData key={item.boardId} item={item} />
      })}
      {currentItems && currentItems.length > 0 && (
        <div className='my-[32px]'>
          <Pagination
            totalPages={totalPages}
            prevPage={prevPage}
            nextPage={nextPage}
          />
        </div>
      )}
    </section>
  )
}

export default Community
