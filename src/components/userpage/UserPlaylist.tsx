import { getUserMyPlaylistData } from '@/shared/mypage/api'
import type { UserInfo } from '@/types/mypage/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import CheckboxItem from '../mypage/CheckboxItem'
import Image from 'next/image'
import { getCurrentMusicData, updateCurrentMusic } from '@/shared/main/api'
import LockContents from './LockContents'
import { useSession } from 'next-auth/react'
import ButtonPrimary from '../../util/ButtonPrimary'
import { useParams } from 'next/navigation'

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

  const { data: userPlaylistMyInfoData } = useQuery({
    queryFn: () => getUserMyPlaylistData(id),
    queryKey: ['userMyMusicIds'], //data
    enabled: !!id,
  })

  const userPlaylistMyIds = userPlaylistMyInfoData?.playlistMyIds
  const userPlaylistMyData = userPlaylistMyInfoData?.myPlaylistData

  const { data: myPlaylistCurrentData } = useQuery({
    queryFn: () => getCurrentMusicData(uid),
    queryKey: ['playListCurrent', uid],
    enabled: !!uid,
  })

  const updateMutation = useMutation({
    mutationFn: updateCurrentMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playListCurrent'] })
      queryClient.invalidateQueries({ queryKey: ['getCurrentMusicList'] })
    },
  })

  const onChangeCheckMusicHandler = (checked: boolean, id: string) => {
    if (checked) {
      setCheckedList((prev) => [...prev, id])
    } else {
      const checkList = checkedList.filter((el) => el !== id)
      setCheckedList(checkList)
    }
  }

  const onClickAddHandler = () => {
    if (checkedList.length === 0) {
      alert('추가할 노래를 선택해주세요!')
      return
    }

    const myCurrentMusicIds = myPlaylistCurrentData?.[0].currentMusicIds!
    let newData = []

    if ((myCurrentMusicIds?.length as number) > 0) {
      const addData = checkedList.filter(
        (el) => !myCurrentMusicIds.includes(el),
      )

      if (addData.length === 0) {
        alert(
          `선택하신 ${checkedList.length}개의 곡 모두 이미 추가되어 있습니다.`,
        )
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

    alert('추가가 완료되었습니다.')
    setCheckedList([])
  }

  const onClickAllAddHandler = () => {
    const userPlaylistMy = !userPlaylistMyIds ? [] : userPlaylistMyIds
    const myPlayListCurrent = !myPlaylistCurrentData?.[0].currentMusicIds
      ? []
      : myPlaylistCurrentData?.[0].currentMusicIds
    let newData = []

    if (userPlaylistMy?.length === 0) {
      alert('추가할 곡이 없습니다.')
      return
    }

    if ((myPlayListCurrent?.length as number) > 0) {
      const addData = userPlaylistMy?.filter(
        (el) => !myPlayListCurrent!.includes(el),
      )
      console.log('addData', addData)
      if (addData?.length === 0) {
        alert(`${userPlaylistMy?.length}개 모두 이미 추가되어 있습니다.`)
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
    alert('추가가 완료되었습니다.')
    setCheckedList([])
  }

  const shadow =
    'shadow-[-4px_-4px_8px_rgba(255,255,255,0.05),4px_4px_8px_rgba(0,0,0,0.7)]'

  return (
    <div className='mt-[5rem]'>
      {isVisibility ? (
        <>
          <div className='flex items-center justify-between'>
            <h2 className='text-[1.25rem] font-bold'>
              {data?.nickname}님의 플레이리스트
            </h2>
            <ButtonPrimary onClick={onClickAllAddHandler}>
              전체 담기
            </ButtonPrimary>
          </div>
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
          <ul className='tracking-[-0.03em]'>
            {userPlaylistMyData && userPlaylistMyData?.length > 0 ? (
              userPlaylistMyData?.map((item) => {
                return (
                  <li
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
                        className='flex flex-col'
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
                )
              })
            ) : (
              <li className='flex h-[300px] items-center justify-center text-xl text-white/50'>
                {data?.nickname}님이 담은 노래가 없습니다.
              </li>
            )}
          </ul>
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
