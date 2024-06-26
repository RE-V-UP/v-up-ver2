import arrow from '@/../public/images/chevron-down.svg'
import { GET_MUSIC_LIST_QUERY_KEYS } from '@/query/musicPlayer/musicPlayerQueryKeys'
import {
  getCurrentMusicData,
  insertCurrentMusics,
  updateCurrentMusic,
} from '@/shared/main/api'
import { getUserMyPlaylistDataInfinite } from '@/shared/mypage/api'
import type { UserInfo } from '@/types/mypage/types'
import InfiniteScrollContainer from '@/util/InfiniteScrollContainer'
import { dragHandler } from '@/util/util'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import ButtonPrimary from '../../util/ButtonPrimary'
import CheckboxItem from '../mypage/CheckboxItem'
import LockContents from './LockContents'
import { throttle } from 'lodash'

const UserPlaylist = ({
  data,
  isVisibility,
}: {
  data: UserInfo
  isVisibility: boolean
}) => {
  const { data: userSessionInfo } = useSession()
  const uid = userSessionInfo?.user?.uid as string
  const [checkedList, setCheckedList] = useState<string[]>([])
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const [toggle, setToggle] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const scrollBoxRef = useRef<HTMLDivElement>(null)
  const [scrollBoxTopPosition, setScrollBoxTopPosition] = useState(0)

  const PER_PAGE = 5
  const MAX_PAGES = 4

  const {
    data: userPlaylistMyData,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery({
    queryKey: [`userMyMusicIds-${id}`],
    queryFn: ({ pageParam = 1 }) =>
      getUserMyPlaylistDataInfinite(id, pageParam, PER_PAGE),
    select: (data) => ({
      pages: data.pages.map((data) => data?.myPlaylistData),
      pageParams: data.pageParams,
      userPlaylistMyIds: data.pages[0]?.playlistMyIds,
    }),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage || lastPage.isLast) {
        return null
      }
      return lastPageParam + 1
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined
      }
      return firstPageParam - 1
    },
    initialPageParam: 1,
    maxPages: MAX_PAGES,
    enabled: !!id,
  })

  const userPlaylistMyIds = userPlaylistMyData?.userPlaylistMyIds

  const { data: myPlaylistCurrentData } = useQuery({
    queryFn: () => getCurrentMusicData(uid),
    queryKey: [GET_MUSIC_LIST_QUERY_KEYS.MY_CURRENT_MUSIC_LIST, uid],
    enabled: !!uid,
  })

  const updateMutation = useMutation({
    mutationFn: updateCurrentMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.MY_CURRENT_MUSIC_LIST],
      })
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.CURRENT_MUSIC_INFO],
      })
    },
  })

  const insertMutation = useMutation({
    mutationFn: insertCurrentMusics,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.CURRENT_MUSIC_INFO],
      })
    },
  })

  const checkListReset = () => {
    setCheckedList([])
  }

  const onChangeCheckMusicHandler = (checked: boolean, id: string) => {
    if (checked) {
      setCheckedList((prev) => [...prev, id])
    } else {
      const checkList = checkedList.filter((el) => el !== id)
      setCheckedList(checkList)
    }
  }

  const onClickAddHandler = async () => {
    if (checkedList.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: '삭제할 노래를 선택해주세요!',
        confirmButtonText: '확인',
        background: '#2B2B2B',
        color: '#ffffff',
      })
      return
    }

    const myCurrentMusicIds = myPlaylistCurrentData?.[0].currentMusicIds!
    let newData = []

    if ((myCurrentMusicIds?.length as number) > 0) {
      const addData = checkedList.filter(
        (el) => !myCurrentMusicIds.includes(el),
      )

      if (addData.length === 0) {
        await Swal.fire({
          icon: 'warning',
          title: `선택하신 ${checkedList.length}개의 곡 모두 이미 추가되어 있습니다.`,
          showConfirmButton: false,
          timer: 1500,
          background: '#2B2B2B',
          color: '#ffffff',
        })
        return
      }

      newData = [...myCurrentMusicIds, ...addData]
    } else {
      newData = [...checkedList]
    }

    updateMutation.mutate({
      userId: uid,
      currentList: newData,
    })
    await Swal.fire({
      icon: 'success',
      title: '현재 재생목록에 추가 되었습니다.',
      showConfirmButton: false,
      timer: 1500,
      background: '#2B2B2B',
      color: '#ffffff',
    })
    checkListReset()
  }

  const onClickAllAddHandler = async () => {
    const userPlaylistMy = !userPlaylistMyIds ? [] : userPlaylistMyIds

    if (!myPlaylistCurrentData?.length && userPlaylistMy.length) {
      await insertMutation.mutate({
        userId: uid,
        musicIds: [...userPlaylistMy],
      })
      return
    }

    const myPlayListCurrent = !myPlaylistCurrentData?.[0].currentMusicIds
      ? []
      : myPlaylistCurrentData?.[0].currentMusicIds
    let newData = []

    if (userPlaylistMy?.length === 0) {
      await Swal.fire({
        icon: 'info',
        title: '추가할 곡이 없습니다.',
        showConfirmButton: false,
        timer: 1500,
        background: '#2B2B2B',
        color: '#ffffff',
      })
      return
    }

    if ((myPlayListCurrent?.length as number) > 0) {
      const addData = userPlaylistMy?.filter(
        (el) => !myPlayListCurrent!.includes(el),
      )

      if (addData?.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: `선택하신 ${userPlaylistMy.length}개 모두 이미 추가되어 있습니다.`,
          showConfirmButton: false,
          timer: 1500,
          background: '#2B2B2B',
          color: '#ffffff',
        })
        return
      }

      newData = [...myPlayListCurrent, ...addData!]
    } else {
      newData = [...userPlaylistMy!]
    }

    updateMutation.mutate({
      userId: uid,
      currentList: newData,
    })
    await Swal.fire({
      icon: 'success',
      title: '현재 재생목록에 추가 되었습니다.',
      showConfirmButton: false,
      timer: 1500,
      background: '#2B2B2B',
      color: '#ffffff',
    })
    checkListReset()
  }

  const onClickToggleHandler = () => {
    setToggle((prev) => !prev)
    checkListReset()
  }

  const handleScroll = useCallback(
    throttle(() => {
      const height = listRef.current?.children[0]
        ? listRef.current?.children[0].clientHeight
        : 0
      if (scrollBoxRef.current) {
        if (
          hasPreviousPage &&
          !isFetchingPreviousPage &&
          scrollBoxRef.current.scrollTop < height * 4
        ) {
          fetchPreviousPage()
        }
      }
    }, 1000),
    [fetchPreviousPage, hasPreviousPage],
  )

  const nextPage = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }

  useEffect(() => {
    if (scrollBoxRef.current) {
      setScrollBoxTopPosition(scrollBoxRef.current?.getBoundingClientRect().top)
    }
  }, [scrollBoxTopPosition])

  useEffect(() => {
    if (scrollBoxRef.current) {
      scrollBoxRef.current.addEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const shadow =
    'shadow-[-4px_-4px_8px_rgba(255,255,255,0.05),4px_4px_8px_rgba(0,0,0,0.7)]'

  const toggleStyle = 'h-0 opacity-0'

  return (
    <div className='mt-[5rem]'>
      {isVisibility ? (
        <>
          <div className='flex items-center justify-between'>
            <h2
              className='flex cursor-pointer items-center gap-2 text-[1.25rem] font-bold'
              onClick={onClickToggleHandler}
            >
              {data?.nickname}님의 플레이리스트{' '}
              <Image
                src={arrow}
                height={24}
                width={24}
                className={`${toggle ? '' : 'rotate-180'}`}
                alt='화살표 아이콘'
              />
            </h2>
            <ButtonPrimary onClick={onClickAllAddHandler}>
              전체 담기
            </ButtonPrimary>
          </div>
          {checkedList.length > 0 && (
            <div
              className={`fixed bottom-10 flex min-w-[114px] rounded-2xl border-2 border-[rgba(0,0,0,0.05)] ${shadow} overflow-hidden bg-[#ffffff19] backdrop-blur-sm`}
              style={{ left: 'calc(50% + (388px / 2) - 56px)' }}
            >
              <button
                type='button'
                onClick={onClickAddHandler}
                className='w-full p-4'
              >
                {checkedList.length}곡 담기
              </button>
            </div>
          )}
          <div
            ref={scrollBoxRef}
            className='overflow-y-auto'
            style={{
              height: `calc(100vh - ${scrollBoxTopPosition}px - 30px)`,
            }}
          >
            <InfiniteScrollContainer
              isFetchingNextPage={isFetchingNextPage}
              isFetchingPreviousPage={isFetchingPreviousPage}
              hasNextPage={hasNextPage}
              nextPage={nextPage}
              root={scrollBoxRef.current}
            >
              <ul
                className={`tracking-[-0.03em] ${toggle ? toggleStyle : ''} overflow-hidden transition-opacity ease-in-out`}
                ref={listRef}
              >
                {userPlaylistMyData &&
                userPlaylistMyData.userPlaylistMyIds?.length! > 0 ? (
                  <>
                    {userPlaylistMyData.pages.map((group, i) => (
                      <React.Fragment key={userPlaylistMyData.pageParams[i]}>
                        {group?.map((item) => (
                          <li
                            draggable='true'
                            onDragStart={(e) => {
                              dragHandler(e, item)
                            }}
                            key={item.musicId}
                            className='flex items-center justify-between p-4'
                          >
                            <div className='flex items-center'>
                              <CheckboxItem
                                checked={checkedList.includes(item.musicId)}
                                id={`user-${item.musicId}`}
                                onChangeCheckMusicHandler={(e) =>
                                  onChangeCheckMusicHandler(
                                    e.target.checked,
                                    item.musicId,
                                  )
                                }
                              />
                              <figure className='ml-7 mr-4 overflow-hidden rounded-full'>
                                <Image
                                  src={item.thumbnail}
                                  width={56}
                                  height={56}
                                  alt={`${item.musicTitle} 앨범 이미지`}
                                />
                              </figure>
                              <label
                                htmlFor={`user-${item.musicId}`}
                                className='flex cursor-pointer flex-col'
                              >
                                <span className='text-[1.125rem]'>
                                  {item.musicTitle}
                                </span>
                                <span className='text-[0.875rem] text-[#ffffff7f]'>
                                  {item.artist}
                                </span>
                              </label>
                            </div>
                            <span className='text-[0.875rem] font-medium text-[#ffffff7f]'>
                              {item.runTime}
                            </span>
                          </li>
                        ))}
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  <li className='flex h-[300px] items-center justify-center text-xl text-white/50'>
                    {data?.nickname}님이 담은 노래가 없습니다.
                  </li>
                )}
              </ul>
            </InfiniteScrollContainer>
          </div>
        </>
      ) : (
        <>
          <h2 className='text-[1.25rem] font-bold'>
            {data?.nickname}님의 플레이리스트
          </h2>
          <LockContents />
        </>
      )}
    </div>
  )
}

export default UserPlaylist
