'use client'
import musicDragIcon from '@/../public/images/musicDragIcon.svg'
import { queryClient } from '@/app/provider'
import {
  GET_MUSIC_LIST_QUERY_KEYS,
  getMusicList,
} from '@/query/musicPlayer/musicPlayerQueryKeys'
import { insertCurrentMusic, updateCurrentMusic } from '@/shared/main/api'
import { useCustomListMusicStore } from '@/shared/store/playerStore'
import {
  CurrentPlayListType,
  MusicInfoType,
  MusicListProps,
} from '@/types/musicPlayer/types'
import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { DragEvent, useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import CheckboxItem from '../mypage/CheckboxItem'

// 현재 플레이 리스트 목록 컴포넌트
const CurrentMusicList = ({
  currentPlaying,
  currentPlayList,
  isLyrics,
  checkedList,
  selectAll,
  setSelectAll,
  setCheckedList,
  setCurrentPlaying,
  onChangeCheckMusicHandler,
  onDeleteCurrentMusicHandler,
  setMusicIndex,
}: MusicListProps) => {
  const [isDrag, setIsDrag] = useState(false)
  const [draggedItem, setDraggedItem] = useState<MusicInfoType | null>(null)
  const [dragIndex, setDragIndex] = useState<number>(-1)

  const { data: userSessionInfo } = useSession()
  const uid = userSessionInfo?.user?.uid as string

  const customListMusic = useCustomListMusicStore(
    (state) => state.customListMusic,
  )
  const { customListData } = useCustomListMusicStore()
  const { customPlayList } = customListData

  const { playListCurrent } = getMusicList(uid)

  // 쥬스탄드 customListMusic state에 값이 없을 경우 서버 데이터를  전역상태 + 로컬스토리지에 저장한다. 이후 추가,삭제와 같이 서버 데이터 변경이 없으면 그대로 유지된다
  // 드래그앤 드롭으로 인덱스 변경 시 customListMusic에 인덱스 순서가 저장되며 로컬스토리지도 변경된다
  // 유즈이펙으로 서버데이터와, 로컬스토리지 데이터가 변경될때마다 리렌더링이 발생한다
  useEffect(() => {
    if (customPlayList.length === 0) {
      customListMusic(currentPlayList)
      return
    }

    // 현재 플리에 음악을 추가 할 경우, 서버데이터와 쥬스탄드 state의 음악 ID값 비교 후 같지않은 데이터 추출
    const addValue = currentPlayList.filter((currentItem) => {
      return customPlayList.every((customItem) => {
        return currentItem.musicId !== customItem.musicId
      })
    })

    // 현재 플리에 음악을 삭제 할 경우, 서버데이터와 쥬스탄드 state의 음악 ID값 비교 후 같지않은 데이터 추출
    const removeValues = customPlayList.filter((currentItem) => {
      return currentPlayList.every((customItem) => {
        return currentItem.musicId !== customItem.musicId
      })
    })

    // 현재 플리 추가 로직
    if (addValue.length > 0) {
      // 서버 데이터와(추가한 현재 플리가 포함된) 위에서 서버와 쥬스탄드 state를 비교해 같지않아 추출된 데이터를 전개구문으로 풀어 하나의 배열로 넣어주되,
      // 위에서 추출된 변수를 뒤에 넣어줌으로 추가할때마다 맨 아래에 추가된다
      const addList = [...customPlayList, ...addValue]
      customListMusic(addList)
    }

    // 현재 플리 삭제 로직
    if (removeValues.length > 0) {
      // 서버 데이터와 쥬스탄드 state 비교후 같지 않은 데이터를 map으로 음악 id값을 추출하고,
      // 쥬스탄드 state에 필터와 인클루드를 통해 map으로 추출된 음악iD와 비교 후 같지않은 데이터만 반환하여 새 배열을 만든다(투두리스트 삭제와 같은 원리)
      const currentItems = removeValues.map((item) => {
        return item.musicId
      })

      const removeList = customPlayList.filter((item) => {
        return !currentItems.includes(item.musicId)
      })
      customListMusic(removeList)
    }
  }, [currentPlayList, customPlayList])

  const insertMutation = useMutation({
    mutationFn: insertCurrentMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.CURRENT_MUSIC_INFO],
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCurrentMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.CURRENT_MUSIC_INFO],
      })
    },
  })

  // 외부 컴포넌트에서 현재 플레이리스트에 추가하기 위한 드롭 함수(드롭 시 현재 플레이리스트에 노래가 추가된다)
  const onOuterDropHandler = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    // 같은 영역에 드롭 이벤트를 인덱스 변경과 외부 컴포넌트에서 데이터 받아오는 두개를 사용하다보니 스테이트에 불리언값을 넣어 드롭 인덱스를 구분지어줬다
    if (!isDrag) {
      // dataTransfer는 외부 컴포넌트로부터 드래그 이벤트로 값을 저장하고, 가져오기위해 사용된다 JSON을 사용한 이유는 dataTransfer가 문자만 저장되기때문
      // 쥬스탄드를 이용해 전역상태에 저장하는 방법도 있었으나 코드를 더 간결하게 하기 위해 dataTransfer를 사용함(보일러플레이트를 줄이려고)
      const musicInfo = JSON.parse(e.dataTransfer.getData('musicInfo'))

      if (playListCurrent && playListCurrent.length > 0) {
        const currentList = playListCurrent[0].currentMusicIds
        if (currentList.find((el) => el === musicInfo.musicId)) {
          Swal.fire({
            icon: 'warning',
            title: '이미 추가된 노래입니다.',
            showConfirmButton: false,
            timer: 1500,
            background: '#2B2B2B',
            color: '#ffffff',
          })
          return
        }

        currentList.push(musicInfo.musicId)
        updateMutation.mutate({ userId: uid, currentList })
      } else {
        insertMutation.mutate({ userId: uid, musicId: musicInfo.musicId })
      }
      Swal.fire({
        icon: 'success',
        title: '현재 재생목록에 추가 되었습니다.',
        showConfirmButton: false,
        timer: 1500,
        background: '#2B2B2B',
        color: '#ffffff',
      })
    }
  }

  // 플레이리스트 순서 변경을 위한 드래그 이벤트
  const onInnerDragHandler = (item: MusicInfoType, index: number) => {
    // 스테이트에 드래그한 요소의 데이터와(음악정보), 위치정보를 저장한다(인덱스)
    setDraggedItem(item)
    setDragIndex(index)
  }
  const onInnerDropHandler = (dropIndex: number) => {
    if (!draggedItem || !currentPlayList) {
      return
    }
    if (dragIndex !== dropIndex) {
      // 스플라이스를 이용해 드래그한 요소를 인덱스에서 삭제한다
      const [draggedMusic] = currentPlayList.splice(dragIndex, 1)

      // 위에서 삭제한 드래그한 요소를 드롭한 위치에 추가해준다(내려놓은위치, 0이면 삭제가 아닌 추가됨, 위에서 삭제한 요소를 담은 변수)
      currentPlayList.splice(dropIndex, 0, draggedMusic)

      // 쥬스탄드 스테이트에 저장함으로 로컬스토리지에도 저장된다
      customListMusic(currentPlayList)
    }
    // 드롭으로 인덱스 순서 변경 후 스테이트 초기화
    setDraggedItem(null)
    setDragIndex(-1)
    setIsDrag(false)
  }

  // 해당 영역에만 드롭이벤트를 발생시킬수있는 이벤트
  const onDragOverHandler = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // 전체 선택을 위한 이벤트 버튼 클릭 시 현재 플레이리스트에 담긴 음악 id값을 추출해 체크리스트 스테이트에 담아준다(체크리스트 스테이트에 담긴 값이 삭제됨)
  const onSelectAllHandler = () => {
    const allMusicIds = currentPlayList.flatMap(
      (item: CurrentPlayListType) => item.musicId,
    )

    if (!selectAll) {
      setCheckedList(allMusicIds)
    } else {
      setCheckedList([])
    }
    setSelectAll((prev) => !prev)
  }

  return (
    <div
      className='mt-[16px] flex max-h-[250px] min-h-[250px] flex-col overflow-y-auto overflow-x-hidden'
      // 온드롭 - 드래그 한 요소를 내려놓았을때 발생하는 이벤트
      // 온드래그오버 - 해당 영역에만 드롭이벤트가 발생한다
      onDrop={onOuterDropHandler}
      onDragOver={onDragOverHandler}
    >
      {customPlayList.length === 0 && (
        <div className='flex flex-col items-center text-[18px] opacity-50'>
          음악을 추가해주세요
        </div>
      )}
      <div className='flex flex-col justify-between'>
        {customPlayList.map((item: CurrentPlayListType, index: number) => {
          // 현재 플리에 리스트와 쥬스탄드 state에 담긴 플리 리스트 음악 ID가 같은것을 musicIndex변수에 담아 음악 제목 또는 가수 클릭 시 해당 음악이 재생된다
          const musicIndex = customPlayList.findIndex(
            (arr: CurrentPlayListType) => {
              return arr.musicId === item.musicId
            },
          )
          const isCurrentPlaying = item.musicId === currentPlaying?.musicId

          return (
            <div
              onDrop={() => onInnerDropHandler(index)}
              onDragOver={onDragOverHandler}
              key={item.musicId}
            >
              {!isLyrics ? (
                <div
                  // 드래그블을 트루로 설정해야 드래그 이벤트를 사용할 수 있다
                  // 온드래그 스타트 - 드래그 시작 시 발생하는 이벤트, 드래그하면 스테이트에 음악 데이터와 데이터인덱스를 스테이트에 담아준다
                  draggable='true'
                  onDragStart={() => {
                    setIsDrag(true)
                    onInnerDragHandler(item, index)
                  }}
                  className={`relative flex max-h-[63px]  w-full cursor-pointer justify-between pb-[8px] pl-[16px] pr-[16px] pt-[8px] ${isCurrentPlaying ? 'rounded-lg bg-neutral-700' : ''}`}
                >
                  <div className='flex items-center gap-[16px]'>
                    <CheckboxItem
                      checked={checkedList.includes(item.musicId)}
                      id={item.musicId}
                      onChangeCheckMusicHandler={(e) =>
                        onChangeCheckMusicHandler(
                          e.target.checked,
                          item.musicId,
                        )
                      }
                    />
                    <div
                      onClick={() => {
                        setMusicIndex(musicIndex)
                        setCurrentPlaying(customPlayList[musicIndex])
                      }}
                      className='flex cursor-pointer flex-col'
                    >
                      <p className='text-[16px]'>{item.musicTitle}</p>
                      <span className='text-[14px] opacity-[30%] '>
                        {item.artist}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-[17px]'>
                    <span className='text-[14px] opacity-[30%] '>
                      {item.runTime}
                    </span>
                    <Image
                      src={musicDragIcon}
                      alt='드래그 아이콘'
                      width={24}
                      height={24}
                    />
                  </div>
                </div>
              ) : null}
              {isLyrics && isCurrentPlaying && (
                <div className='m-auto  w-[326px] items-center p-[8px] text-center text-[14px] leading-[150%] opacity-[30%]'>
                  {customPlayList[musicIndex].lyrics}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {!isLyrics && customPlayList.length > 0 && checkedList.length > 0 && (
        <div className='absolute bottom-[40px] left-[56px] right-[56px] flex gap-[8px]'>
          <button
            type='button'
            onClick={onSelectAllHandler}
            className='h-[56px] w-[113px] rounded-[16px] border-[2px] border-solid border-[rgba(0,0,0,0.4)] bg-[rgba(255,255,255,0.1)] text-center font-bold drop-shadow-[-4px_-4px_8px_rgba(0,0,0,0.05),_4px_4px_8px_rgba(0,0,0,0.7)]  backdrop-blur-[12px]'
          >
            {selectAll ? '전체 해제' : '전체 선택'}
          </button>
          <button
            type='button'
            onClick={onDeleteCurrentMusicHandler}
            className='h-[56px] w-[113px] rounded-[16px] border-[2px] border-solid border-[rgba(0,0,0,0.4)] bg-[rgba(255,255,255,0.1)] text-center font-bold drop-shadow-[-4px_-4px_8px_rgba(0,0,0,0.05),_4px_4px_8px_rgba(0,0,0,0.7)]  backdrop-blur-[12px]'
          >
            {`${checkedList.length > 0 ? `${checkedList.length} 곡 삭제` : '곡 삭제'}`}
          </button>
        </div>
      )}
    </div>
  )
}
export default CurrentMusicList
