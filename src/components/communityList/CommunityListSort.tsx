import { Dispatch, SetStateAction } from 'react'

// 커뮤니티 리스트 sort state 정렬 버튼
const CommunityListSort = ({
  isSort,
  setIsSort,
}: {
  isSort: boolean
  setIsSort: Dispatch<SetStateAction<boolean>>
}) => {
  return (
    <div className='flex  h-[22px]  gap-2 text-[16px] leading-[140%]'>
      <button
        onClick={() => {
          setIsSort(true)
        }}
        className={`${isSort ? 'font-bold text-[#685BFF]' : 'text-[rgba(255,255,255,0.5)]'}`}
      >
        최신순
      </button>
      |
      <button
        onClick={() => {
          setIsSort(false)
        }}
        className={`${isSort ? 'text-[rgba(255,255,255,0.5)]' : 'font-bold text-[#685BFF]'}`}
      >
        좋아요순
      </button>
    </div>
  )
}

export default CommunityListSort
