import { getLikeBoardCount, getLikeBoardData } from '@/shared/mypage/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import BoardItem from './BoardItem'
import Pagination from './Pagination'
import BoardNoData from './BoardNoData'
import { getCurrentMusicData, updateCurrentMusic } from '@/shared/main/api'
import { useSession } from 'next-auth/react'

const LikeBoardList = () => {
  const { data: userSessionInfo } = useSession()
  const uid = userSessionInfo?.user?.uid as string
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: totalCount } = useQuery({
    queryFn: () => getLikeBoardCount(uid),
    queryKey: ['likeBoardAllCount'],
    enabled: !!uid,
  })

  const PER_PAGE = 5
  const totalPages = Math.ceil(totalCount! / PER_PAGE)
  const start = (currentPage - 1) * PER_PAGE
  const end = currentPage * PER_PAGE - 1

  const { data, isLoading, isError } = useQuery({
    queryFn: () => getLikeBoardData(uid, start, end),
    queryKey: ['likeBoard', currentPage],
    enabled: !!uid,
  })

  const { data: playListCurrent } = useQuery({
    queryFn: () => getCurrentMusicData(uid),
    queryKey: ['playListCurrent'],
    enabled: !!uid,
  })

  const updateMutation = useMutation({
    mutationFn: updateCurrentMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mypage'] })
      queryClient.invalidateQueries({ queryKey: ['playListCurrent'] })
      queryClient.invalidateQueries({ queryKey: ['getCurrentMusicList'] })
    },
  })

  const onClickAddCurrentMusicHandler = (musicId: string) => {
    const currentList = playListCurrent?.length
      ? playListCurrent[0].currentMusicIds
      : []
    if (currentList.find((el) => el === musicId)) {
      alert('이미 추가된 노래입니다.')
      return
    }
    currentList.push(musicId)
    updateMutation.mutate({ userId: uid, currentList })
    alert('현재 재생목록에 추가 되었습니다.')
  }

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1)
  }

  const prevPage = () => {
    setCurrentPage((prev) => prev - 1)
  }

  if (isError) {
    return '에러가 발생했어요!'
  }

  if (isLoading) {
    return '데이터를 불러오는 중입니다.'
  }

  return (
    <section>
      <ul>
        {data && data?.length > 0 ? (
          data?.map((item) => {
            return (
              <BoardItem
                key={item.boardId}
                data={item}
                onClick={() => onClickAddCurrentMusicHandler(item.musicId)}
              />
            )
          })
        ) : (
          <BoardNoData />
        )}
      </ul>
      {data && data?.length > 0 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          nextPage={nextPage}
          prevPage={prevPage}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        ''
      )}
    </section>
  )
}

export default LikeBoardList
