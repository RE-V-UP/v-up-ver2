'use client'
import rectangle from '@/../public/images/Rectangle 156.svg'
import arrowSearch from '@/../public/images/arrow_forward_ios.svg'
import search from '@/../public/images/searchIcon (2).svg'
import useInput from '@/hooks/useInput'
import { usePaginationStore } from '@/shared/store/paginationStore'
import { useSearchedKeywordStore } from '@/shared/store/searchStore'
import { resetPagination } from '@/util/util'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useRef } from 'react'
import Swal from 'sweetalert2'
import { OPEN_ANOTHER_SHADOW } from '../login/loginCss'

// 검색창
const SearchForm = () => {
  const {
    form: keywordInput,
    onChange,
    reset,
  } = useInput({
    keyword: '',
    selectedTabs: 'musicInfo',
  })
  // 검색 키워드 와 셀렉박스를 쥬스탄드에 저장함으로 페이지에서 같은 값을 공유할 수 있다
  const { keyword, selectedTabs } = keywordInput
  const searched = useSearchedKeywordStore((state) => state.searched)
  const setCurrentPageData = usePaginationStore(
    (state) => state.setCurrentPageData,
  )

  const router = useRouter()
  const keywordRef = useRef<HTMLInputElement>(null)

  // 검색 버튼을 누르면 서버에서 해당 데이터를 검색
  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!keyword) {
      Swal.fire({
        icon: 'warning',
        title: '검색 키워드를 입력해 주세요',
        background: '#2B2B2B',
        color: '#ffffff',
      })
      return keywordRef.current?.focus()
    }

    // 쥬스탄드에 검색 키워드와 selectedTabs 저장, 검색할때마다 현재 페이지를 1페이지로 초기화해주는 함수를 연결함으로 이전페이지 검색도 가능하다
    searched(keyword, selectedTabs)
    resetPagination(setCurrentPageData)
    router.push('/search')
    reset()
  }

  return (
    <div
      className={`inline-flex w-[300px] items-center justify-between rounded-xl ${OPEN_ANOTHER_SHADOW}
      bg-white bg-opacity-10 py-2 pl-4 
   `}
    >
      <div className='flex items-center'>
        <form onSubmit={onSubmitHandler} className='flex flex-row'>
          <button type='submit'>
            <Image
              src={search}
              alt='검색'
              className='mr-2'
              width={18}
              height={18}
            />
          </button>
          <Image src={rectangle} alt='검색바' width={1} height={16} />
          <input
            type='text'
            name='keyword'
            value={keyword}
            ref={keywordRef}
            onChange={onChange}
            className='w-[140px] appearance-none bg-transparent pl-2 pr-2 focus:outline-none'
          />

          <select
            name='selectedTabs'
            value={selectedTabs}
            onChange={onChange}
            className='w-[80px] appearance-none bg-transparent text-center text-sm font-bold text-white text-opacity-30'
            id='selectImg'
          >
            <option
              value='musicInfo'
              className='appearance-none bg-transparent text-black focus:outline-none'
            >
              노래검색
            </option>
            <option
              value='community'
              className='appearance-none bg-transparent text-black focus:outline-none'
            >
              게시글검색
            </option>
          </select>
          <label htmlFor='selectImg'>
            <div className='inline-flex h-[18px] w-[18px] flex-col items-center justify-center gap-2.5 rounded bg-white bg-opacity-5 p-0.5'>
              <Image src={arrowSearch} width={14} height={14} alt='검색' />
            </div>
          </label>
        </form>
      </div>
    </div>
  )
}

export default SearchForm
