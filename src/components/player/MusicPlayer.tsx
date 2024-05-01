'use client'
import { queryClient } from '@/app/provider'
import {
  GET_MUSIC_LIST_QUERY_KEYS,
  getMusicList,
} from '@/query/musicPlayer/musicPlayerQueryKeys'
import {
  insertMyPlayMusic,
  updateCurrentMusic,
  updateMyPlayMusic,
} from '@/shared/musicPlayer/api'
import { useCustomListMusicStore } from '@/shared/store/playerStore'
import { CurrentPlayListType } from '@/types/musicPlayer/types'
import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import 'react-h5-audio-player/lib/styles.css'
import Swal from 'sweetalert2'
import CurrentMusicList from './CurrentMusicList'
import Player from './Player'

// 플레이어 최상위 컴포넌트
const MusicPlayer = () => {
  const [currentPlaying, setCurrentPlaying] =
    useState<CurrentPlayListType | null>(null)
  const [musicIndex, setMusicIndex] = useState<number>(0)
  const [checkedList, setCheckedList] = useState<string[]>([])
  const [isLyrics, setIsLyrics] = useState(false)
  const [isRandom, setIsRandom] = useState(false)
  const [selectAll, setSelectAll] = useState(false)

  const { data: userSessionInfo } = useSession()
  const uid = userSessionInfo?.user.uid as string

  // 로컬스토리지와 쥬스탄드에 저장된 현재 플레이 리스트
  // 쥬스탄드 스테이트에 저장된 값이 없을때만 DB와 통신하며 이후 로컬스토리지에 저장된 값으로만 관리된다
  // 추가, 삭제 시 서버 데이터와 로컬스토리지에 저장된 데이터를 비교 후 로컬스토리지 데이터를 수정해준다(CurrentMusicList 컴포넌트 참고)
  const { customListData } = useCustomListMusicStore()
  const { customPlayList } = customListData

  const { currentPlayList, myPlayList, isError } = getMusicList(uid)

  const deleteMutation = useMutation({
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
    mutationFn: insertMyPlayMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.MY_MUSIC_INFO],
      })
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.MY_MUSIC_LIST],
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateMyPlayMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.MY_MUSIC_INFO],
      })
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.MY_MUSIC_LIST],
      })
    },
  })

  if (!currentPlayList) {
    return []
  }
  if (isError) {
    console.error('현재 플레이리스트를 가져오지 못했습니다')
    return
  }

  const onLyricsToggle = () => {
    setIsLyrics((prev) => !prev)
  }

  const onRandomMusicHandler = () => {
    setIsRandom((prev) => {
      return !prev
    })
  }

  // 플레이어 이전 버튼을 누를경우 isRandom 스테이트가 참일경우 Math.random을 이용해 랜덤재생된다
  // 플리 인덱스가 0과 같을경우 플리리스트-1로 이전 노래를 재생하게된다
  const onPreviousHandler = () => {
    if (!isRandom) {
      if (musicIndex === 0) {
        setMusicIndex(customPlayList.length - 1)

        // 현재 재생중인 음악 정보를 담은 스테이트. 플레이리스트에 인덱스 기준으로 현재 음악 정보를 담아주고있다
        setCurrentPlaying(customPlayList[musicIndex] as CurrentPlayListType)
      } else {
        setMusicIndex((prev) => prev - 1)
        setCurrentPlaying(customPlayList[musicIndex] as CurrentPlayListType)
      }
    } else {
      setCurrentPlaying(
        customPlayList[
          Math.floor(Math.random() * customPlayList.length)
        ] as CurrentPlayListType,
      )
    }
  }
  // 플레이어 다음 버튼을 누르거나, 현재 노래가 끝날경우 다음 노래로 넘어간다
  const onNextTrackHandler = () => {
    if (!isRandom) {
      if (musicIndex === customPlayList.length - 1) {
        setMusicIndex(0)
        setCurrentPlaying(customPlayList[0] as CurrentPlayListType)
      } else {
        setMusicIndex((prev) => prev + 1)
        setCurrentPlaying(
          customPlayList[musicIndex]
            ? (customPlayList[musicIndex + 1] as CurrentPlayListType)
            : null,
        )
      }
    } else {
      setCurrentPlaying(
        customPlayList[
          Math.floor(Math.random() * customPlayList.length)
        ] as CurrentPlayListType,
      )
    }
  }

  // 플레이 리스트 체크박스를 클릭하면 음악 id가 담기고  마플리 또는 삭제 이벤트에 사용한다
  const onChangeCheckMusicHandler = (checked: boolean, id: string) => {
    if (checked) {
      setCheckedList((prev) => [...prev, id])
    } else {
      const checkList = checkedList.filter((el) => el !== id)
      setCheckedList(checkList)
    }
  }

  // 삭제 이벤트 체크박스에 담긴 id값과, 서버에 현재플리 테이블에 저장된 id값을 비교해 같지 않은 데이터만 새 배열로 반환하여 업데이트해준다
  // 왜? 배열 형태니까 배열에서 같지않은 데이터만 지우고 새 배열로 업데이트
  const onDeleteCurrentMusicHandler = async () => {
    Swal.fire({
      title: '선택한 노래를 삭제하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      background: '#2B2B2B',
      color: '#ffffff',
    }).then((result) => {
      if (result.isConfirmed) {
        const currentMusicData = customPlayList.filter(
          (music) => !checkedList.includes(music.musicId),
        )
        deleteMutation.mutate({
          uid,
          currentMusicData: currentMusicData.map((music) => music.musicId),
        })
        setCheckedList([])
        setSelectAll(false)
        const isCurrentMusicDeleted = checkedList.includes(
          currentPlaying!.musicId,
        )
        if (isCurrentMusicDeleted) {
          setCurrentPlaying(
            customPlayList[musicIndex]
              ? (currentMusicData[musicIndex] as CurrentPlayListType)
              : null,
          )
        }
        Swal.fire({
          title: '재생목록이 삭제되었습니다.',
          showConfirmButton: false,
          timer: 1500,
          icon: 'success',
          background: '#2B2B2B',
          color: '#ffffff',
        })
      }
    })
  }

  // 마플리 추가 이벤트
  // 체크박스에 담긴 배열과, 마플리에 담긴 음악ID배열을 every로 비교 후 같지 않은 데이터 추출해서 기존 마플리 배열 뒤에 추가해서 업데이트해준다
  // every는 &&, some은 || 로 생각하면된다
  const onInsertMyPlayListHandler = async () => {
    if (checkedList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '추가할 노래를 선택해 주세요',
        showConfirmButton: false,
        timer: 1500,
        background: '#2B2B2B',
        color: '#ffffff',
      })
      return
    }

    Swal.fire({
      title: '선택한 곡을 마이플레이 리스트에 추가하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      background: '#2B2B2B',
      color: '#ffffff',
    }).then((result) => {
      if (result.isConfirmed) {
        if (myPlayList && myPlayList.length > 0) {
          const myIndex = myPlayList.flatMap((item) => {
            return item.myMusicIds
          })

          const uniqueValues = checkedList.filter((value) => {
            return myIndex.every((item) => {
              return item !== value
            })
          })
          if (uniqueValues.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: '이미 추가된 노래입니다.',
              showConfirmButton: false,
              timer: 1500,
              background: '#2B2B2B',
              color: '#ffffff',
            })
            setCheckedList([])
            return
          } else {
            const updateList = [...myIndex, ...uniqueValues]
            updateMutation.mutate({ userId: uid, myMusicList: updateList })
            Swal.fire({
              icon: 'success',
              title: '마이플레이 리스트에 추가 되었습니다.',
              showConfirmButton: false,
              timer: 1500,
              background: '#2B2B2B',
              color: '#ffffff',
            })
            setCheckedList([])
          }
        } else {
          insertMutation.mutate({ userId: uid, musicId: checkedList })
          Swal.fire({
            icon: 'success',
            title: '마이플레이 리스트에 추가 되었습니다.',
            showConfirmButton: false,
            timer: 1500,
            background: '#2B2B2B',
            color: '#ffffff',
          })
          setCheckedList([])
        }
      }
    })
  }

  return (
    <div>
      <div className='min-h-[600px]'>
        <Player
          currentPlaying={currentPlaying}
          setCurrentPlaying={setCurrentPlaying}
          musicIndex={musicIndex}
          isLyrics={isLyrics}
          isRandom={isRandom}
          onRandomMusicHandler={onRandomMusicHandler}
          onPreviousHandler={onPreviousHandler}
          onNextTrackHandler={onNextTrackHandler}
          onLyricsToggle={onLyricsToggle}
          onInsertMyPlayListHandler={onInsertMyPlayListHandler}
        />
      </div>
      <div>
        <CurrentMusicList
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          currentPlayList={currentPlayList as CurrentPlayListType[]}
          currentPlaying={currentPlaying}
          isLyrics={isLyrics}
          checkedList={checkedList}
          setCheckedList={setCheckedList}
          setCurrentPlaying={setCurrentPlaying}
          onChangeCheckMusicHandler={onChangeCheckMusicHandler}
          onDeleteCurrentMusicHandler={onDeleteCurrentMusicHandler}
          setMusicIndex={setMusicIndex}
        />
      </div>
    </div>
  )
}
export default MusicPlayer
