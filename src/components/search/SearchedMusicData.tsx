'use client'
import addCurrMusic from '@/../public/images/community-detail-Image/add-current-music.svg'
import addMyPlayList from '@/../public/images/community-detail-Image/add-my-playlist.svg'
import {
  GET_MUSIC_LIST_QUERY_KEYS,
  getMusicList,
} from '@/query/musicPlayer/musicPlayerQueryKeys'
import { insertCurrentMusic, updateCurrentMusic } from '@/shared/main/api'
import { insertMyPlayMusic, updateMyPlayMusic } from '@/shared/musicPlayer/api'
import { MusicInfoType } from '@/types/musicPlayer/types'
import { dragHandler } from '@/util/util'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { ADD_CURRENT_MUSIC_SHADOW } from '../communityDetail/communityCss'

// 음악 검색 결과 컴포넌트, 페이지네이션 처리된 변수가 프롭스로 들어간다
const SearchedMusicData = ({
  currentItems,
}: {
  currentItems: MusicInfoType[]
}) => {
  const { data: userSessionInfo } = useSession()
  const uid = userSessionInfo?.user.uid as string
  const queryClient = useQueryClient()
  const router = useRouter()

  const { playListCurrent, myPlayList } = getMusicList(uid)

  const insertCurrentMutation = useMutation({
    mutationFn: insertCurrentMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.CURRENT_MUSIC_INFO],
      })
    },
  })
  const updateCurrentMutation = useMutation({
    mutationFn: updateCurrentMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.CURRENT_MUSIC_INFO],
      })
    },
  })

  const insertMyMutation = useMutation({
    mutationFn: insertMyPlayMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.MY_MUSIC_LIST],
      })
    },
  })

  const updateMyMutation = useMutation({
    mutationFn: updateMyPlayMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_MUSIC_LIST_QUERY_KEYS.MY_MUSIC_LIST],
      })
    },
  })

  // 현재 플레이리스트 추가 함수.
  const onClickAddCurrentMusicHandler = (musicId: string) => {
    if (uid === '' || !uid) {
      Swal.fire({
        icon: 'error',
        title:
          '로그인 후 사용할 수 있는 서비스입니다. 로그인 페이지로 이동합니다.',
        background: '#2B2B2B',
        color: '#ffffff',
      })
      router.replace('/login')
      return
    }
    // playListCurrent가 현재 플레이리스트. 테이블에 현재 로그인된 유저의 음악 ID값이 담긴 배열 컬럼과 선택한 음악 ID와 find로 비교 후 추가 또는 반환한다
    // 최초 현재 플레이 리스트에 등록시에만 insertMutation을 호출하고 그 외에는 updateMutation을 사용한다
    if (playListCurrent && playListCurrent.length > 0) {
      const currentList = playListCurrent[0].currentMusicIds

      if (currentList.find((el) => el === musicId)) {
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
      currentList.push(musicId)
      updateCurrentMutation.mutate({ userId: uid, currentList: currentList })
    } else {
      insertCurrentMutation.mutate({ userId: uid, musicId })
    }
    Swal.fire({
      icon: 'success',
      title: '현재 플레이 리스트에 추가되었습니다',
      showConfirmButton: false,
      timer: 1500,
      background: '#2B2B2B',
      color: '#ffffff',
    })
  }

  // 마이플레이 리스트 추가 함수
  const onClickAddMyPlayListHandler = async (musicId: string) => {
    if (uid === '' || !uid) {
      Swal.fire({
        icon: 'error',
        title:
          '로그인 후 사용할 수 있는 서비스입니다. 로그인 페이지로 이동합니다.',
        background: '#2B2B2B',
        color: '#ffffff',
      })

      router.replace('/login')
      return
    }
    Swal.fire({
      title: '마이플레이 리스트에 추가하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      background: '#2B2B2B',
      color: '#ffffff',
    }).then((result) => {
      if (result.isConfirmed) {
        // 마이플레이리스트 테이블에 현재 로그인된 유저의 음악 ID값이 담긴 배열 컬럼과 선택한 음악 ID와 find로 비교 후 추가 또는 반환한다
        // 최초  마이플레이 리스트에 등록시에만 insertMutation을 호출하고 그 외에는 updateMutation을 사용한다
        if (myPlayList && myPlayList.length > 0) {
          const myList = myPlayList[0].myMusicIds
          if (myList.find((el) => el === musicId)) {
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
          myList.push(musicId)
          updateMyMutation.mutate({ userId: uid, myMusicList: myList })
        } else {
          const myMusicId = [musicId]
          insertMyMutation.mutate({ userId: uid, musicId: myMusicId })
        }
        Swal.fire({
          title: '마이플레이 리스트에 추가 되었습니다',
          showConfirmButton: false,
          timer: 1500,
          icon: 'success',
          background: '#2B2B2B',
          color: '#ffffff',
        })
      }
    })
  }

  return (
    <ul className='list-none'>
      {currentItems.map((item) => {
        return (
          <li
            draggable='true'
            onDragStart={(e) => {
              dragHandler(e, item)
            }}
            key={item.musicId}
            className='flex h-[88px] w-[732px] list-none items-start gap-[19px] p-[16px]'
          >
            <div className='flex h-[56px] w-[588px] gap-[16px]'>
              <figure className='h-[56px] w-[56px]'>
                <Image
                  src={item.thumbnail}
                  width={56}
                  height={56}
                  alt={`${item.musicTitle} 앨범 썸네일`}
                  className='rounded-full'
                />
              </figure>
              <div className='flex h-[48px] w-[516px] items-center justify-between pr-[32px]'>
                <div className='flex flex-col gap-[3px]'>
                  <span className='text-[18px] font-bold'>
                    {item.musicTitle}
                  </span>
                  <span className='text-[14px] font-bold opacity-[50%]'>
                    {item.artist}
                  </span>
                </div>
                <span className='text-[14px]  opacity-[50%]'>
                  {item.runTime}
                </span>
              </div>
            </div>
            <div className='h-48px flex w-[122px] gap-[16px]'>
              <button
                onClick={() => onClickAddCurrentMusicHandler(item.musicId)}
                className={`flex h-[48px] w-[48px] items-center justify-center rounded-[100%] border border-solid border-[#292929] bg-[#292929] p-[8px] ${ADD_CURRENT_MUSIC_SHADOW}`}
              >
                <Image
                  src={addCurrMusic}
                  alt='현재재생목록추가 아이콘'
                  width={24}
                  height={24}
                />
              </button>

              <button
                type='button'
                className={`flex h-[48px] w-[48px] items-center justify-center rounded-[100%] border border-solid border-[#292929] bg-[#292929] p-[8px] ${ADD_CURRENT_MUSIC_SHADOW}`}
                onClick={() => onClickAddMyPlayListHandler(item.musicId)}
              >
                <Image
                  src={addMyPlayList}
                  alt='마이플레이리스트에 저장 아이콘'
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
export default SearchedMusicData
