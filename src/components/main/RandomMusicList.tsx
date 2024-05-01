'use client'

import { getRandomMusicData } from '@/shared/main/api'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import GenreMusicItem from './GenreMusicItem'

import { GENRE_MUSIC_QUERY_KEY } from '@/query/genreMusic/queryKeys'
import { useSession } from 'next-auth/react'
import SectionTitle from './SectionTitle'
import SlideButton from './SlideButton'
import { GenreMusicInfo } from '@/types/main/types'

const RandomMusicList = () => {
  const [position, setPosition] = useState(0)
  const session = useSession()
  const [randomMusic, setRandomMusic] = useState<GenreMusicInfo[]>([])

  const check = session.status === 'authenticated'

  const MOVE_POINT = 136 + 24 //임시값 - 슬라이드로 이동할 값

  //없을 때
  const { data, isError, isLoading } = useQuery({
    queryFn: () => getRandomMusicData(),
    queryKey: [GENRE_MUSIC_QUERY_KEY.GET_MAIN_GENRE_MUSIC],
  })

  // 리렌더가 일어나거나 음악 데이터가 변경될 시 리렌더되며 새 데이터를 가져온다
  // set 객체를 담은 변수를 활용하여 Math.random에서 중복되는 값을 없앤 데이터를 랜덤으로 추출하여 보여준다
  useEffect(() => {
    if (data) {
      const randomIndex = new Set<number>()
      while (randomIndex.size < 10) {
        randomIndex.add(Math.floor(Math.random() * data.length))
      }
      const randomMusic = Array.from(randomIndex).map((index) => data[index])
      setRandomMusic(randomMusic)
    }
  }, [data])

  const onClickPrevHandler = () => {
    if (position < 0) {
      setPosition((prev) => prev + MOVE_POINT)
    }
  }

  const onClickNextHandler = () => {
    setPosition((prev) => prev - MOVE_POINT)
  }

  return (
    <section className={`${!check ? 'pl-10' : 'pl-20'} my-8`}>
      <SectionTitle>이런 음악은 어떠신가요?🎶</SectionTitle>
      <div className='relative flex overflow-hidden'>
        <ul
          className='flex flex-nowrap py-1'
          style={{
            transition: 'all 0.4s ease-in-out',
            transform: `translateX(${position}px)`,
          }}
        >
          {randomMusic?.map((item) => {
            return <GenreMusicItem key={item.musicId} item={item} />
          })}
        </ul>
        <SlideButton
          position={position}
          movePoint={MOVE_POINT}
          length={randomMusic?.length ? randomMusic?.length : 0}
          onClickNextHandler={onClickNextHandler}
          onClickPrevHandler={onClickPrevHandler}
        />
      </div>
    </section>
  )
}

export default RandomMusicList
